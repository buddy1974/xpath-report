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
  uniqueIndex,
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

// DL-054 — super-admin account management. Separate from `isActive`
// (unchanged, still the single thing the login check reads) so that
// "reactivate" can structurally distinguish a merely suspended/blocked
// account from a deactivated (soft-deleted) one — a boolean alone
// can't tell those apart. suspended/blocked/deactivated all imply
// isActive=false; only "active" implies isActive=true. Kept in sync by
// the account-status server action, not by a DB trigger.
export const accountStatusEnum = pgEnum("account_status", [
  "active",
  "suspended",
  "blocked",
  "deactivated",
]);

// DL-054 — announcements/news ticker.
export const announcementCategoryEnum = pgEnum("announcement_category", [
  "news",
  "operational",
  "emergency",
]);
export const announcementStatusEnum = pgEnum("announcement_status", [
  "draft",
  "published",
]);

// DL-055 — reagent/equipment tracking. "antibody" covers the register
// plus any admin-added reagent; "equipment" tracks calibration only.
export const reagentItemTypeEnum = pgEnum("reagent_item_type", [
  "antibody",
  "equipment",
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
  "account_claimed", // first-login claim wizard completed (profile + TOTP enrollment)
  // DL-054 — admin-editable default content (Header G3: saving an edit
  // from the administrator account IS the director-approval step).
  "content_edited",
  // DL-054 — super-admin account management. Distinct actions, not one
  // generic "account_changed", so the audit trail reads unambiguously.
  "account_edited",
  "account_suspended",
  "account_blocked",
  "account_reactivated",
  "account_deactivated",
  // DL-054 — announcements/news ticker.
  "announcement_edited",
  "announcement_published",
  "announcement_unpublished",
  // DL-055 — reagent/equipment tracking.
  "reagent_item_added",
  "reagent_item_updated",
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
    // First-login claim wizard (team provisioning). Accounts are created
    // with a placeholder email + a strong random session password and
    // must complete this before /dashboard is reachable — enforced in
    // authConfig.callbacks.authorized, same pattern as totpVerified.
    mustCompleteSetup: boolean("must_complete_setup").default(true).notNull(),
    // Set when claim-wizard Step 1 (profile) is submitted — lets the
    // wizard resume at Step 2 (TOTP enrollment) rather than re-asking for
    // profile info if the session is abandoned partway.
    profileCompletedAt: timestamp("profile_completed_at", { withTimezone: true }),
    department: text("department"),
    phone: text("phone"),
    // R2 object key for the profile picture, if uploaded — same
    // tenant/owner-scoped key convention as dictation audio (lib/r2.ts).
    // Never a public URL; always served through /api/avatar/me so
    // access stays behind the normal session check.
    avatarKey: text("avatar_key"),
    isActive: boolean("is_active").default(true).notNull(),
    // DL-054 — see accountStatusEnum's comment above. `isActive` remains
    // the sole thing `authorize()` checks at login; this column is the
    // richer, admin-facing state.
    status: accountStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    tenantIdx: index("users_tenant_idx").on(t.tenantId),
    // email unique *within* a tenant, not globally — a person could exist
    // under two labs once the platform is multi-tenant in the wild. A real
    // (not just advisory) constraint, so a claim-wizard email change can't
    // silently collide with an existing account in the same tenant.
    emailTenantIdx: uniqueIndex("users_email_tenant_idx").on(t.tenantId, t.email),
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
    kind: text("kind").notNull(), // note | draft | reference_file | tip | dictation | report_draft
    title: text("title"),
    body: text("body"),
    fileRef: text("file_ref"), // R2 object key, if a file
    // Dictation language (M4 — EN/FR), passed through to Whisper's
    // `language` param for accuracy. Null for non-dictation kinds.
    language: text("language"),
    // M5 — kind "report_draft" only: { templateId, dictationId, fieldValues:
    // {path: value}, aiFieldPaths: [path] (still AI-sourced, not yet
    // human-edited — Header G1/G8: AI content always visibly marked),
    // quotes: {path: quote} (grounding text, for the pathologist to verify
    // against the transcript), reflexSuggestions: [...] }. Structured
    // values live here, not on `body` — `body` stays the raw transcript
    // text on the linked dictation item.
    data: jsonb("data"),
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
/* DL-054 — Admin-editable default content (Header G3/G4)             */
/* ------------------------------------------------------------------ */
/**
 * Generic, versioned override layer for admin-editable "default content"
 * — template titles/blurbs/section titles, the Reflex Testing preview
 * text, and similar structural/reference content. NEVER pathologist
 * personal content (drafts/notes/profiles stay exactly as owner-only as
 * `privateWorkspaceItems` already enforces — this table has no owner
 * concept at all, only tenant + content key).
 *
 * One current row per (tenant, contentKey) — editing overwrites `value`
 * and bumps `version`; the audit log (action "content_edited", written
 * on every save) is the version *history*, so this table doesn't need
 * its own separate history table. Per Header G3, saving an edit from
 * the administrator account IS the director-approval step — no
 * separate approval workflow. Already-signed `clinicalRecords` are
 * immutable JSONB snapshots and are never affected by a content edit;
 * only *new* structuring/report work sees the updated value.
 */
export const editableContent = pgTable(
  "editable_content",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    // e.g. "reflex_preview.17_4_tier1", "template.breast-invasive-resection.blurb".
    contentKey: text("content_key").notNull(),
    value: text("value").notNull(),
    // Free-text, template/section-level (never per-patient). Surfaced to
    // pathologists as guidance/context alongside the content it annotates
    // (Marcel's explicit call) — advisory only, never auto-applied to any
    // field (Header G1).
    directorNote: text("director_note"),
    version: integer("version").notNull().default(1),
    updatedBy: uuid("updated_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    tenantIdx: index("editable_content_tenant_idx").on(t.tenantId),
    keyIdx: uniqueIndex("editable_content_key_idx").on(t.tenantId, t.contentKey),
  }),
);

/* ------------------------------------------------------------------ */
/* DL-054 — Announcements / news ticker                                */
/* ------------------------------------------------------------------ */
/**
 * Single-role broadcast (administrator only — no editor/moderator sub-
 * roles). Informational only, never a channel for clinical guidance
 * (that stays in templates/protocol-library/reflex-testing). EN/FR text
 * is authored directly by the admin, not translated — this is original
 * admin-authored content, not spec-derived, so direct dual authorship
 * is correct (unlike template/reflex content, which stays English-only
 * per DL-035/R-029).
 */
export const announcements = pgTable(
  "announcements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    tickerTextEn: text("ticker_text_en").notNull(),
    tickerTextFr: text("ticker_text_fr").notNull(),
    bodyEn: text("body_en").notNull(),
    bodyFr: text("body_fr").notNull(),
    category: announcementCategoryEnum("category").notNull().default("news"),
    link: text("link"),
    status: announcementStatusEnum("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    // null = indefinite, until manually unpublished.
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    tenantIdx: index("announcements_tenant_idx").on(t.tenantId),
    statusIdx: index("announcements_status_idx").on(t.status),
  }),
);

