# X-PATH — Decision Log

Format: DL-nnn · decision · rationale.

- **DL-001 — Two separate data domains (private workspace vs clinical record).**
  Dr. Ivo requires pathologists' private professional space to be inaccessible
  to anyone, including him; a signed patient report must remain in the audited
  medical record of truth. Modelled as two tables with different access rules.
- **DL-002 — Audit log is append-only.** Legal/ISO 15189 requirement; no update
  or delete path in code (`lib/audit.ts` write-only).
- **DL-003 — Multi-tenant from the foundation.** X-PATH expands beyond
  BettaHealth; retrofitting tenancy is a rebuild. Every row tenant-scoped.
- **DL-004 — Advisory frame.** Platform never interprets patient images or
  originates a diagnosis. Keeps X-PATH out of IVDR/FDA device scope and off the
  pathologist's medico-legal responsibility.
- **DL-005 — Template logic only, not content.** CAP/WHO/AJCC text is
  copyrighted. Content comes from client originals, ICCR (free), or in-house
  authoring; only structural logic is reused.
- **DL-006 — Strong encryption + isolation, not zero-knowledge.** The AI must
  read dictation to assist; search/backup must work. Promise: private from other
  humans, never browsed — not "mathematically unreadable".
- **DL-007 — Scope discipline.** Phase 1 = engine + 3–5 real templates; not 130
  templates, not 10 agents.
- **DL-008 — Auth: TOTP authenticator, not SMS.** Free, works with no mobile
  signal in the lab, nothing to intercept.
- **DL-009 — Second-factor state lives in the JWT, upgraded via
  `unstable_update`.** `/api/auth/verify-totp` verifies the authenticator
  code, then calls NextAuth's `unstable_update({ totpVerified: true })` to
  upgrade the session token in place, rather than persisting a "verified"
  flag in Postgres. Keeps 2FA state ephemeral per-session (re-verify on a
  fresh login) and avoids a write path that isn't the audit log. Tracked as
  a risk in `docs/known-risks.md` (R-009) because the API is explicitly
  `unstable_`.
- **DL-010 — `trustHost: true` in `auth.config.ts`.** M1 deploys to a
  Vercel *preview* URL that changes per deploy; Auth.js otherwise requires
  the request host to match `AUTH_URL` exactly. **Incomplete on its own —
  see DL-019: an explicitly-set `AUTH_URL` still overrides `trustHost` for
  outbound redirect construction.**
- **DL-011 — CSRF and rate-limit state for `/api/auth/verify-totp` are
  both explicit application code, not framework defaults.** NextAuth's
  CSRF token only protects its own `/api/auth/callback/*` handlers; a
  same-origin `Origin`-vs-`Host` check was added by hand
  (`src/app/api/auth/verify-totp/route.ts`). Lockout counters
  (`users.totpFailedAttempts`, `totpLockedUntil`) are stored in Postgres
  rather than in memory because the app runs as stateless serverless
  functions — an in-process counter would reset or fail to share state
  across invocations and would not actually limit anything.
- **DL-012 — G2a added to PROJECT_HEADER.md (v1.0 → v1.1, 2026-08-02):
  no notification/alert/digest/reporting layer of any kind into a
  pathologist's activity, for anyone but the pathologist.** Broader than
  "no Telegram" — the test is whether a piece of infrastructure *could*
  be used to surface pathologist activity to the owner, not whether the
  current feature does. Repo docs synced to match: removed stale
  Telegram/"notifications" references from `docs/architecture.md`,
  `docs/workflow-map.md`, and `README.md` (all previously listed it as
  deferred to "Session 02+" rather than permanently excluded).
  `.env.example` and `PROJECT_HEADER.md` were already current — no
  Telegram placeholders present. This entry exists so the exclusion is
  traceable in repo history, not just in the header.
- **DL-013 — Template engine tiers follow CAP's own convention
  (core/conditional/non-core), not a new scheme.** Unmarked field = core;
  "(required only if applicable)" = conditional; "+" prefix in the CAP
  source = non-core. Reusing their tiering means the derived data stays
  legible against the source protocol during director review, without
  inventing an X-PATH-specific taxonomy.
- **DL-014 — "Standardized comment" checklist options are represented as
  `needsInHouseAuthoring: true`, not populated with CAP's paragraph
  text.** Several CAP protocols (e.g. Breast Biomarker's ER low-positive
  comment, HER2 ISH Group 2/3/4 comments) include full authored-paragraph
  checklist options, not just a label or controlled-vocabulary term —
  copying those verbatim would cross Header G3. Each is stored with a
  short, in-house-written label standing in for the real text, which must
  be authored in-house or licensed as part of the director-approval step
  before clinical use (Header §7 quality gate: copyright check).
