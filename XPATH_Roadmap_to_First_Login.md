# X-PATH — ROADMAP TO FIRST PATHOLOGIST LOGIN → TRANSCRIBE → ASSIGN
### How we walk together, transparently, until a pathologist can log in, dictate, and validate their results.
**Governs execution alongside `PROJECT_HEADER.md` and `XPATH_Complete_Handover.md`. Claude Code follows this milestone by milestone, updates the progress tracker, and SIGNALS Marcel at each moment a key or template is needed — then waits.**

---

## HOW THIS WORKS (read first)

**We walk simultaneously.** Claude Code builds; Marcel supplies keys/templates *just in time*. Claude Code never blocks silently — when it needs something from Marcel, it emits a **SIGNAL** and pauses.

**The SIGNAL block** (Claude Code uses this exact shape; Marcel replies "done" — keys are filled in `.env.local` / Vercel, never pasted in chat):
```
🔔 SIGNAL — MARCEL, ACTION NEEDED  [Milestone Mx]
WHAT:   <e.g. Neon database>
WHY:    <what it unblocks>
DO:     <exact step, e.g. "create Neon project → paste DATABASE_URL + DATABASE_URL_UNPOOLED into .env.local">
REPLY:  "done" when filled (do NOT share the values here)
```

**Progress is always visible.** Claude Code maintains **`docs/PROGRESS.md`** in the repo and updates it at every milestone — a checklist + a text progress bar + "you are here." Marcel can open it any time to see exactly where we are (see spec at the end).

**Keep it simple now.** This roadmap goes only as far as the first working loop. Anything not needed for *login → transcribe → assign* is deferred (see "Deferred / removed" below).

---

## THE GOAL OF THIS ROADMAP
A pathologist opens **xpath.report** on phone or desktop, logs in (with 2FA), works inside their **private encrypted space**, **dictates** a case (EN/FR), the system **transcribes and fills the structured template**, and the pathologist **reviews, corrects, and validates/assigns** the result into their archive. That is the finish line here.

---

## DEFERRED / REMOVED for now (Dr. Ivo's instruction — do NOT build these yet)
- ✗ **Barcode / labels**
- ✗ **Case & specimen management**
- ✗ **Olivya (LIS) integration**
- ✗ **Telegram / notifications**
- ✗ **Any owner (Dr. Ivo) visibility or reporting into pathologist content** — he does not see pathologists' work, cases, or reports. No admin reporting layer over their space.
These return later (or not at all) — parked, not forgotten.

---

## WHAT ALREADY EXISTS ELSEWHERE (competitive scan) — and our gap
- For pathology, **voice = dictation with templates is the standard** (Dragon Medical One, M*Modal), and it <cite index="82-1">can save 2–4 hours of documentation time a day</cite>. But <cite index="80-1">dictation replaces typing; it does not reduce the work of structuring the note</cite> — the pathologist still shapes everything.
- **Our differentiator:** X-PATH doesn't just do voice→text — it does **voice → structured template auto-fill + reflex checks**, in **EN/FR**, at low cost, for a mid-size African lab. That combination doesn't exist in those tools.
- **Personal-workspace / learning / archive / second-opinion** platforms exist — Pathomation, PathPresenter, Tribun Health, Gestalt PathCloud, the KiKo network — but they're all **whole-slide-image centric** <cite index="88-1">(upload, view, annotate, share WSIs; tagging and bookmarking; second-opinion workflow; courses and quizzes)</cite>. **None** pair a private encrypted reporting workspace with voice-driven structured reporting for a lab like X.PATH. **That is our gap to own.**
- **Features worth folding in later** (proven by those platforms, cheap to add to our workspace): personal **tagging/bookmarking & search** of one's own past cases, a **personal archive**, a **learning/tips** area, and (roadmap) **second-opinion sharing**. These map exactly to Dr. Ivo's ask: notes, archives, learn, tips.

---

## THE PRIVATE WORKSPACE — why it's central (Dr. Ivo's emphasis)
The pathologist's private space is not a side feature; it's the **retention engine**. Pathologists should **do their daily work inside X-PATH** — dictate reports, keep personal notes, browse their own archive, pick up tips, learn — so the platform becomes **indispensable to their practice** (high daily-active use, low churn). They must **visibly know their data is encrypted** and that **no one else — including the lab owner — can see it**. This stickiness is also the basis for Dr. Ivo's **future intent to charge pathologists** for access — so build the workspace to be genuinely valuable and self-contained. (For now: keep it simple — notes, archive, tips, encryption indicator.)

---

## MILESTONES (M0 → M7)

### M0 — Foundation  ✅ DONE (Session 01)
Multi-tenant schema (private-workspace vs clinical-record + audit), access guards, Auth.js+TOTP scaffold, app shell, seed. Verified: core modules typecheck clean.
**Progress: ▓░░░░░░░░░ ~10%**

---

