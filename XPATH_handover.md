# X-PATH — COMPLETE PROJECT HANDOVER
### For: Claude Code (Executor) · From: Cowork (Source-of-truth session) · Owner: Marcel (supervises only)
**Read this in full before any work. It is the complete context. `PROJECT_HEADER.md` remains the constitution; this document is the detailed briefing behind it.**

---

## TABLE OF CONTENTS
1. How to use this document
2. Genesis & relationship context
3. Operating model & roles
4. Product identity
5. Mission (client's words)
6. The vision (what we're building)
7. Non-negotiable guardrails (G1–G8)
8. The advisory frame — rulings & incidents (critical)
9. Dr. Ivo's full requirements
10. Dr. Ivo's corrections & clarifications (the "do not re-open" list)
11. Report structure & coding
12. IHC antibody register (all 38 + clones + Ventana refs)
13. IHC panel menu · HER2 workflow · PD-L1 · special stains
14. CAP cancer-protocol template taxonomy (logic only)
15. Cameroon & regional considerations (comprehensive)
16. Architecture (engines, data model, stack)
17. The core loop & its feasibility
18. Scope discipline & phasing
19. Environment / secrets
20. Session 01 status (already built)
21. Roadmap (Session 02+)
22. Owner preferences & working style
23. CLAUDE.md workflow rules + the missing-files situation
24. Legal / copyright / commercial
25. Open decisions (do not block on these)
26. Hard NO list
27. What Marcel supervises (settled — do not re-ask)
28. Gaps Cowork is adding (review & accept/cut)
29. Artifacts produced this session
30. Suggested skills

---

## 1. How to use this document
This is the full memory of the planning session that preceded the build. Claude Code should absorb it so **Marcel does not have to repeat context**. Where a fact is still open, it is marked in §25 — proceed around it, do not block. Where a decision is settled, it is in §27 — do not re-litigate it. `PROJECT_HEADER.md` governs; if anything here conflicts with the header, the header wins and you stop and flag.

---

## 2. Genesis & relationship context
- Marcel (Maxpromo Digital, Germany) is helping **Dr. Ivo**, a pathologist and friend, who runs **X.PATH Labs** (~15 pathologists) operating within **BettaHealth (Betta Health Ltd)**, Yaoundé, **Cameroon**.
- It began as a personal favour (an honest, vendor-neutral feasibility view) and has become a real build. Commercial terms are still being settled (see §24/§25).
- **BettaHealth** is the holding, **registered in Dubai**, operating in Cameroon. **X-PATH will expand beyond BettaHealth** to serve pathologists and doctors across Cameroon — so the platform is **multi-tenant from the foundation**, BettaHealth being tenant one.
- Builder: **Maxpromo Digital** — German sole proprietorship, **Kleinunternehmer §19 UStG (charges no VAT)**.

---

## 3. Operating model & roles
- **Marcel — Product Owner / Decision Maker.** From here on he **supervises**; he should not have to re-explain or repeat. Sole authority to approve scope and accept work.
- **ChatGPT — PM / Architect / strategy layer.**
- **Claude Cowork — Inspector / Reviewer / Validator** (this session = source of truth).
- **Claude Code — Executor** (you). Connected to the repo; runs the build/verify gates in-repo.
- **Dr. Ivo — Clinical authority.** Owns all diagnostic judgment, template validation, sign-out.

---

## 4. Product identity
- **Platform name:** X-PATH
- **Domain:** xpath.report (registered)
- **Repo:** https://github.com/buddy1974/xpath-report · branch `main`
- **Local:** `C:\Users\loneb\Documents\ai-software-dev\projects\xpath-report`
- (Earlier working name "CPath" is **retired** — use X-PATH.)

---

## 5. Mission (Dr. Ivo's own words)
Move pathologists **away from writing long essays** — time-consuming and prone to missing details — **toward a modern, structured, problem-solving way of producing the Befund (report).** Every feature serves this: complete, structured, faster reports. If it doesn't serve it, it's out of scope.

---

## 6. The vision
X-PATH is a **multi-tenant professional platform for pathologists** — not a single-lab reporting tool. Each pathologist gets a **private, encrypted professional workspace** where they:
- report (structured, voice-driven, reflex-checked),
- keep personal notes, learning material, saved reference files for reuse, tips, better methods,
- message/share with peers,
- share results with **doctors of their choice**.

The lab gets its **system of record and audit trail** — **without the owner surveilling individual pathologists' private work**. It is a platform pathologists *belong to*, not software one lab buys. Tenant one = BettaHealth/X.PATH; built to grow.

---

## 7. Non-negotiable guardrails (G1–G8) — from PROJECT_HEADER
- **G1 — Multi-tenant from the foundation.** Every row tenant-scoped.
- **G2 — Private workspace vs. clinical record of truth (firm principle).** Private workspace = owner-only, not readable by anyone incl. the lab owner. A signed report = audited clinical record of truth, immutable (amend = new version). "Owner doesn't surveil private work" TRUE; "signed reports escape the record" FALSE.
- **G3 — Templates: logic only.** Never reproduce/scrape/embed CAP/WHO/AJCC copyrighted text. Content from client originals, ICCR (free), or in-house authoring. Every template locally validated + director-approved before clinical use.
- **G4 — Scope discipline.** Phase 1 = engine + 3–5 real templates. Not 130 templates, not 10 agents.
- **G5 — Realistic security.** Strong per-user encryption + strict access isolation. **Not** zero-knowledge (the AI must read text to assist). Promise: private from other humans, never browsed — not "mathematically unreadable."
- **G6 — Scope = X.PATH's real capability.** Morphology + IHC in-house. Molecular (NGS/PCR/MRD/liquid biopsy) is send-out, rare, separate protocol family, surfaced only as advisory recommendation.
- **G7 — Bilingual & regional.** EN + FR; regional disease intelligence built into reflex logic.
- **G8 — Never fabricate.** Reason only over what is described/entered. Never invent findings, values, or citations.

---

## 8. THE ADVISORY FRAME — rulings & incidents (read carefully)
This is the safety spine and it was tested repeatedly. **Encode it as behaviour, not just a note.**

**What happened:** During the session, images of patient tissue (a prostate H&E, later a slide with circled regions) were uploaded with requests to "diagnose," "describe benign/malignant cells," "interpret and guide," and ultimately to have the platform's AI "participate actively in guiding... suggesting the direction the tumour might be." Each was **declined**, and Dr. Ivo (present) accepted the reasoning.

**The ruling that governs the product:**
- **X-PATH never interprets patient images and never originates a diagnosis.** No "benign/malignant" calls from images. A general model reading lab images cannot do this safely, and doing so makes the product a **regulated diagnostic device (IVDR/FDA)** and puts Maxpromo on the hook for medico-legal liability.
- **The safe, valuable version — text-based decision support:** the platform reasons over the pathologist's **own described findings** (morphology, stains, measurements, differential) and: structures them, drafts the report, codes it, checks completeness/consistency, **suggests next investigations / reflex stains / panels**, and flags missing info. Input = the pathologist's observations. Output = structure + suggestions + flags. **Decision = the pathologist's signature.**
- **Image analysis, when it comes, lives in a validated adjunctive tool** (Dr. Ivo has **Roche navify Digital Pathology**) — X-PATH **integrates**, it does not imitate image AI.
- AI-produced content is always **visibly marked** and always lands for human validation. Never fabricate to fill a gap (G8).

**This is the line: X-PATH guides the *system and the work-up from described findings*; the pathologist interprets the *patient*.**

---

## 9. Dr. Ivo's full requirements (everything he asked across the session)
- **Voice-driven core loop:** on phone/desktop, log in → open intake → capture image/context → **speak** → system **transcribes** (EN/FR) → **identifies & selects the right template** → **fills the values** → pathologist **reviews, corrects, validates/signs**.
- **OCR intake:** scan/photo of requisition (JPEG/PNG/PDF) → auto-read patient/specimen into the case.
- **Per-pathologist private encrypted profiles/workspaces:** "no one else sees." Owner (Dr. Ivo) **does not want access** to individual pathologists' reports/work — explicitly for their **psychological safety and privacy**.
- **Personal space contents:** notes, learning, uploaded support files for reuse in later uploads, tips, better ways of doing things.
- **Messaging & sharing** between pathologists; **share results with doctors of their choice** (pathologist-controlled).
- **Reflex / ancillary testing engine** (his PRD "reflex agent"): reasons over clinical context + site + described H&E morphology + differential → proposes **prioritised** next investigations (special stains, IHC panels, deeper levels, referral). Availability-aware (in-house / under-validation / referral). Sequential/hypothesis-driven (e.g. lineage first: pancytokeratin, CD45, SOX10 → then organ-directed). Writes a concise **3–5 item** recommendation. **Advisory** — must not auto-order; pathologist approves.
- **Structured templates analogous to CAP** cancer protocols, per organ/tissue/test, **continuously updated**.
- **Multi-agent north star (PRD):** ~10 "expert agents" (reporting, tumour-board summariser, QA/ISO 15189, documentation, education, research, marketing, clinical-evidence, biomarker, etc.) — **roadmap, not Phase 1.**
- **Report structure:** diagnosis first → WHO/ICD-O/ICD-10 coding → TNM → interpretation. (See §11.)
- **Bilingual EN/FR** medical-grade output.
- **Regional intelligence:** TB, HIV-associated pathology, Burkitt, Kaposi, schistosomiasis routinely in differentials (as decision support).
- **Equipment (his real environment):** Leica TP1020 (tissue processor), Leica autostainer, **Roche Ventana BenchMark ULTRA** (IHC + ISH) with validated-antibody database, **Roche navify Digital Pathology** (WSI/digital).
- **Governance:** protocol/SOP library — controlled documents (stain principle, specimen type, fixation, method, controls, hazards, validation status, version, owner, review date) with a detected-update → technical-review → local-verification → approval → training → release workflow. **AI does not activate a protocol; the director approves.**

---

## 10. Dr. Ivo's corrections & clarifications (DO NOT RE-OPEN)
These are settled adjustments he made; treat as final:
1. **Do not overload molecular tests into the reporting templates.** Molecular is a **separate** reporting-template family.
2. **X.PATH runs only IHC in-house** (plus morphology). **NGS, PCR, MRD, liquid biopsy = send-out and very rare.**
3. Send-out/molecular tests appear on the final report **only as an advisory suggestion**, and only when **diagnostically or therapeutically relevant**.
4. **Private workspace vs clinical record** distinction is a firm design principle (he approved it). He does not want access to individual pathologists' work; psychological safety/privacy.
5. **The standard is CAP** (College of American Pathologists), not the "American Cancer Society." (Marcel referred to "American cancer society templates"; the correct source is CAP Cancer Protocols. Also relevant: **ICCR** — free international datasets — and **WHO/AJCC** underneath.)
6. **X-PATH is under BettaHealth (Dubai holding, Cameroon operations) and will expand beyond it** → build multi-tenant.
7. **PD-L1 and chromogenic HER2 FISH/ISH are available in-house** (Ventana) — HER2 is fully in-house (IHC → reflex Dual-ISH).

---

## 11. Report structure & coding
Target report shape (from his PRD, accepted):
1. **Diagnosis** (stated first).
2. **Coding:** WHO classification (tumour type), **ICD-O**, **ICD-10**.
3. **Staging:** TNM / AJCC (edition-versioned).
4. **Interpretation / comment** (free-text, concise).
5. **Recommended ancillary/reflex testing** (3–5 prioritised items, advisory).
Design the data model so structured fields can later export to **FHIR / SNOMED CT** and feed registries (forward option, not Phase 1). Concise — the whole point is *not* long essays.

---

## 12. IHC ANTIBODY REGISTER (verified from Roche orders — all 38)
Source: Roche Diagnostics Order Confirmation 8572001371 + Proforma 8571900587, on BenchMark ULTRA. Name · clone · Ventana/vendor catalogue ref.

| # | Antibody | Clone | Catalogue ref | Vendor |
|---|---|---|---|---|
| 1 | Ki-67 | 30-9 | 05278384001 | Ventana CONFIRM |
| 2 | HER2/neu | 4B5 | 05999570001 | Ventana |
| 3 | ER | SP1 | 05278406001 | Ventana CONFIRM |
| 4 | PR | 1E2 | 05277990001 | Ventana CONFIRM |
| 5 | CDX-2 | EPR2764Y | 05463491001 | Cell Marque |
| 6 | CK20 | rabbit monoclonal | 05587760001 | Ventana CONFIRM |
| 7 | CK7 | rabbit monoclonal | 05986818001 | Ventana CONFIRM |
| 8 | CD45 / LCA | RP2/18 | 05266912001 | Ventana CONFIRM |
| 9 | TTF-1 | (confirm — SP141?) | 05479312001 | Ventana CONFIRM |
| 10 | GATA3 | L50-823 | 07107749001 | Cell Marque |
| 11 | CD20 | L26 | 05267099001 | Ventana CONFIRM |
| 12 | CD3 | 2GV6 | 05278422001 | Ventana CONFIRM |
| 13 | CD34 | QBEnd/10 | 05278210001 | Ventana CONFIRM |
| 14 | Desmin | DE-R-11 | 05267005001 | Ventana CONFIRM |
| 15 | S100 | polyclonal | 05267072001 | Ventana CONFIRM |
| 16 | CD117 (c-kit) | EP10 | 08763909001 | Ventana |
| 17 | BCL-2 | 124 | 05986826001 | Ventana CONFIRM |
| 18 | CD10 | SP67 | 05857856001 | Ventana |
| 19 | Chromogranin A | LK2H10 | 05267056001 | Ventana |
| 20 | MLH1 | M1 | 08033668001 | Ventana |
| 21 | PMS2 | A16-4 | 08033692001 | Ventana |
| 22 | MSH2 | G219-1129 | 08033684001 | Ventana |
| 23 | MSH6 | SP93 | 08033676001 | Ventana |
| 24 | Napsin A | MRQ-60 | 07047720001 | Cell Marque |
| 25 | Synaptophysin | SP11 | 05479304001 | Ventana CONFIRM |
| 26 | E-Cadherin | 36 | 05905290001 | Ventana |
| 27 | CD138 | B-A38 | 05269083001 | Cell Marque |
| 28 | CD15 | MMA | 05266904001 | Ventana CONFIRM |
| 29 | CD30 | Ber-H2 | 07007841001 | Ventana |
| 30 | Glypican-3 | GC33 | 06483186001 | Ventana |
| 31 | BCL-6 | (confirm) | 05269008001 | Cell Marque |
| 32 | CD5 | SP19 | 05929903001 | Ventana CONFIRM |
| 33 | Vimentin | V9 | 05278139001 | Ventana CONFIRM |
| 34 | p40 | BC28 | 07394420001 | Ventana |
| 35 | p53 | DO-7 | 05278775001 | Ventana CONFIRM |
| 36 | SMA | (confirm) | 05268303001 | Cell Marque |
| 37 | Myogenin | (confirm) | 05268290001 | Cell Marque |
| 38 | PAX5 | SP34 | 05552729001 | Ventana CONFIRM |

**Each antibody record in the app must carry:** name, clone, catalogue ref, vendor, assay status (IVD/lab-validated), **scoring system where applicable** (HER2 0/1+/2+/3+ incl. HER2-low; ER/PR % or Allred; Ki-67 %; PD-L1 clone-specific), and expected **control tissue**. The reflex engine may only ever suggest antibodies on this register; anything off-list routes to referral.

---

## 13. IHC panel menu · HER2 workflow · PD-L1 · special stains

**In-house diagnostic panels (16), as supplied by Dr. Ivo:**
Breast diagnostic (E-Cadherin) · Breast biomarker (ER, PR, HER2, Ki-67) · Gastric (CK7, CK20, CDX2) · Lung (TTF-1, p40, Napsin A) · Colorectal/MMR (MLH1, PMS2, MSH2, MSH6) · Endometrial (p53) · Liver (Glypican-3) · **CUP** (CK7, CK20, CDX2, TTF-1, GATA3, PAX8*, CD45) · Sarcoma (Vimentin, Desmin, SMA, CD34, S100, CD117, Myogenin) · Lymphoma basic (CD20, CD3, CD5, CD45, Ki-67) · Hodgkin (CD30, CD15, PAX5, CD20, CD3) · DLBCL & Burkitt (CD20, CD10, BCL2, BCL6, Ki-67) · Multiple myeloma (CD138, CD20, CD3) · Neuroendocrine (Chromogranin, Synaptophysin, Ki-67) · Pancreas & biliary (CK7, CK20, CDX2) · Tumour-agnostic (HER2).
*PAX8 appears in the CUP panel list but not the Roche register — **confirm PAX8 availability/clone**.

**HER2 — fully in-house, the flagship reflex-and-confirm workflow (build first):**
- HER2 IHC (clone 4B5) → score 0 / 1+ / 2+ / 3+ (record the **HER2-low** 0-vs-1+ distinction).
- **If 2+ → reflex to Ventana HER2 Dual ISH (in-house):** VENTANA HER2 Dual ISH DNA Probe Cocktail (08314373001), SISH DNP + Red ISH DIG detection (08318883001 / 08318832001), 3-in-1 xenograft controls (05640300001). Report **HER2/CEP17 ratio + copy number** → integrated final HER2 status. No send-out.

**PD-L1 (Ventana, in-house):** clone **not yet confirmed** — SP263 or SP142. Scoring is clone/tumour specific (TPS for lung, IC for SP142 breast/urothelial). **Confirm clone before modelling** (see §25).

**Special stains menu (for the reflex engine):** the authoritative X.PATH list comes from Dr. Ivo's reflex/SOP document (to be supplied). Common stains the reflex logic will reference — **confirm availability of each**: PAS, PAS-D, GMS, Ziehl-Neelsen/AFB, Congo red, Perls/Prussian blue, Masson trichrome, reticulin, mucicarmine, Giemsa, Grocott, Warthin-Starry. Reflex examples accepted: granulomatous inflammation → AFB/PAS/GMS + deeper levels; amorphous eosinophilic deposit → Congo red; poorly-differentiated tumour → lineage IHC panel first.

---

## 14. CAP cancer-protocol template taxonomy (LOGIC ONLY — never copy content)
Dr. Ivo will supply the CAP originals; we take **structural logic only** (G3). Authoritative current list: https://www.cap.org/protocols-and-guidelines/cancer-protocols/current-cancer-protocols/ (do not scrape). Free alternative with near-equivalent structure and open reuse: **ICCR** (https://www.iccr-cancer.org/datasets/published-datasets/), explicitly usable in lower/middle-income settings.

**The template *engine* logic to implement (this is what we reuse):** tiered data elements — **core (required) / conditional (required-when-applicable) / non-core (optional)**; **single- and multi-select** responses; controlled value lists per field; **"cannot be determined"** option; repeatable blocks (e.g. biomarkers); free-text "specify/explain/other" escapes; **versioned** classification bindings (WHO edition, AJCC edition) that update on CAP's ~quarterly cycle; a generic fallback protocol when no organ-specific one exists.

**Organ-system coverage (the backlog / priority map — ~130 protocols across ~14 systems):**
Breast · Gynaecologic (cervix, endometrium, ovary, vulva…) · Genitourinary (prostate, bladder, kidney, testis…) · Gastrointestinal (colon & rectum, stomach, oesophagus, pancreas, liver, appendix, anus…) · Thoracic (lung, pleura/mesothelioma, thymus) · Head & Neck (HPV-assoc. & HPV-independent oropharynx, hypopharynx, larynx, nasopharynx, salivary gland, oral cavity, mucosal melanoma…) · Endocrine (thyroid, adrenal, PPGL, **PitNET**) · Skin (melanoma, Merkel cell, carcinomas) · Soft tissue & bone (sarcoma) · Haematologic (lymphomas, myeloma, leukaemia) · CNS · Ophthalmic (uveal melanoma, retinoblastoma) · Paediatric · Biomarker reporting templates (breast, GI, lung, etc.).

**Do NOT build all ~130.** Phase-1 templates = the **3–5 matching X.PATH's real caseload and its 38 antibodies** (candidates: **breast (with HER2), colon/rectum, prostate, lymphoma, CUP**). The rest load as configuration on cadence.

---

## 15. Cameroon & regional considerations (comprehensive)
- **Language:** professional **French and English** — reports and referring-clinician communication. Primary language TBD (§25).
- **Transcription realism:** accented EN/FR + pathology terms need a **domain dictionary** and a **week-one accuracy benchmark with Dr. Ivo's actual voice** before relying on dictation.
- **Regional disease epidemiology in reflex logic:** TB (granulomas → AFB), schistosomiasis, Burkitt lymphoma, HIV-associated pathology, Kaposi, endemic parasitic/infectious disease. Use **CDC DPDx** as a public reference for parasite morphology (cite, don't scrape).
- **Availability-awareness is essential:** only suggest tests/stains/antibodies that are **in-house at X.PATH**; everything else is tagged **referral**. This is what makes the platform usable in-country rather than aspirational.
- **Molecular is send-out and rare** (§10) — capture/integrate send-out *results*; never assume in-house NGS/ctDNA.
- **Budget discipline (real constraint):** form-mode entry = **€0/report** (no AI); dictation = a few cents; **Telegram bot notifications = free** (avoid paid SMS/email packages); lean self-hosted infra; provider-swappable AI. Cost is a *choice per case*, not fixed overhead.
- **Currency:** any cost figures for the client in **XAF** (1 EUR ≈ 655.957 XAF).
- **Mobile-first / connectivity:** pathologists work from **phones**; the capture→dictate flow must work on mobile and tolerate imperfect connectivity (queue/retry, upload direct to storage).
- **Accession format observed:** e.g. `HI-T-4226` — accommodate the lab's numbering scheme.
- **Data-hosting jurisdiction** given Dubai holding + Cameroon operations is **open** (§25) — design so hosting region is configurable.
- **Equipment reality:** Ventana BenchMark ULTRA (IHC+ISH), Leica processor/stainer, Roche navify (images). X-PATH integrates with these; it does not replace navify's image analysis.
- **Second-opinion need is real and currently improvised** — observed live: a colleague sharing a case as a `.pptx` over a phone call. This is the telepathology/second-opinion feature happening manually; build it properly (roadmap).

---

## 16. Architecture (engines, data model, stack)
**Three engines + one governance layer, all advisory:**
1. **Reporting engine** — structured diagnostic templates (morphology + structured IHC), concise, coded (ICD-10/ICD-O/TNM), FHIR-export-ready as forward option.
2. **Reflex & ancillary engine** — reasons over described findings + regional epidemiology → prioritised suggestions from the **real** stain/antibody menus, availability-tagged; writes the 3–5-item recommendation. **Absorbs the molecular send-out suggestion** (same engine, different test types).
3. **Governance layer** — versioned template + protocol/SOP library; **nothing goes clinically live without director approval.** Governs both reporting templates and stain SOPs.
Across all: **role-based access, audit trail, EN/FR, regional intelligence, advisory guardrail.**

**Data model (Header G2, already scaffolded — see §20):** `tenants`, `users` (roles: pathologist/technician/manager/administrator), **`private_workspace_items`** (owner-only), **`clinical_records`** (audited, immutable), **`audit_log`** (append-only), `cases`. Access isolation enforced in `lib/access.ts` (tenant scoping + owner-only workspace, **no role override**).

**Stack:** Next.js (App Router) · TypeScript · Tailwind → **Vercel** (GitHub CI/CD). **Neon** Postgres · Drizzle ORM. **Auth.js + TOTP** 2FA (authenticator, no SMS). **Cloudflare R2** (audio/scans/PDFs). **OpenAI** (Whisper + structuring; swappable; **pseudonymise before any call**). **Telegram** notifications. **Cloudflare** DNS/WAF. **PDF generation off-Vercel** (dedicated worker — Chromium exceeds serverless limits). Large uploads go **direct to R2** (presigned), not through serverless. Long transcription runs as a **background job**, not inline.

---

## 17. The core loop & its feasibility
**The loop (build and demo this first):** log in → capture (image/context) → **speak** → transcribe (EN/FR) → **suggest template (human confirms)** → **auto-fill values** → pathologist reviews → corrects/validates → **signs** → PDF + record.

**Feasibility, honestly rated:**
- Login/capture/transcribe/field-fill/review-sign: **feasible & reliable.**
- **Template auto-selection is the one risky link.** With ~130 templates, blind auto-routing makes silent errors. **Fix (design, not gamble):** the pathologist taps/confirms specimen type (or it comes from the requisition/OCR) → narrows to 2–3 → dictation fills fields. **Auto-*suggest* template, human confirms; auto-*fill* fields, human validates.** Never blind-route.
- French/accented transcription: benchmark week one; domain dictionary.

---

## 18. Scope discipline & phasing
- **Phase 1 (now):** foundation (done, §20) → template **engine** + **3–5 real templates** (HER2/breast first) → the **speak→fill→sign core loop** on those → structured IHC block + HER2 IHC→Dual-ISH reflex.
- **Phase 2:** more templates (as config), reflex engine breadth, validated protocol/SOP library (director-authored), knowledge/notes/learning workspace features, referring-doctor sharing, Telegram alerts, EN/FR polish.
- **Phase 3 / north star:** the ~130-template library, the multi-agent PRD, digital-slide (navify) integration, second-opinion/telepathology, registry/QI export, FHIR interoperability.
**Resist widening Phase 1.** Ship one excellent loop; earn the next phase.

---

## 19. Environment / secrets
See `.env.example` (already in repo). Keys: `NEXT_PUBLIC_APP_URL`, `DATABASE_URL`(+`_UNPOOLED`), `AUTH_SECRET`, `AUTH_URL`, `ENCRYPTION_KEY` (base64 of 32 bytes — encrypts TOTP secrets), R2 (`R2_ACCOUNT_ID/ACCESS_KEY_ID/SECRET_ACCESS_KEY/BUCKET_NAME/ENDPOINT`), OpenAI (`OPENAI_API_KEY/MODEL/TRANSCRIBE_MODEL`), Telegram (`TELEGRAM_BOT_TOKEN/WEBHOOK_SECRET`), `CRON_SECRET`. **`NEXT_PUBLIC_*` is browser-exposed — no secrets there. Set per Vercel environment (Prod/Preview/Dev). Never commit real values.** Generate: `openssl rand -base64 32`.

---

## 20. Session 01 status (ALREADY BUILT — do not rebuild)
A foundation package was produced and handed to Marcel (`xpath-report-session01.zip`). It contains: the full schema (`src/db/schema.ts`) encoding G1/G2 + audit; access guards (`src/lib/access.ts`); audit writer; crypto helper; Drizzle client; Auth.js v5 + TOTP config; middleware gate; sign-in / verify / role-aware dashboard shell; seed script; `.env.example`; `PROJECT_HEADER.md`; `CLAUDE.md`; and `docs/` (product-brief, architecture, decision-log).
**Verified:** schema + access + audit + crypto + db client **typecheck clean**. **Not yet run in-repo:** full `npm install` + `npm run build` + auth flow end-to-end — **your first job is to run the in-repo build/verify gate** (per CLAUDE.md) and fix anything the build surfaces. Then complete Session-01 Definition of Done (§ below).

**Session 01 Definition of Done:** login + TOTP works · a pathologist sees only their own data · owner/admin cannot open a private workspace · tenant scoping holds · two domains + audit present · an action writes an audit entry · deploys to a Vercel preview from `main`. **Then STOP for Cowork inspection before Session 02.**

---

## 21. Roadmap (Session 02+)
- **Session 02:** template **engine** (versioned, data-driven) + **first real template (breast/HER2)** + the **core loop** on it (auto-suggest template → dictation auto-fill → review → sign). Structured IHC block + HER2 reflex.
- **Session 03+:** more templates as config; reflex engine; OCR intake; private-workspace features (notes/learning/files); sharing; Telegram alerts; PDF worker; audit/admin UI.
Each session: bounded, ends at a STOP gate for Cowork inspection.

---

## 22. Owner preferences & working style (apply to all work)
- **Architect-first, step-by-step, explicit, authoritative** instructions and reasoning.
- **One master instruction / single source of truth.** (This doc + PROJECT_HEADER.)
- Technical explanations include **folder paths, stack, deployment architecture.**
- **Disciplined workflow:** acceptance criteria, **PR discipline**, assignment tracking, engineering↔functional alignment.
- **Short verbal summaries for live calls.**
- Marcel is an experienced **systems operator** (15+ yrs Joomla/WordPress/hosting, legacy→CI/CD migrations) using **AI-assisted development** — not a beginner coder. Explain at systems level; don't over-explain basics.
- **Do not make Marcel repeat himself.** From here he supervises.

---

## 23. CLAUDE.md workflow rules + the missing-files situation
`CLAUDE.md` (in repo) mandates:
- **Strict workflow:** Plan → Build → Review → Debug → Security → Performance → Deploy. Do not code immediately.
- **Repo safety:** before any change, print CWD, confirm project name, confirm the task matches this repo; if unclear, **STOP**; never edit the wrong repository.
- **Build rule:** before "done," run `npx tsc --noEmit` and `npm run build`; never say "should work"; only say passed **after verification.**
- **Security rule:** before deploy verify — auth, roles, API protection, server actions, database access, RLS/ownership checks, secrets, rate limits, input validation, file uploads, CORS, headers, logs, Vercel env, Cloudflare rules. **Add X-PATH's G1/G2 checks** (tenant isolation; owner cannot read private workspace).
- **AI coding rule:** no random broad changes; fix only the requested task; no refactoring unrelated files; no architecture change without approval; don't remove business logic unless told.
- **Memory rule:** after each meaningful task update `docs/change-log.md`; log lessons to `.claude\tasks\lessons.md`; multi-step tasks update `.claude\tasks\todo.md`.

**⚠️ Unresolved:** `CLAUDE.md` references 12 global files in `C:\Users\loneb\.claude\tasks\` (enterprise/rules/stack/plan/agent/review/debug/security/performance/deploy/lessons/todo). **These were not found** at that path (the folder held only Claude Code session UUID folders). Options: (a) locate them (search wider/OneDrive), or (b) regenerate them from this handover + PROJECT_HEADER. Until resolved, treat **this document + PROJECT_HEADER.md** as the authoritative rule-set and **do not block** on the missing global files.

---

## 24. Legal / copyright / commercial
- **No CAP/WHO/AJCC content copied** — logic only (G3). CAP originals used privately for structure; content sources are client originals / ICCR / in-house authoring.
- **X-PATH is advisory software, not a diagnostic device** — keep it that way (avoids IVDR/FDA and medico-legal liability). This is a commercial safeguard for Maxpromo.
- **Maxpromo invoicing:** Kleinunternehmer **§19 UStG — no VAT**; invoices state *"Gemäß §19 UStG wird keine Umsatzsteuer berechnet."*
- **Ownership:** client's **data and templates are always the client's**; code ownership on handover is an open commercial term (§25).

---

## 25. Open decisions (DO NOT BLOCK — proceed around, flag when relevant)
1. **PD-L1 clone** (SP263 / SP142) + scoring context.
2. **TTF-1 clone** (SP141?), and confirm clones flagged "(confirm)" in §12, plus **PAX8** availability/clone.
3. **LIS relationship:** is it **Olivya**, **Roche navify**, both, or neither — and its **API**? (Earlier "Olivya"; later only navify was named. No public product page found for "Olivya" — it's a system Dr. Ivo logs into.)
4. **Data-hosting jurisdiction** (Dubai holding / Cameroon ops).
5. **Commercial model & code ownership** on handover.
6. **Primary reporting language** (EN or FR default).
7. **Missing `.claude\tasks` global files** (§23) — locate or regenerate.
8. **Special-stains authoritative menu** — from Dr. Ivo's reflex SOP (to be supplied).

---

## 26. Hard NO list
- ✗ No diagnosing/interpreting patient images/specimens; no benign/malignant calls (§8, G1).
- ✗ No reproducing/scraping CAP/WHO/AJCC content — logic only (G3).
- ✗ No owner/admin access into pathologists' private workspaces (G2).
- ✗ No signed patient report outside the audited clinical record (G2).
- ✗ No expanding Phase 1 to all templates / all agents (G4).
- ✗ No zero-knowledge claims the AI-assist model contradicts (G5).
- ✗ No molecular data-entry sections bloating diagnostic templates (G6/§10).
- ✗ No fabricated findings/values/citations (G8).
- ✗ No VAT on Maxpromo invoices (§24).
- ✗ Never edit the wrong repository; if unclear, STOP (CLAUDE.md).

---

## 27. What Marcel supervises (settled — do NOT re-ask him)
Name (X-PATH/xpath.report) · advisory frame · private-vs-clinical principle · logic-only templates · morphology+IHC scope with molecular separate/advisory · multi-tenant foundation · the 38-antibody register + HER2 IHC→Dual-ISH in-house · reflex engine as a differentiator · EN/FR + regional · Phase-1 scope (engine + 3–5 templates, HER2/breast first) · the three-engine + governance architecture · the stack. These are closed. Ask Marcel only about §25 open items, or when a genuine header conflict arises.

---

## 28. GAPS COWORK IS ADDING (review — accept or cut)
Marcel asked me to flag anything missed. Proposed additions:
1. **Patient-data handling policy:** pseudonymise before any AI call; define **audio & report retention** (e.g. delete source audio 90 days post-validation); encryption at rest/in transit. (Aligns with earlier feasibility work.)
2. **Backup & disaster recovery** for the clinical record of truth (it's a legal document).
3. **Offline / poor-connectivity resilience** on mobile capture (queue, retry, resumable uploads).
4. **Report PDF letterhead / branding:** "X.PATH Labs @ BettaHealth" — confirm logo/letterhead; per-tenant branding for future tenants.
5. **Amendment/addendum workflow** UX (schema supports versioning; needs a defined process, per CAP practice).
6. **Turnaround-time tracking** (manager view; useful for accreditation).
7. **Pathologist onboarding/training** flow (accounts pre-configured then handed over; the account-creation model was discussed — pre-configured to start, self-signup later).
8. **ISO 15189 readiness** as an explicit design lens (audit trail, controlled documents, validation records already point here).
9. **Consent/DP posture** given Dubai holding + potential cross-border hosting — design hosting-region-configurable.
10. **A "pending send-out" pointer field** on reports (note that a molecular test was sent / result pending) without pulling in the molecular template.
11. **Terminology dictionary** (EN/FR pathology terms, antibody names) shared by transcription + templates.
12. **Second-opinion/telepathology** as a named roadmap feature (observed need).
Recommend accepting 1, 2, 3, 4, 5, 10 into near-term scope notes; 6–9, 11, 12 as roadmap.

---

## 29. Artifacts produced this session (reference, don't duplicate)
- `PROJECT_HEADER.md` — the constitution (in repo).
- `xpath-report-session01.zip` — the built foundation (schema, guards, auth, shell, docs).
- `XPATH_Execution_Session_01.md` — Session 01 work order.
- `XPATH_Working_Session_Runbook.md`, `XPATH_Working_Session_Worksheet.pdf` — the planning-session materials.
- `XPATH_Reference_Links.html` — verified CAP / ICCR / WHO / AJCC / mTuitive / tools links.
- (Earlier feasibility PDFs and the product mockup PDF/deck under the prior CPath name — superseded on branding, still useful as reference.)

---

## 30. Suggested skills (for Claude Code)
- `engineering:architecture` / `engineering:system-design` — template engine + access-isolation design.
- `frontend-design` — app shell, mobile capture UI, role dashboards.
- `engineering:code-review` + `engineering:testing-strategy` — before each PR (esp. G1/G2 isolation tests).
- `engineering:deploy-checklist` — before Vercel deploys.
- `engineering:debug` — for the in-repo build gate.

---

**FINAL RULE:** Load `PROJECT_HEADER.md` first, every session. This handover is the context behind it. When in doubt, STOP and flag — do not drift, do not invent, do not simplify a critical detail. Marcel supervises; build to what is written here.
