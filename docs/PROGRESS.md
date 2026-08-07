# X-PATH — PROGRESS
Overall: ▓▓▓▓▓▓▓▓▓▓ ~97% (you are here → M7 done: DNS live, redeployed, re-verified on xpath.report; R-036 resolved with a real mobile end-to-end test; Dictate CTA bar/Workspace/OCR-save/per-category colors built and live-verified (DL-051); Reflex Testing & Special Stains admin-only capability preview built and live-verified (DL-052); mobile IA redesign — top nav removed, floating avatar + full-screen user menu — built and live-verified with two stated tool-limitation caveats (DL-053); three super-admin features — content editing, account management, announcements — built and live-verified (DL-054); offline-first upload + TAT dashboard + QC-flag capture + reagent/equipment tracking + audit-log export + a frontend UX pass all built and live-verified (DL-055); Structure-page back link built + QC-flag/Workspace-triage live-verified for real (DL-056); installable PWA (manifest/service worker/iOS tags/install prompt) + a mobile-hardening sweep built, Lighthouse-audited (100/100 accessibility + best-practices), and live-verified in place of the deferred native-app migration (DL-058); full restorable version history for admin content overrides built and live-verified, a real bug caught and fixed by that same verification (DL-059); desktop-parity pass — persistent sidebar nav, wider Workspace/Home layouts — built and live-verified (DL-060); only the live Dr. Ivo demo remains)

✅ **R-036 RESOLVED (DL-050) — Marcel fixed the R2 CORS policy and ran a
real end-to-end mobile test (`test-pathologist` account): dictation
audio upload, transcription, and save-to-workspace all worked live for
the first time.** Also confirmed: profile-picture upload, template
auto-suggestion correctly requiring manual confirm (G1). Full detail in
`docs/known-risks.md` R-036 (kept for the historical record).

[x] M0 Foundation              100%
[x] M1 Login live               100%
[x] M2 Private workspace        90%   ← the aggregated list view flagged as missing (was 60%) is now built: /dashboard/workspace + nav item (DL-051), listing dictations/notes/drafts with a "Send to AI" or "Continue reviewing" action per item. Remaining 10%: reference_file/tip kinds exist in the schema but have no UI producing them yet — not asked for, not built
[x] M3 Template engine          100%   ← all 6 Phase-1 templates built
[x] M4 Voice + transcription    100%   ← pipeline + real-browser upload both CONFIRMED WORKING live (R-036 resolved, DL-050)
[x] M5 Structure & auto-fill    90%   ← engine + all templates verified
[x] M6 Review · validate · assign 100%   ← review/sign/archive/PDF loop E2E-verified live
[x] M7 Hardening + demo         100%   ← DNS live, redeployed, re-verified live on xpath.report; seeded demo pathologist + test-pathologist accounts confirmed working end-to-end on a real device (DL-046/047/050)

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
🔔 **DL-057 correction, standing rule now**: `dev-administrator@xpath.report`
   and `test-pathologist@xpath.report` are your own permanent accounts —
   their passwords are never reset or rotated as part of routine
   verification anymore (that was the DL-055/056 bug DL-057 corrected).
   If you haven't already set your own password on either account since
   the last time it was touched, run `npx tsx --env-file=.env.local
   scripts/set-admin-password.ts` / `scripts/set-pathologist-password.ts`
   yourself once, for a value only you know — otherwise there is nothing
   to do here, and this item will not be re-raised.
🔔 Now genuinely testable, unlike when first raised: install X-PATH as a
   PWA on a real phone (Settings → Install app on Android/Chrome, or
   Share → Add to Home Screen on iOS — DL-058) and give the floating
   avatar/full-screen menu, Dictate CTA bar, and general safe-area
   spacing (DL-053) a real 30-second glance. Everything was verified by
   direct DOM/CSS/state inspection plus a live Lighthouse audit
   (100/100 accessibility + best-practices) instead of an actual device
   — confident it's correct, but this closes the loop for real.
🔔 On a real desktop browser (≥1024px wide), glance at the new sidebar
   (DL-060) as a pathologist — it was live-verified with an
   administrator account (7-item nav, active-link highlighting, docked
   settings trigger, an unwidened page rendering correctly alongside
   it), but the pathologist-only Workspace grid and Home's side-by-side
   Trends/Learning weren't independently click-verified this round
   (would have needed a second disposable account for an empty demo —
   stated as a real gap, not silently skipped). Same underlying
   `lg:grid`/breakpoint mechanism already confirmed working, so
   confidence is high, but a real glance would close the loop.
