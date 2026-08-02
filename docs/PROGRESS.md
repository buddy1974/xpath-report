# X-PATH — PROGRESS
Overall: ▓▓░░░░░░░░ ~20% (you are here → M1: Accounts & login live)

[x] M0 Foundation              100%
[>] M1 Login live                75%   ← current, blocked on Vercel
[ ] M2 Private workspace         0%
[ ] M3 Template engine           0%
[ ] M4 Voice + transcription     0%
[ ] M5 Structure & auto-fill     0%
[ ] M6 Review · validate · assign 0%
[ ] M7 Hardening + demo          0%

WAITING ON MARCEL:
🔔 M1 — Vercel project not visible to the Vercel connector (only team found is
   "buddy1974's projects" / team_EAyech9xnsZIk9ajje9eCKp4, 0 projects on it, no
   .vercel/project.json in repo). Confirm which account/team it's actually under,
   or that GitHub-connect needs to be finished.
🔔 M1 — Push M1 commits to `main` (currently all local/uncommitted) — needed
   before Vercel (whichever project it turns out to be) builds anything newer
   than Session 01. Holding until Marcel confirms — a push to main is shared
   state, not doing it silently.

LAST UPDATE: 2026-08-02 — Migrations generated + applied to real Neon
(drizzle/0000_swift_cassandra_nova.sql), seeded (2 pathologists + technician/
manager/administrator, each with a real TOTP secret). Verified against REAL
Neon data:
  - G1/G2 isolation (scripts/verify-isolation.ts): PASS — second pathologist
    and administrator both denied a private workspace item; cross-tenant
    access denied.
  - Full login+TOTP HTTP flow (credentials sign-in -> blocked pre-2FA ->
    wrong code rejected -> correct code accepted -> /dashboard reachable ->
    forged cross-origin POST to verify-totp rejected, 403): 8/8 checks PASS.
    Run against localhost hitting the real production Neon DB, NOT the live
    Vercel URL (Vercel deploy blocked — see above).
  - audit_log confirmed written for real: sign_in (via totp) and
    totp_failed (attempt 1) rows present for the test pathologist.
  - Note: AUTH_SECRET currently in .env.local is low-entropy
    (789456123321456987789456321, not openssl-generated) — fine for this
    dev-DB verification pass, should be regenerated before anything beyond
    internal testing.
`npx tsc --noEmit` clean throughout. M1 Definition of Done: 3 of 4 items
proven against real data; "login+TOTP on the live URL" specifically blocked
on the two items above. STOPPED here per M1 gate — not rolling into M2.
