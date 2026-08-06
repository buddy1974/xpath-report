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
- **R-033 — RESOLVED same session: the real onboarding flow
  (`claim-account`'s Server Actions) crashed for every not-yet-claimed
  real account.** Discovered live in production (see `docs/decision-log.md`
  DL-040) via a disposable throwaway test account, not one of the 8 real
  provisioned identities. Root cause: `completeProfile`/`confirmEnrollment`
  were Server Actions whose implicit POST target is the browser's current
  address-bar URL — after the sign-in to middleware-redirect chain
  (`signInAction` redirects to `/dashboard`; middleware redirects that to
  `/claim-account`), the address bar never actually updates off
  `/dashboard`, so the form posted there instead. Middleware then redirected
  that POST too, and a middleware redirect is not a valid Server Action
  protocol response — the client crashed with "Application error: a
  client-side exception," and the DB write never happened (confirmed:
  `profileCompletedAt` stayed `null`). Fixed by converting both to Route
  Handlers (`/api/auth/claim-profile`, `/api/auth/claim-enroll`), same
  pattern as DL-039's `/api/auth/enroll-totp`. Live-verified end to end
  with a second disposable throwaway account: Step 1 → Step 2 QR →
  `/dashboard`, no crash. **Still open:** whether any of the 8 real
  accounts from `scripts/provision-team.ts` hit this bug before the fix
  landed has not been cross-checked against team communication — worth
  confirming with Marcel/Dr. Ivo whether anyone needs to retry their claim.
- **R-034 — CONDITIONAL-field trigger-based hiding and danger-zone urgency
  banners were deliberately not built as part of DL-045's review-form
  redesign.** CONDITIONAL fields (e.g. "Rectal Tumor Location," required
  only when Tumor Site is rectal) still render inline/always-visible
  rather than hidden until their trigger fires, because no field in the
  template type/data model currently carries "depends on field X = value
  Y" metadata — encoding it correctly across ~30-50 conditional fields
  spanning all 6 templates is a real data-modeling task, and guessing at
  triggers from label text is a real clinical-correctness risk (could
  hide a field a pathologist actually needs to fill on a signed record).
  Separately, there is no "mark as urgent" mechanism anywhere in the data
  model, so danger-zone banners for urgent findings (positive margin,
  high grade) were not built — auto-inferring urgency from field values
  would be an uncredentialed clinical inference (Header G1/G8). Both need
  real design/data-modeling work, not a fast follow inside a UI task.
  **Update (DL-046): the danger-zone-banner half is now built** — a
  pathologist-set urgency flag (severity + note), never inferred. The
  CONDITIONAL-field auto-hiding half remains open, unchanged.
- **R-035 — `structureTranscript`'s grounding-quote match is a literal
  substring check, so a transcript containing embedded newlines
  mid-phrase silently drops otherwise-correct, well-grounded model
  values.** Found live while building DL-046's demo seed script: a
  hard-wrapped multi-line JS template literal for the transcript
  produced a string with `\n` in the middle of several phrases (e.g.
  "ninety percent\nof tumor cells"); the model's returned quote used a
  normal space at that point ("ninety percent of tumor cells"), so
  `normalizedTranscript.includes(quote.toLowerCase())` failed and the
  field was rejected — 9 of 10 real, correctly-extracted values were
  silently dropped this way in one run. Not a code bug in
  `validateAndGround` itself (rejecting a quote that doesn't literally
  appear is the correct, deliberate G8 anti-fabrication behavior) — but
  a real fragility: any real transcript source that normalizes/wraps
  whitespace differently than the model's quote (copy-pasted multi-line
  text, some PDF-to-text tools, certain editors) could hit the same
  silent-rejection failure mode against a perfectly good extraction.
  Mitigated in the demo script by writing the transcript as one
  unbroken line; not yet mitigated in the production path (Whisper
  transcription output, which doesn't hard-wrap, is the actual live
  source, so this is lower-priority than it would be for pasted text —
  but worth a real fix, e.g. normalizing whitespace on both sides of the
  comparison, if a future source of transcript text (manual paste,
  non-Whisper import) is ever added).
