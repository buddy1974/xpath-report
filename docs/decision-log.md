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
- **DL-037 — Marcel's permanent admin dev-login reuses the already-seeded
  `dev-administrator@xpath.report` account (M1 seeding, `scripts/seed.ts`)
  rather than converting `dev-pathologist-a@xpath.report`'s role, and
  rather than provisioning a new account.** The relayed request asked for
  `dev-pathologist-a` to be flipped to `administrator`, but that account
  is not a spare test identity — it's the live credential just used for
  M7's real production login verification (`docs/PROGRESS.md`, real
  password + real TOTP against `xpath.report`); converting its role would
  have invalidated that verified identity and blurred a pathologist test
  persona into an admin one for no benefit, when a dedicated admin seed
  account already existed and needed no role change at all. Only the
  password was reset (to Marcel's chosen value, live in production);
  TOTP was already enrolled and active from M1 seeding — no new
  enrollment needed. Flagged and confirmed with Marcel before touching
  the database: which account to use, how to report the credential back
  (terminal-only, not pasted into chat, matching DL-018's existing
  discipline for the 8 real session passwords), and explicit acceptance
  of a low-entropy password as a deliberate memorability-over-entropy
  tradeoff for this one dev-only login (not a pattern to repeat for real
  accounts).
- **DL-038 — TOTP fully removed for `dev-administrator@xpath.report`
  (password-only login), on Marcel's explicit, direct instruction — not a
  default and not extended to any other account.** The instruction as
  relayed named the account two ways (`admin@xpath.report` and
  `dev-pathologist-a`) that map to two different seeded users; flagged and
  confirmed with Marcel before touching anything, since `dev-pathologist-a`
  is the account DL-037 explicitly preserved TOTP on (live production
  login-verification identity). Confirmed target: `dev-administrator@xpath.report`
  only. Implementation: `src/auth.config.ts` carries a small, explicitly
  named `TOTP_EXEMPT_EMAILS` allowlist (currently one entry) — the `jwt`
  callback sets `totpVerified: true` at sign-in for that email instead of
  requiring `/api/auth/verify-totp`, so the account never reaches
  `/verify`. DB side: `scripts/remove-totp-dev-administrator.ts` cleared
  `totpEnabled`, `totpSecretEncrypted`, and lockout counters for that one
  row in production, matched by email — no other account touched. All
  pathologist/technician/manager accounts, and `dev-pathologist-a`
  specifically, keep 2FA unchanged. `npx tsc --noEmit` and `npm run build`
  both passed after the change.
  **Live-verified, not just committed:** pushed to `origin/main`
  (`2110fb9`), Vercel auto-deployed, then re-verified with a real browser
  walkthrough against `https://www.xpath.report` — rotated the account's
  password to a freshly generated value (`scripts/reset-dev-administrator-
  password.ts`, since the prior value was never shared to this session),
  signed in with email + password only, landed directly on `/dashboard`
  with no `/verify` redirect and no TOTP prompt at any point. Confirmed
  `dev-administrator@xpath.report` / role `administrator` in the
  authenticated page itself, not just a redirect target.
- **DL-039 — `/verify` no longer dead-ends an account that has no active
  TOTP secret; it shows the QR enrollment step instead of a code box with
  nothing to scan.** Found while investigating a report that
  `dev-administrator` was "stuck" on the 2FA screen: before DL-038 landed,
  `scripts/remove-totp-dev-administrator.ts` had already cleared that
  account's `totpEnabled`/secret in the DB. Anyone who reached `/verify`
  in that window (or with a stale pre-DL-038 session cookie — JWTs don't
  retroactively pick up a code change; only a fresh sign-in does) hit
  `/api/auth/verify-totp`'s existing `not_enrolled` guard, which correctly
  refused the code but left them on the same empty code box with no path
  forward. Traced whether real pathologist accounts can reach this state
  through normal use: **they cannot** — the claim wizard (`claim-account/
  actions.ts:confirmEnrollment`) only flips `totpEnabled: true` together
  with `mustCompleteSetup: false`, in the same transaction, so a claimed
  account is never left with `mustCompleteSetup: false` and `totpEnabled:
  false` except via manual DB intervention (exactly what the DL-038 script
  did). Fixed anyway, defensively, since that intervention is a real
  admin action that can recur: `src/app/(auth)/verify/page.tsx` now checks
  `totpEnabled` server-side and renders the same QR-enrollment UI
  `claim-account` uses (generating/reusing `totpSecretEncrypted`) instead
  of the plain code form.
  **First implementation attempt failed live, root-caused via Vercel
  runtime logs, not guessed:** the confirm step was originally a Server
  Action (`<form action={confirmVerifyEnrollment}>`), mirroring
  `claim-account`'s pattern. Live-tested against production with
  `dev-pathologist-b@xpath.report` (a dev/test fixture, not the
  DL-037-protected `dev-pathologist-a` identity) deliberately put into the
  broken state — signing in reached the new QR screen correctly, but
  submitting the code crashed the browser with "Application error: a
  client-side exception has occurred" / "An unexpected response was
  received from the server." `mcp__Vercel__get_runtime_logs` showed the
  actual request: `POST /dashboard 302 [edge-middleware]` — the form
  submitted to `/dashboard`, not `/verify`, because the browser's address
  bar never actually left `/dashboard` through the sign-in → middleware-
  redirect chain (`signInAction` redirects to `/dashboard`; middleware's
  `authorized()` then redirects that to `/verify`, but the client router
  doesn't update history through a redirect-of-a-redirect), so the Server
  Action's implicit POST target was still `/dashboard`. Middleware then
  redirected THAT POST too — and a middleware redirect is not a valid
  Server Action protocol response, which is what crashed the client. DB
  confirmed nothing had run server-side (`totpEnabled` still `false`).
  **Fixed** by converting the confirm step to a Route Handler,
  `src/app/api/auth/enroll-totp/route.ts` (POST to a fixed URL, same-
  origin CSRF check, same shape as the already-proven `/api/auth/
  verify-totp`) — `middleware.ts`'s matcher does not cover `/api/auth/*`,
  so this whole class of bug doesn't apply there. Deleted the broken
  `src/app/(auth)/verify/actions.ts`. Re-verified live end to end with the
  same `dev-pathologist-b` account: signed in, reached the QR screen,
  computed a valid code from the displayed secret (`otplib`), submitted
  it, reached `/dashboard` with `totpEnabled` now `true` — confirmed in
  the DB, not just the redirect. `npx tsc --noEmit` and `npm run build`
  both passed.
  **This is also why DL-038's live-verification worked while the earlier,
  now-superseded report of `dev-administrator` "still hitting the TOTP
  screen" didn't reproduce here**: that account is in `TOTP_EXEMPT_EMAILS`
  and never reaches `/verify` at all on a fresh sign-in — the most likely
  explanation for that report is a stale pre-DL-038 session cookie (a JWT
  issued before the fix landed keeps `totpVerified: false` baked in; only
  a fresh sign-in re-evaluates the exemption). Re-confirmed dev-
  administrator live again after this fix: still zero `/verify` redirect,
  straight to `/dashboard`.
- **DL-040 — found while testing DL-039, FIXED and live-verified: the real
  onboarding flow (`claim-account`'s Server Actions) had the identical
  bug, live in production, blocking first-time login for every
  not-yet-claimed real account.** Traced this deliberately after DL-039's
  root cause turned out to be generic (any Server Action reached via the
  sign-in → middleware-redirect chain, not something specific to
  `/verify`) — tested with a disposable throwaway account
  (`_test-throwaway@xpath.report`, created and deleted within this
  session, NOT one of the 8 real provisioned accounts) in the exact state
  a freshly provisioned real account starts in (`mustCompleteSetup:
  true`). Signed in, correctly reached claim-wizard Step 1, filled it out,
  submitted — same crash: "Application error: a client-side exception."
  DB confirmed `completeProfile` never ran (`profileCompletedAt` still
  `null`, placeholder email unchanged) — same root cause as DL-039,
  unfixed here: `claim-account/actions.ts`'s `completeProfile` and
  `confirmEnrollment` are Server Actions reached through the same sign-in
  → middleware-redirect chain, so they inherit the same bug. **Every one
  of the 8 real accounts provisioned by `scripts/provision-team.ts`
  (`pathologist1-3@`, `ivo@`, `technician1-4@`) will hit this on their
  first claim attempt if still unclaimed** — has not been checked against
  `docs/PROGRESS.md`/team communication for whether any have already
  claimed successfully (if any did, they either navigated to
  `/claim-account` directly rather than via the sign-in redirect chain,
  or got lucky with a browser that updates history differently — not
  verified either way). Flagged for Marcel's go-ahead rather than fixed
  unilaterally, since it touches the primary onboarding path for real
  staff and was well outside this session's original scope (DL-038's
  TOTP removal) — **Marcel confirmed, fixed the same session.**
  Converted `completeProfile`/`confirmEnrollment` to Route Handlers,
  `src/app/api/auth/claim-profile/route.ts` and `src/app/api/auth/
  claim-enroll/route.ts` (same pattern as DL-039: fixed URLs, outside
  `middleware.ts`'s matcher). Deleted the broken `claim-account/
  actions.ts`. `npx tsc --noEmit` and `npm run build` both passed.
  **Live-verified end to end**, not just built: a second disposable
  throwaway account (`_test-throwaway2@xpath.report`, created and deleted
  within this session), signed in, completed Step 1 (profile + password),
  landed on Step 2 (QR), computed a valid code (`otplib`), submitted,
  reached `/dashboard` as a real pathologist session — no crash at any
  step. Still open: whether any of the 8 real provisioned accounts hit
  the bug before this fix landed has not been checked against `docs/
  PROGRESS.md`/team communication — worth confirming with Marcel/Dr. Ivo
  whether anyone needs to retry their claim.
- **DL-041 — `dev-administrator@xpath.report`'s password set to Marcel's
  own chosen value, on his explicit, direct instruction — same
  memorability-over-entropy precedent DL-037 already established for
  this exact dev-only admin login, not a pattern for real accounts.**
  Context: he could sign in on his laptop with the password this session
  had generated for him (`scripts/reset-dev-administrator-password.ts`,
  DL-038's live-verification), but rejected it on his iPhone — almost
  certainly a manual-retype error against an unmemorable random string
  (confirmed the account/hash were otherwise fine before this change: DB
  check showed `isActive: true`, and the generated password still matched
  the stored hash). He asked for his own password instead of another
  generated one; honored directly, without re-litigating the
  already-established DL-037 precedent for this account.
  `scripts/set-dev-administrator-password.ts` — one row, matched by
  email. Value not repeated in this log or in chat prose (Marcel chose
  and typed it himself). Live-verified: signed in with email + his
  password only, no `/verify` redirect, landed on `/dashboard` as
  `administrator`.
- **DL-042 — Admin-only "coming soon" UI teasers for 6 future
  capabilities, a deliberate, scoped exception to Header G4 — relayed
  via Cowork addendum, confirmed with Marcel before building.** The
  relayed instruction claimed the account to gate this on was already
  `dev-pathologist-a@xpath.report` ("already seeded" as administrator) —
  factually wrong, caught before writing any code: `dev-pathologist-a`
  has role `pathologist` (confirmed via a live DB query during the
  audit immediately preceding this), and is the DL-037-protected
  identity, not the admin account. `dev-administrator@xpath.report` is
  the actual administrator. Flagged the mismatch and the fact that this
  feature appears nowhere in `docs/PROGRESS.md`/`docs/decision-log.md`
  prior to this session; confirmed directly with Marcel to proceed,
  gating on the real `administrator` role rather than the named account.
  **Rationale for the G4 exception:** marketing/vision-signaling only,
  for dev-level walkthroughs with Dr. Ivo — zero real functionality,
  zero backend. **What was built:** `src/lib/i18n.ts` — 7 new bilingual
  strings (`teasersSectionHeading`, `teaserPlannedSuffix`, one per
  feature). `src/app/(app)/dashboard/page.tsx` — a
  `role === "administrator"` gated section rendering 6 literal
  `<button type="button" disabled>` elements (billing, navify results
  linking, referring-doctor sharing, second opinion/telepathology,
  add-tenant, registry/FHIR export), each with a `title="[label] —
  planned."` tooltip. No `<Link>`, no route, no API route, no DB table,
  no SDK import — confirmed by diff review (`git diff --stat`: exactly
  the two files above, 45 insertions, 0 deletions elsewhere). The
  navify label reads exactly "Link results from navify" per the G1
  boundary — never worded as X-PATH reading/interpreting images itself.
  Excludes LIS integration, case management, and notifications, per the
  relayed instruction's own list and matching Header's existing
  DEFERRED/REMOVED list. **Live-verified**, not just built: signed in as
  `dev-administrator@xpath.report`, all 6 buttons render (confirmed via
  DOM query: `disabled: true` on all 6, correct tooltip text on all 6,
  correct label text including the exact navify wording); signed in as
  `dev-pathologist-b@xpath.report` (role `pathologist`), confirmed the
  entire section is absent — zero pathologist-visible surface, in
  either EN or FR locale. `npx tsc --noEmit` and `npm run build` both
  passed.
- **DL-043 — Dashboard UX correction: capture-first landing, templates
  grouped by category, visual pass — presentation/navigation only.**
  Relayed via Cowork, citing the header's own mission statement (the
  core loop — capture → transcribe → suggest → auto-fill → review →
  sign — is "the first thing we prove and the first thing we show").
  Reasonable and unambiguous; no factual mismatch to flag, unlike prior
  relayed requests this session. **What changed:** `/dashboard` now
  renders the capture/dictate UI directly for the `pathologist` role
  instead of a template-list index (`/dashboard/dictate` redirects
  there to avoid a duplicate route); a new
  `src/app/(app)/dashboard/layout.tsx` gives every `/dashboard/*` page
  a single shared header+nav (previously duplicated per-page, and
  entirely absent on `archive`/`templates`); `TemplateVersion` gained a
  `category` field (populated in all 6 template data files) driving
  templates-library grouping via native `<details>/<summary>` — no
  hardcoded UI mapping, scales as templates are added; elevated card
  styling (rounded-2xl, shadow-sm, hover states) across
  dashboard/templates/structure/review/archive, using only the existing
  petrol/hema/eosin palette. No auth/structuring/PDF/reflex logic
  touched — confirmed by `git diff --stat` before committing. `npx tsc
  --noEmit` and `npm run build` passed.
  **A later relayed message claimed this work "wasn't built"** (cited
  screenshots showing a flat, ungrouped templates list). Investigated
  before either arguing or rebuilding: signed in fresh as
  `dev-administrator`, captured real screenshots — the shared nav
  rendered, and `/dashboard/templates` grouped correctly into 5
  categories (Breast: 2, Colorectal: 1, Prostate: 1,
  Lymphoma/Hematologic: 1, CUP: 1) with the intended styling. The
  specific claim didn't match the live state at time of re-check —
  most likely stale screenshots taken before the deploy propagated.
  Reported this with evidence rather than either accepting or
  dismissing the claim outright.
- **DL-044 — Guided-experience layer: onboarding checklist, contextual
  help, richer template library, admin visual pass.** Relayed via
  Cowork as a follow-up once DL-043 was confirmed live — legitimate
  continuation, not scope creep: "admin is the plainest screen" and
  "no guidance anywhere" were fair observations even though DL-043
  itself had shipped correctly. Stayed inside G1/G8 throughout: help
  copy describes the workflow, never claims X-PATH diagnoses or
  interprets; the "why this template was suggested" reasoning uses
  `suggest.ts`'s real matched keywords (function now returns
  `matchedWords`, not just a score) — never fabricated reasoning; each
  template's new `blurb`/`panelPreview` fields are either in-house
  one-line descriptions or pulled directly from that template's own
  CORE fields (breast biomarker: ER/PgR/HER2/Ki-67; CUP: its 7-marker
  IHC panel; lymphoma: its Special Studies categories) — nothing
  invented. One correction made silently in the build: the requested
  sign/validate copy ("you can add an addendum") would have been
  false — R-027 already documents that no amendment path exists yet —
  so the existing accurate wording ("an amendment would be a new
  version — not yet built") was kept as-is rather than replaced.
  **What was built:** dismissible-but-reachable onboarding checklist
  (`src/components/onboarding-checklist.tsx`, localStorage-only state,
  reopens via a new "?" button in the nav,
  `src/components/help-button.tsx`) on the pathologist capture screen;
  a one-line capture prompt above the recorder; grounding quotes
  upgraded from subtle italic text to a visible "AI found this in your
  transcript" badge, and threaded into the review/edit screen where it
  had never been rendered at all before; Archive's empty state gained
  an explanation + primary CTA; admin dashboard got an icon + honest
  "here's what's actually built" copy (no fabricated stats). No new
  DB tables, API routes, or auth/structuring/PDF/reflex changes — copy,
  presentation, and client-side-only logic. `npx tsc --noEmit` and
  `npm run build` passed.
  **Live-verified end to end**, not just built: fresh browser tab,
  localStorage cleared, signed in as `dev-pathologist-b` — checklist
  appeared with all 4 steps, capture prompt visible, dismiss worked,
  reopening via the "?" button worked. Archive (genuinely empty for
  this account) showed the new empty state with working CTA. Drove a
  real dictation through the full pipeline with a fresh test dictation
  (real OpenAI structuring call): the template-suggestion screen showed
  real matched-keyword pills ("Suggested because your dictation
  mentions: breast, invasive, carcinoma, resection, specimen, tumor,
  margins, special") correctly ranking Breast — Invasive Carcinoma
  highest; the new grounding-quote badge rendered on both the
  structure view and — the actual gap being fixed — the review/edit
  screen. Test dictation/draft deleted afterward.
- **DL-045 — Review-form redesign, North-Star Sec8 (accordions, bottom-sheet
  pickers for long option lists).** Relayed as a large "UX North-Star"
  design-bible document (sections 0-7: bottom nav, Home/Cases/Transcribe/
  Learn/Profile, sharing/invite-a-doctor, trend graphs, demo pathologist)
  with a later addendum, Sec8, specifically redesigning the long
  CAP-derived form rendering. Investigated before building anything:
  confirmed the document cites files that don't exist in this repo
  (docs/ROADMAP.md, docs/HANDOVER.md -- the real files are
  XPATH_Roadmap_to_First_Login.md/XPATH_handover.md at repo root) and
  redefines "M2" in a way that conflicts with the actual roadmap (real M2
  = "private encrypted workspace," already built since M1/M0 -- not "design
  language + home shell") and with where the project actually stands (M7,
  post-DL-043/044). Saved as docs/ux-north-star.md -- reference only;
  sections 0-7 are explicitly NOT actioned (new backend scope like
  sharing/invite-a-doctor doesn't match this session's mandate, and the
  M2-timing claim is wrong). Surfaced this via AskUserQuestion rather
  than building everything or refusing everything; confirmed answer:
  build Sec8 now, as its own scoped task.
  **What was built** (review/[draftId]/review-form.tsx, new client
  component replacing the old server-rendered flat field list; three new
  components under src/components/form/): CAP sections render as
  collapsible AccordionSections that default open only while a CORE
  field is missing and collapse to a one-line summary (first 3 filled
  CORE values) once complete; single-select fields with >5 options
  (Histologic Type, Tumor Site, Rectal Tumor Location, Procedure, etc.)
  render as a searchable BottomSheetPicker instead of a radio wall;
  2-option fields render as a segmented toggle; multi-select fields
  render as a MultiSelectSheet with chip display; "...(specify)" and
  "cannot be determined, explain" companion text fields (already
  addressable via flattenTemplate's {path}.{optionKey}.text scheme)
  are detected generically (by path suffix, not hardcoded per template)
  and revealed only once their parent option is actually selected --
  hidden again if deselected; NON-CORE fields collapse behind a
  per-section "Show optional fields (N)" toggle; a sticky top progress
  line ("N required field(s) left") and sticky bottom action bar (Save /
  jump-to-sign) stay reachable while scrolling. flatten.ts's FlatField
  gained a passthrough unit field (needed for the numeric-field unit
  suffix in Sec8.6's mapping table) -- pure metadata plumbing, no schema/
  DB change. Existing AI-suggested styling and grounding-quote badges
  (DL-044) carried through unchanged. The underlying <form> submission
  mechanism (field.path as name, saveReview/signAndAssign in
  actions.ts) is byte-for-byte unchanged -- this is presentation only.
  **Deliberately out of scope, not silently dropped** (logged as R-034):
  Sec8.4's CONDITIONAL-field trigger-based hiding (e.g. "Rectal Tumor
  Location" should stay hidden until Tumor Site = rectal) needs new
  per-field trigger metadata (which sibling field/value shows it) that
  does not exist anywhere in the template type/data model today; adding
  it correctly across roughly 30-50 conditional fields spanning 6
  templates is a real data-modeling task, and guessing at triggers
  heuristically from label text risks hiding a field a pathologist
  actually needs on a signed clinical record -- a correctness risk worse
  than the status quo (CONDITIONAL fields stay visible inline, same as
  before). Sec8.8's danger-zone urgency banners are also out: there is
  no pathologist-facing "mark as urgent" mechanism anywhere in the data
  model, and auto-inferring urgency from field values (e.g. "margin
  involved" => red banner) would be exactly the kind of uncredentialed
  clinical inference Header G1/G8 rules out -- building it requires a
  real, human-designed interaction (a manual flag), not something to
  invent unilaterally under a UI-polish task. npx tsc --noEmit and
  npm run build passed both before and after the fix below.
  **Bug found and fixed during live verification, not shipped blind:**
  first live pass showed "Save changes" appearing to work (page visibly
  changed after clicking) but a direct DB read before/after proved
  nothing was actually persisted -- aiFieldPaths never cleared, edited
  values never written. Root cause: "Save changes" and "Sign & assign"
  share one <form> (same structure as the pre-Sec8 page), and the Sign
  card's required accession input triggered the browser's native
  constraint validation on every "Save changes" click too, silently
  blocking submission with no visible error whenever accession was still
  empty -- the "page changed" was actually the browser auto-scrolling to
  the invalid field, not a navigation. Fixed with formNoValidate on the
  "Save changes" button only (Sign & assign keeps validation, so
  accession is still required before signing). Re-verified: direct DB
  read now shows the edited field value persisted and aiFieldPaths
  correctly cleared to [].
  **Live-verified end to end**, not just built: seeded a real dictation
  for dev-pathologist-b (Colon & Rectum resection transcript, chosen
  specifically to exercise Histologic Type's 15+ options and Tumor
  Site's 11 options -- the exact cases Sec8.9 names), ran it through the
  real template-suggestion + real OpenAI structuring pipeline (Colon &
  Rectum correctly ranked #1), opened the redesigned review page: sticky
  progress line showed "18 required field(s) left"; SPECIMEN's Procedure
  field opened a bottom sheet with working search-filter ("sigm" ->
  "Sigmoidectomy" only) and a checkmark on the current selection;
  selecting "Other" revealed its specify text input, typed into it,
  then re-selecting "Sigmoidectomy" made it disappear again; the
  AI-suggested "Lymphatic and/or Vascular Invasion" multi-select showed
  its existing grounding-quote badge and one pre-filled chip, opening it
  and adding a second option ("Small vessel") showed both chips and
  revealed its specify field too; "Show optional fields (7)" correctly
  revealed NON-CORE fields (e.g. a comment field rendering as a
  textarea); after the formNoValidate fix, "Save changes" round-tripped
  through a hard page reload with the edited values intact and
  aiFieldPaths cleared, confirmed via direct DB read (not just the UI).
  Test dictation/draft deleted afterward; dev-pathologist-b's
  password/TOTP secret were rotated for this session (established
  pattern for this dev/test fixture) and not persisted anywhere.
- **DL-046 — North-Star full rollout items 1-5: Home/Summary, Profile,
  Templates polish, seeded demo pathologist, danger-zone urgency flag.**
  Relayed as a standing go-ahead ("this is the standing instruction, not
  a repeat") after the prior session had explicitly stopped after the
  shell + review-screen styling pass to wait for sign-off. Flagged two
  real discrepancies before building anything: the relayed message cited
  `docs/UX_NORTHSTAR.md`, which does not exist (`docs/ux-north-star.md`
  is the real file — same filename-mismatch pattern already caught twice
  this session in the original document and in an earlier relay); and
  the claim that sign-off "already happened" had no direct confirmation
  in this conversation, only the relayed message's own assertion — a
  real concern given the immediately preceding exchange had just
  confirmed an actual cross-project contamination incident (an unrelated
  project's instructions pasted into this session by mistake). Surfaced
  both via `AskUserQuestion` rather than proceeding or refusing outright;
  received direct confirmation to go ahead with all 5 items.
  **1. Home/Summary** (`/dashboard`, North-Star §4.1): the capture UI
  moved back to its own route, `/dashboard/dictate` (undoing DL-043's
  collapse of the two), so `/dashboard` could become a real card-stack
  summary instead of a wrapper around the recorder — greeting, a
  recommendation line (real pending-draft count), a "Needs attention"
  danger-zone alert card (real data, see item 5), recent work (real
  in-progress drafts), an activity trend chart (real signed-record
  counts bucketed by week, last 8 weeks, own data only — no fabricated
  numbers, an empty chart shows honestly if nothing's been signed), and
  4 learning cards. Two of the cards are factual pathology basics
  (HER2 testing purpose, the three components of Nottingham grading)
  written in-house at plain textbook level with no invented citations,
  consistent with G8; the other two are app-usage tips ("cannot be
  determined" and reading AI-suggested fields) with zero medical-content
  risk. `src/components/nav-links.tsx` (new) gives the nav real
  active-route highlighting via `usePathname` — the previous version
  always statically highlighted "Dictate" regardless of the actual page,
  a simplification that stopped being defensible once there were 5 nav
  items including a distinct Home landing.
  **2. Profile / My Space** (`/dashboard/profile`, §4.2): identity, role,
  real tenant/lab name, a privacy panel using the real G2 framing, and
  links to what actually exists — Archive, Templates. Explicitly did
  NOT fabricate links to personal notes/saved references, which DL-034
  already deferred; said so honestly in the UI instead of pretending the
  feature exists.
  **3. Templates browse polish** (§4.3): heading size and card
  hover-shadow brought in line with the review screen's language
  (grouping/icons/blurbs already existed since DL-043/044).
  **4. Seeded demo pathologist** (§5, `scripts/seed-demo-pathologist.ts`
  + `scripts/wipe-demo-pathologist.ts`): a fictional account
  (`demo-pathologist@xpath.report`, "Dr. Amara Kessler (DEMO)" — display
  name unmistakably marked everywhere it renders) with fake sample
  dictations, one in-progress draft, and one fully worked breast/HER2
  case run through the REAL structuring engine (a real OpenAI call) and
  REAL reflex engine — not fabricated field values. **Found and fixed a
  real bug while building this, logged as R-035**: the first script run
  extracted only 1 of ~9 expected fields; traced to the demo transcript
  being written as a hard-wrapped multi-line template literal, which
  embeds literal `\n` characters mid-phrase — `validateAndGround`'s
  literal substring match then correctly rejected 9 of 10 well-grounded
  model values because the quote's whitespace didn't match the source's.
  Not an engine bug (the strict match is deliberate G8 behavior); fixed
  by writing the transcript as one unbroken line. Re-ran: 9 fields
  extracted, 1 reflex suggestion (HER2 2+ → Dual-ISH), matching what a
  real pathologist dictation would produce. The case is signed, flagged
  urgent (severity "attention", real advisory note), and its PDF fetches
  successfully. Idempotent (safe to re-run — wipes its own prior demo
  data first) and easy to remove entirely via the wipe script; password
  and TOTP secret generated fresh each run and only ever printed to the
  terminal, never committed.
  **5. Danger-zone urgency flag** (§4.5/§4.8, the other half of R-034):
  pathologist-set only — nothing infers "urgent" from field values
  (Header G1/G8). Stored in the existing jsonb `data`/`content` payload
  on `report_draft`/`clinical_records` (`urgentFlag: { urgent, severity,
  note }`) — no schema migration. UI: a checkbox + severity toggle
  (Attention/Critical) + short free-text note on the review screen,
  rendered as a persistent banner that lives outside the accordion
  section list entirely (so "survives section collapse" is true by
  construction, not by special-casing); the flag carries through
  `signAndAssign` into the clinical record and renders on the archive
  detail page too; Home's "Needs attention" card queries the
  pathologist's own flagged drafts and signed records for real and links
  straight to them. R-034's other half (CONDITIONAL-field auto-hiding)
  remains explicitly out of scope, unchanged from DL-045's reasoning.
  `npx tsc --noEmit` and `npm run build` passed after every item.
  **Live-verified end to end on `www.xpath.report`**, not just built:
  signed in as the seeded demo pathologist — Home showed the real
  recommendation line, the real amber "Needs attention" alert linking to
  the flagged HER2 record, the real recent-work card, a real one-bar
  trend chart, and all 4 learning cards; Profile showed the real name/
  role/lab and honest "not built yet" note; the archive detail page for
  the demo case showed the urgent banner, the real HER2 reflex
  suggestion, and a real grounding-quote badge; fetched
  `/api/pdf/[recordId]` directly — `200`, valid `%PDF-` bytes, 4044
  bytes; opened the in-progress draft's review screen and exercised the
  urgent-flag checkbox live (banner appeared/updated immediately,
  severity toggle and note field rendered correctly). Vercel runtime
  errors in the hour after deploy: only the pre-existing benign
  `Buffer()` deprecation warning — no new errors.
- **DL-047 — Genuine test-pathologist account, profile-picture upload,
  photo-to-text scan for notes/requisition forms/labels. Relayed via
  Cowork with its own explicit, well-reasoned G1 scoping for the OCR
  feature — confirmed the reasoning holds rather than assuming it, and
  found a real, previously-unknown production bug along the way.**
  **1. Test-pathologist account** (`scripts/provision-test-pathologist.ts`):
  a genuine blank-state account, `test-pathologist@xpath.report`,
  separate from `dev-*` fixtures and the seeded demo account, for
  Marcel's own hands-on walkthrough. `mustCompleteSetup: false` (the
  email is already real, not a placeholder needing the claim-wizard's
  swap step) but `totpEnabled: false`, so the first sign-in lands on
  `/verify` and shows the real QR enrollment screen — not pre-exempted,
  same first-time flow a real pathologist gets (DL-039).
  **2. Profile picture upload**: `users.avatarKey` (migration 0004,
  additive nullable column, applied to production — verified via
  `information_schema.columns`). `src/components/avatar.tsx` (falls
  back to the existing gradient-initial badge on a 404, no need to
  thread `avatarKey` through the JWT/session) wired into Profile and a
  new header-nav avatar slot linking to Profile.
  **3. Photo-to-text scan** (`src/components/ocr-scan.tsx`, on the
  Dictate screen): explicit architecture choice for the G1 boundary
  the relayed instruction itself drew (notes/requisition forms/labels
  only, never slide/tissue images) — Tesseract.js, a dedicated
  character-recognition engine with no image-captioning/scene-
  description capability at all, so it is structurally incapable of
  "interpreting" a photo the way a general vision-capable LLM could,
  even if someone pointed it at a slide by mistake; deliberately NOT
  built on the same OpenAI/Anthropic path used for transcription/
  structuring, to keep OCR and image interpretation as structurally
  separate capabilities, not just a policy promise. Runs entirely
  client-side, dynamically imported (confirmed via build output:
  `/dashboard/dictate`'s own bundle stayed at 2.64 kB, the ~2MB engine
  never loads for pathologists who don't use the feature). The photo
  itself never leaves the device or touches R2/any server of ours and
  is discarded after extraction — precisely: Tesseract's own generic
  engine/language-model files (no user data, fixed for every install)
  load from its default CDN on first use, a real network request, just
  never one carrying the photo (corrected an initial overclaim in the
  code comment that said "no external API call happens at all," which
  wasn't quite accurate). Extracted text renders in a plain editable
  textarea with a copy button — never written into any field
  automatically (Header G1, same principle as AI-suggested template
  fields always requiring human confirmation).
  **Real bug found and fixed during live verification — CRITICAL,
  logged as R-036**: testing the profile-picture upload live, the
  direct browser-to-R2 presigned PUT failed with `Failed to fetch`;
  network inspection showed the browser's CORS preflight `OPTIONS`
  request to R2 came back `403`. Fixed avatar upload by routing it
  through a Server Action that reads the file into a `Buffer` and does
  a server-side R2 `PutObjectCommand` (`src/lib/r2.ts`'s new
  `putObject` helper) instead of a direct browser PUT — avatar images
  are small (<5MB), so proxying through a Vercel function is a
  reasonable, scoped exception to the direct-to-R2 pattern, which
  stays unchanged for audio (a real reason: avoiding Vercel's request-
  body/time limits on longer dictations, DL-021). **Then deliberately
  tested whether the same failure hits the actual dictation-recorder
  upload path** (unchanged since M4, previously verified only via a
  server-side script that bypasses browser CORS entirely — DL-021/
  R-019 — never with a real browser, since no real microphone has been
  available in this session): generated a real presigned URL for an
  `audio/webm` object key and issued the identical `fetch` PUT from an
  authenticated real browser tab. **Same failure.** This means the R2
  bucket's CORS policy very likely blocks the actual dictation-capture
  upload for any real pathologist using a real browser today — not
  just the new avatar feature. No tool available in this session
  exposes R2 CORS configuration (`r2_bucket_get` returns no `cors`
  field, no dedicated CORS-policy MCP tool exists) — this needs
  Marcel's Cloudflare dashboard directly (R2 → bucket → Settings →
  CORS Policy), not something fixable from application code. Did NOT
  attempt to work around this for audio myself, unlike the avatar fix:
  proxying potentially-long audio recordings through a Vercel function
  risks trading one failure mode (CORS) for another (body-size/timeout
  limits) without Marcel's input on which tradeoff he wants — flagged
  clearly instead, per R-036, as the single highest-priority open item
  before treating the dictation capture loop as demo-ready for a real
  user. `npx tsc --noEmit` and `npm run build` passed after every
  change; `npm audit` after adding `tesseract.js`: only the pre-
  existing accepted R-007 finding, nothing new.
  **Live-verified end to end on `www.xpath.report`**, not just built:
  full TOTP QR enrollment walkthrough on the new test-pathologist
  account (real secret, real computed code, landed on `/dashboard` with
  no pre-exemption); avatar upload failed with the CORS bug, then
  succeeded after the fix (both the Profile page and the header-nav
  avatar slot updated to the uploaded image); the OCR scan correctly
  extracted all 4 lines of text from a real synthetic requisition-form
  test image ("REQUISITION FORM / Specimen: Colon biopsy / Accession:
  TEST-0099 / Clinical history: rule out malignancy"), with the copy
  button and G1 advisory note both rendering; a seeded dictation for
  the new account ran through the real template-suggestion + real
  OpenAI structuring pipeline (Prostate — Needle Biopsy correctly
  ranked #1) and opened correctly on the review screen. Test dictation/
  draft and the test avatar were cleaned up afterward so the account
  stays genuinely blank-slate for Marcel's own first walkthrough.
- **DL-048 — `dev-administrator@xpath.report` confirmed as a permanent,
  standing admin account (not a rotating dev fixture); root-caused a
  prior login failure; built and live-verified a reliable password-set
  script.** Marcel reported that the last password he'd set for this
  account didn't let him log back in and asked for root cause, not just
  a patch.
  **Audited every structural cause that could produce that symptom —
  all came back clean:**
  (a) no forced password rotation or password-age field exists anywhere
  in the schema (`src/db/schema.ts` `users` table has no such column) —
  there is nothing in the codebase that could silently expire a
  password;
  (b) session strategy is JWT with no expiry tied to credential age —
  `src/auth.config.ts` sets no such logic; a session simply lasts until
  Auth.js's default JWT lifetime;
  (c) TOTP is exempted for this exact email via `TOTP_EXEMPT_EMAILS` in
  `src/auth.config.ts` (DL-038) — a hardcoded, git-tracked array, not a
  DB flag, so it cannot drift or reset on its own the way a DB-stored
  flag could;
  (d) queried the live row directly: `isActive: true`, `totpEnabled:
  false`, `totpFailedAttempts: 0`, `totpLockedUntil: null`,
  `mustCompleteSetup: false`, `passwordHash` a well-formed `$2a$10$`/
  60-char bcrypt hash — nothing here would reject a correct login;
  (e) checked for the one real latent risk in `src/auth.ts`'s
  `authorize()` — it queries `users` by email with `.limit(1)` and no
  tenant filter, and `users.email` is only unique *within* a tenant
  (`users_email_tenant_idx`), not globally, so a second row with the
  same email under a different tenant could silently be the one checked
  at login (Postgres row order is unspecified without `ORDER BY`).
  Confirmed only one row exists for this email today, so this did not
  cause the reported failure — but it is a real latent gap once a
  second tenant exists (G1), noted in `docs/known-risks.md`, not fixed
  here (out of scope for this task, no second tenant exists yet to
  trigger it);
  (f) checked Cloudflare Turnstile (`src/lib/turnstile.ts`), since a
  secret key configured server-side without the matching site key
  configured client-side would silently fail every login regardless of
  password (widget never renders → no token ever sent → server sees
  `!token` → rejects). `docs/PROGRESS.md` already listed this SIGNAL as
  still open/unfilled, and confirmed live: the sign-in page's DOM
  renders no Turnstile widget, and (see below) a real login succeeded
  with no token ever submitted — ruling this out directly, not just by
  inference from docs that could have gone stale.
  **Conclusion: no code or schema defect reproduces the symptom.** The
  most likely explanation is a one-off human/process error — a
  mistyped or mismatched password value — in whatever uncommitted
  script was used the last time (neither this session nor the repo has
  a record of exactly what that script did; it was never committed, so
  its exact logic can't be audited after the fact). This matches the
  precedent already on record in DL-041 (a generated password rejected
  on Marcel's iPhone, traced to a manual-retype mismatch, not a DB
  defect) — the same class of failure, not a new one.
  **Built `scripts/set-admin-password.ts`**, the permanent, reusable,
  reliable path requested: a local-only script matched by BOTH email
  AND `role="administrator"` (defense in depth against the tenant-
  scoping gap in (e) above, so it can never touch the wrong row even if
  a duplicate email ever exists later), bcrypt-hashes the typed
  password, writes it, and reasserts `isActive: true`, `mustCompleteSetup:
  false`, `totpEnabled: false` on every run so a stray DB edit elsewhere
  can never silently lock this account out again. Chose a single local
  script over an in-app "reset password" screen: a real in-app reset
  flow needs email delivery (magic link/token) to be safe, which needs
  its own SIGNAL for an email provider Marcel hasn't set up — disproportionate
  scope for one standing internal admin account, and the local-script
  pattern already has two solid precedents on record (DL-037/041).
  **Two real bugs found and fixed in the script itself before handing
  it off, both caught by testing it, not shipping on faith:** an
  original two-question (password + confirm-retype) design silently
  lost the confirm-retype answer, or threw `ERR_USE_AFTER_CLOSE`,
  depending on how the input arrived — a genuine Node `readline` gotcha
  (a fresh `createInterface` per question can lose buffered stdin data;
  and readline auto-closes as soon as the input stream signals end,
  which races a second sequential `question()` when multiple lines
  arrive in one burst rather than as live keystrokes). Fixed by dropping
  the confirm-retype step entirely in favor of a single prompt — removes
  the whole class of fragility rather than patching around it, and
  mistype protection instead comes from the mandatory live-login-test
  step the script's own output points to.
  **Live-verified end to end, not just committed**: ran the finished
  script locally against production with a throwaway test password,
  confirmed the DB row updated correctly, then signed in for real at
  `https://www.xpath.report/sign-in` with that exact password — landed
  directly on `/dashboard` with no `/verify` or `/claim-account`
  redirect, page content confirmed the `administrator` view ("Administration
  — Users, roles and audit"). No Turnstile token was ever submitted and
  login still succeeded, independently confirming (f) above. Rotated
  the account to a fresh unknown random value afterward (`openssl rand
  -base64 24` piped directly into the script, never displayed or
  logged) so no one — including this session — holds a working
  password for a permanent admin account; Marcel runs `scripts/set-
  admin-password.ts` himself next to set his own chosen, permanent
  value. `npx tsc --noEmit` and `npm run build` both passed.
- **DL-049 — `test-pathologist@xpath.report` given the same permanent,
  no-friction treatment as `dev-administrator` (DL-048).** This is
  Marcel's own account for testing the pathologist lens, not a shared/
  rotating fixture — explicit instruction to extend the DL-048 pattern,
  not invent a new one.
  Added `test-pathologist@xpath.report` to `TOTP_EXEMPT_EMAILS` in
  `src/auth.config.ts` alongside `dev-administrator@xpath.report` (same
  code-level, git-tracked exemption — DL-038's mechanism, now used for
  a second account, still not a default for anyone else). Confirmed
  `mustCompleteSetup: false` was already correct on the live row from
  provisioning (DL-047) — nothing to change there.
  Built `scripts/set-pathologist-password.ts`, a near-identical sibling
  of `scripts/set-admin-password.ts`: matched by email AND
  `role="pathologist"` (same defense-in-depth reasoning — can never
  touch the wrong row even under a future email collision across
  tenants, R-037), single prompt (no confirm-retype, same reasoning as
  DL-048's fix), reasserts `isActive`/`mustCompleteSetup`/`totpEnabled`
  on every run. Kept as a separate small script rather than
  parameterizing `set-admin-password.ts` by role — the script's name
  should say what it does, and duplicating ~60 lines is cheaper than a
  shared-module abstraction for two call sites.
  **Live-verified end to end, not just committed**: pushed the TOTP-
  exemption change first and waited for Vercel to deploy it (the
  exemption is a code path, not a DB flag — a live login test run
  before deploy would have hit `/verify` regardless of the script
  working correctly), then ran the script with a throwaway test
  password, confirmed the DB row updated, and signed in for real at
  `https://www.xpath.report/sign-in`. Landed directly on `/dashboard`
  with no TOTP prompt — page content confirmed the pathologist Home
  view ("Welcome back, Test Pathologist", worklist, G2 privacy panel,
  learning cards), clearly distinct from the administrator view DL-048
  confirmed for the other account, ruling out a role mix-up. Rotated
  the account to a fresh unknown random value afterward (`openssl rand
  -base64 24` piped directly into the script, never displayed or
  logged), same as DL-048 — Marcel runs `scripts/set-pathologist-
  password.ts` himself next to set his own chosen, permanent value.
  `npx tsc --noEmit` and `npm run build` both passed before each push.
- **DL-050 — R-036 resolved: Marcel fixed the R2 CORS policy and ran a
  real end-to-end mobile test (`test-pathologist` account) confirming
  dictation upload, transcription, and save-to-workspace all work live
  for the first time.** Also confirmed working in the same test:
  profile-picture upload, and template auto-suggestion correctly
  requiring manual confirm rather than auto-routing (G1 compliant).
  One earlier concern is voided: merged-looking transcript/OCR text
  Marcel saw was him manually copy-pasting between the two to test, not
  a system bug — no code change needed. `docs/known-risks.md` R-036
  marked resolved with the fix attributed correctly (Cloudflare
  dashboard change, not an application-code fix — no code in this repo
  changed for this resolution). From this live test, Marcel raised five
  scoped UX asks (Dictate as a dominant mobile CTA, an OCR "Save to
  workspace" action, an explicit "AI Enhancement" step instead of
  auto-structuring, a persistently-reachable private workspace, and a
  persistent AI-caution near every AI-generated output/field — with
  real garbled-transcript examples: "tubule formation" → "tubal
  formation," "fibrocystic change" → "pharaocytic change," "HER2
  immunohistochemistry" → "HER to immune histo chemistry") plus a lower-
  priority Apple-Health-style visual polish pass (card typography,
  padding, section headers, per-category icon color, pill-shaped tab-
  bar indicator). Both explicitly asked for a feasibility/scope report
  before any implementation — assessed, not built, this session; see
  the reply for the itemized scope and open design questions.
  **Found and corrected a stale `docs/PROGRESS.md` line while
  scoping**: M2 "Private workspace" was listed at 0%, but the
  underlying data model (`privateWorkspaceItems`, `kind: note | draft |
  reference_file | tip | dictation | report_draft` — `src/db/
  schema.ts:165`) and its G2 owner-only isolation (`assertWorkspaceOwner`)
  are already built and in production use for dictations and drafts —
  verified directly in the schema, not taken on faith from the scoping
  research. What's actually still missing is narrower: a single
  aggregated list view across all item kinds (items 2 and 4 of the
  five UX asks) — today items surface piecemeal, dictations only on
  `/dashboard/dictate` and drafts only in Home's "Recent work."
  Corrected to 60% with that detail, so the milestone tracker reflects
  what's real.
