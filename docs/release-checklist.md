# X-PATH — Release Checklist

Definition of done for *any* module (Header §7), plus the mechanical steps.

## Every session, before saying "done"
- [ ] `npm run typecheck` — shown, not claimed.
- [ ] `npm run build` — shown, not claimed.
- [ ] `docs/change-log.md` updated.
- [ ] Any new/changed architectural decision logged in `docs/decision-log.md`.
- [ ] Any new risk logged in `docs/known-risks.md`.
- [ ] Guardrail self-check against `PROJECT_HEADER.md` §3 and §6 (Hard NO
      list) — explicitly, not assumed.

## Before first non-local deploy (Vercel preview)
- [ ] Repo is private on GitHub.
- [ ] `.env.example` has placeholders only; real secrets live in Vercel env
      vars, generated locally (`openssl rand -base64 32`), never committed.
- [ ] `docs/security-checklist.md` fully reviewed.
- [ ] Neon database provisioned; migrations applied (`npm run db:migrate`);
      seed run against a throwaway/dev database only — never against
      anything containing real patient data.
- [ ] Vercel project connected to GitHub `main` with preview deploys on PR.

## Before any clinical/patient data is ever entered (future gate)
- [ ] Data-hosting jurisdiction confirmed (R-005).
- [ ] Guideline-content licensing position confirmed (R-001) if the
      Knowledge Environment module is in scope.
- [ ] Full security-checklist pass with patient-data-specific review
      (encryption at rest confirmed on the actual Neon project, R2 bucket
      access policy reviewed, audit log tested end to end on a real action).
- [ ] Dr. Ivo sign-off on template validation for any clinical template in
      use (Header G3).

## Session 01 specifically — Definition of Done (Header work order §6)
- [x] Schema shows the two distinct G2 domains + audit log; an action can
      write an audit entry (`lib/audit.ts`).
- [x] Access isolation + tenant scoping enforced in code (`lib/access.ts`),
      not just intended.
- [x] Nothing clinical/AI built (G4/G6).
- [x] No copyrighted protocol content anywhere (G3).
- [x] No secrets committed; `.env.example` only.
- [x] `npm run typecheck && npm run build` verified in a real environment.
- [ ] Login + TOTP 2FA exercised end to end against a live Neon database —
      **not yet run; requires a provisioned Neon project + `npm run
      db:migrate && npm run db:seed` on Marcel's machine or CI.**
- [ ] Deploys to a Vercel preview from `main` — **not yet done; requires
      GitHub push + Vercel project connection.**