- **DL-015 — M3 template rendering is a static, non-interactive
  structural render for this milestone.** Renders tiers, controlled
  vocabulary, free-text slots, and repeatable-block markers from the
  versioned data, with inputs disabled — no value binding. Binding
  transcript/dictation output to these fields is M5 (auto-fill), not M3.
- **DL-016 — Sign-in form switched from posting directly to
  `/api/auth/callback/credentials` to a Server Action calling `signIn`
  from `@/auth`.** A real browser walkthrough of the claim wizard (not
  the earlier scripted HTTP tests, which manually fetched and injected a
  CSRF token the real page never provided) surfaced `?error=MissingCSRF`
  on the actual, unmodified sign-in page — it had never included the
  `csrfToken` field Auth.js's own callback endpoint requires. Calling
  `signIn()` in-process from a Server Action sidesteps that HTTP
  round-trip and its CSRF-cookie requirement entirely; Next.js's own
  built-in Origin-header check for Server Actions covers CSRF instead
  (same protection the claim wizard's own actions already rely on — see
  DL-011's note on custom Route Handlers needing it manually, which
  Server Actions don't). This means the M1 "login works" verification
  from the previous session was true of the API, not of the actual page a
  human uses — logged as a process lesson, not just a code fix.
- **DL-017 — Claim wizard Step 1 explicitly refreshes the JWT's cached
  email/name via `unstable_update`.** Also caught by the same browser
  walkthrough: after replacing the placeholder email in the DB, the
  dashboard header kept showing the old placeholder — the JWT token
  caches `email`/`name` at login and nothing was refreshing them
  mid-session. Fixed in `auth.config.ts`'s `jwt` callback (handles
  `session.user.email`/`name` on `trigger === "update"`, same pattern as
  `totpVerified`/`mustCompleteSetup`) plus a call to `unstable_update` at
  the end of `completeProfile`. The underlying DB write was always
  correct; only the session's cached copy was stale.
- **DL-018 — Session passwords for provisioned accounts are generated
  with `crypto.randomBytes(18).toString("base64url")` (~144 bits) and
  printed to console once, never written to any file.** Matches the
  existing `openssl rand -base64 32`-style bar for secrets in this repo;
  swept the working tree for all 8 generated passwords after provisioning
  to confirm none landed in a tracked (or even untracked) file.
- **DL-019 — `AUTH_URL` removed entirely from Vercel (Production +
  Preview), not pointed at the preview host.** `trustHost: true` (DL-010)
  only relaxes Auth.js's *inbound* host-acceptance check; an explicitly
  set `AUTH_URL` still wins for *outbound* redirect construction. With
  `AUTH_URL=https://xpath.report` set (the eventual production domain,
  not DNS-live until M7), a real browser walkthrough — not scripted HTTP
  checks, which used `redirect: 'manual'` and never actually followed the
  Location header — found that login redirected users mid-flow off
  `xpath-report.vercel.app` onto `xpath.report`, which resolved to
  Hostinger's parked-domain page, losing the session with no error
  (R-018). Removing `AUTH_URL` lets `trustHost` fully take over: Auth.js
  now infers the host from each actual request, which works correctly on
  the current Vercel URL *and* will keep working unchanged once
  `xpath.report` DNS goes live at M7 — no second fix needed then.
  Re-verified via full browser walkthrough after the env var was removed:
  login+TOTP succeeds end to end, host never changes, audit_log entry
  confirmed written.
- **DL-020 — Dictations reuse `private_workspace_items` (`kind:
  "dictation"`) rather than a new table.** The existing schema already
  has exactly what's needed: `fileRef` for the R2 audio key, `body` for
  the transcript, owner/tenant scoping. A dictation is private-workspace
  data until reviewed and saved (Header G2) — it's not part of the
  audited clinical record until sign-out (M6, not yet built), so no
  `audit_log` entry is written for capture/transcribe/save actions,
  matching G2's "owner does not surveil pathologists' private work."
  Added one column (`language`, for the Whisper `language` param).
- **DL-021 — Audio uploads go direct browser-to-R2 via a short-lived
  (5 min) presigned PUT URL, not through a serverless function.**
  Matches `docs/architecture.md`'s existing note (avoids Vercel's
  request-body size/time limits on longer dictations). Transcription
  then happens server-side: download from R2, forward to Whisper — never
  routes the raw audio blob through a client-controlled proxy.
- **DL-022 — Pseudonymization for M4 means "no structured identifying
  fields in the OpenAI request," not "redacted audio."** Header §5
  requires pseudonymizing before any external AI call. Only raw audio
  bytes are sent to Whisper (`src/lib/transcription.ts`) — no patient
  name/MRN/DOB or any other field is attached. Redacting spoken PII
  *within* the audio itself before transcription isn't solved (would
  require transcribing first) — logged as an open, procedurally
  mitigated risk (R-021), not silently treated as solved.
