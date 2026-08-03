# X-PATH — Change Log

Format: date · session · what changed · why.

## 2026-08-03 — M6 review · sign · archive loop built and E2E-verified
- Built the M6 signing loop: `dashboard/review/[draftId]` (flat
  field-per-row editable form over `flattenTemplate`, DL-031),
  `dashboard/review/[draftId]/actions.ts` (`saveReview`, `signAndAssign`
  — look-up-or-create the `cases` row by accession, DL-032, then insert
  an immutable `clinicalRecords` row, write a `sign_out_report` audit
  entry, delete the source `report_draft`), and `dashboard/archive` +
  `dashboard/archive/[recordId]` (pathologist's own signed-record list
  and detail view, `view_clinical_record` audit on cross-viewer reads).
- Fixed `flattenTemplate` dropping the `cannotBeDetermined` flag
  (DL-030) — needed for the review form to express G8's "flag missing
  info, don't fabricate" requirement. Re-verified 0 duplicate field
  paths across all 6 templates after the fix.
- Verified end-to-end against real Neon data via real browser
  interaction (not just typecheck/build): seeded a real dictation
  transcript (ER/PR/HER2/Ki-67 biomarker content), logged in as
  `dev-pathologist-a@xpath.report`, ran suggest → confirm template →
  auto-fill (correctly filled ER Positive/91-100%/strong, PgR Negative,
  HER2 IHC Equivocal 2+, Ki-67 25%, and correctly fired the HER2
  Dual-ISH reflex suggestion) → review page → signed with a test
  accession → landed on the archive detail page. Then independently
  confirmed against real Neon (not just the UI): the `clinicalRecords`
  row, the `sign_out_report` audit row with matching detail, deletion
  of the source draft, survival of the original dictation, and the new
  `cases` row all exist and match.
- Two real findings from this testing, logged rather than fixed
  reflexively: R-026 (`template-view.tsx` doesn't render `opt.children`,
  currently inert — no template uses it yet) and R-028 (template
  suggestion ranked CUP above the correct Breast Biomarker template for
  an unambiguous biomarker transcript — Header §5's mandatory human
  confirmation already covers this, but the ranking itself is worse
  than expected and worth revisiting). Also logged R-027: signed
  records have no amendment path yet — a real gap, out of scope for
  M6's first-time signing loop.
- `npx tsc --noEmit` and `npm run build` pass. M6's signing loop is now
  functionally complete except PDF generation, which is gated on the
  vendor decision surfaced to Marcel separately (per the pre-flagged
  gate, not an open-ended question).

## 2026-08-03 — Remaining Phase-1 templates built (Colon & Rectum, Prostate, Lymphoma, CUP)
- Built the last 4 of 6 Phase-1 templates via 4 parallel forked agents
  (each inherits full conversation context — schema, G3 rules, the
  Breast templates as the reference pattern — so the raw CAP source
  text stayed out of the main thread): `colorectal-resection.ts`,
  `prostate-needle-biopsy.ts`, `lymphoma-basic.ts`, `cup.ts`.
- Prostate combines CAP's specimen-level + case-level protocol pair
  into one `TemplateVersion` (DL-028) — a real needle biopsy report
  synthesizes both. CUP has no CAP source (none exists); built from
  `PROJECT_HEADER.md` §5's generic-fallback-protocol pattern + the real
  CUP IHC panel from `XPATH_handover.md` §13, with PAX8 explicitly
  tagged as an unconfirmed-clone open item rather than silently
  included as confirmed.
