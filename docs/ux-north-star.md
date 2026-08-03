# X-PATH — UX NORTH-STAR (design bible)
### The interface logic we inherit from Apple Health, adapted for pathologists — and built milestone by milestone, not all at once.
**Companion to `PROJECT_HEADER.md`, `XPATH_Roadmap_to_First_Login.md`, `XPATH_handover.md` (repo root — this doc originally cited `docs/ROADMAP.md`/`docs/HANDOVER.md`, which don't exist under those names; corrected here for traceability, see `docs/decision-log.md`). This is the visual & interaction target. Claude Code builds toward it at each milestone; the look-and-feel lands at M2 and features fill in per the roadmap.**

> **Status note (added on receipt, not part of the original doc):** received after M7 (hardening/demo-prep) was already underway and after two rounds of dashboard UX work (DL-043/044) had already shipped and been confirmed live. This document's own "M2" (design language + Health-style home shell + demo pathologist) does not match `XPATH_Roadmap_to_First_Login.md`'s actual M2 definition ("Private encrypted workspace" — encryption indicator, notes, archive, learning/tips — already built and verified since M0/M1). Saved here as reference per the document's own instruction not to build it all at once; not yet actioned against the current build. See `docs/decision-log.md` for the discrepancy log and open questions before any of this is built.

---

## 0. HOW TO USE THIS
Marcel's reference is the iPhone **Health** app: a warm, card-based, mobile-first, "wow" experience — Summary home, Profile, Search by category, a persistent transcribe action, a Sharing flow, learning cards, trend graphs, and danger highlighting. We inherit that **interaction logic**, not Apple's content or exact styling.
**Build order rule (critical):** do NOT build all of this at once. The *design language* and the *home shell + demo pathologist* land at **M2**. Transcribe (M4), auto-fill + danger highlighting (M5), validate/assign + sharing + PDF (M6). Same destination, safe sequence. Each screen below is tagged with its milestone.

---

## 1. WHAT WE INHERIT vs. WHAT WE CHANGE

**Inherit (the good logic):**
- **Summary-first home** — card dashboard: recent work, news, recommendations, learning, trends.
- **Profile top-right** → personal space, privacy, settings.
- **Search / browse by category** — Health browses body systems; we browse **organ / cancer type**.
- **Persistent transcribe action** (mic, bottom) — tap → speaks → writes live → **validate**.
- **Sharing flow** with the *"You're in control · encrypted · stop anytime"* framing.
- **Highlights + trend graphs**, and **out-of-range highlighting** (Health flags abnormal trends in color).
- **Interactive, colorful, rounded cards, generous spacing** — a premium, calm, mobile-first feel.

**Change (our product is not Apple's):**
- **Sharing direction is reversed.** Apple = patient shares *their own* data outward to family, with notifications. X-PATH = the **pathologist chooses a specific doctor** to view a **specific result**, from a private space. Do **not** copy Apple's share-to-family / notifications model.
- **Privacy is stricter.** The pathologist's space is **encrypted and owner-invisible** (Dr. Ivo sees nothing). Keep Apple's *"encrypted, you're in control"* framing; enforce our G2 reality underneath.
- **No notifications / Telegram** (removed for now) — the Health "Notifications" affordance is not built.
- **Advisory, never diagnostic.** Danger highlighting flags what the *pathologist described* as urgent for their confirmation — it never originates a diagnosis or fabricates a finding (G1/G8).

---

## 2. DESIGN LANGUAGE

**Palette** — quiet clinical base + an H&E-inspired accent (hematoxylin purple / eosin pink), which ties the brand to pathology itself:
- Primary: **petrol `#0E4B54`** / deep `#08363D` (trust, medical).
- Accents: **hema `#6A3AA0`** (hematoxylin), **eosin `#D5567E`** (eosin) — used sparingly, for brand marks and highlights.
- Semantic: **mint `#1F9E82`** = normal/complete · **amber `#C0812F`** = attention · **red `#C0392B`** = critical/urgent (danger zone).
- Surfaces: warm off-white cards on a light neutral background; dark section covers only for hero/learning imagery.

**Form:** large rounded cards (16–20px radius), generous padding, soft shadows, one clear action per card. Mobile-first (phone is the primary device); everything works one-thumb.

**Type:** clean sans for UI; a warm serif is optional for card titles to feel less clinical. Big, confident headings like Health ("Why Hearing Health Matters" → "Why HER2 Status Matters").

**Icons:** friendly category icons per organ/cancer type (like Health's Activity/Heart/Respiratory), plus a clear mic for transcribe.

**Graphs:** use where they add meaning — reporting activity, turnaround, case volume trends — in the Health "Trends" card style (avg line + bars). Never decorative.

**Danger-zone highlighting:** when the pathologist's report contains a finding they mark urgent (e.g. positive margin, high-grade, critical result), surface it as a **colored banner/flag** (amber attention, red critical) with a short label — like Health's "You're walking less than usual" but for "Urgent: positive margin — flag for clinician." Advisory; the pathologist sets/confirms it.

---

## 3. INFORMATION ARCHITECTURE

Bottom navigation (3 tabs + center action + profile), Health-style:
- **Home** (Summary) · **Cases** (archive/worklist) · **[ Transcribe ]** center mic action · **Learn** · **Profile** (top-right avatar).
- A **Sharing** surface reached from a result (not a primary tab, since it's per-result and pathologist-initiated).

---

## 4. SCREENS (each tagged with its milestone)

### 4.1 Home / Summary  **[M2]**
Landing screen. Card stack:
- **Greeting** + avatar top-right; subtle **"🔒 Private & encrypted — only you can see your workspace."**
- **Recent work** — draft/in-progress cases (their own only).
- **Danger-zone alerts** (if any) — urgent results awaiting action, red/amber.
- **Trends** — a graph card (their reporting activity / turnaround), Health "Trends" style.
- **Learning** — big image cards: "Why HER2 Status Matters," "Learning about Lymphoma classification," cancer news, tips. The knowledge-gaining environment.
- **Recommendations** — e.g. "You have 2 drafts pending validation."

### 4.2 Profile / My Space  **[M2]**
- Identity, role, lab (X.PATH @ BettaHealth).
- **Privacy panel** — *"Your data is encrypted. No one else — including the lab — can see your workspace. You control what you share."*
- **My notes** · **My archive** · **My saved references** · **My tips/learning** (the sticky personal space).
- Settings (language EN/FR toggle).

### 4.3 Browse / Search by organ & cancer type  **[M3]**
- Health-Categories-style list: Breast · Colorectal · Prostate · Lung · Lymphoma · CUP · … (the templates we've loaded).
- Selecting one = the **template auto-suggest confirm point** (pathologist taps the specimen type → narrows templates → never blind-routed).

### 4.4 Transcribe (center mic action)  **[M4]**
- Tap mic → **live transcription** (EN/FR) writing on screen in real time, exactly like the iPhone dictation Marcel used.
- Editable transcript; language auto/toggle; pathology domain dictionary.
- "Continue" → feeds the confirmed template. Pseudonymise before AI.

### 4.5 Report — template fill & review  **[render M3 · auto-fill M5]**
- The structured template rendered as a clean form: tiered fields, controlled values, "cannot be determined."
- **AI-filled values visibly marked** (e.g. a subtle "AI" chip) so the pathologist knows what to check.
- **Structured IHC block** (antibody · clone · Ventana ref · result · interpretation) + **HER2 IHC→Dual-ISH reflex** surfacing when score = 2+.
- **Danger-zone highlight** on urgent findings.
- Report shape: diagnosis first → coding (WHO/ICD-O/ICD-10) → TNM → interpretation → **3–5 reflex suggestions**.

### 4.6 Validate / Assign  **[M6]**
- Review → correct → **Validate & Sign** → creates the audited clinical record **and** files it in the pathologist's archive.
- Generates a **PDF on X.PATH letterhead**.
- Clear, satisfying confirmation (the "done" moment).

### 4.7 Sharing — invite a doctor  **[M6+]**
- From a validated result: **"Invite a doctor to view this result with you"** (second opinion / referring clinician).
- Framing like Health's Sharing: *"You're in control · only what you choose is shared · encrypted · stop anytime."*
- **Pathologist-initiated, per-result.** Not share-to-family, no auto-notifications.

### 4.8 Learn / Knowledge  **[M2 basic → grows]**
- Learning cards, tips, cancer news, guidance — helps the pathologist learn and solve problems, deepening reliance on the platform. Starts simple (static/curated cards), grows later.

---

## 5. THE SEEDED DEMO PATHOLOGIST (for the Dr. Ivo presentation)  **[M2]**
Build a **test pathologist account** Marcel logs into, pre-filled with **placeholder data** he can present and later wipe:
- A realistic name/avatar (fictional — **not** Marcel's real Health data), role "Pathologist," tenant BettaHealth.
- **A populated home:** a few sample draft/completed cases, trend graph with sample data, learning cards, a couple of notes and archive items.
- **One fully worked sample case** end-to-end: a placeholder **breast/HER2** report — sample dictation transcript → auto-filled template → HER2 2+ → Dual-ISH reflex → a **danger-zone highlight** example → validated → PDF. So Dr. Ivo sees the whole loop "as a pathologist would use it."
- Everything clearly flagged **DEMO / placeholder**, easily deletable, using **fake patient data only** (never real).
- Purpose: Marcel presents this to Dr. Ivo — "if a pathologist uses it well, this is how it looks."

---

## 6. MILESTONE MAP (so it builds in order)
| Screen / capability | Milestone |
|---|---|
| Design language (palette, cards, nav) | M2 |
| Home/Summary shell + learning cards + encryption indicator | M2 |
| Profile / My Space (notes, archive, tips) | M2 |
| **Seeded demo pathologist + placeholder data** | M2 |
| Browse by organ + template render | M3 |
| Transcribe (live EN/FR) | M4 |
| Auto-fill + AI-marking + danger-zone highlight + HER2 reflex | M5 |
| Validate/Assign + PDF | M6 |
| Sharing (invite a doctor) | M6+ |

> The full sample worked case in the demo profile (§5) is assembled as these milestones land — at M2 it can be a static mock; it becomes real as M4–M6 build the live loop.

---

## 7. GUARDRAILS THAT STILL GOVERN THE UI
- **Advisory, never diagnostic** — danger highlights and reflex suggestions are prompts the pathologist confirms; the UI never states a diagnosis on its own (G1).
- **Never fabricate** — demo data is clearly placeholder; live AI values are marked and validated (G8).
- **G2 private workspace** — owner/admin never see a pathologist's space; the encryption indicator must reflect real isolation, not decoration.
- **Honest encryption language** — "encrypted, only you see it" (true: private from other humans), not "zero-knowledge" (G5).
- **No notifications/Telegram, no case-management/barcode** — not in the UI (deferred list).
- **Mobile-first** — the phone is the primary device; the transcribe→validate loop must be one-thumb smooth.

---

## 8. TEMPLATE / FORM INTERACTION SPEC — the long CAP forms  **[render M3 · AI layer M5]**
This governs how the structured templates (colon, breast, prostate…) render and behave. The current build renders long inline radio walls (15+ options for Histologic Type, 11 for Tumor Site). Replace that with the pattern below.

### 8.1 First principle — this is a REVIEW surface, not a blank form
Voice fills the template first (M4/M5). So the form is optimised for **confirm-and-correct**, not type-from-scratch: filled sections collapse to a one-line summary, missing/low-confidence CORE fields auto-expand and flag, and the whole thing reads top-to-bottom like a receipt being approved. Design for a pathologist doing 30 cases a day — every saved tap matters.

### 8.2 Structure — accordion sections (not one long scroll, not a one-question wizard)
- Chunk by CAP section: **Clinical → Specimen → Tumor → Margins → Nodes → IHC → Comment.**
- Each section is a **collapsible card**. A completed section collapses to its summary line: *"Tumor — Adenocarcinoma · sigmoid colon · G2 ✓."*
- Only the active/incomplete section stays open. Tap a summary to reopen.
- Why not a one-question-per-screen wizard: too many taps for a power user. Why not a flat long scroll: no orientation. Accordion = both fixed.

### 8.3 Long option lists → bottom-sheet searchable pickers (this fixes both screenshots)
- A single-select field with many options renders as **one tappable row** showing the current value (or "Select…"). Tapping opens a **bottom sheet** that slides up with a **search box + option list**.
- Type-ahead: "muc" → *Mucinous adenocarcinoma* → tap → sheet closes, row shows the value. One row instead of a screen of radios, and faster for someone who knows the answer.
- Voice-filled value appears pre-selected as a **chip**; the pathologist taps only to change it.
- Native iOS 15+/Material 3 bottom-sheet feel — like Health, not a web form.

### 8.4 Show less by default (dynamic disclosure)
- **CORE** fields visible.
- **NON-CORE** collapsed behind "Show optional fields."
- **CONDITIONAL** fields **hidden until their trigger fires** — e.g. "Rectal Tumor Location (required only for rectal primaries)" appears **only when Tumor Site = rectum/rectosigmoid**, not shown greyed. This can cut a 60-field form to ~20 visible on a given case.

### 8.5 Always-visible orientation & action (sticky)
- **Top:** slim progress indicator — "3 required fields left."
- **Bottom:** persistent action bar — **Save draft · Validate & Sign** — always reachable, never scroll-to-find.
- Optional: a section-jump strip.

### 8.6 Field-type → component mapping (implement this table)
| CAP field pattern | Component |
|---|---|
| Single-select, ≤5 options | inline radio group or segmented control |
| Single-select, >5 options | **bottom-sheet searchable picker** (one row) |
| Multi-select | bottom-sheet multi-select with checkable chips |
| "…(specify)" free text | text field **revealed after** the option is chosen (not beside every option) |
| "Cannot be determined / Not identified" | always present as the last option in the picker |
| Numeric (size, node count) | numeric keypad input with unit suffix |
| Boolean (present/absent) | segmented toggle |
| Comment / non-core note | collapsed multiline field |

### 8.7 The wow layer (must serve speed, not decorate)
Smooth collapse/expand animation · satisfying checkmark when a section completes · **AI-filled values shown as subtly highlighted chips** so the pathologist sees what to verify · light haptic on select · **≥44px touch targets** · the calm H&E card aesthetic. Keep the **CORE / CONDITIONAL / NON-CORE chips** — they're already excellent and legible.

### 8.8 Danger-zone banners (persist through collapse)
Urgent findings (positive margin, high grade, critical result) show a **red/amber banner** that stays visible even when its section is collapsed — so an urgent case is never hidden. Advisory: the pathologist sets/confirms it; never auto-diagnosed (G1/G8).

### 8.9 Direct fixes for the two current screens
- **Histologic Type** (15+ radios) → searchable bottom-sheet picker, single row.
- **Tumor Site** (11 radios + per-option "specify") → picker; the "specify" free-text appears **after** selection.
- **"Rectal Tumor Location" (CONDITIONAL)** → hidden until Tumor Site is rectal.
- Wrap each field group in a **collapsible section** with a summary line.

### 8.10 Do NOT
- ✗ No page-number pagination ("Page 1 of 5").
- ✗ No one-question-per-screen wizard for these forms.
- ✗ No inline radio walls for long option lists.
- ✗ No greyed conditional fields shown before their trigger — hide them.

---

**FINAL NOTE:** This is the *target*, not a licence to build everything now. Build the **M2 slice first** — the Health-style home, profile, learning cards, encryption indicator, and the seeded demo pathologist — so the very first thing Dr. Ivo (and Marcel) sees already feels like a premium health app, and the rest fills in on the roadmap. Load `PROJECT_HEADER.md` first; keep it advisory; make it wow.