- **DL-023 — Structuring engine validates every AI-returned field
  against two things before trusting it: (1) the path/option key must be
  real (rejects invented fields), (2) a verbatim quote from the
  transcript must ground it (rejects ungrounded values).**
  (`src/lib/structuring.ts:validateAndGround`) This is the concrete
  mechanism behind Header G8 ("never fabricate") for M5 — not a policy
  statement, an actual runtime check. What it does NOT catch: the model
  can quote real transcript text while still miscategorizing it (e.g.
  "ninety percent" correctly quoted but bucketed into the wrong adjacent
  range option) — logged as R-023, mitigated by every AI field showing
  its grounding quote so the pathologist (who must review before
  sign-out, M6) catches the mismatch, not by trying to perfect numeric-
  range parsing.
- **DL-024 — `flattenTemplate` gives "Specify X: ___" companion
  text/number inputs their own addressable path
  (`{fieldPath}.{optionKey}.text`), separate from the option-selection
  path itself.** Found via real testing, not designed in from the start:
  the first version only let the structuring engine record *that* a
  "specify" option was chosen, not *what* the specified value was — e.g.
  "ER positive, 90%" would auto-fill "positive" but silently drop the
  actual 90%. Since nearly every quantitative field in these CAP
  templates (percentages, mm measurements) uses this exact
  select-then-specify pattern, this was a real, not theoretical, data-
  fidelity gap.
