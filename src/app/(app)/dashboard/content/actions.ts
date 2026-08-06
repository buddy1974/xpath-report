"use server";

/**
 * X-PATH — admin-editable default content: write side (DL-054)
 * ------------------------------------------------------------------
 * Per Header G3, saving here from the administrator account IS the
 * director-approval step — no separate approval workflow. One current
 * row per (tenant, contentKey): editing overwrites `value` and bumps
 * `version`; the audit log (written on every save) is the version
 * *history*. Never touches `privateWorkspaceItems` or
 * `clinicalRecords` — this table has no owner/patient concept at all.
 */
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { editableContent } from "@/db/schema";
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

export async function saveContentOverride(formData: FormData) {
  const { userId, tenantId } = await requireAdmin();

  const contentKey = String(formData.get("contentKey") ?? "").trim();
  const value = String(formData.get("value") ?? "").trim();
  const directorNote = String(formData.get("directorNote") ?? "").trim() || null;

  if (!contentKey || !value) throw new Error("Content key and value are required.");

  const existing = await db
    .select()
    .from(editableContent)
    .where(and(eq(editableContent.tenantId, tenantId), eq(editableContent.contentKey, contentKey)))
    .limit(1);

  if (existing[0]) {
    await db
      .update(editableContent)
      .set({ value, directorNote, version: existing[0].version + 1, updatedBy: userId, updatedAt: new Date() })
      .where(eq(editableContent.id, existing[0].id));
  } else {
    await db.insert(editableContent).values({
      id: randomUUID(),
      tenantId,
      contentKey,
      value,
      directorNote,
      version: 1,
      updatedBy: userId,
    });
  }

  await writeAudit({
    tenantId,
    actorId: userId,
    action: "content_edited",
    detail: { contentKey, version: (existing[0]?.version ?? 0) + 1 },
  });

  redirect(`/dashboard/content?edit=${encodeURIComponent(contentKey)}`);
}