- Did not just trust the forked agents' self-reports — re-verified
  independently: full-repo `npx tsc --noEmit`, a duplicate-field-path
  check across all 6 registered templates via `flattenTemplate` (0
  collisions found), templateId uniqueness, a grep for suspiciously
  long label strings as a copied-prose smell test (none found), and a
  manual read of each file's header comment plus one substantive
  section (Colon & Rectum's pTNM, Lymphoma's flagged tier
  simplification, Prostate's shared-option helper, CUP in full).
- Logged, not silently smoothed over: Lymphoma's "Final Integrated
  Diagnosis" field has 3 of ~100 options CAP marks non-core while the
  template engine's `tier` is per-field not per-option — modeled as a
  single core field, documented in the file's own header (DL-029).
- Wired all 6 into `src/lib/templates/index.ts`. Verified the M5
  auto-fill engine against a newly-added template (CUP), not just
  Breast — real transcript, real OpenAI call: correctly extracted
  histologic type, all 6 IHC panel results, and a free-text
  interpretation field, each with a real grounding quote; template
  suggestion correctly ranked CUP highest for a CUP-shaped transcript.
- `npx tsc --noEmit` and `npm run build` pass across all 6 templates.

## 2026-08-03 — M5 core engine built and verified (structure & auto-fill)
- Built the transcript→template structuring engine: `lib/templates/flatten.ts`
  (addressable field paths), `lib/structuring.ts` (OpenAI/Anthropic per
  `AI_STRUCTURING_PROVIDER`, every value validated against real field
  paths/options AND grounded with a verbatim transcript quote before
  being trusted — DL-023), `lib/reflex.ts` (HER2 IHC 2+ → Dual-ISH
  reflex, advisory only), `lib/templates/suggest.ts` (deterministic
  template shortlist, human always confirms). `/dashboard/structure/[dictationId]`
  ties it together: suggest → confirm → auto-fill → review with AI
  badges + grounding quotes + reflex banner.
- Extracted the M3 template renderer into `src/components/template-view.tsx`
  so M3's blank view and M5's filled view share one implementation.
- Verified with a real transcript and a real OpenAI call (not
  mocked): correctly filled ER/PgR/HER2/Ki-67 fields with real grounding
  quotes, correctly fired the HER2 reflex suggestion.
- Found and fixed a real data-fidelity gap via that test: "Specify
  percentage: ___" options had no separate addressable path for the
  actual number, only for which option was picked — "ER positive, 90%"
  was silently dropping the 90 (DL-024, fixed in `flatten.ts` +
  `template-view.tsx`).
- Found and logged (not fixed) a subtler gap: the model can correctly
  quote real transcript text while still bucketing it into the wrong
  adjacent numeric range ("ninety percent" correctly quoted, but
  "91-100%" picked instead of "81-90%"). Grounding-quote validation
  catches fabrication, not semantic miscategorization — mitigated by
  showing every AI field's quote for the pathologist's mandatory review,
  not by more parsing (R-023).
- Tested the Anthropic structuring path directly: it authenticates
  correctly (confirmed — the response is a 400 billing error, not a 401
  auth error) but the account has no credit balance, so a real
  round-trip is unverified (R-025).
- `npx tsc --noEmit` and `npm run build` pass throughout.

Building straight through M5→M7 per Marcel's explicit go-ahead — no
per-milestone stop, except two gates the project's own docs already
call for: M6's PDF worker vendor pick, and M7's Cloudflare DNS cutover
(both flagged in `docs/PROGRESS.md`, not re-litigated here).

## 2026-08-02 — M4 built (voice capture + transcription); blocked on R2 permission
- Verified `OPENAI_API_KEY` with a real Whisper call before building on
  it (synthesized pathology speech via Windows TTS, near-perfect
  transcript) — not just checking the env var exists.
- Built the M4 vertical slice: `src/lib/r2.ts` (S3-compatible client,
  presigned uploads, server-side download), `src/lib/transcription.ts`
  (Whisper wrapper — only raw audio sent, no identifying fields,
  DL-022), a `language` column added to `private_workspace_items`
  (DL-020 — dictations reuse the existing private-workspace table rather
  than a new one; never audited, matches Header G2), and
  `/dashboard/dictate` (record → direct-to-R2 presigned upload →
  transcribe → editable, AI-marked transcript → save).
- `npm install @aws-sdk/client-s3` pulled in a critical transitive
  vulnerability (`fast-xml-parser` regex/entity-expansion issues) —
  caught via `npm audit` before committing, fixed with `npm audit fix`
  (non-breaking), re-verified clean; pinned both new deps to exact
  versions per repo convention.
- End-to-end pipeline test (presign → upload → download → transcribe)
  failed at the upload step: 403 Access Denied. Isolated precisely, not
  a code bug — `HeadBucket`/`ListObjectsV2` succeed with the same
  credentials, `PutObject` fails identically via presigned URL and
  direct SDK call. The R2 API token has read-only permission on
  `xpath-storage`. Reported to Marcel with the exact fix needed
  (Cloudflare dashboard → R2 → token permissions) rather than guessing
  or building a workaround (R-019).
- Logged, not silently skipped: audio retention/auto-delete policy
  (R-020 — needs a cron mechanism not yet built), verbal PII spoken in
  dictation audio isn't redacted before transcription (R-021 —
  procedural mitigation only, not solved technically), week-one FR/
  accent benchmark still needs Dr. Ivo's real voice (R-022).
