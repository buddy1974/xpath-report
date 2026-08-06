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
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { editableContent } from "@/db/schema";

export type ContentOverride = { value: string; directorNote: string | null; version: number };

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
  for (const r of rows) map[r.contentKey] = { value: r.value, directorNote: r.directorNote, version: r.version };
  return map;
}

export async function getAllContentOverrides(tenantId: string): Promise<Record<string, ContentOverride>> {
  const rows = await db.select().from(editableContent).where(eq(editableContent.tenantId, tenantId));
  const map: Record<string, ContentOverride> = {};
  for (const r of rows) map[r.contentKey] = { value: r.value, directorNote: r.directorNote, version: r.version };
  return map;
}
