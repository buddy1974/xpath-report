# X-PATH — PROGRESS
Overall: ▓▓▓▓▓▓░░░░ ~58% (you are here → M5 core engine built + verified with real transcripts)

[x] M0 Foundation              100%
[x] M1 Login live               100%
[ ] M2 Private workspace         0%
[>] M3 Template engine           70%   ← in progress
[x] M4 Voice + transcription    95%   ← pipeline verified live, mic-UI unverified
[>] M5 Structure & auto-fill    50%   ← current
[ ] M6 Review · validate · assign 0%
[ ] M7 Hardening + demo          0%

Team provisioning (Cowork execution-order §1 — parallel workstream, not a
numbered milestone): built and verified end-to-end, both locally and live.

Building straight through M5→M7 per Marcel's explicit go-ahead
(2026-08-03) — no per-milestone stop. Two things flagged in advance as
genuine gates already built into the project's own docs, not new
caution: (1) M6's PDF worker vendor choice — the roadmap calls for a
concrete recommendation for Marcel to approve/reject, not an open
question; (2) M7's Cloudflare DNS cutover — the roadmap calls this the
one "genuinely irreversible-ish" step needing Marcel's explicit go
before it happens, not after. Everything else in M5/M6/M7 builds
straight through.

WAITING ON MARCEL:
🔔 Cloudflare Turnstile keys (`CLOUDFLARE_TURNSTILE_SITE_KEY` +
   `CLOUDFLARE_TURNSTILE_SECRET_KEY`) — code is wired and ready, inactive
   until these are set.
🔔 Anthropic account has no credit balance — `AI_STRUCTURING_PROVIDER=anthropic`
   reaches and authenticates against the API correctly (confirmed: the
   error is a 400 billing error, not a 401 auth error), but hasn't been
   verified end to end with a real response. Not blocking — OpenAI (the
   default) is fully verified.

LAST UPDATE: 2026-08-03 —

**M1/M3/M4/team-provisioning: unchanged since last report, all still
live and verified** (see `docs/change-log.md` for full history —
login+TOTP live on `xpath-report.vercel.app`, Breast templates built,
M4 pipeline verified against real R2+OpenAI, 8 real accounts
provisioned and claimed via the wizard).

**M5 — structure & auto-fill. Core engine built and verified with real
transcripts + real API calls, not just typechecked:**
- `src/lib/templates/flatten.ts` — flattens a template's nested
  sections/fields into addressable dotted paths; this is the fillable
  surface offered to the AI and validated against.
- `src/lib/structuring.ts` — transcript → field values, OpenAI or
  Anthropic per `AI_STRUCTURING_PROVIDER` (Header §8). Every returned
  value must (1) reference a real field path/option key — invented ones
  rejected — and (2) come with a verbatim quote that's checked against
  the actual transcript — ungrounded values rejected (DL-023). This is
  the concrete, runtime mechanism behind Header G8 ("never fabricate"),
  not a policy statement.
- `src/lib/reflex.ts` — HER2 IHC 2+ (Equivocal) → Ventana HER2 Dual-ISH
  reflex suggestion, advisory only, from the real 38-antibody register
  (handover §12–13). One rule for M5, as the roadmap specifies ("build
  first").
- `src/lib/templates/suggest.ts` — deterministic keyword-overlap
  template shortlist (DL-025) — pathologist always confirms explicitly,
  never blind-routed.
- `/dashboard/structure/[dictationId]` — suggest → confirm → auto-fill
  → read-only review showing AI-suggested values with their grounding
  quotes and any reflex suggestions. Shares a renderer
  (`src/components/template-view.tsx`) with the M3 blank-template view.
- **Verified with a real transcript and a real OpenAI call** (not
  synthetic/mocked): "Estrogen receptor is positive, ninety percent...
  HER2... equivocal, score two plus... Ki-67... twenty five percent."
  correctly filled ER/PgR/HER2/Ki-67 fields, each grounded with a real
  quote, and correctly fired the HER2 Dual-ISH reflex suggestion.
- **Two real gaps found via this testing, one fixed, one logged:**
  (1) FIXED — "Specify percentage: ___" style options had no separate
  path for the actual number, only for which option was chosen; "90%"
  would auto-fill "positive" but silently drop the 90 (DL-024). (2)
  LOGGED, not fixed — the model can correctly quote real transcript text
  ("ninety percent") while still picking an adjacent numeric bucket
  ("91-100%" instead of "81-90%"); grounding-quote validation doesn't
  catch semantic/numeric miscategorization. Mitigated by design (every
  AI field shows its quote for the pathologist's mandatory M6 review),
  not by additional parsing (R-023).
- **Also logged rather than silently built or assumed:** repeatable
  blocks (Tumor Characteristics ×5) only auto-fill as a single instance
  (R-024); Anthropic path authenticates correctly but is blocked by an
  empty credit balance, unverified end to end (R-025, SIGNAL above).

**Not yet done in M5:** the remaining Phase-1 templates (Colon &
Rectum, Prostate, Lymphoma, CUP) — CAP source files are available
locally, same extraction process as Breast. Building next.

`npx tsc --noEmit` and `npm run build` pass. Committing and continuing
straight into the remaining M5 template work.
