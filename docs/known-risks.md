# X-PATH — Known Risks

Format: R-nnn · risk · current mitigation / status.

- **R-001 — Guideline content licensing (WHO/CAP/ICCR/AJCC).** These are
  copyrighted publications. Ingesting their text into a searchable knowledge
  base without a license is a real legal exposure. Mitigation: Header G3 —
  logic only, never copied text; content comes from client originals, ICCR
  (free), or in-house authoring. **Open until X.PATH/Dr. Ivo confirms a
  licensing position** (Header §9 — Open items).
- **R-002 — Recommendation/reflex engine drifting toward medical-device
  classification.** Software that proposes IHC or molecular testing edges
  toward regulated-device territory in some jurisdictions. Mitigation:
  Header G1 — advisory only, always human-validated, never originates a
  diagnosis; AI content always visibly marked.
- **R-003 — French medical ASR quality untested.** Medical speech
  recognition in French is generally weaker than English and this has not
  been measured against X.PATH's real dictation. Mitigation: test on ~20 real
  French dictations before Session 02 commits to a transcription vendor.
- **R-004 — LIS integration target unconfirmed.** Unclear whether the system
  of record is Olivya, Roche navify, both, or neither, and what API surface
  it exposes. Mitigation: confirm before building the LIS integration module
  (Header §9 — Open items); ask whether Olivya already sells a dictation/
  synoptic-reporting module before building one.
- **R-005 — Data-hosting jurisdiction.** Dubai holding entity, Cameroon
  operation; hosting jurisdiction for patient data not yet decided.
  Mitigation: confirm before any production data is written (currently only
  a local/dev schema exists; no patient data anywhere yet).
- **R-006 — `next-auth` is on a beta release line (`5.0.0-beta.32`).**
  Auth.js v5 is still pre-1.0. Mitigation: pinned exact version (no `^`),
  `npm audit` checked each session, upgrade deliberately and re-verify the
  build/security checklist on every bump.
- **R-007 — `drizzle-kit`'s bundled `esbuild` has an unresolved moderate
  advisory (GHSA-67mh-4wv8-2f99).** Dev-tooling only (migration generation
  CLI), not shipped to the production runtime, and the advisory concerns a
  local dev server accepting cross-origin requests — not applicable to a CLI
  invocation. Accepted risk for Phase 1; re-check on each `drizzle-kit` bump.
- **R-008 — No rate limiting on auth endpoints yet.** *Partially resolved
  in M1:* `/api/auth/verify-totp` now has DB-backed lockout (5 wrong codes
  → 15 min lock, audited) — see `docs/security-checklist.md`. **Still
  open:** the password step (`/api/auth/callback/credentials`, handled
  internally by NextAuth) has no throttling. Superseded/tracked further as
  R-011.
- **R-009 — `/api/auth/verify-totp` depends on NextAuth's `unstable_update`
  API (DL-009).** It is explicitly unstable in `next-auth@5.0.0-beta.32`
  and could change signature on a future beta bump. Mitigation: exact
  version pinned (R-006); re-verify this route on every `next-auth` bump.
- **R-010 — Local dev machine has a stray `package-lock.json` one
  directory above the repo** (`ai-software-dev/package-lock.json`), which
  makes `next build` infer the wrong workspace root locally (cosmetic
  warning only — build still succeeds). Not present in Vercel's build
  context since Vercel only checks out this repo. No action needed unless
  it starts affecting local builds.
