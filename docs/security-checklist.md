# X-PATH — Security Checklist

Run before any deploy, and re-check anything touched by the current session.

## Auth & session
- [ ] Credentials provider hashes verified with bcrypt; no plaintext password
      path anywhere.
- [ ] TOTP secrets stored via `lib/crypto.ts` (encrypted at rest); never
      logged, never returned in an API response.
- [ ] No SMS 2FA path (Header DL-008).
- [ ] `middleware.ts` uses only the edge-safe `auth.config.ts` — no bcrypt,
      no DB client in the Edge bundle (verify: `npm run build`, check the
      Middleware bundle size/trace for `bcryptjs`).
- [ ] `/dashboard/**` unreachable without a TOTP-verified session.
- [x] **CSRF — custom cookie-authenticated POST routes.** NextAuth's
      built-in CSRF token only covers its own `/api/auth/callback/*`
      handlers, not routes we write. `/api/auth/verify-totp` adds an
      explicit same-origin check (`Origin` header must match `Host`, fail
      closed if `Origin` is missing) — see the comment in
      `src/app/api/auth/verify-totp/route.ts`. Backstop: the session
      cookie is SameSite=Lax (Auth.js default, unmodified). Any future
      custom mutating route under `/api/**` needs the same same-origin
      check — it is not automatic.

## Access isolation (Header G1/G2 — the core guardrail)
- [ ] Every clinical/workspace query passes through `lib/access.ts`
      (`assertSameTenant`, `assertWorkspaceOwner`, `canReadClinicalRecord`) —
      no hand-rolled query bypasses these.
- [ ] No role (including administrator) can read another user's
      `private_workspace_items`. This is enforced in code, not convention.
- [ ] Cross-tenant reads are impossible even for administrators of a
      different tenant.

## Data handling
- [ ] Secrets only ever live in `.env.local` / the hosting platform's env
      store — never committed. `.env.example` holds placeholders only.
- [ ] Patient identifiers are stripped before any dictation/scan payload
      leaves the environment for an external AI call (Header §5 —
      pseudonymize before external AI). Not yet applicable until Session 02+
      introduces dictation.
- [ ] `audit_log` is append-only in code (`lib/audit.ts`) — no update/delete
      path exists anywhere in the codebase.

## Application hardening (apply as each surface is introduced)
- [ ] Input validation with Zod on every server action / API route.
- [x] Rate limiting on `/api/auth/verify-totp` — DB-backed lockout
      (`users.totpFailedAttempts` / `totpLockedUntil`), not in-memory (the
      app runs as stateless serverless functions, so a per-instance counter
      would not actually limit anything). Locks the account for
      `TOTP_LOCKOUT_MINUTES` after `MAX_FAILED_TOTP_ATTEMPTS` wrong codes
      (`src/lib/totp-policy.ts`, currently 5 / 15 min). Every failed
      attempt and every lockout writes an `audit_log` row
      (`totp_failed` / `totp_locked`).
  - [ ] **Still open:** `/api/auth/callback/credentials` (the password
        step, handled internally by NextAuth) has no rate limiting yet.
        Tracked as `docs/known-risks.md` R-011 — not covered by this pass.
- [ ] File uploads (R2, once introduced) scoped per-tenant, signed URLs only.
- [ ] Standard security headers (CSP, HSTS, X-Frame-Options) set at the
      Vercel/Cloudflare edge before first public deploy.
- [ ] Cloudflare WAF rules reviewed before the domain goes live.

## Verification discipline
- [ ] `npm run typecheck && npm run build` run and output shown — never
      claimed as "should work" (CLAUDE.md build rule).
- [ ] `npm audit` reviewed; any new high/critical finding is either fixed or
      explicitly logged in `docs/known-risks.md` with a reason it's deferred.
