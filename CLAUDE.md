# PROJECT OPERATING RULES — xpath-report

This repository is governed by **`PROJECT_HEADER.md`** (repo root) — read it
first, always. It is the constitution; if any instruction conflicts with it,
stop and flag rather than proceeding.

## Source of truth (in this repo — read before implementing)
- `docs/product-brief.md`
- `docs/architecture.md`
- `docs/decision-log.md`
- `docs/workflow-map.md`
- `docs/security-checklist.md`
- `docs/known-risks.md`
- `docs/change-log.md`
- `docs/release-checklist.md`

All eight exist in this repo as of Session 01. If a future session finds one
missing, create a minimal version before major feature work — but a missing
doc is never a reason to stop and interrogate the user; note the gap in
`docs/known-risks.md` and continue.

## Optional personal workflow files
Marcel's machine may also have global task files under `~/.claude/tasks/`
(`enterprise.md`, `rules.md`, `stack.md`, `plan.md`, `agent.md`, `review.md`,
`debug.md`, `security.md`, `performance.md`, `deploy.md`, `lessons.md`,
`todo.md`). These are **personal workflow preferences that live outside this
repository** — read them if present for extra context, but their absence is
never a blocker. This repo must be independently buildable and reviewable by
anyone (Dr. Ivo, a future hire, a Cameroon agency per the feasibility study)
without access to Marcel's personal machine. Do not gate work on files this
repo does not own.

## Strict workflow
Plan → Build → Review → Debug → Security → Performance → Deploy.
Do not code without a plan; do not skip the build/security gates below.

## Repo safety
Before any code change: confirm cwd, confirm this is `xpath-report`, confirm
the task matches this repo. If unclear, stop and flag — never edit the wrong
repository.

## Build rule (non-negotiable)
Before saying work is done, run and show the output — never say "should work":
```
npm run typecheck
npm run build
```

## Security rule
Before any deploy, verify: auth flow · role checks · tenant scoping ·
`lib/access.ts` guards on every clinical/workspace query · secrets never
committed · rate limits on auth endpoints · input validation (Zod) · file
upload handling (R2, once introduced) · CORS/headers · audit-log coverage ·
Vercel env vars · Cloudflare rules. See `docs/security-checklist.md`.

## AI coding rule
Fix only the requested task. Do not refactor unrelated files. Do not change
architecture without it being logged in `docs/decision-log.md`. Do not remove
business logic unless explicitly instructed. Do not widen scope past the
current session's stated objective (Header G4).

## Memory rule
After each meaningful session: append to `docs/change-log.md`. If the session
surfaces a new risk, add it to `docs/known-risks.md`. If Marcel's personal
`~/.claude/tasks/lessons.md` or `todo.md` exist, update those too — but their
absence never blocks the change-log update above.
