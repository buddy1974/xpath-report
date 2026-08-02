/**
 * X-PATH — Database schema
 * ------------------------------------------------------------------
 * This file encodes the PROJECT_HEADER guardrails at the data layer.
 * The separation below is INTENTIONAL and must not be collapsed.
 *
 *  G1  Multi-tenant from the foundation.            -> `tenants`, every row tenant-scoped
 *  G2  Private workspace  vs  Clinical record.      -> `privateWorkspaceItems`  vs  `clinicalRecords`
 *  G2  Signed reports are audited & immutable.      -> `clinicalRecords` + `auditLog`
 *
 * See docs/architecture.md and docs/decision-log.md (DL-001, DL-002).
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  jsonb,
  boolean,
  integer,
  index,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Enums                                                              */
/* ------------------------------------------------------------------ */

export const roleEnum = pgEnum("role", [
  "pathologist",
  "technician",
  "manager",
  "administrator",
]);

// Clinical records move through a lifecycle. Only "released" is the
// legal system-of-record state; everything before it is a working draft
// that still lives in the pathologist's private space (see below).
export const recordStatusEnum = pgEnum("record_status", [
  "draft", // being worked on — private to the author
  "released", // signed out — enters the audited clinical record of truth
  "amended", // formal addendum after release (never overwrite; new version)
]);

export const auditActionEnum = pgEnum("audit_action", [
  "sign_in",
  "sign_out_report", // pathologist validates & releases a report
  "amend_report",
  "view_clinical_record",
  "create_case",
  "system",
  "totp_failed", // wrong 2FA code (rate-limiting trail — security-checklist.md)
  "totp_locked", // 2FA lockout triggered after MAX_FAILED_TOTP_ATTEMPTS
]);

/* ------------------------------------------------------------------ */
/* G1 — Tenancy                                                       */
/* ------------------------------------------------------------------ */

// Tenant one = BettaHealth / X.PATH Labs. Built for many.
export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // Every user belongs to exactly one tenant. All access is scoped by this.
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    email: text("email").notNull(),
    displayName: text("display_name").notNull(),
    role: roleEnum("role").notNull(),
    passwordHash: text("password_hash").notNull(),
    // TOTP secret is ENCRYPTED at rest with ENCRYPTION_KEY (see lib/crypto.ts).
    // Never store the raw secret. Authenticator-app 2FA only (no SMS).
    totpSecretEncrypted: text("totp_secret_encrypted"),
    totpEnabled: boolean("totp_enabled").default(false).notNull(),
    // Rate limiting for /api/auth/verify-totp (security-checklist.md).
    // DB-backed, not in-memory: the app runs as stateless serverless
    // functions, so a per-instance counter would not actually limit
    // anything across invocations.
    totpFailedAttempts: integer("totp_failed_attempts").default(0).notNull(),
    totpLockedUntil: timestamp("totp_locked_until", { withTimezone: true }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    tenantIdx: index("users_tenant_idx").on(t.tenantId),
    // email unique *within* a tenant, not globally — a person could exist
    // under two labs once the platform is multi-tenant in the wild.
    emailTenantIdx: index("users_email_tenant_idx").on(t.tenantId, t.email),
  }),
);

/* ------------------------------------------------------------------ */
/* Cases — the shared clinical object (specimen/accession)            */
/* ------------------------------------------------------------------ */

export const cases = pgTable(
  "cases",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    accession: text("accession").notNull(), // e.g. HI-T-4226
    // The pathologist the case is assigned to. Access to draft work is
    // restricted to this owner (G2). Others cannot read another's drafts.
    assignedPathologistId: uuid("assigned_pathologist_id").references(
      () => users.id,
      { onDelete: "set null" },
    ),
    specimenType: text("specimen_type"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    tenantIdx: index("cases_tenant_idx").on(t.tenantId),
    assignedIdx: index("cases_assigned_idx").on(t.assignedPathologistId),
  }),
);

/* ------------------------------------------------------------------ */
/* G2 — Domain A: PRIVATE WORKSPACE                                   */
/* ------------------------------------------------------------------ */
/**
 * Per-user private space: drafts, notes, learning files, saved references,
 * tips. Access = owner ONLY. Not readable by other pathologists, managers,
 * or administrators — including the lab owner. Enforced in lib/access.ts
 * (assertWorkspaceOwner) on EVERY read. This protects the pathologist's
 * professional privacy and psychological safety (Header G2).
 */
export const privateWorkspaceItems = pgTable(
  "private_workspace_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    // The sole owner. There is deliberately no "shared with" column here.
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(), // note | draft | reference_file | tip
    title: text("title"),
    body: text("body"),
    fileRef: text("file_ref"), // R2 object key, if a file
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    ownerIdx: index("pws_owner_idx").on(t.ownerId),
  }),
);

/* ------------------------------------------------------------------ */
/* G2 — Domain B: CLINICAL RECORD OF TRUTH                            */
/* ------------------------------------------------------------------ */
/**
 * A released/signed patient report. This is a legal medical document and
 * part of the lab's system of record. Unlike the private workspace, a
 * released record is:
 *   - visible to the appropriate clinical/record roles (not "private"),
 *   - immutable after release (amend = new version, never overwrite),
 *   - always accompanied by an audit trail (auditLog).
 * A draft becomes a clinical record only at sign-out.
 */
export const clinicalRecords = pgTable(
  "clinical_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    caseId: uuid("case_id")
      .notNull()
      .references(() => cases.id, { onDelete: "restrict" }),
    // Who signed it. Accountability is explicit and permanent.
    signedByPathologistId: uuid("signed_by_pathologist_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    status: recordStatusEnum("status").notNull().default("released"),
    version: text("version").notNull().default("1"),
    // Structured report payload (synoptic values). Kept as JSON now;
    // becomes engine-driven templates in Session 02.
    content: jsonb("content").notNull(),
    releasedAt: timestamp("released_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    tenantIdx: index("cr_tenant_idx").on(t.tenantId),
    caseIdx: index("cr_case_idx").on(t.caseId),
  }),
);

/* ------------------------------------------------------------------ */
/* G2 — Append-only AUDIT LOG                                          */
/* ------------------------------------------------------------------ */
/**
 * Every action on a clinical record is recorded here. This table is
 * WRITE-ONLY by application code (see lib/audit.ts). There is no update or
 * delete path. An ISO 15189 assessor's record.
 */
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    actorId: uuid("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: auditActionEnum("action").notNull(),
    // Free-form context (record id, case accession, etc). Never PHI beyond
    // what is necessary to identify the record.
    detail: jsonb("detail"),
    at: timestamp("at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    tenantIdx: index("audit_tenant_idx").on(t.tenantId),
    atIdx: index("audit_at_idx").on(t.at),
  }),
);

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Tenant = typeof tenants.$inferSelect;
export type Role = (typeof roleEnum.enumValues)[number];
