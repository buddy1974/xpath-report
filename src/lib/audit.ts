/**
 * X-PATH — Append-only audit writer (PROJECT_HEADER G2)
 * ------------------------------------------------------------------
 * The ONLY way application code writes to the audit log. There is no update
 * or delete helper — by design. Every action on a clinical record calls this.
 */

import { db } from "@/db";
import { auditLog } from "@/db/schema";

type AuditAction =
  | "sign_in"
  | "sign_out_report"
  | "amend_report"
  | "view_clinical_record"
  | "create_case"
  | "system"
  | "totp_failed"
  | "totp_locked"
  | "account_claimed"
  | "content_edited"
  | "account_edited"
  | "account_suspended"
  | "account_blocked"
  | "account_reactivated"
  | "account_deactivated"
  | "announcement_edited"
  | "announcement_published"
  | "announcement_unpublished"
  | "reagent_item_added"
  | "reagent_item_updated"
  | "content_restored"
  | "content_version_deleted";

export async function writeAudit(params: {
  tenantId: string;
  actorId?: string | null;
  action: AuditAction;
  detail?: Record<string, unknown>;
}): Promise<void> {
  await db.insert(auditLog).values({
    tenantId: params.tenantId,
    actorId: params.actorId ?? null,
    action: params.action,
    detail: params.detail ?? null,
  });
}
