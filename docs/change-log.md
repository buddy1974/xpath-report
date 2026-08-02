# X-PATH — Change Log

Format: date · session · what changed · why.

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
