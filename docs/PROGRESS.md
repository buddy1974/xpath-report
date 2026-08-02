# X-PATH — PROGRESS
Overall: ▓▓▓▓▓░░░░░ ~48% (you are here → M4 built, blocked on R2 write permission)

[x] M0 Foundation              100%
[x] M1 Login live               100%
[ ] M2 Private workspace         0%
[>] M3 Template engine           70%   ← in progress
[>] M4 Voice + transcription    60%   ← current, blocked on R2 write permission
[ ] M5 Structure & auto-fill     0%
[ ] M6 Review · validate · assign 0%
[ ] M7 Hardening + demo          0%

Team provisioning (Cowork execution-order §1 — parallel workstream, not a
numbered milestone): built and verified end-to-end, both locally and live.

WAITING ON MARCEL:
🔔 R2 API token has read-only permission on `xpath-storage` — `PutObject`
   fails (403) via presigned URL *and* direct SDK call, while
   `HeadBucket`/`ListObjectsV2` succeed with the same credentials. Not a
   code bug (isolated precisely — see R-019). Needs: Cloudflare dashboard
   → R2 → Manage API Tokens → give the token Object Read & Write on
   `xpath-storage` (or issue a new token and update `.env.local` +
   Vercel). This blocks end-to-end M4 testing (upload → transcribe →
   save) — the code is written and believed correct, just unverified
   past the upload step.
🔔 Cloudflare Turnstile keys (`CLOUDFLARE_TURNSTILE_SITE_KEY` +
   `CLOUDFLARE_TURNSTILE_SECRET_KEY`) — code is wired and ready, inactive
   until these are set.

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

**M4 — voice capture + transcription. Built, blocked on external R2
permission.**
- Verified `OPENAI_API_KEY` with a real test call before building on
  top of it (per the execution order's own instruction) — synthesized
  speech via Windows TTS ("Invasive ductal carcinoma, Nottingham grade
  two, margins clear.") transcribed near-perfectly through Whisper.
- Built: `src/lib/r2.ts` (presigned upload + server-side download),
  `src/lib/transcription.ts` (Whisper wrapper, pseudonymization = raw
  audio only, no identifying fields — DL-022), `mustCompleteSetup`-style
  dictation flow reusing `private_workspace_items` (`kind: "dictation"`,
  new `language` column — DL-020), a 3-state recorder UI
  (`/dashboard/dictate`: record → upload direct to R2 via presigned URL
  → transcribe → editable transcript, marked AI-generated per Header
  G1/G8 → save to private workspace, never audited per G2).
- Installing `@aws-sdk/client-s3` pulled in a **critical** transitive
  vulnerability (`fast-xml-parser`) — caught before it shipped, resolved
  via `npm audit fix` (non-breaking), re-verified clean.
- **Blocked:** R2 write permission (R-019, SIGNAL above). Isolated
  precisely — `HeadBucket`/`ListObjectsV2` succeed, `PutObject` fails
  (403) identically via presigned URL and direct SDK call, ruling out a
  bug in the presigning code or an endpoint/format mismatch. Whisper leg
  independently confirmed working; only the R2 write leg is unverified
  past this point.
- Logged rather than silently built: audio retention/auto-delete policy
  (R-020, needs a cron mechanism not yet built), verbal-PII-in-audio
  residual risk (R-021, procedural mitigation only), week-one FR/accent
  benchmark still needs Dr. Ivo's real voice (R-022, not substitutable
  with synthesized test speech).

`npx tsc --noEmit` and `npm run build` pass. Committed locally, not
pushed (mid-milestone, blocked on the R2 SIGNAL — will finish
verification and push once that's resolved).
