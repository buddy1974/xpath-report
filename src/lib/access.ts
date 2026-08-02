/**
 * X-PATH — Access isolation guards
 * ------------------------------------------------------------------
 * The PROJECT_HEADER guardrails are only real if they are enforced in code.
 * These helpers are the single choke-point for that enforcement. Every
 * data-access path must go through them.
 *
 *  G1  Tenant scoping:   a user may only ever touch rows in their own tenant.
 *  G2  Workspace privacy: a private-workspace item is readable ONLY by its
 *      owner — not by managers, not by administrators, not by the lab owner.
 *
 * Rule: never hand-roll a query that reads clinical or workspace data without
 * passing the actor through assertSameTenant / assertWorkspaceOwner first.
 */

import type { Role } from "@/db/schema";

export class AccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccessError";
  }
}

export interface Actor {
  id: string;
  tenantId: string;
  role: Role;
}

/** G1 — same-tenant or nothing. */
export function assertSameTenant(actor: Actor, resourceTenantId: string): void {
  if (actor.tenantId !== resourceTenantId) {
    throw new AccessError("Cross-tenant access denied");
  }
}

/**
 * G2 — private workspace is owner-only.
 *
 * There is deliberately NO role that can override this. An administrator or
 * manager calling this for someone else's item is denied, by design. This is
 * the code that makes "Dr. Ivo does not want access into individual
 * pathologists' private work" true rather than aspirational.
 */
export function assertWorkspaceOwner(
  actor: Actor,
  item: { tenantId: string; ownerId: string },
): void {
  assertSameTenant(actor, item.tenantId);
  if (actor.id !== item.ownerId) {
    throw new AccessError("Private workspace is owner-only");
  }
}

/**
 * Draft clinical work (status = "draft") is still private to the assigned
 * pathologist. Only once RELEASED does it become visible to record roles.
 */
export function canReadClinicalRecord(
  actor: Actor,
  record: {
    tenantId: string;
    status: "draft" | "released" | "amended";
    signedByPathologistId: string;
  },
): boolean {
  if (actor.tenantId !== record.tenantId) return false;

  // Drafts: only the author.
  if (record.status === "draft") {
    return actor.id === record.signedByPathologistId;
  }

  // Released / amended: part of the clinical record of truth. Visible to
  // clinical & record roles within the tenant. (Managers see records for
  // operations; they do NOT see private workspaces — different domain.)
  return (
    actor.role === "pathologist" ||
    actor.role === "manager" ||
    actor.role === "administrator"
  );
}

export function assertCanReadClinicalRecord(
  actor: Actor,
  record: {
    tenantId: string;
    status: "draft" | "released" | "amended";
    signedByPathologistId: string;
  },
): void {
  if (!canReadClinicalRecord(actor, record)) {
    throw new AccessError("Not permitted to read this clinical record");
  }
}