- **DL-025 — Template suggestion (M5) is a deterministic keyword-overlap
  score, not another paid AI call.** With only a few Phase-1 templates
  and the pathologist always confirming explicitly (Header §5: "auto-
  suggest, human confirms, never blind-route"), ranking quality here is
  a convenience, not a safety boundary — a free heuristic is enough.
  Revisit only if the shortlist quality becomes a real problem once more
  templates exist.
- **DL-026 — Report drafts (`kind: "report_draft"`) store structured
  field values in a new `jsonb` `data` column, not by extending `body`.**
  Keeps the raw transcript (on the linked dictation item's `body`)
  separate from the structured interpretation of it (`fieldValues`,
  `aiFieldPaths`, `quotes`, `reflexSuggestions` on the draft item) —
  both stay private-workspace data, not audited, until M6 sign-out.
- **DL-027 — Remaining Phase-1 templates (Colon & Rectum, Prostate
  Needle Biopsy, Lymphoma Basic) extracted via parallel forked agents,
  each given the exact same G3 boundary instructions and the Breast
  templates as a reference pattern — then independently re-verified
  (not just trusted) before wiring up: full-repo typecheck, a duplicate-
  field-path check across all 6 templates via `flattenTemplate`
  (`0` collisions), templateId uniqueness, a grep for suspiciously long
  label strings (a copied-prose smell test), and a manual read of each
  file's header comment plus one substantive section.** CUP was built
  the same way but from the header's generic-fallback-protocol pattern
  instead of a CAP source, since none exists for CUP.
- **DL-028 — Prostate Needle Biopsy is modeled as ONE `TemplateVersion`
  combining CAP's specimen-level and case-level protocol pair**, not two
  separate templates — a real needle biopsy report synthesizes both
  levels into one document. Specimen-level findings are a repeatable
  block (`max: 24`, one per positive core/zone); case-level fields
  summarize across all of them. A shared 22-zone location option list is
  factored into one helper function, reused across both levels, rather
  than duplicated three times.
- **DL-029 — `TemplateField.tier` is per-field, not per-option (existing
  M3 schema constraint) — Lymphoma Basic's "Final Integrated Diagnosis"
  field has 3 of its ~100 options marked non-core by CAP while the rest
  are core.** Modeled as a single `core` field (matching the large
  majority of its options) rather than changing the schema to support
  per-option tiers for one field in one template. Logged explicitly in
  the file's own header comment, not silently smoothed over — worth
  revisiting only if per-option tiering turns out to matter for more
  templates later.
- **DL-030 — `flattenTemplate`'s `cannotBeDetermined` handling was
  fixed to preserve the flag so M6's review/edit form (and G8's "never
  fabricate — flag missing info, don't fill it" requirement) can
  actually express "cannot be determined."** Building M6 surfaced that
  the flag was silently dropped by the M5-era flatten logic. Re-verified
  the fix caused no regressions: `0` duplicate field paths across all 6
  templates after the change (same check as DL-027).
- **DL-031 — M6's review/edit form (`src/app/(app)/dashboard/review/
  [draftId]/page.tsx`) is a flat, uniform field-per-row editor built on
  `flattenTemplate`, not a re-implementation of the nested tree UI from
  `template-view.tsx`.** Every field shape M6 needs (single/multi-select,
  text/number, "specify" companion values, "cannot be determined") is
  already one addressable dotted path, so one render function
  (`FieldEditor`) covers all of them instead of duplicating the
  recursive section/field tree a second time. Known simplification, not
  hidden: a selected single-select radio can't be un-selected without
  JS in this first version — a real but minor rough edge.
- **DL-032 — Sign-out (`signAndAssign`) look-up-or-create the `cases`
  row by `(tenantId, accession)` rather than requiring a pre-existing
  case.** M6's scope is the signing loop, not a full accessioning
  workflow (that's technician-role territory, not yet built) — so the
  pathologist's own accession-number entry at sign-out is treated as
  authoritative for now. Cross-checking against a technician-created
  case is a real future feature, deliberately deferred.
- **DL-033 — PDF worker: `@react-pdf/renderer`, self-hosted inside the
  existing Vercel Node function — not headless Chromium, not a managed
  PDF/rendering API. Concrete recommendation presented to Marcel for
  approval per the pre-flagged M6 gate; approved 2026-08-03.** Rejected
  alternatives and why: Puppeteer/Playwright + `@sparticuz/chromium` in
  a Vercel serverless function reuses the existing HTML report layout
  more directly, but is fragile there in practice — binary size close
  to platform limits, slow cold starts, ongoing chromium-version
  maintenance for a one-person team. A managed PDF/headless-browser API
  (Browserless, PDFShift, DocRaptor, etc.) is fastest to integrate but
  sends real clinical report content (biomarker results, accession
  numbers, pathologist identity) to a third-party processor — a real
  vendor/privacy question this project hasn't needed to open, given G5
  ("realistic security, not zero-knowledge" — still a real bar, not an
  invitation to add avoidable third-party exposure). A dedicated PDF
  worker service on Render/Railway/Fly.io decouples from Vercel's
  constraints but adds a second deployment target to run/monitor/auth
  against — unjustified for v1. `@react-pdf/renderer` keeps report data
  from ever leaving the existing deployment and needs no new infra, at
  the cost of building the report layout once in PDF-native components
  (`src/lib/pdf/report-document.tsx`) rather than reusing the HTML view
  as-is. `/api/pdf/[recordId]` (Node runtime route handler) reuses the
  same `assertCanReadClinicalRecord` check as the archive detail page
  and logs the download as a `view_clinical_record` audit entry
  (`detail.format: "pdf"`) rather than adding a new `audit_action` enum
  value for one new read path. Verified end to end: real signed record
  from the M6 browser test, fetched through the real route with a real
  session, returned `200` with a valid `%PDF-` payload.
- **DL-034 — M2's dedicated private-workspace UI (personal notes CRUD,
  a learning/tips area) stays deferred going into M7; M7's own listed
  items (encryption indicator, archive search) are being built as part
  of M7, not treated as blocked on M2.** M2's underlying guardrail
  (`privateWorkspaceItems` + `assertWorkspaceOwner`, G2) has been real
  and enforced since M0/M1 — dictation and report drafts already live
  there. What was never built is dedicated UI for free-standing
  personal notes or a tips area; per Marcel's explicit "build straight
  through M5→M7, nothing here gates that," that UI stays out of this
  MVP-demo critical path rather than becoming a blocking detour. Not
  silently dropped — logged here so it isn't mistaken for "done."
- **DL-035 — M7 "EN/FR polish": UI chrome only (buttons, nav, static
  copy), EN default, via a lightweight i18n layer — NOT template field
  labels/options.** Presented to Marcel as a scope choice rather than
  assumed, because the alternative (drafting French translations for
  the ~700+ CAP-derived field labels/options across all 6 templates)
  would mean either fabricating unreviewed French pathology terminology
  (a real G8 risk — "never fabricate" applies to translation accuracy
  too, not just extracted values) or blocking on Dr. Ivo's review
  before this pass could ship. Approved 2026-08-03. Template field
  bilingual support is a real gap, not silently dropped — logged as
  R-029 in `docs/known-risks.md`.
- **DL-036 — Cloudflare DNS cutover for `xpath.report` executed by
  Marcel directly (2026-08-03), not by Claude Code.** No Cloudflare
  DNS/zone-management tool was available in this session (only
  D1/KV/R2/Workers/Hyperdrive MCP tools) — consistent with the
  project's SIGNAL protocol treating DNS/secrets as Marcel's own
  action, never executed blind. Independently re-verified afterward via
  direct fetch rather than trusting the report alone: both
  `xpath.report` and `www.xpath.report` correctly serve the real app
  through Vercel. Surfaced and fixed a second issue found while
  verifying: Vercel production was still on the pre-M6 deployment since
  M5–M7 had only ever been committed locally, never pushed to
  `origin/main` — pushed (Marcel's go-ahead), Vercel auto-deployed,
  re-verified live end to end (real login, Archive, real signed record,
  real PDF fetch — `200`, valid `%PDF-` bytes — all against production
  infrastructure, not local `.env.local`).
