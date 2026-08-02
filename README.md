# X-PATH — xpath.report

Structured pathology reporting platform. **Foundation (Execution Session 01).**

> Governance: read **`PROJECT_HEADER.md`** first — it is the constitution.
> Workflow: read **`CLAUDE.md`** (Plan → Build → Review → Debug → Security →
> Performance → Deploy). Source-of-truth docs in `docs/`.

## What Session 01 delivers (foundation only)
- Multi-tenant schema (Header G1) — `src/db/schema.ts`.
- **Private workspace vs clinical record** separation (Header G2) — the two
  domains + append-only audit log, all in the schema.
- Access-isolation guards in code (`src/lib/access.ts`) — tenant scoping +
  owner-only private workspace (no role override, not even admin/owner).
- Auth.js v5 + TOTP 2FA (`src/auth.ts`), authenticator only, encrypted secrets.
- App shell: sign-in → verify (2FA) → role-aware dashboard (empty).
- Seed: tenant BettaHealth + one user per role.

**Not in Session 01** (Header G4): templates, voice/AI, OCR, reflex engine,
report generation. Those are Session 02+. **Not ever:** any notification,
alert, digest, or reporting layer into pathologist activity — permanently
excluded by Header G2a, not deferred.

## Verified
`schema · access · audit · crypto · db` typecheck clean (core guardrail modules).

## Run (in-repo — where the build gate lives)
```bash
cp .env.example .env.local        # fill DATABASE_URL, AUTH_SECRET, ENCRYPTION_KEY
npm install
npm run db:generate && npm run db:migrate && npm run db:seed
npm run typecheck && npm run build   # CLAUDE.md build rule — verify before "done"
npm run dev
```

## Definition of done (demonstrate)
Login + TOTP works · a pathologist sees only their own data · owner/admin cannot
open a private workspace · tenant scoping holds · two domains + audit present ·
an action writes an audit entry · deploys to a Vercel preview from `main`.

_Maxpromo Digital — Gemäß §19 UStG wird keine Umsatzsteuer berechnet._
