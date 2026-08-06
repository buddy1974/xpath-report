/**
 * X-PATH — audit-log export query (DL-055)
 * ------------------------------------------------------------------
 * Reads the existing append-only audit_log (lib/audit.ts) — this is a
 * read/format layer only, not a new logging mechanism. Tenant-scoped,
 * joined with `users` for a human-readable actor name. Never touches
 * `privateWorkspaceItems` or `clinicalRecords` (Header G2) — the audit
 * log's own `detail` jsonb is whatever each write already stored, none
 * of which includes report content.
 */
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { auditLog, users } from "@/db/schema";

export interface AuditExportRow {
  at: Date;
  actorName: string | null;
  action: string;
  detail: unknown;
}

export async function getAuditExportRows(tenantId: string, from?: Date, to?: Date): Promise<AuditExportRow[]> {
  const conditions = [eq(auditLog.tenantId, tenantId)];
  if (from) conditions.push(gte(auditLog.at, from));
  if (to) conditions.push(lte(auditLog.at, to));

  const rows = await db
    .select({ at: auditLog.at, actorName: users.displayName, action: auditLog.action, detail: auditLog.detail })
    .from(auditLog)
    .leftJoin(users, eq(users.id, auditLog.actorId))
    .where(and(...conditions))
    .orderBy(desc(auditLog.at));

  return rows;
}
