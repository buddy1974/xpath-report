# X-PATH — PROGRESS
Overall: ▓▓▓▓▓▓▓▓░░ ~75% (you are here → M6 signing loop built + E2E-verified; PDF generation pending vendor decision)

[x] M0 Foundation              100%
[x] M1 Login live               100%
[ ] M2 Private workspace         0%
[x] M3 Template engine          100%   ← all 6 Phase-1 templates built
[x] M4 Voice + transcription    95%   ← pipeline verified live, mic-UI unverified
[x] M5 Structure & auto-fill    90%   ← engine + all templates verified
[x] M6 Review · validate · assign 85%   ← review/sign/archive loop E2E-verified live; PDF pending vendor gate
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

**M1/M3(Breast)/M4/team-provisioning: unchanged since last report, all
still live and verified** (see `docs/change-log.md` for full history).

**M3/M5 — all 6 Phase-1 templates now built.** Added Colon & Rectum
(Resection), Prostate (Needle Biopsy — one `TemplateVersion` combining
CAP's specimen-level + case-level protocol pair, DL-028), Lymphoma
(Basic), and CUP (no CAP source exists — built from the header's
generic-fallback-protocol pattern + the real CUP IHC panel from
`XPATH_handover.md` §13; PAX8 explicitly tagged as an unconfirmed-clone
open item, not silently included as if confirmed). Built via 4 parallel
forked agents, each given identical G3-boundary instructions and the
Breast templates as reference — then independently re-verified, not
just trusted (DL-027): full-repo typecheck, a duplicate-field-path
check across all 6 templates (`0` collisions), templateId uniqueness,
a copied-prose smell test (grep for suspiciously long labels — none
found), and a manual read of each file's header + a substantive
section. One schema constraint honestly logged rather than silently
worked around: `tier` is per-field not per-option, so Lymphoma's
~100-option diagnosis field (3 of which CAP marks non-core) is modeled
as a single core field (DL-029).

**M5 auto-fill engine verified against a newly-added template too, not
just Breast** — real transcript, real OpenAI call, against CUP:
correctly extracted histologic type, all 6 IHC panel results (CK7/
CK20/CDX2/TTF-1/GATA3/CD45), and the free-text differential
interpretation field, each with a real grounding quote. Template
suggestion correctly ranked CUP highest for a CUP-shaped transcript.

`npx tsc --noEmit` and `npm run build` pass across all 6 templates.

**M6 — review, sign, archive loop built and E2E-verified against real
Neon data (not just typecheck/build).** Real browser walkthrough:
seeded dictation → suggest/confirm template → auto-fill (correctly
extracted ER/PR/HER2/Ki-67 values, correctly fired the HER2 Dual-ISH
reflex) → review/edit form → sign with a test accession → archive
detail page. Independently confirmed against real Neon: `clinicalRecords`
row, `sign_out_report` audit entry, source draft deleted, original
dictation preserved, `cases` row created. Fixed a real bug found while
building this (`flattenTemplate` was dropping `cannotBeDetermined`,
DL-030). Two non-blocking findings logged, not fixed reflexively:
R-026 (inert `opt.children` rendering gap) and R-028 (template
suggestion mis-ranked an unambiguous transcript — Header §5's human
confirmation already covers it). R-027 logged: no amendment path for
signed records yet, a real gap outside M6's first-signing-loop scope.

M6 is functionally complete except PDF generation — that's gated on
the vendor decision, surfaced to Marcel as a concrete recommendation
(not an open question) per the pre-flagged gate. See next message /
`docs/decision-log.md` for the recommendation once given.
