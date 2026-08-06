"use server";

/**
 * X-PATH — reagent/equipment tracking server actions (DL-055)
 * ------------------------------------------------------------------
 * Operational lab-supply data — never touches privateWorkspaceItems or
 * clinicalRecords (Header G2), same structural isolation as accounts/
 * content admin. Register-seeded rows (registerKey non-null) keep
 * their name/clone/catalogue/vendor fixed — only stock, threshold, and
 * calibration are editable there, so the verified Roche register data
 * can't drift from what's actually on file. Admin-added rows (no
 * register match) are fully editable.
 */
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { reagentItems } from "@/db/schema";
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

function parseOptionalInt(v: FormDataEntryValue | null): number | null {
  if (v === null) return null;
  const s = String(v).trim();
  if (!s) return null;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

function parseOptionalDate(v: FormDataEntryValue | null): Date | null {
  if (v === null) return null;
  const s = String(v).trim();
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** New freeform item — anything not on the seeded register. */
export async function addReagentItem(formData: FormData) {
  const { userId, tenantId } = await requireAdmin();

  const type = String(formData.get("type") ?? "") === "equipment" ? "equipment" : "antibody";
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required.");
  const clone = String(formData.get("clone") ?? "").trim() || null;
  const catalogueRef = String(formData.get("catalogueRef") ?? "").trim() || null;
  const vendor = String(formData.get("vendor") ?? "").trim() || null;

  const [created] = await db
    .insert(reagentItems)
    .values({
      tenantId,
      registerKey: null,
      type,
      name,
      clone,
      catalogueRef,
      vendor,
      currentStock: type === "antibody" ? parseOptionalInt(formData.get("currentStock")) : null,
      lowStockThreshold: type === "antibody" ? (parseOptionalInt(formData.get("lowStockThreshold")) ?? 5) : null,
      lastCalibratedAt: type === "equipment" ? parseOptionalDate(formData.get("lastCalibratedAt")) : null,
      calibrationIntervalDays:
        type === "equipment" ? (parseOptionalInt(formData.get("calibrationIntervalDays")) ?? 90) : null,
      updatedBy: userId,
    })
    .returning();

  await writeAudit({
    tenantId,
    actorId: userId,
    action: "reagent_item_added",
    detail: { itemId: created.id, name, type },
  });

  redirect("/dashboard/reagents");
}

/** Stock update — antibody-type rows (register-seeded or admin-added). */
export async function updateReagentStock(formData: FormData) {
  const { userId, tenantId } = await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const rows = await db.select().from(reagentItems).where(eq(reagentItems.id, id)).limit(1);
  const item = rows[0];
  if (!item || item.tenantId !== tenantId || item.type !== "antibody") throw new Error("Item not found");

  const currentStock = parseOptionalInt(formData.get("currentStock"));
  const lowStockThreshold = parseOptionalInt(formData.get("lowStockThreshold")) ?? 5;
  const lastRestockedAt = parseOptionalDate(formData.get("lastRestockedAt"));

  await db
    .update(reagentItems)
    .set({ currentStock, lowStockThreshold, lastRestockedAt, updatedBy: userId, updatedAt: new Date() })
    .where(eq(reagentItems.id, id));

  await writeAudit({
    tenantId,
    actorId: userId,
    action: "reagent_item_updated",
    detail: { itemId: id, name: item.name, currentStock, lowStockThreshold },
  });

  redirect("/dashboard/reagents");
}

/** Calibration update — equipment-type rows. */
export async function updateEquipmentCalibration(formData: FormData) {
  const { userId, tenantId } = await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const rows = await db.select().from(reagentItems).where(eq(reagentItems.id, id)).limit(1);
  const item = rows[0];
  if (!item || item.tenantId !== tenantId || item.type !== "equipment") throw new Error("Item not found");

  const lastCalibratedAt = parseOptionalDate(formData.get("lastCalibratedAt"));
  const calibrationIntervalDays = parseOptionalInt(formData.get("calibrationIntervalDays")) ?? 90;

  await db
    .update(reagentItems)
    .set({ lastCalibratedAt, calibrationIntervalDays, updatedBy: userId, updatedAt: new Date() })
    .where(eq(reagentItems.id, id));

  await writeAudit({
    tenantId,
    actorId: userId,
    action: "reagent_item_updated",
    detail: { itemId: id, name: item.name, lastCalibratedAt, calibrationIntervalDays },
  });

  redirect("/dashboard/reagents");
}