- `npx tsc --noEmit` and `npm run build` pass. Committed locally, not
  pushed (blocked mid-milestone on the R2 SIGNAL).

## 2026-08-02 — AUTH_URL redirect bug found live, fixed, re-verified
- Pushed `496fba2` to `main`; Vercel auto-deployed it (`dpl_FbZv7aYoSbTcnDjMw5DfQwFKthdc`,
  confirmed READY).
- A full browser walkthrough of login+TOTP against the live URL (not the
  scripted HTTP checks used for the earlier "M1 verified live" claim)
  found a serious bug: `AUTH_URL=https://xpath.report` was set in Vercel
  but that domain isn't DNS-live until M7 — real login redirected users
  mid-flow off `xpath-report.vercel.app` onto the parked domain, landing
  on Hostinger's parking page with the session lost and no error shown.
  `trustHost: true` only relaxes Auth.js's inbound host check, not
  outbound redirect construction, which an explicit `AUTH_URL` still
  controls (DL-019, R-018).
- Could not fix directly — no Vercel MCP tool exposes environment
  variable editing. Reported the exact diagnosis and fix to Marcel:
  remove `AUTH_URL` from Vercel entirely (better than pointing it at the
  preview host, since it then self-corrects at M7 with no further change
  needed) rather than just repointing it. Marcel removed it from both
  Production and Preview.
- Re-verified live via full browser walkthrough: login+TOTP succeeds end
  to end, host never changes, `audit_log` entry confirmed written. All 4
  M1 DoD items now proven on the actual live URL via an actual browser —
  the strongest verification standard used so far this session.
- Corrected the record on the earlier "M1 verified live" claim: it was
  true of the HTTP/API mechanics (scripted checks using
  `redirect: 'manual'`, which never follows the Location header the way
  a browser does) but did not catch this redirect bug. Third real bug
  this session found only via an actual browser, not scripted HTTP tests
  (after the missing-CSRF and stale-session-email bugs) — logged as a
  standing lesson (R-016/R-018): scripted API checks aren't sufficient on
  their own for user-facing flows.

## 2026-08-02 — M1 closed for real (live URL); team provisioning (Cowork addendum §1)
- **M1 fully closed:** verified independently (not on the relayed claim
  alone) that the Vercel project is real — `get_project`/`get_deployment`
  by direct ID confirmed READY, commit c547e92, aliased to
  xpath-report.vercel.app / www.xpath.report / xpath.report
  (`list_projects` had a list/index lag — R-013 resolved). Ran the full
  login+TOTP HTTP flow against the actual live URL: 8/8 checks pass,
  audit_log rows confirmed written for real. Flagged (not blocking):
  GitHub repo is public, not private (R-015); AUTH_SECRET is still
  low-entropy.