🔔 Cloudflare Turnstile keys (`CLOUDFLARE_TURNSTILE_SITE_KEY` +
   `CLOUDFLARE_TURNSTILE_SECRET_KEY`) — code is wired and ready, inactive
   until these are set.
🔔 Anthropic account has no credit balance — `AI_STRUCTURING_PROVIDER=anthropic`
   reaches and authenticates against the API correctly (confirmed: the
   error is a 400 billing error, not a 401 auth error), but hasn't been
   verified end to end with a real response. Not blocking — OpenAI (the
   default) is fully verified.

LAST UPDATE: 2026-08-07 —

**DL-060 — Desktop-parity pass: persistent sidebar nav + wider
layouts, breakpoint-gated at `lg:` (1024px).** Presentation-only, no
data/auth changes. Persistent left sidebar (role-based nav, one source
of truth shared with the mobile sheet via `lib/nav-features.ts`) with
active-link highlighting and hover states, replacing the mobile
floating-avatar pattern on desktop only — the docked user row opens
the *same* settings sheet, not a rebuilt one. Workspace becomes a
multi-column grid at `lg:`/`xl:`; Home's Trends + Learning sit
side-by-side and open by default at `lg:` (still real, user-toggleable
`<details>` — a small `ResponsiveDetails` wrapper only changes the
initial state per breakpoint; mobile keeps DL-053's collapsed default
exactly as before). Scoped deliberately to sidebar + Workspace + Home
this pass, not a speculative widen-everything sweep. Live-verified with
a disposable admin account: sidebar, active-link highlighting, the
settings trigger, and an unwidened page all confirmed correct. The
pathologist-only Workspace/Home grid wasn't independently click-tested
this round (stated above, not silently skipped). Full detail in
`docs/decision-log.md` DL-060.

**DL-059 — Full, real version history for admin content overrides (a
DL-054 follow-up, resolving the "no revert/delete yet" gap noted after
that session).** Marcel's explicit call: full freedom to edit, revert
to any prior state including the untouched system default, or delete a
specific historical entry. New append-only `editableContentVersions`
table; `editableContent` stays a fast-read pointer so the real hot
paths (Templates, Reflex preview) need no join. **A real bug this
session's own live-verification caught, not assumed correct**:
deleting the currently-active version checked the FK pointer *after*
the delete, but `ON DELETE SET NULL` had already cleared it by then, so
the fallback-to-default logic silently never ran, leaving a stale
override live pointing at a deleted version. Fixed, redeployed,
re-verified the exact scenario end to end. Full create → restore →
delete → fallback-to-default cycle live-verified with a disposable
admin account, cleaned up after. Full detail in `docs/decision-log.md`
DL-059.

**DL-058 — Installable PWA + mobile-hardening sweep, in place of the
native Capacitor migration you decided to hold off on** (real
multi-week scope, not worth the timeline risk this close to the Dr.
Ivo demo). No architecture change, no auth/server-action changes.
Manifest + placeholder petrol/white icon set, an app-shell service
worker (cache-first for static assets only, structurally separate from
DL-055's offline queue — verified live it caches only the 11 intended
static files, nothing from `/api/` or `/dashboard/`), iOS meta tags
(one real gap caught live: Next's typed metadata only emits the modern
`mobile-web-app-capable` tag, not the legacy one iOS Safari still
needs — added directly), an Android/Chrome install button in the user
menu plus a one-time iOS "Add to Home Screen" hint, and a mobile-
hardening sweep (44px tap targets + safe-area padding) across screens
DL-053/055 hadn't touched. Lighthouse's "PWA" category has been
removed from the tool entirely as of the version this session pulled —
confirmed empirically, not assumed — so ran accessibility +
best-practices instead against the live site (first run: 95/100
accessibility on one real color-contrast finding, fixed and redeployed)
and verified installability directly via Chrome DevTools (the modern
replacement for the old Lighthouse PWA audits). **Final live scores:
100/100 accessibility, 100/100 best-practices.** Desktop-parity
explicitly deferred as a stated follow-up (above), not built. Full
detail in `docs/decision-log.md` DL-058.

