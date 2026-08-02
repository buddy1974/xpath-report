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
