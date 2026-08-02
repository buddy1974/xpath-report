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
  the request host to match `AUTH_URL` exactly. Revisit at M7 once
  `xpath.report` is the fixed production host.
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
