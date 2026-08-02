# X-PATH — PROGRESS
Overall: ▓▓▓░░░░░░░ ~32% (you are here → M3: Template engine, first templates built)

[x] M0 Foundation              100%
[>] M1 Login live                75%   ← blocked on Vercel project visibility
[ ] M2 Private workspace         0%
[>] M3 Template engine           70%   ← current
[ ] M4 Voice + transcription     0%
[ ] M5 Structure & auto-fill     0%
[ ] M6 Review · validate · assign 0%
[ ] M7 Hardening + demo          0%

Note: M3 was started ahead of M2/before the M1 gate fully closed, per
Marcel's explicit go-ahead on the Cowork full-execution-order addendum
(2026-08-02). M1's remaining blocker (Vercel) is independent and tracked
separately, not blocking M3.

WAITING ON MARCEL:
🔔 M1 — Vercel project not visible to the Vercel connector (only team found is
   "buddy1974's projects" / team_EAyech9xnsZIk9ajje9eCKp4, 0 projects on it, no
   .vercel/project.json in repo). Confirm which account/team it's actually under,
   or that GitHub-connect needs to be finished.
🔔 Team provisioning workstream (§1 of the Cowork addendum — 8 real accounts
   incl. a named real individual, PII-collecting claim wizard, Cloudflare
   Turnstile): holding for a direct one-line "yes, build it" from Marcel —
   this scope doesn't appear in PROJECT_HEADER.md, XPATH_handover.md, or
   XPATH_Roadmap_to_First_Login.md, so treating it as a material
   product/architecture decision needing explicit confirmation, not
   building it off a relayed document alone.

LAST UPDATE: 2026-08-02 —

**M1:** Migrations generated + applied to real Neon
(drizzle/0000_swift_cassandra_nova.sql), seeded (2 pathologists + technician/
manager/administrator, each with a real TOTP secret). Verified against REAL
Neon data: G1/G2 isolation PASS (scripts/verify-isolation.ts), full
login+TOTP HTTP flow 8/8 checks PASS (run against localhost hitting real
Neon, NOT the live Vercel URL — still blocked, see above), audit_log entries
confirmed written for real. Pushed to `main` (commit c547e92) once Marcel
confirmed. AUTH_SECRET in .env.local is low-entropy — flagged, not yet
regenerated.

**M3 (new):** Extracted structural logic (field names, tiers, controlled
vocabulary — never paragraph text, Header G3) from the two supplied CAP
source files (`Breast.Invasive.Res_4.11.0.0.REL_CAPCP.docx`,
`Breast.Bmk_1.6.1.0.-REL_CAPCP.docx`, read locally via docx→text extraction,
never committed). Built:
  - `src/lib/templates/types.ts` — the versioned template engine schema:
    tiered fields (core/conditional/non-core, CAP's own convention),
    single/multi-select, controlled vocabulary, "cannot be determined",
    repeatable blocks, versioned classification bindings (AJCC/WHO
    editions), a draft/pending_review/approved gate.
  - `src/lib/templates/data/breast-invasive-resection.ts` — full Breast
    Invasive Carcinoma (Resection) protocol (AJCC 8th, WHO 6th), all
    sections (Specimen, Tumor incl. repeatable Tumor Characteristics up to
    5x, Margins, Regional Lymph Nodes, Distant Metastasis, pTNM, Additional
    Findings, Special Studies, Comments).
  - `src/lib/templates/data/breast-biomarker.ts` — full Breast Biomarker
    Reporting Template (ER/PgR/HER2 IHC/HER2 ISH/Ki-67, methods, testing
    methodology). Several "standardized comment" checklist options in the
    CAP source are full authored paragraphs, not just labels — those are
    tagged `needsInHouseAuthoring: true` with a short in-house label
    instead of copied text (DL-014, R-012) — not clinically usable until
    authored/approved.
  - `/dashboard/templates` + `/dashboard/templates/[templateId]` — static
    structural render (tiers, options, free-text slots, repeatable
    markers; inputs disabled — no value binding yet, that's M5).
`npx tsc --noEmit` and `npm run build` both pass. Committed locally, NOT
pushed — per the addendum's own cadence rule (push at milestone gates or
when Marcel says so), and there's no live Vercel target to deploy to yet
regardless.

M1 Definition of Done: 3 of 4 items proven against real data; "login+TOTP
on the live URL" still blocked on Vercel project visibility (R-013).