### M1 — Accounts & login live
**Build:** run the in-repo build/verify gate (fix anything it surfaces), wire Neon, deploy to Vercel, complete login + TOTP end-to-end on a live URL.
**🔔 SIGNALS (first key moment — several together):**
- **GitHub** — repo (already created ✅).
- **Neon** — create project → `DATABASE_URL` + `DATABASE_URL_UNPOOLED`.
- **Vercel** — connect the GitHub repo → first deploy.
- **Auth secrets** — generate locally: `AUTH_SECRET`, `ENCRYPTION_KEY` (`openssl rand -base64 32`).
- (Cloudflare DNS for xpath.report can wait until M7 production; a Vercel preview URL is fine now.)
**Definition of Done:** a seeded pathologist logs in with 2FA on the live Vercel URL; tenant scoping holds.
**Progress: ▓▓░░░░░░░░ ~20%**

---

### M2 — Private encrypted workspace (the sticky core)
**Build:** the pathologist's personal space — **encryption indicator** ("Your space is private & encrypted — no one else, including the lab, can see it"), **personal notes** (create/edit/search), **personal archive** (their own items, tag/bookmark), a simple **learning/tips** area. Enforce G2: owner/admin cannot read any of it. No reporting to Dr. Ivo.
**🔔 SIGNAL:** **Cloudflare R2** — for saved reference-file uploads → `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_ENDPOINT`. (Notes/text need no external service; R2 only when file uploads land.)
**Definition of Done:** pathologist creates notes, sees only their own space, encryption indicator visible; an admin account provably cannot open it.
**Progress: ▓▓▓░░░░░░░ ~32%**

---

### M3 — Template engine + first template (Breast / HER2)
**Build:** the **data-driven, versioned template engine** — tiered fields (core/conditional/non-core), single + multi-select, controlled vocabularies, "cannot be determined", versioned classification bindings, director-approval gate (stub). Render a template as a structured form. Author the **first template: Breast (invasive) + Breast Biomarker** from CAP *logic*.
**🔔 SIGNAL (first template request):**
```
🔔 SIGNAL — MARCEL, TEMPLATE NEEDED  [M3]
WHAT:  CAP protocol LOGIC for Breast — Invasive Carcinoma (Resection) + Breast Biomarker Reporting
DO:    upload the CAP originals (version + PDF/Word), like your Lung/Melanoma example
NOTE:  logic only — we never copy CAP text (G3)
```
**Definition of Done:** the Breast template renders as a structured form; its version is recorded; approval gate present.
**Progress: ▓▓▓▓▓░░░░░ ~50%**

---

### M4 — Voice capture + transcription (EN / FR)
**Build:** mobile-friendly capture (open intake, hold the pic/context), **record audio → R2 → Whisper transcription** (EN/FR + pathology domain dictionary), **editable transcript**. **Pseudonymise before any AI call.**
**🔔 SIGNAL (OpenAI moment):**
```
🔔 SIGNAL — MARCEL, ACTION NEEDED  [M4]
WHAT:  OpenAI API key (Whisper transcription)
DO:    create key → paste OPENAI_API_KEY into .env.local / Vercel
```
Plus: **week-one accuracy benchmark** with Dr. Ivo's real voice (EN + FR) before relying on it.
**Definition of Done:** pathologist speaks and sees an accurate, editable transcript in EN and FR.
**Progress: ▓▓▓▓▓▓░░░░ ~64%**

---

### M5 — Structure & auto-fill (transcript → template values)
**Build:** **template auto-SUGGEST (human confirms)** from specimen type/dictation — never blind-route; **map transcript → field values** into the confirmed template; **structured IHC block + HER2 IHC→Dual-ISH reflex** (using the real 38-antibody register). AI-produced values **visibly marked**; never fabricate (G8).
**🔔 SIGNAL (more templates, as the engine proves out — one at a time):**
```
🔔 SIGNAL — MARCEL, TEMPLATE NEEDED  [M5]
WHAT:  next Phase-1 templates — Colon & Rectum (Resection), Prostate (Needle Biopsy),
       Lymphoma (Basic), CUP — submit each as we reach it (logic only)
```
**Definition of Done:** dictation fills the confirmed Breast template's fields; values are marked AI; HER2 reflex logic fires on a 2+ score.
**Progress: ▓▓▓▓▓▓▓▓░░ ~80%**

---

### M6 — Review, validate, ASSIGN  ← the finish line of this roadmap
**Build:** review/correct UI; **validate/sign** action → creates the **clinical record** (audited, immutable) **and** files the result into the pathologist's **archive**; "assign their results" = attach + release. Basic **PDF** on X.PATH letterhead (via the off-Vercel worker) — minimal is fine here.
**🔔 SIGNAL:** **PDF worker** host (small service) if not already — Claude Code will specify.
**Definition of Done:** a pathologist logs in → dictates → template auto-fills → reviews/corrects → **validates/assigns** → result appears in their archive + the audited record. **The goal loop works end to end.**
**Progress: ▓▓▓▓▓▓▓▓▓░ ~92%**

