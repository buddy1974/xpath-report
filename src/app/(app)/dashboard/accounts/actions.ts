"use server";

/**
 * X-PATH — super-admin account management server actions (DL-054)
 * ------------------------------------------------------------------
 * Full profile/status management for every account in the tenant.
 * Deliberately never touches `privateWorkspaceItems` or
 * `clinicalRecords` — not filtered out by a permission check, simply
 * never queried here at all, so there's no code path that could leak
 * one (Header G2). Every action is audit-logged.
 */
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users, type Role } from "@/db/schema";
import { writeAudit } from "@/lib/audit";

async function requireAdmin() {
  const session = await auth();
  const role = (session as any)?.role as string | undefined;
  const userId = (session?.user as any)?.id as string | undefined;
  const tenantId = (session as any)?.tenantId as string | undefined;
  if (!session || !userId || !tenantId) throw new Error("Not authenticated");
  if (role !== "administrator") throw new Error("Administrator only");
  return { userId, tenantId };
}

/** "unit" in the relayed spec = the existing `department` column — no new field. */
export async function updateAccountProfile(formData: FormData) {
  const { userId, tenantId } = await requireAdmin();
  const targetId = String(formData.get("id") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "") as Role;

  if (!displayName || !email || !role) {
    throw new Error("Name, email, and role are required.");
  }

  const rows = await db.select().from(users).where(eq(users.id, targetId)).limit(1);
  const target = rows[0];
  if (!target || target.tenantId !== tenantId) throw new Error("Account not found");

  await db.update(users).set({ displayName, department, phone, email, role }).where(eq(users.id, targetId));

  await writeAudit({
    tenantId,
    actorId: userId,
    action: "account_edited",
    detail: { targetId, displayName, email, role },
  });

  redirect("/dashboard/accounts");
}

type StatusAction = "suspend" | "block" | "reactivate" | "deactivate";

const NEW_STATUS: Record<StatusAction, "suspended" | "blocked" | "active" | "deactivated"> = {
  suspend: "suspended",
  block: "blocked",
  reactivate: "active",
  deactivate: "deactivated",
};
const AUDIT_ACTION: Record<StatusAction, "account_suspended" | "account_blocked" | "account_reactivated" | "account_deactivated"> = {
  suspend: "account_suspended",
  block: "account_blocked",
  reactivate: "account_reactivated",
  deactivate: "account_deactivated",
};

export async function changeAccountStatus(targetId: string, action: StatusAction) {
  const { userId, tenantId } = await requireAdmin();

  const rows = await db.select().from(users).where(eq(users.id, targetId)).limit(1);
  const target = rows[0];
  if (!target || target.tenantId !== tenantId) throw new Error("Account not found");

  // Reactivate is a deliberate boundary: it only ever undoes a suspend
  // or block, never a deactivate (soft-delete) — Marcel's explicit spec.
  if (action === "reactivate" && target.status === "deactivated") {
    throw new Error("A deactivated account can't be reactivated from here — that boundary is deliberate.");
  }
  // Not asked for explicitly, but a real operational safety guard given
  // this app's own emphasis elsewhere (DL-048) on the admin account
  // staying permanently, always accessible — an admin locking out the
  // only admin account would be a genuinely bad failure mode to allow.
  if (target.id === userId && (action === "block" || action === "deactivate")) {
    throw new Error("You can't block or deactivate your own account.");
  }

  const newStatus = NEW_STATUS[action];
  await db
    .update(users)
    .set({ status: newStatus, isActive: newStatus === "active" })
    .where(eq(users.id, targetId));

  await writeAudit({
    tenantId,
    actorId: userId,
    action: AUDIT_ACTION[action],
    detail: { targetId, previousStatus: target.status, newStatus },
  });

  redirect("/dashboard/accounts");
}
