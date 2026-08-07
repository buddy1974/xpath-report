"use server";

/**
 * X-PATH — admin-editable default content: write side (DL-054, DL-059)
 * ------------------------------------------------------------------
 * Per Header G3, saving here from the administrator account IS the
 * director-approval step — no separate approval workflow. Never
 * touches `privateWorkspaceItems` or `clinicalRecords` — this table
 * has no owner/patient concept at all.
 *
 * DL-059 — real version history: every save/restore appends a new row
 * to `editableContentVersions` (never rewritten, git-revert style —
 * restoring creates a new version rather than mutating an old one) and
 * updates `editableContent`'s `currentVersionId` pointer. "Version
 * zero" (the original system default) has no row — restoring to it
 * just deletes the `editableContent` row.
 */
import { redirect } from "next/navigation";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { editableContent, editableContentVersions } from "@/db/schema";
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

async function upsertCurrent(
  tenantId: string,
  contentKey: string,
  value: string,
  directorNote: string | null,
  versionId: string,
  userId: string,
) {
  const existing = await db
    .select()
    .from(editableContent)
    .where(and(eq(editableContent.tenantId, tenantId), eq(editableContent.contentKey, contentKey)))
    .limit(1);

  if (existing[0]) {
    await db
      .update(editableContent)
      .set({
        value,
        directorNote,
        version: existing[0].version + 1,
        currentVersionId: versionId,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(editableContent.id, existing[0].id));
  } else {
    await db.insert(editableContent).values({
      tenantId,
      contentKey,
      value,
      directorNote,
      version: 1,
      currentVersionId: versionId,
      updatedBy: userId,
    });
  }
}

export async function saveContentOverride(formData: FormData) {
  const { userId, tenantId } = await requireAdmin();

  const contentKey = String(formData.get("contentKey") ?? "").trim();
  const value = String(formData.get("value") ?? "").trim();
  const directorNote = String(formData.get("directorNote") ?? "").trim() || null;

  if (!contentKey || !value) throw new Error("Content key and value are required.");

  const [versionRow] = await db
    .insert(editableContentVersions)
    .values({ tenantId, contentKey, value, directorNote, editedBy: userId })
    .returning();

  await upsertCurrent(tenantId, contentKey, value, directorNote, versionRow.id, userId);

  await writeAudit({
    tenantId,
    actorId: userId,
    action: "content_edited",
    detail: { contentKey, versionId: versionRow.id },
  });

  redirect(`/dashboard/content?edit=${encodeURIComponent(contentKey)}`);
}

/** Restores a prior version (or "default" — version zero, no row at all). */
export async function restoreContentVersion(formData: FormData) {
  const { userId, tenantId } = await requireAdmin();
  const contentKey = String(formData.get("contentKey") ?? "").trim();
  const versionId = String(formData.get("versionId") ?? "").trim();
  if (!contentKey || !versionId) throw new Error("Content key and version are required.");

  if (versionId === "default") {
    await db
      .delete(editableContent)
      .where(and(eq(editableContent.tenantId, tenantId), eq(editableContent.contentKey, contentKey)));
    await writeAudit({
      tenantId,
      actorId: userId,
      action: "content_restored",
      detail: { contentKey, restoredTo: "default" },
    });
    redirect(`/dashboard/content?edit=${encodeURIComponent(contentKey)}`);
  }

  const versionRows = await db
    .select()
    .from(editableContentVersions)
    .where(
      and(
        eq(editableContentVersions.id, versionId),
        eq(editableContentVersions.tenantId, tenantId),
        eq(editableContentVersions.contentKey, contentKey),
      ),
    )
    .limit(1);
  const version = versionRows[0];
  if (!version) throw new Error("Version not found.");

  // Restoring creates a NEW version row rather than reusing the old
  // one — the history timeline only ever grows forward, same as a
  // git revert never rewrites the commit it reverts to.
  const [newVersionRow] = await db
    .insert(editableContentVersions)
    .values({ tenantId, contentKey, value: version.value, directorNote: version.directorNote, editedBy: userId })
    .returning();

  await upsertCurrent(tenantId, contentKey, version.value, version.directorNote, newVersionRow.id, userId);

  await writeAudit({
    tenantId,
    actorId: userId,
    action: "content_restored",
    detail: { contentKey, restoredFromVersionId: versionId, newVersionId: newVersionRow.id },
  });

  redirect(`/dashboard/content?edit=${encodeURIComponent(contentKey)}`);
}

/**
 * Deletes one historical version row. If it was the currently-active
 * one, falls back to the next-most-recent remaining version, or to
 * "default" (deletes the `editableContent` row) if none remain.
 */
export async function deleteContentVersion(formData: FormData) {
  const { userId, tenantId } = await requireAdmin();
  const contentKey = String(formData.get("contentKey") ?? "").trim();
  const versionId = String(formData.get("versionId") ?? "").trim();
  if (!contentKey || !versionId) throw new Error("Content key and version are required.");

  const versionRows = await db
    .select()
    .from(editableContentVersions)
    .where(
      and(
        eq(editableContentVersions.id, versionId),
        eq(editableContentVersions.tenantId, tenantId),
        eq(editableContentVersions.contentKey, contentKey),
      ),
    )
    .limit(1);
  if (!versionRows[0]) throw new Error("Version not found.");

  // Capture "is this the active version" BEFORE deleting — the FK's
  // ON DELETE SET NULL fires the instant the row is gone, so reading
  // `existing` afterward would always see currentVersionId already
  // nulled out and silently skip the fallback below (a real bug this
  // session's own live-verification caught: deleting the last
  // remaining version left editableContent's value/version columns
  // orphaned, still live, pointing at nothing).
  const existing = await db
    .select()
    .from(editableContent)
    .where(and(eq(editableContent.tenantId, tenantId), eq(editableContent.contentKey, contentKey)))
    .limit(1);
  const wasActive = existing[0]?.currentVersionId === versionId;

  await db.delete(editableContentVersions).where(eq(editableContentVersions.id, versionId));

  if (wasActive) {
    const remaining = await db
      .select()
      .from(editableContentVersions)
      .where(and(eq(editableContentVersions.tenantId, tenantId), eq(editableContentVersions.contentKey, contentKey)))
      .orderBy(desc(editableContentVersions.createdAt))
      .limit(1);

    if (remaining[0]) {
      await db
        .update(editableContent)
        .set({
          value: remaining[0].value,
          directorNote: remaining[0].directorNote,
          currentVersionId: remaining[0].id,
          updatedBy: userId,
          updatedAt: new Date(),
        })
        .where(eq(editableContent.id, existing[0].id));
    } else {
      await db.delete(editableContent).where(eq(editableContent.id, existing[0].id));
    }
  }

  await writeAudit({
    tenantId,
    actorId: userId,
    action: "content_version_deleted",
    detail: { contentKey, deletedVersionId: versionId },
  });

  redirect(`/dashboard/content?edit=${encodeURIComponent(contentKey)}`);
}
