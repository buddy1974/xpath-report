# X-PATH — PROGRESS
Overall: ▓▓▓▓░░░░░░ ~44% (you are here → M1 fully closed live; starting M4 prerequisites)

[x] M0 Foundation              100%
[x] M1 Login live               100%
[ ] M2 Private workspace         0%
[>] M3 Template engine           70%   ← in progress
[>] M4 Voice + transcription     0%   ← starting
[ ] M5 Structure & auto-fill     0%
[ ] M6 Review · validate · assign 0%
[ ] M7 Hardening + demo          0%

Team provisioning (Cowork execution-order §1 — parallel workstream, not a
numbered milestone): built and verified end-to-end, both locally and live.

WAITING ON MARCEL:
🔔 Cloudflare Turnstile keys (`CLOUDFLARE_TURNSTILE_SITE_KEY` +
   `CLOUDFLARE_TURNSTILE_SECRET_KEY`) — code is wired and ready, inactive
   until these are set.
🔔 The 8 provisioned session passwords were handed off already (Marcel
   confirmed moved/saved) — nothing further needed there.

LAST UPDATE: 2026-08-02 —

**M1 — fully closed, live, on the actual production-path URL.**
`AUTH_URL=https://xpath.report` (set, but not DNS-live until M7) was
overriding `trustHost` for outbound redirects — a real browser walkthrough
(not scripted HTTP checks, which used `redirect: 'manual'` and never
followed the Location header) found login redirecting real users off
`xpath-report.vercel.app` onto the parked `xpath.report` domain mid-flow,
losing the session with no visible error (R-018). Marcel removed
`AUTH_URL` from Vercel entirely (Production + Preview) — the correct fix,
better than pointing it at the preview host, since it now self-corrects
at M7 with no further change needed. Re-verified live via full browser
walkthrough: login+TOTP succeeds end to end, host never changes,
`audit_log` entry confirmed written (DL-019). All 4 M1 DoD items now
proven on the actual live URL, via an actual browser. Also flagged, not
blocking: GitHub repo is public not private (R-015); AUTH_SECRET still
low-entropy.

**M3 — template engine + Breast templates (unchanged this round).**
Versioned template engine + two full Phase-1 templates (Breast Invasive
Resection, Breast Biomarker) derived from the supplied CAP source files,
structural logic only. `/dashboard/templates` renders both statically —
value binding is M5.

**Team provisioning (Cowork addendum §1) — built and verified, twice
now.** `mustCompleteSetup` schema gate, 8 real accounts provisioned, 2-step
claim wizard (profile + real TOTP QR enrollment), Turnstile wired
(inactive pending keys). Walked end to end against real Neon both locally
and on the live URL. Two real bugs found via actual browser walkthroughs
this session (not scripted HTTP tests) and fixed: missing CSRF token on
sign-in (DL-016), stale session email after profile update (DL-017) — on
top of the AUTH_URL redirect bug above. Three bugs total this session
that only surfaced because real browsers were used to test real
user-facing flows, not just HTTP scripts against the API surface
(R-016/R-018 — logged as a standing lesson for future verification work).

`npx tsc --noEmit` and `npm run build` pass throughout. Pushed to `main`
(`496fba2`) and deployed — confirmed live and correct.

**Next: M4 (voice + transcription).** `OPENAI_API_KEY` and R2 credentials
are already present in `.env.local` (from earlier in this session) —
first step is confirming they're also set in Vercel and doing a real
test call to Whisper before building on top of them, per the execution
order's own instruction not to just check the env var exists.