- **Team provisioning built** (Cowork execution-order §1, confirmed
  directly by Marcel): `mustCompleteSetup` schema gate (same pattern as
  `totpVerified`), `scripts/provision-team.ts` (8 real accounts —
  3 pathologists, Dr. Ivo, 4 technicians — each with a strong random
  session password, printed to console once, never written to a file),
  a 2-step claim wizard (`src/app/(auth)/claim-account/`: profile +
  password replacement, then TOTP enrollment with a real QR code via the
  new `qrcode` dependency), and Cloudflare Turnstile wiring on `/sign-in`
  (inactive until keys are set — SIGNAL open). Extracted the TOTP
  verify+lockout logic shared between login and enrollment into
  `src/lib/totp.ts`. Added a real unique constraint on `(tenant_id,
  email)` — previously just an index — which caught a genuine collision
  between M1's dev-test seed emails and the real provisioning emails;
  renamed the dev fixtures (`dev-pathologist-a/b@...` etc.) rather than
  deviate from the spec's real account emails.
- **Two real bugs found and fixed via an actual browser walkthrough of
  the claim wizard** (not just scripted HTTP tests): (1) the sign-in page
  had always been missing the CSRF token NextAuth's own callback endpoint
  requires — real users would have hit `?error=MissingCSRF`; M1's earlier
  "verified" claim only worked because the test script manually injected
  a token no real page provided (R-016). Fixed by switching to a Server
  Action calling `signIn()` directly (DL-016). (2) the dashboard header
  showed the stale placeholder email after claim-wizard Step 1 changed
  it — DB was correct, JWT cache wasn't refreshed (DL-017), fixed via
  `unstable_update`.
- Walked the full flow end to end locally against real Neon: placeholder
  login → blocked from `/dashboard` → Step 1 → Step 2 (real QR, real TOTP
  code) → dashboard → log out → log back in with the new real
  email/password → straight to `/verify` (not the wizard again) → correct
  email displayed. `account_claimed` audit entry confirmed written.
  Swept the working tree for all 8 generated session passwords — none
  found anywhere (DL-018).
- `npx tsc --noEmit` and `npm run build` pass. Committed locally, not
  pushed yet.

## 2026-08-02 — M1 live-verified + pushed; M3 template engine + Breast templates
- **M1 closed out (partially):** ran `db:generate`/`db:migrate`/`db:seed`
  against real Neon, confirmed G1/G2 isolation and the full login+TOTP HTTP
  flow (8/8 checks, incl. forged cross-origin request rejected) against
  real data, confirmed `audit_log` rows written for real. Committed and
  pushed to `main` (c547e92) once Marcel confirmed directly. Still open:
  Vercel project isn't visible to the Vercel connector (R-013) — "login on
  the live URL" specifically unverified until that's sorted.