- **R-036 — RESOLVED (2026-08-04) — the R2 bucket's CORS policy rejected
  every direct browser-to-R2 presigned upload, confirmed for BOTH the
  avatar-upload feature AND the dictation-audio path itself.**
  **Resolution: Marcel fixed the R2 bucket's CORS policy in the
  Cloudflare dashboard, then ran a real end-to-end test on his own
  mobile device with the `test-pathologist` account — dictation audio
  upload, transcription, and save-to-workspace all worked live for the
  first time.** Also confirmed working in the same live test: profile
  picture upload, and template auto-suggestion (correctly requiring
  manual confirm, not auto-routing — G1 compliant). Left below for the
  historical record of what the failure was and how it was found.
  Found live (DL-047) building the profile-picture upload: a real
  browser `fetch()` PUT to a real presigned URL failed with `Failed to
  fetch` after the browser's CORS preflight `OPTIONS` request came back
  `403`. Fixed avatar upload by routing it through a Server Action
  (server-side R2 PUT, no browser CORS involved) — but then tested
  whether the same failure hits the actual dictation-recorder upload
  path (`src/app/(app)/dashboard/dictate/actions.ts:createCapture` +
  `recorder.tsx`'s direct-to-R2 `fetch` PUT), which has used this exact
  presigned-URL pattern since M4 and was previously only ever verified
  via a server-side script (DL-021/R-019's pipeline test bypasses
  browser CORS entirely) — **never with a real browser**, because no
  real microphone has been available in this session's browser
  automation (see the old M4/mic-UI gap this replaces, previously
  logged only as an unverified checklist line in `docs/PROGRESS.md`,
  never as a numbered risk). Generated a real presigned URL for an
  `audio/webm` object key and issued the identical `fetch` PUT from an
  authenticated real browser tab: **same failure** (`Failed to fetch`).
  This means **any real pathologist attempting to dictate a case
  through the actual browser UI today would hit an upload failure at
  the "Start recording" → stop → upload step** — the core capture loop,
  the single most important user-facing feature in the product, is
  very likely broken in production for real users, not just for the
  new avatar feature. No tool available in this session exposes R2
  CORS configuration (`r2_bucket_get` returns no `cors` field; there is
  no dedicated CORS-policy MCP tool) — this needs Marcel's Cloudflare
  dashboard (R2 → bucket → Settings → CORS Policy: allow `PUT`/`GET` +
  `OPTIONS` from `https://www.xpath.report` and `https://xpath.report`,
  with `Content-Type` and the `x-amz-*` checksum headers the AWS SDK
  v3 client attaches by default) — a likely 2-minute fix once done, but
  not something fixable from application code. **Recommend treating
  this as the single highest-priority open item before any real
  pathologist (including the seeded demo account or the new
  test-pathologist account) is asked to dictate through the actual
  browser recorder.** Until CORS is fixed or confirmed working with a
  real browser + real microphone, do not treat the dictation capture
  loop as "verified live" for a real user, even though the underlying
  transcription pipeline itself (Whisper call, structuring, reflex) is
  thoroughly verified via server-side script tests.
- **R-037 — LOW PRIORITY, latent until a second tenant exists:
  `src/auth.ts`'s Credentials `authorize()` looks up a login by email
  alone (`.limit(1)`, no tenant filter), but `users.email` is only
  unique *within* a tenant (`users_email_tenant_idx` in
  `src/db/schema.ts`), not globally.** Found during the DL-048 root-
  cause audit of a reported admin login failure (ruled out as the
  cause this time — confirmed only one row exists for
  `dev-administrator@xpath.report` today). If a second tenant is ever
  onboarded (G1 explicitly requires the app be built multi-tenant from
  the foundation) and its email space ever collides with an existing
  user's email in a different tenant, which row `authorize()` checks
  the password against is whichever Postgres returns first with no
  `ORDER BY` — unspecified, not deterministic. Not fixed now (no second
  tenant exists yet, so nothing reproduces it, and Header's AI coding
  rule is to fix only the requested task) — worth scoping a tenant-
  aware login (e.g. a lab-selector step, or a tenant slug on the
  sign-in form) before a second tenant is actually onboarded.
- **R-038 — LOW, process hygiene, no live credential at risk — a
  throwaway admin password (`AdminVerifyDL052x!`, used once to live-
  verify DL-052's admin-only preview) was typed as a literal Bash
  argument (`printf '...' | npx tsx ...`) and now sits in plaintext in
  this session's transcript.** Caught by Cowork's review of DL-052, not
  self-caught. Rotated to an unknown random value immediately
  afterward (same session), so nothing currently valid is exposed — but
  the pattern itself is bad practice on principle: any password value
  typed as a literal tool-call parameter (Bash *or* browser-automation
  `form_input`) persists in the transcript regardless of how quickly
  it's rotated away. The earlier final-rotation step in the same
  session already used the safer pattern (`openssl rand -base64 24 |
  npx tsx ...` — the value is generated and piped in without ever being
  typed or known to the operator) for the *last* password set on that
  account; the *throwaway verification* password should have used the
  same generate-and-pipe approach instead of a hand-typed string.
  Going forward: for any live-login verification step that needs a
  throwaway credential, generate it via `openssl rand` rather than
  typing a memorable string, and still rotate it away immediately after
  (as already done here) — treat "appeared once as a tool-call
  parameter" as equivalent to "logged forever," not something that can
  be fully avoided while still doing real browser verification (the
  project's own R-036/DL-047 history is exactly why server-side-only
  verification isn't an acceptable substitute).
- **RESOLVED (2026-08-06) — R-039 — two DL-055 follow-ups, both now
  live-verified.** **(1)** Added a real "← Workspace" back link to all
  three of `/dashboard/structure/[dictationId]`'s render states, then
  extended the "hide chrome during focused work" carve-out
  (avatar/ticker/CTA bar) to that screen too, now that it has a safe
  exit. **(2)** QC-flag capture at review and the Workspace pending-
  signature triage badge were both live-clicked: a real draft was
  flagged non-concordant then switched to stain-failure with a reason
  note, saved, and confirmed to persist correctly after a full
  server round-trip; the Workspace list showed the correct "WATCH"
  triage badge (icon+text) on all three pending drafts. Live
  verification required a real `test-pathologist@xpath.report`
  session — a cookie-mint alternative (using the app's own
  `AUTH_SECRET` to forge a session without ever touching a password)
  was investigated first but is not achievable with the available
  browser tools: NextAuth's session cookie is `httpOnly`, and the
  browser tools only run page-context JS, which cannot set it: the
  only paths in were the real login form or a temporary auth-bypass
  endpoint on the live app, and the latter was correctly treated as a
  security-control change needing separate authorization, not
  something to add unilaterally. Asked the user directly rather than
  choosing silently; approved the real-login-form path. Password
  reset via the generate-and-pipe script, the one generated value read
  back exactly once in order to type it into the real sign-in form
  (a deliberate, approved, one-time exception to R-038's "never
  observe a password" rule — flagged as such at the time, not quietly
  done), then rotated to a fresh unknown value again immediately after
  sign-out, twice over (a first rotation, then one more after a second
  short re-login to confirm the Structure-page fix specifically) —
  nobody, including this session, holds a working credential for that
  account now.