- **R-011 — Password sign-in (`/api/auth/callback/credentials`) has no
  rate limiting.** It's handled internally by NextAuth's own route
  handler, not code we own, so the DB-backed lockout added for
  `/api/auth/verify-totp` (R-008) doesn't cover it — a wrapper/proxy in
  front of the credentials callback would be needed. An attacker who
  doesn't yet have a session cookie can still brute-force passwords
  (though they'd still need the TOTP code afterward). Mitigation: address
  before any public (non-demo) deploy — flag again at M7 hardening if not
  done sooner.
- **R-012 — Breast Biomarker template has several "standardized comment"
  fields with placeholder labels, not real text (DL-014).** These render
  in the M3 structural view but are not clinically usable until authored
  in-house / licensed and approved by Dr. Ivo. Mitigation: `needsInHouseAuthoring:
  true` on each affected option (`src/lib/templates/data/breast-biomarker.ts`)
  makes them greppable; must be resolved before `approval.status` moves
  past `"draft"` for this template.
- **R-013 — RESOLVED.** Vercel project was real; `list_projects` had a
  list/index lag on this account. `get_project`/`get_deployment` by
  direct ID confirmed it (`prj_GB7I7tg5rwrBuuSN8kEQptzdo1cL`, commit
  c547e92, READY, aliased to xpath-report.vercel.app / www.xpath.report /
  xpath.report). Login+TOTP verified live against that URL.
- **R-014 — CUP template (M5) has no CAP source and an unconfirmed-clone
  antibody (PAX8) in its panel.** Per the M3/M5 work order: build from the
  header's generic-fallback-protocol pattern + the CUP IHC panel in
  `XPATH_handover.md` §13 (CK7, CK20, CDX2, TTF-1, GATA3, PAX8*, CD45).
  Tag PAX8 as unconfirmed rather than blocking (Header §9/§25 — open
  items, do not block Phase-1 planning).
- **R-015 — GitHub repo (`buddy1974/xpath-report`) is public, not
  private.** `docs/release-checklist.md`'s own pre-deploy checklist calls
  for a private repo. No secrets are in it (swept — `.env.example` is
  placeholder-only, `.env.local` never committed), but the full source,
  including the security implementation (CSRF checks, lockout logic,
  claim-wizard flow), is publicly visible. Flagged during M1 live
  verification, not yet actioned — Marcel's call whether/when to flip it
  private.
- **R-016 — Scripted API-level verification can mask real browser-level
  bugs.** M1's original "login works" claim was based on a script that
  manually fetched and injected a CSRF token — the real, unmodified
  sign-in page had never included that token and would have failed for
  every actual user (`?error=MissingCSRF`). Caught only once an actual
  browser walkthrough of the claim wizard was done (Cowork addendum §1e).
  Fixed (DL-016). Lesson: any future "verified" claim for a user-facing
  flow should include at least one real-browser pass, not only scripted
  HTTP checks — scripted checks are still valuable for the auth/audit
  plumbing underneath, just not sufficient on their own for pages a human
  actually loads and submits.
- **R-017 — `qrcode` package (or a transitive dependency) triggers a
  Node `Buffer()` deprecation warning during claim-wizard Step 2
  render.** Harmless today (functional, QR renders correctly) but
  `Buffer()`'s legacy constructor could be removed in a future Node
  major version. Low priority; re-check if `qrcode` ships an update or if
  Node's deprecation timeline firms up.
- **R-018 — RESOLVED.** `AUTH_URL=https://xpath.report` (set, not
  DNS-live) caused Auth.js to redirect real browsers mid-login off
  `xpath-report.vercel.app` onto the parked domain, losing the session
  with no visible error — found via full browser walkthrough (scripted
  `redirect: 'manual'` HTTP checks never caught it, since they don't
  actually follow the Location header the way a browser does). Fixed by
  removing `AUTH_URL` from Vercel entirely (DL-019); re-verified live —
  login+TOTP succeeds end to end, host never changes, audit_log entry
  confirmed. Second entry (after R-016) for the same underlying lesson:
  scripted API checks aren't sufficient on their own for user-facing
  flows a real browser drives.
- **R-019 — RESOLVED.** R2 API token had read-only permission on
  `xpath-storage`; `PutObject` failed (403) identically via presigned
  URL and direct SDK call while `HeadBucket`/`ListObjectsV2` succeeded.
  Marcel edited the token in place to Object Read & Write (same
  credentials, no `.env.local`/Vercel changes needed). Re-ran the full
  pipeline test after the fix: presign → upload (200) → server-side
  download (byte-for-byte match, 267004 bytes) → Whisper transcription
  ("colorectal adenocarcinoma, moderately differentiated, margins
  negative" — accurate) → cleanup. PASSED end to end against real R2 and
  real OpenAI.
- **R-020 — Audio retention policy not implemented.** Dictation audio in
  R2 has no auto-delete after validation (privacy + cost concern flagged
  in the original roadmap gap list, "In M4"). Building actual scheduled
  deletion needs a cron/job mechanism not yet built (`CRON_SECRET` exists
  in `.env.example` but no cron endpoint exists yet). Logged rather than
  built silently — this is a real architecture decision (what triggers
  deletion, what retention window) that should be confirmed, not assumed.
- **R-021 — Verbal PII in dictation audio is not redacted before
  transcription.** Header §5's "pseudonymize before any external AI
  call" is satisfied for everything X-PATH controls — only raw audio
  bytes go to Whisper, no structured identifying fields are attached
  (`src/lib/transcription.ts`). But if a pathologist speaks a patient's
  name or other identifier out loud, Whisper transcribes it verbatim;
  redacting audio before transcription isn't technically solved here
  (would require transcribing first, which defeats the purpose).
  Mitigated procedurally for now — pathologists asked not to speak
  identifiers, and the transcript is reviewed by the pathologist before
  any downstream use. Not solved technically; flagged rather than
  silently accepted.
- **R-022 — Week-one FR/accent accuracy benchmark not done.** Dr. Ivo's
  real voice (EN + FR) isn't available yet to benchmark against, per the
  roadmap's own explicit call-out. Logged as an open item rather than
  skipped silently — do not treat Whisper's accuracy on synthesized
  test speech (R-019's verification) as a substitute for this.
- **R-023 — Structuring engine can correctly quote real transcript text
  while still miscategorizing it into the wrong option.** Found via real
  testing (M5): given "ninety percent of cells," the model returned a
  genuine, verbatim, transcript-grounded quote — but selected the
  "91-100%" bucket instead of the correct "81-90%" one. `validateAndGround`
  (DL-023) checks that quotes are real and that paths/option keys exist;
  it does not check that a selected numeric range actually contains the
  quoted number. Mitigated by design, not by additional parsing: every
  AI-suggested field renders its grounding quote directly next to the
  selected value (`src/components/template-view.tsx`), specifically so
  the pathologist's mandatory review (Header G1, M6 sign-out) catches
  exactly this kind of near-miss. Not fixed technically — flagged.
- **R-024 — Repeatable blocks (e.g. Breast Invasive Resection's Tumor
  Characteristics, up to 5x) are auto-filled as a single instance
  only.** `flattenTemplate` doesn't attempt to split a dictation across
  multiple repeats of the same block — deciding which sentence belongs
  to which of several tumor foci is a real design question (would need
  either explicit dictation structure like "first focus... second
  focus..." or a separate per-repeat LLM pass), deferred past M5's
  minimum scope (single confirmed template, values marked AI, reflex
  fires). A dictation describing multiple tumor foci will only get the
  first one auto-filled; the rest need manual entry once M6's edit UI
  exists.
- **R-025 — Anthropic structuring path (`AI_STRUCTURING_PROVIDER=anthropic`)
  reaches and authenticates against the API correctly, but is blocked by
  an empty account credit balance — not yet verified end to end.**
  Tested directly: the request is well-formed and the key authenticates
  (confirmed by the response being a 400 billing error — "Your credit
  balance is too low" — not a 401 auth error or a malformed-request
  error). `AI_STRUCTURING_PROVIDER=openai` (the `.env.local` default) is
  fully verified with real calls; the Anthropic code path
  (`src/lib/structuring.ts:callAnthropic`) is believed correct on the
  same basis (identical downstream validation/grounding, same JSON
  contract requested of the model) but needs Anthropic account credit
  before a real round-trip can confirm it.
- **R-026 — `template-view.tsx`'s shared `FieldView`/`SectionView`
  (used by the M5 structure-preview screen and the M6 archive detail
  page) doesn't render `opt.children` (fields nested under a specific
  option), only `field.children`.** Confirmed via grep that no current
  template actually uses `opt.children`, so this is currently inert —
  flagged so it isn't silently forgotten if a future template
  introduces option-nested fields.
- **R-027 — Signed clinical records have no amendment path.** M6's
  `signAndAssign` is a one-way action (draft → immutable `clinicalRecords`
  row, `status: "released"`); the review page's own copy says as much
  ("It cannot be edited afterward — an amendment would be a new
  version (not yet built)"). A real correction-after-sign-out workflow
  (new version, superseding the old one, both retained per G2's
  immutability requirement) is not yet built. Not a blocker for M6's
  scope (the first-time signing loop) but a real gap before this can
  be used on a genuine case.
- **R-028 — Template-suggestion ranking can rank the wrong template
  first.** Verified via real M6 E2E testing: an ER/PR/HER2/Ki-67
  biomarker transcript was top-ranked as "Carcinoma of Unknown Primary
  (CUP)" (match score 1) instead of "Breast Biomarker Reporting
  Template." Not a safety issue on its own — Header §5 already requires
  the pathologist to confirm, never auto-route (DL-025 accepted a
  simple free heuristic over a paid AI call for exactly this reason) —
  but the ranking quality is worse than expected for an unambiguous
  transcript. Worth revisiting `src/lib/templates/suggest.ts`'s scoring
  once more templates exist and this stops being a one-off.
- **R-029 — Template field labels/options (all 6 Phase-1 templates)
  are English-only; M7's EN/FR polish pass deliberately scoped to UI
  chrome, not template content (DL-035).** A French-speaking
  pathologist using X-PATH today gets an English-only structured form,
  even though the dictation-language selector already supports French
  transcription. Real gap for genuine bilingual use — needs Dr. Ivo's
  review of any French pathology terminology before it ships (G8 —
  fabricated/unreviewed medical translation is worse than none).
- **R-030 — Production Vercel env vars (M2-M6 features: `OPENAI_API_KEY`,
  `R2_*`, `ANTHROPIC_*`) not independently confirmed as set in
  Production scope; no available tool can enumerate them.** Verified
  what's actually checkable: the production deployment
  (`xpath-report.vercel.app`) is live and serves the correct sign-in
  page for an unauthenticated `/dashboard` request; `get_runtime_errors`
  shows no fatal errors in the last 7 days (one benign `Buffer()`
  deprecation warning only). That does NOT prove the M4-M6 metered/
  external-service paths (Whisper transcription, R2 upload, PDF
  generation) work in production — those haven't been exercised live,
  only against local `.env.local`. Recommend Marcel spot-checks the
  Vercel dashboard's Production env vars directly, or gives explicit
  go-ahead for a real (metered, production-data-creating) live E2E
  pass before the Dr. Ivo demo.
- **RESOLVED (2026-08-03) — R-031 — `xpath.report` DNS cutover.**
  Originally logged as confirmation that DNS was still on Hostinger's
  parked page (gate intact, not silently crossed). Marcel cut over
  Cloudflare DNS the same day; independently re-verified: both
  `xpath.report` and `www.xpath.report` now resolve to the real X-PATH
  app on Vercel (`server: cloudflare` + `x-powered-by: Next.js`, no
  more Hostinger HTML). Also caught and fixed in the same pass: Vercel
  production was still serving the pre-M6 deployment (M5–M7 existed
  only in local commits, never pushed) — pushed to `origin/main`,
  Vercel auto-deployed, re-verified live (Archive/EN-FR/PDF all present
  and working on the real production domain, logged into with a real
  session).
- **R-032 — M7's mobile pass was done via responsive-class code review,
  not a real mobile-viewport screenshot.** The browser automation's
  `resize_window` tool reported success but never actually changed
  `window.innerWidth` in this session (confirmed via direct JS check,
  tried on two separate tabs) — a tooling limitation, not a claim
  about the app itself. What was actually done: reviewed every page's
  Tailwind classes for mobile-first correctness. Sign-in/verify/
  claim-account were already solid (single-column `max-w-sm` forms,
  decorative panel correctly `hidden md:flex`). Found and fixed one
  real bug: the dashboard shell header (`dashboard/page.tsx`) packed
  logo + email + role + EN/FR toggle + sign-out into one fixed-height,
  non-wrapping flex row — on a ~390px phone width the combined content
  width exceeds the viewport. Fixed with `flex-wrap`, `min-h-14`
  instead of fixed `h-14`, and hiding the email address below the `sm:`
  breakpoint. Not verified with a real screenshot — a genuine gap,
  worth a real device/browser check before the Dr. Ivo demo.
- **R-033 — OPEN, HIGH SEVERITY: the real onboarding flow
  (`claim-account`'s Server Actions) crashes for every not-yet-claimed
  real account.** Discovered live in production (see `docs/decision-log.md`
  DL-040) via a disposable throwaway test account, not one of the 8 real
  provisioned identities. Root cause: `completeProfile`/`confirmEnrollment`
  are Server Actions whose implicit POST target is the browser's current
  address-bar URL — after the sign-in to middleware-redirect chain
  (`signInAction` redirects to `/dashboard`; middleware redirects that to
  `/claim-account`), the address bar never actually updates off
  `/dashboard`, so the form posts there instead. Middleware then redirects
  that POST too, and a middleware redirect is not a valid Server Action
  protocol response — the client crashes with "Application error: a
  client-side exception," and the DB write never happens (confirmed:
  `profileCompletedAt` stays `null`). Every one of the 8 real accounts
  from `scripts/provision-team.ts` will hit this on first claim attempt if
  still unclaimed — not yet cross-checked against team communication for
  whether anyone already claimed successfully. DL-039 fixed the identical
  bug in `/verify` by converting its Server Action to a Route Handler
  (`/api/auth/enroll-totp`, outside middleware's matcher); the same fix
  would apply to `claim-account`, but it touches the primary onboarding
  path for real staff and is outside this session's original scope — not
  fixed yet, flagged for Marcel's go-ahead.