- **M3 started ahead of the M1 gate closing**, per Marcel's explicit
  go-ahead on a Cowork "full execution order" addendum. Built the
  versioned template engine (`src/lib/templates/types.ts`: tiered fields
  using CAP's own core/conditional/non-core convention, single/multi-select,
  controlled vocabulary, "cannot be determined", repeatable blocks,
  versioned classification bindings, draft/pending_review/approved gate).
  Authored two Phase-1 templates as derived data from the two CAP source
  files Marcel supplied locally (never committed):
  `src/lib/templates/data/breast-invasive-resection.ts` (AJCC 8th, WHO
  6th — full Specimen/Tumor/Margins/Regional Lymph Nodes/Distant
  Metastasis/pTNM/Additional Findings/Special Studies/Comments) and
  `src/lib/templates/data/breast-biomarker.ts` (ER/PgR/HER2 IHC/HER2
  ISH/Ki-67 + methods). Several "standardized comment" checklist options
  in the Biomarker source are full authored paragraphs, not just labels —
  those are marked `needsInHouseAuthoring: true` with a short in-house
  label instead of copied CAP text (DL-014, R-012). Added
  `/dashboard/templates` + `/dashboard/templates/[templateId]` as a
  static structural render (no value binding — that's M5).
- **Explicitly held back:** the Cowork addendum's §1 "team provisioning"
  workstream (8 real accounts incl. a named real individual, PII claim
  wizard, Cloudflare Turnstile) — this scope isn't in any of the three
  verified source-of-truth documents, so it's parked pending a direct
  one-line confirmation from Marcel rather than built off a relayed
  document alone.
- `npx tsc --noEmit` and `npm run build` pass throughout. M3 work
  committed locally, not pushed (no live deploy target yet; push-at-
  milestone-gate is the agreed cadence going forward).

## 2026-08-02 — M1 build (login + TOTP) + header sync (v1.0 → v1.1, G2a)
- Built out M1: NextAuth route handler, `/api/auth/verify-totp` (TOTP check
  + session upgrade via `unstable_update`), root `/` redirect, dashboard
  wired to the real session. Seed script now creates 2 pathologists (for
  the isolation check) + technician/manager/administrator, each enrolled
  with a real TOTP secret. Added `scripts/verify-isolation.ts`, which
  exercises `lib/access.ts` against real seeded rows to prove a second
  pathologist and an administrator are both denied a private workspace
  item. `npx tsc --noEmit` and `npm run build` pass; `npm audit` clean.
- Added explicit CSRF protection (same-origin `Origin`-vs-`Host` check —
  NextAuth's built-in CSRF token does not cover custom routes) and
  DB-backed rate limiting/lockout (5 failed codes → 15 min, audited) to
  `/api/auth/verify-totp`, per `docs/security-checklist.md`'s existing
  "rate limiting on /api/auth/*" requirement. Password sign-in
  (`/api/auth/callback/credentials`) still has no rate limiting — left
  open, tracked as R-011, not silently folded into "done."
- **Header sync:** `PROJECT_HEADER.md` moved to v1.1, adding **G2a — no
  notification/alert/digest/reporting layer of any kind into a
  pathologist's activity**, broader than "no Telegram." Removed stale
  Telegram/"notifications (Session 02+)" references from
  `docs/architecture.md`, `docs/workflow-map.md`, and `README.md` — all
  three previously implied it was a deferred feature rather than a
  permanent exclusion. `.env.example` and `PROJECT_HEADER.md` were already
  current on disk (no action needed there). See DL-012.

## 2026-08-02 — Session 01 foundation + Cowork inspection pass
- Built the walking-skeleton foundation: multi-tenant schema, the two G2 data
  domains (`private_workspace_items` / `clinical_records`), append-only
  `audit_log`, `lib/access.ts` guards, Auth.js v5 + TOTP 2FA, sign-in →
  verify → role-aware empty dashboard, seed script.
- Populated `docs/product-brief.md`, `docs/architecture.md`,
  `docs/decision-log.md` from the locked project vision.
- **Cowork inspection pass (this entry):**
  - Bumped `next` 15.1.6 → 15.5.22, `next-auth` beta.25 → beta.32,
    `drizzle-orm` 0.38.4 → 0.45.2, `drizzle-kit` 0.30.2 → 0.31.10, `tsx`
    4.19.2 → 4.23.2, plus `postcss`/`sharp` version overrides — closed 11 npm
    audit findings (3 critical, several high) down to one accepted
    dev-tooling-only moderate finding (R-007).
  - Split `src/auth.ts` into an edge-safe `src/auth.config.ts` (used by
    `middleware.ts`) and the full Node-runtime config (used by route
    handlers/server actions). The original single-file config pulled bcrypt
    and the Drizzle/Neon client into the Edge middleware bundle — worked in
    `next build` but was a real production risk on Vercel Edge. Verified via
    `npm run build`: Middleware bundle dropped from 161 kB (with bcrypt) to
    86.5 kB, and the bcrypt/setImmediate Edge-runtime warnings are gone.
  - Rewrote `CLAUDE.md`: the previous version hard-required 12 files under
    `~/.claude/tasks/` and 5 `docs/*.md` files that did not exist in the
    repo. This caused the executor session to stall in a discovery/
    clarification loop instead of building. Personal workflow files are now
    read-if-present, never blocking; the 5 missing docs are added here
    (`workflow-map.md`, `security-checklist.md`, `known-risks.md`,
    `change-log.md`, `release-checklist.md`) so the repo is self-sufficient.
  - Ran `npm install`, `npx tsc --noEmit`, and `npm run build` end to end —
    all pass. This is the first time Session 01 was actually verified in a
    real Node environment rather than typechecked module-by-module.