/* ------------------------------------------------------------------ */
/* DL-055 — Reagent / equipment tracking                              */
/* ------------------------------------------------------------------ */
/**
 * Seeded once per tenant from src/lib/reagents/register.ts (X.PATH's
 * real 38-antibody register + BenchMark ULTRA) on first visit to
 * /dashboard/reagents — `registerKey` is that seed's stable slug so a
 * reseed never duplicates a row. Admin-added items (anything not on
 * the register) carry `registerKey: null`. Stock tracking applies to
 * "antibody" rows, calibration tracking to "equipment" rows — a single
 * table rather than two, since both are "the same admin screen's
 * editable rows with an alert threshold," and every field beyond
 * name/type is nullable so neither kind forces the other's columns.
 */
export const reagentItems = pgTable(
  "reagent_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    registerKey: text("register_key"),
    type: reagentItemTypeEnum("type").notNull(),
    name: text("name").notNull(),
    clone: text("clone"),
    catalogueRef: text("catalogue_ref"),
    vendor: text("vendor"),
    // "antibody" fields — null for equipment rows.
    currentStock: integer("current_stock"),
    lowStockThreshold: integer("low_stock_threshold").default(5),
    lastRestockedAt: timestamp("last_restocked_at", { withTimezone: true }),
    // "equipment" fields — null for antibody rows.
    lastCalibratedAt: timestamp("last_calibrated_at", { withTimezone: true }),
    calibrationIntervalDays: integer("calibration_interval_days"),
    updatedBy: uuid("updated_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    tenantIdx: index("reagent_items_tenant_idx").on(t.tenantId),
    keyIdx: uniqueIndex("reagent_items_key_idx").on(t.tenantId, t.registerKey),
  }),
);

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Tenant = typeof tenants.$inferSelect;
export type Role = (typeof roleEnum.enumValues)[number];
