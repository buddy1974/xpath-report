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
