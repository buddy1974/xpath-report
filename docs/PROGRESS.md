# X-PATH — PROGRESS
Overall: ▓▓▓▓░░░░░░ ~42% (you are here → M3 templates done; team provisioning built + verified)

[x] M0 Foundation              100%
[x] M1 Login live               100%
[ ] M2 Private workspace         0%
[>] M3 Template engine           70%   ← current
[ ] M4 Voice + transcription     0%
[ ] M5 Structure & auto-fill     0%
[ ] M6 Review · validate · assign 0%
[ ] M7 Hardening + demo          0%

Team provisioning (Cowork execution-order §1 — parallel workstream, not a
numbered milestone): schema + provisioning script + claim wizard + Turnstile
wiring all built and verified end-to-end locally against real Neon.

WAITING ON MARCEL:
🔔 Cloudflare Turnstile keys (`CLOUDFLARE_TURNSTILE_SITE_KEY` +
   `CLOUDFLARE_TURNSTILE_SECRET_KEY`) — code is wired and ready, inactive
   until these are set (widget doesn't render, server check passes through).
🔔 The 8 provisioned session passwords are sitting in this session's
   scrollback only (never written to a file) — hand them off to the real
   people before this context is gone, or re-run `npm run provision:team`
   for a fresh set later (would need the 8 existing placeholder rows
   cleared first, since email is now uniquely constrained per tenant).

LAST UPDATE: 2026-08-02 —

**M1 CLOSED — verified for real against the live URL**
(https://xpath-report.vercel.app, commit c547e92; confirmed independently
via direct Vercel API check after the relayed claim — `list_projects` had
a list/index lag, `get_project`/`get_deployment` by ID confirmed READY,
aliased to xpath-report.vercel.app / www.xpath.report / xpath.report).
Full login+TOTP HTTP flow 8/8 checks PASS, forged cross-origin request
rejected (403), audit_log entries confirmed written for real. All 4 M1
DoD items proven against real data on the live URL. Flagged, not
blocking: GitHub repo is public not private (R-015, release-checklist.md
calls for private); AUTH_SECRET is still low-entropy.

**M3 — template engine + Breast templates.** Extracted structural logic
(field names, tiers, controlled vocabulary — never paragraph text, Header
G3) from the two supplied CAP source files, never committed. Built the
versioned template engine (`src/lib/templates/types.ts`) and two full
Phase-1 templates: Breast Invasive Carcinoma (Resection) and Breast
Biomarker Reporting. A handful of Biomarker "standardized comment"
options are full authored paragraphs in the source — tagged
`needsInHouseAuthoring: true` with a short in-house label instead of
copied text (DL-014, R-012), not clinically usable until authored/
approved. `/dashboard/templates` renders both as a static structural
view (no value binding — that's M5).

**Team provisioning (Cowork addendum §1) — built and verified.**
`mustCompleteSetup` schema gate (same pattern as `totpVerified`);
`scripts/provision-team.ts` provisioned the 8 real accounts (3
pathologists, Dr. Ivo, 4 technicians) with strong random session
passwords, printed once to console, never written to a file (swept the
working tree afterward to confirm); a 2-step claim wizard (profile +
password replacement, then real TOTP QR enrollment); Cloudflare Turnstile
wired on `/sign-in` (inactive pending keys). Added a genuine unique
constraint on `(tenant_id, email)` — this caught a real collision between
M1's dev-test seed emails and the provisioning emails, which got renamed
(`dev-pathologist-a/b@...`) rather than deviating from the spec's exact
real-account emails.

**Two real bugs found via an actual browser walkthrough of the claim
wizard (not just scripted HTTP tests), both fixed:**
1. Sign-in had always been missing the CSRF token NextAuth's callback
   endpoint requires — real users would hit `?error=MissingCSRF`. M1's
   earlier "verified" claim only worked because the test script manually
   injected a token the real page never provided. Fixed by switching to
   a Server Action calling `signIn()` directly, protected by Next.js's
   built-in Origin-header check instead (DL-016, R-016 — the lesson:
   scripted API checks aren't sufficient on their own for user-facing
   pages).
2. Dashboard header showed the stale placeholder email after Step 1
   changed it — DB was correct, the JWT cache wasn't refreshed. Fixed via
   `unstable_update` in `completeProfile` (DL-017).

Full flow walked end to end locally against real Neon: placeholder login
→ blocked from `/dashboard` → Step 1 → Step 2 (real QR, real TOTP code)
→ dashboard → log out → log back in with the new real email/password →
straight to `/verify` (not the wizard again) → correct email displayed.
`account_claimed` audit entry confirmed written.

`npx tsc --noEmit` and `npm run build` pass. Committed locally
(not pushed yet — per the addendum's own cadence: push at milestone
gates or when Marcel says so).