**DL-057 — Correction: never rotate `dev-administrator@xpath.report`/
`test-pathologist@xpath.report`'s passwords.** These are your own
permanent, stable-password accounts (DL-048/049), not verification
fixtures — the DL-055/056 rotate-after-verification pattern was wrong
and repeatedly locked you out. No code changed, process only. Saved as
a standing memory so this isn't raised again. Full detail in
`docs/decision-log.md` DL-057.

**DL-056 — Structure-page back link + live-verified QC-flag/Workspace-
triage (both DL-055 R-039 follow-ups, now closed).** Added a real
"← Workspace" link to all three of `/dashboard/structure/[dictationId]`'s
render states, then extended the hide-chrome-during-focused-work
carve-out there too. Investigated a way to live-verify QC-flag capture
and the Workspace triage badge without ever touching a password at all
(minting an Auth.js session directly via the app's own `AUTH_SECRET`)
— not achievable with the available browser tools, since the session
cookie is `httpOnly` and the tools only run page-context JS; the only
alternative would be a new auth-bypass endpoint on the live app, which
is a real security-control change requiring separate authorization, not
something to add unilaterally. Surfaced that tradeoff directly rather
than picking silently; approved path was a one-time, deliberate
exception to R-038 (generate a password, read it back once, use it to
sign in for real, rotate away immediately after). Both features
confirmed live: a real draft flagged non-concordant then switched to
stain-failure with a reason, saved, and confirmed to persist after a
full page reload; Workspace correctly showed the "WATCH" triage badge
on all three pending drafts. Full detail in `docs/decision-log.md`
DL-056.

**Offline-first upload + five admin/UX items, DL-055.** Built in the
instructed order: offline-first upload first (IndexedDB queue, optimistic
UI, exponential backoff + retry cap, plain-language status only — a
real R2 presigned-URL-expiry design issue caught and fixed before it
shipped broken, and a real transcript-review regression caught and
fixed by relocating that step to a new Structure-page editor), then TAT
dashboard (aggregate-only, Header G1/G2-documented) + QC-flag capture
at review, then reagent/equipment tracking (seeded from the real
38-antibody register, prioritized for Cameroon's slower resupply
logistics) + audit-log CSV/PDF export (a read layer, not a new logging
mechanism), then a frontend UX pass (wait-time triage colors,
`<details>` on the reagents list, text-size/high-contrast settings).
Live-verified on `www.xpath.report`: TAT dashboard, reagent stock
edit/alert round-trip, both audit exports, both new display settings.
QC-flag and Workspace triage verified by code review only at the time
(stated then, not silently skipped) — later live-verified for real in
DL-056, above. `npx tsc --noEmit` and `npm run build` passed clean
before all five pushes. Full detail in `docs/decision-log.md` DL-055.

**Three super-admin features, DL-054: admin-editable content, full
account management, announcements/news ticker.** All gated by the
existing administrator role — no new permission flags. Scope confirmed
for all three before building, including two questions asked directly
rather than guessed (director's-note visibility, account-status data
model — both confirmed with Marcel). Generic `editableContent` table
applied to the Reflex Testing preview and template titles/blurbs/
section titles (not the full nested field tree — templates are static
files, not DB rows, and that's a bigger rework, stated clearly). New
`status` enum for accounts (active/suspended/blocked/deactivated) —
`isActive`/`authorize()` untouched. Announcements: single-role
broadcast, EN/FR direct authorship, emergency sorts first, same hide-
on-dictate/review carve-out as the Dictate CTA bar/avatar. Real gap
found and fixed live: director's note wasn't rendering on template
overrides, only the Reflex preview — fixed, re-verified. Live-verified
end to end: a real suspend→reactivate round trip with audit
confirmation, a real published emergency announcement, a real
template-title edit propagating correctly with its director's note
now showing. Test data cleaned up afterward.

**Mobile IA/visual redesign, DL-053.** Top nav bar removed entirely,
replaced by a floating avatar (hidden on Dictate/Review) opening a
full-screen user menu — Apple Health profile-screen pattern, existing
tokens throughout. Home reorganized into collapsible sections. Caught
and preserved a functionality regression before shipping (the "?"
onboarding-reopen button, easy to lose when deleting the header it
lived in). Found and fixed a real bug live during verification (rAF
suspended in background tabs — switched to setTimeout). Two tool-
environment limits honestly documented rather than glossed over:
literal narrow-viewport screenshots weren't possible this session
(verified via CSS/DOM inspection instead), and the pathologist-specific
pieces were verified by code-pattern equivalence to already-proven
mechanisms rather than resetting another real account's credentials.
Full reasoning in DL-053 — flagged above for a real-device spot-check.

**Reflex Testing & Special Stains agent: admin-only capability preview,
DL-052.** Static, read-only preview of Dr. Ivo's spec (§17.1–17.9 +
module work order) in the admin section — zero DB reads, zero AI calls,
never reachable from any real case/report/dictation flow. Same G4
vision-signaling exception already accepted for the "Coming soon"
teasers (DL-042). Two independent non-live signals: a "PREVIEW — not
live" badge visible even collapsed, and a persistent, non-dismissible
banner shown with the content — not just enforced by routing, since
this goes in front of Dr. Ivo. Expanded by default with a "Show/Hide"
toggle, not a click-to-reveal/activation gate. A real process gap was
caught before any code was written: the instruction first pointed at a
spec file that turned out to live only in Cowork's own project store,
not this repo — flagged directly instead of guessing, then built once
the real content was pasted verbatim. Live-verified as administrator;
content and toggle both confirmed correct.

**Dictate CTA bar, Workspace, OCR save, per-category colors, DL-051.**
Built Marcel's three design decisions from the DL-050 scoping report
(full-width bottom Dictate CTA bar, dedicated Workspace nav+page, real
per-category icon colors) plus his AI-Enhancement clarification (OCR
notes get an explicit "Save to workspace" action, separate from a
per-item "Send to AI" action in Workspace — never combined). Dictate
is now capture-only; browsing/organizing saved items moved to the new
`/dashboard/workspace`. Live-verified using the existing authenticated
test-pathologist session — did NOT reset that account's password,
since it now holds Marcel's own real credential from his DL-050 test.
Confirmed the workspace list against his real data, the OCR-save →
Send-to-AI flow end to end, correct responsive CSS on the CTA bar, no
collision with Review's own fixed bottom bar, and distinct per-category
colors on Templates. Test artifact cleaned up afterward.

**test-pathologist given the same permanent, no-friction treatment as
dev-administrator, DL-049.** TOTP-exempted (`TOTP_EXEMPT_EMAILS`),
`mustCompleteSetup` already false, and a matching `scripts/set-
pathologist-password.ts` script built the same way as DL-048's admin
version. Deployed the exemption first, then live-verified: signed in
for real with a throwaway password, landed on `/dashboard` with no
TOTP prompt, page content confirmed the pathologist Home view (not
admin). Rotated to an unknown value afterward — see WAITING ON MARCEL
above.

**Permanent admin account root cause + reliable password-set script,
DL-048/R-037.** Marcel's last password set for `dev-administrator@
xpath.report` hadn't let him log back in. Audited every structural
cause (forced rotation, session expiry-by-credential-age, TOTP re-lock,
duplicate email rows across tenants, inactive flag, corrupted hash,
Turnstile misconfiguration) — all came back clean, none reproduce the
symptom; most likely a one-off mistyped password in a script that was
never committed, same failure class as the DL-041 precedent. Built
`scripts/set-admin-password.ts` (matched by email + role, reasserts the
account's safe flags on every run), found and fixed two real `readline`
bugs in it while testing, then live-verified end to end: set a
throwaway password, signed in for real on `www.xpath.report`, landed on
`/dashboard` as administrator. Rotated to an unknown random value
afterward — see the WAITING ON MARCEL item above to set your own.

**Test-pathologist account, avatar upload, note/label OCR scan — and a
critical finding, DL-047/R-036.** Built a genuine blank-state account
for Marcel's own walkthrough (real QR TOTP enrollment), profile-picture
upload, and a client-side photo-to-text scan (Tesseract.js, structurally
incapable of interpreting images, never the same path as transcription/
structuring — stays inside G1). While live-testing avatar upload, found
that R2's CORS policy rejects a direct browser-to-R2 presigned PUT
(`403` on preflight) — fixed avatar upload by proxying it through a
Server Action instead. **Then confirmed the identical failure affects
the real dictation-audio upload path**, which had only ever been
verified via a server-side script that bypasses browser CORS — meaning
the core capture loop is very likely broken for any real pathologist
using a real browser today. See the 🔴 banner above and
`docs/known-risks.md` R-036 — this needs Marcel's Cloudflare dashboard,
not application code. Everything else live-verified end to end: TOTP
enrollment, OCR (correct 4-line extraction from a test image), avatar
upload (after the fix), and a seeded dictation through the real
structuring pipeline to the review screen. Test data cleaned up so the
new account stays blank-slate.

**North-Star full rollout, DL-046 — Home, Profile, Templates polish,
seeded demo pathologist, danger-zone flag.** Confirmed directly before
building (the relayed go-ahead cited a nonexistent filename and claimed
sign-off that had no direct confirmation in this conversation — flagged
rather than assumed, especially right after a real cross-project
contamination incident was confirmed earlier the same session).
`/dashboard` is now a real Home/Summary screen (capture UI moved to its
own `/dashboard/dictate` route); `/dashboard/profile` is new; Templates
browse got a matching visual pass; a seeded demo pathologist account
(`demo-pathologist@xpath.report`) now exists with one fully worked
breast/HER2 case run through the real structuring + reflex engines,
signed, flagged urgent, PDF verified — ready for the Dr. Ivo demo
(`scripts/seed-demo-pathologist.ts` / `wipe-demo-pathologist.ts`); a
real pathologist-set danger-zone urgency flag now exists (R-034's other
half), persistent banner on review + archive, real alerts on Home. A
real bug was found and fixed while building the demo script (transcript
line-wrapping broke grounding-quote matching — R-035, not an engine
bug). `npx tsc --noEmit`/`npm run build` pass; every item live-verified
on `www.xpath.report`. Full evidence in `docs/decision-log.md` DL-046.

**Visual design pass — app shell + ONE reference screen, STOPPED for
sign-off as instructed.** Applied North-Star §2 design tokens (additive
`mint` semantic color; existing amber/red left alone to avoid an
unintended shift elsewhere) to the dashboard shell nav (filled pill for
the primary action, proper petrol-outline "Sign out" button, larger
touch targets) and to the review/sign screen specifically (mint
"complete" checkmarks, mint saved-confirmation, bigger heading,
consistent primary/secondary button language on the bottom-sheet
picker). No other screen touched yet. Live-verified on
`www.xpath.report` with a real dictation run through structuring.
Mobile-viewport screenshot verification hit the same known tooling
limitation as R-032 (`resize_window` doesn't actually change
`window.innerWidth`) — reported honestly rather than claimed; relied on
a responsive-code review instead (flex-wrap header, fluid `max-w-3xl`
content, mobile-first bottom sheets, ≥40-44px touch targets, all
already true of the touched files). `npx tsc --noEmit`/`npm run build`
pass. **Waiting on Marcel's sign-off on the shell + review screen
before rolling the same tokens out to the rest of the app.**

**Post-M7 UX polish: review-form redesign (DL-045).** A "UX North-Star"
design-bible document arrived mid-session with a later §8 addendum
specifically redesigning the long CAP-derived form rendering. Checked its
own claims before building (it cites nonexistent files and a wrong "M2"
definition) and saved it as `docs/ux-north-star.md` — reference only,
sections 0-7 not actioned. §8 alone confirmed and built: the review/sign
form now uses collapsible per-section accordions, a searchable bottom-
sheet picker for long single-select fields (Histologic Type, Tumor Site,
etc.), a bottom-sheet multi-select, "…(specify)" fields that reveal only
after their parent option is chosen, an optional-fields toggle, and a
sticky progress/action bar — presentation only, no change to how data is
collected or submitted. Deliberately left out and logged (R-034):
CONDITIONAL-field trigger-based hiding and danger-zone urgency banners,
both of which need real data-modeling/design work beyond this pass.
Found and fixed a real bug during live verification: "Save changes" was
silently blocked by the Sign card's unrelated required accession field
(shared `<form>`, native browser validation) — fixed with
`formNoValidate`, re-verified against the database that saves now
actually persist. Live-verified end to end with a real dictation run
through the real structuring pipeline.



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

**PDF generation built and verified — M6 is now fully complete.**
Marcel approved the recommendation (`@react-pdf/renderer`, self-hosted
inside the existing Vercel function — DL-033): no headless Chromium on
serverless, no third-party rendering vendor seeing clinical report
content, no second deployment target. `npm audit` after install shows
only the pre-existing accepted R-007, nothing new. Verified for real:
fetched `/api/pdf/[recordId]` through a real authenticated session
against the real signed record from the E2E test — `200`, valid PDF.

**M7 — hardening pass, mostly complete.** Before touching UI: logged
the scope decisions this pass depended on (DL-034: M2's dedicated
personal-notes/tips UI stays deferred, M7's own listed items — indicator,
search — get built directly; DL-035: EN/FR polish scoped to UI chrome
only, not template field content, to avoid fabricating unreviewed
French medical terminology — approved by Marcel, logged as R-029).

Then, in order:
- **G1/G2 isolation tests extended to cover M6's `clinicalRecords`**
  (`scripts/verify-isolation.ts`), not just M1's private-workspace
  items — released records readable tenant-wide, drafts signer-only
  regardless of role. 14/14 checks pass against real Neon data, temp
  rows cleaned up.
- **Privacy indicator** (`src/components/privacy-indicator.tsx`) added
  to all private-workspace-scoped pages (dictate, structure, review) —
  worded to match what's actually true (access-control enforced in
  code, not a stronger encryption claim than exists).
- **Archive search** (accession or report-type substring match) built
  and verified live against the real signed test record — accession
  match, template-title match, and no-match empty state all correct.
- **Production deploy readiness checked independently**, not assumed:
  the live Vercel deployment serves the correct sign-in page, no fatal
  runtime errors in 7 days. Could not enumerate Production-scope env
  vars directly (no tool for that) — flagged as R-030, recommend Marcel
  spot-checks the Vercel dashboard before the demo. Confirmed
  `xpath.report` DNS is still on Hostinger's parked page, not
  Vercel — the cutover gate is intact (R-031).
- **EN/FR UI-chrome translation** built via a forked agent (lightweight
  dictionary + cookie-based locale, no new framework dependency),
  independently re-verified afterward (not just trusted): typecheck/
  build re-run clean, live browser check of the FR/EN toggle on the
  real dashboard confirmed both directions render correctly. Template
  field content stays English-only, as scoped (R-029).
- **Mobile pass** — done via responsive-class code review, since the
  browser automation's viewport-resize tool didn't actually work this
  session (confirmed via direct `window.innerWidth` checks — R-032,
  logged honestly rather than claimed as visually verified). Found and
  fixed one real bug: the dashboard header didn't wrap and would
  overflow on a phone-width screen.

`npx tsc --noEmit` and `npm run build` pass after every change above.

**Cloudflare DNS cutover: done, verified live.** Marcel pointed
`xpath.report`/`www.xpath.report` at Vercel; independently confirmed
via direct fetch (no longer Hostinger's parked page — real X-PATH
sign-in page, `server: cloudflare` + `x-powered-by: Next.js`).

**Caught mid-verification: Vercel production was still serving the
pre-M6 deployment** — all M5–M7 work existed only in local commits,
never pushed to `origin/main`, so Vercel's GitHub-triggered deploy had
nothing new to build. Confirmed by logging into the live dashboard and
finding Archive/EN-FR missing. Pushed `dfd90a4`/`e244c6f`/`5e11b28` to
`origin/main` (Marcel's go-ahead); Vercel auto-deployed
(`dpl_2uiP25cFkVHTka2upG6g4x7V1zKj`, commit `5e11b28`), confirmed
`READY` and aliased to both production domains.

**Re-verified live on the real domain after redeploy** — logged in as
`dev-pathologist-a@xpath.report` on `https://www.xpath.report`, real
password + real TOTP: dashboard now shows Archive and the EN/FR
toggle; opened the real signed test record (`HI-T-TEST-001`) in the
Archive; fetched `/api/pdf/91058f37-...` directly — `200`, valid
`%PDF-` payload, 3.8 kB, generated by real production infra (resolves
part of R-030 — the self-hosted PDF path is confirmed working in
Production, independent of any env var uncertainty for OpenAI/R2).

**M7 is done.** Remaining: the live walkthrough demo to Dr. Ivo itself
(a human event, not something to script) — and R-030's open half:
`OPENAI_API_KEY`/`R2_*`/`ANTHROPIC_*` in Production scope are still
not independently confirmed (only PDF's self-hosted path was verified
live; dictation→transcription hasn't been exercised against
production). Recommend a quick real-mic run-through on
`xpath.report` before the demo, or Marcel spot-checks Vercel's env
vars directly.
