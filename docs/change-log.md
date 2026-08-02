# X-PATH — Change Log

Format: date · session · what changed · why.

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
