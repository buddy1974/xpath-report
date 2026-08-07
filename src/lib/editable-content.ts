/**
 * X-PATH — admin-editable default content (DL-054, Header G3/G4)
 * ------------------------------------------------------------------
 * Read-side helper for the generic content-override table. Write-side
 * lives in the content admin route's actions.ts (the only place that
 * writes here, mirroring lib/audit.ts's write-only pattern).
 *
 * NEVER pathologist personal content — this module only ever reads
 * `editableContent`, never `privateWorkspaceItems` (Header G2).
 */
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { editableContent, editableContentVersions } from "@/db/schema";

export type ContentOverride = {
  value: string;
  directorNote: string | null;
  version: number;
  currentVersionId: string | null;
};

export type ContentVersionRow = {
  id: string;
  value: string;
  directorNote: string | null;
  editedBy: string;
  createdAt: Date;
};

export async function getContentOverrides(
  tenantId: string,
  keys: string[],
): Promise<Record<string, ContentOverride>> {
  if (keys.length === 0) return {};
  const rows = await db
    .select()
    .from(editableContent)
    .where(and(eq(editableContent.tenantId, tenantId), inArray(editableContent.contentKey, keys)));
  const map: Record<string, ContentOverride> = {};
  for (const r of rows)
    map[r.contentKey] = {
      value: r.value,
      directorNote: r.directorNote,
      version: r.version,
      currentVersionId: r.currentVersionId,
    };
  return map;
}

export async function getAllContentOverrides(tenantId: string): Promise<Record<string, ContentOverride>> {
  const rows = await db.select().from(editableContent).where(eq(editableContent.tenantId, tenantId));
  const map: Record<string, ContentOverride> = {};
  for (const r of rows)
    map[r.contentKey] = {
      value: r.value,
      directorNote: r.directorNote,
      version: r.version,
      currentVersionId: r.currentVersionId,
    };
  return map;
}

/**
 * DL-059 — full history for one content key, newest first. Only ever
 * called from the content admin page's History panel, never from a
 * hot read path (Templates/Reflex preview), so a per-key query here
 * doesn't risk N+1 the way it would if the list pages called it.
 */
export async function getContentVersions(tenantId: string, contentKey: string): Promise<ContentVersionRow[]> {
  const rows = await db
    .select()
    .from(editableContentVersions)
    .where(and(eq(editableContentVersions.tenantId, tenantId), eq(editableContentVersions.contentKey, contentKey)))
    .orderBy(desc(editableContentVersions.createdAt));
  return rows.map((r) => ({
    id: r.id,
    value: r.value,
    directorNote: r.directorNote,
    editedBy: r.editedBy,
    createdAt: r.createdAt,
  }));
}