---

### M7 — MVP hardening + Dr. Ivo demo
**Build:** EN/FR polish, encryption indicator, archive search, **G1/G2 isolation tests**, mobile pass, production deploy. Demo the full loop to Dr. Ivo.
**🔔 SIGNALS (production):**
- **Cloudflare** — point **xpath.report** DNS → Vercel production; SSL.
- **Vercel** — set production env vars (all keys, Production scope).
**Definition of Done:** the full **login → dictate → transcribe → fill → validate → assign** loop runs live on **xpath.report**; Dr. Ivo watches a pathologist do it.
**Progress: ▓▓▓▓▓▓▓▓▓▓ 100% (of this roadmap)**

---

## API & ACCOUNTS — request schedule (when Claude Code will signal you)
| Service | Needed at | You provide | Notes |
|---|---|---|---|
| GitHub | M0 ✅ | repo | done |
| **Neon** (Postgres) | **M1** | `DATABASE_URL`, `DATABASE_URL_UNPOOLED` | free tier fine |
| **Vercel** + secrets | **M1** | connect repo; generate `AUTH_SECRET`, `ENCRYPTION_KEY` | preview URL first |
| **Cloudflare R2** (storage) | **M2** | `R2_*` keys + bucket | for file uploads / later audio |
| **OpenAI** (Whisper) | **M4** | `OPENAI_API_KEY` | metered; pseudonymise first |
| **PDF worker** host | **M6** | small service endpoint + secret | off-Vercel (Chromium) |
| **Cloudflare DNS** (xpath.report) | **M7** | point domain → Vercel prod | go-live |
| ~~Telegram~~ | — | — | **removed for now** |

## TEMPLATES — submission schedule (Claude Code signals you per template)
| Template (logic only) | Requested at |
|---|---|
| **Breast — Invasive + Breast Biomarker** | **M3** |
| **Colon & Rectum (Resection)** | M5 |
| **Prostate (Needle Biopsy)** | M5 |
| **Lymphoma (Basic)** | M5 |
| **CUP (Carcinoma of Unknown Primary)** | M5 |
| _(others — as config, post-MVP)_ | later |
> Submit in your CAP listing format (name · current version · PDF/Word), e.g. the *Melanoma Biomarker / Merkel Cell / Lung Resection* examples you pasted. We extract **logic only**, never copy content.

---

## PROGRESS TRACKER — `docs/PROGRESS.md` (Claude Code maintains this)
Updated at every milestone so you always see where we are. Format:
```
# X-PATH — PROGRESS
Overall: ▓▓▓▓▓░░░░░ 50%   (you are here → M3: Template engine)

[x] M0 Foundation            100%
[x] M1 Login live            100%
[x] M2 Private workspace     100%
[>] M3 Template engine        60%   ← current
[ ] M4 Voice + transcription   0%
[ ] M5 Structure & auto-fill   0%
[ ] M6 Review · validate · assign 0%
[ ] M7 Hardening + demo        0%

WAITING ON MARCEL: (none)  |  or: "🔔 M4 — OpenAI API key"
LAST UPDATE: <date> — <one line>
```
Rule for Claude Code: update `PROGRESS.md` on every meaningful step; whenever a SIGNAL is open, show it under "WAITING ON MARCEL" and **pause** until Marcel replies "done".

---

## GAPS COWORK IS ADDING (accept or cut)
1. **Encryption-visible UX** — a small, honest "private & encrypted" indicator in the workspace (builds the trust Dr. Ivo wants). *(In M2.)*
2. **Personal archive with tag/search** — proven sticky in competitor platforms; cheap to add. *(In M2.)*
3. **Audio retention policy** — auto-delete source audio N days after validation (privacy + cost). *(In M4.)*
4. **Week-1 FR/accent benchmark** — de-risks the whole voice promise. *(In M4.)*
5. **"Monetisation-ready" flag** — keep the tenancy/user model able to gate access per-pathologist later (Dr. Ivo's future charging), without building billing now. *(architecture note, M1.)*
6. **Basic PDF at M6** — so "assign" produces a real artifact, even minimal.
Recommend accepting all six — they're small and each de-risks or strengthens the core loop.

---

## POST-MVP (future — keep simple now, parked)
More templates (as config) · reflex-engine breadth · referring-doctor sharing · **second-opinion / telepathology** · **charging pathologists** (billing) · navify image integration · registry/FHIR export · (and only if wanted later: notifications, case management, LIS integration).

---

**FINAL RULE:** Build milestone by milestone. Update `docs/PROGRESS.md` every step. SIGNAL Marcel the moment a key or template is needed, then **pause and wait**. Never build the deferred/removed items. Load `PROJECT_HEADER.md` first, every session.
