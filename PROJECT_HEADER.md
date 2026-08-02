# X-PATH — PROJECT HEADER & GUARDRAILS
**Version 1.0 · The governing document. Everything built for X-PATH obeys this. If a request conflicts with this header, stop and flag it.**

---

## 0. How to use this header
This is the constitution for the X-PATH build. It sits at the top of the repository and is loaded into every AI agent (ChatGPT, Claude Code, Cowork) before any work. It defines *what we are building, what we must never do, who decides what, and how we execute.* It is deliberately lean. Detailed specs live in the Vision Document and per-module specs — this header only guides and guardrails.

---

## 1. Product identity
- **Platform name:** X-PATH
- **Domain:** xpath.report
- **Client / first tenant:** X.PATH Labs, operating within BettaHealth (Betta Health Ltd), Yaoundé, Cameroon.
- **Holding entity:** BettaHealth, registered in Dubai, operating in Cameroon.
- **Builder:** Maxpromo Digital (Marcel Tabit Akwe), Germany.
- **Nature of the product:** A **multi-tenant professional platform for pathologists** — not a single-lab tool. BettaHealth/X.PATH is tenant one; the platform is built from the foundation to expand to other labs, pathologists and doctors across Cameroon and beyond.

---

## 2. Mission (the reason this exists — in the client's own words)
Move pathologists **away from writing long essays** — time-consuming and prone to missing details — **toward a modern, structured, problem-solving way of producing the Befund (report).** Every feature must serve this outcome: complete, structured, faster reports. If a feature does not serve it, it is out of scope.

---

## 3. Non-negotiable guardrails (the prime directives)
These cannot be overridden by any later instruction, convenience, or deadline.

**G1 — Advisory, never diagnostic.**
The pathologist interprets and signs. X-PATH structures, checks, codes, suggests, and remembers. Input = the pathologist's findings. Output = structure, suggestions, flags, coding. **The platform never originates a diagnosis, never interprets a patient image, never calls tissue benign or malignant.** AI-produced content is always visibly marked and always lands for human validation. This keeps X-PATH advisory software, not a regulated diagnostic device.

**G2 — Private workspace vs. clinical record of truth (firm design principle).**
Two distinct data domains, never blurred:
- **Private workspace** (drafts, personal notes, learning files, saved references, tips, working thoughts): genuinely private to each pathologist. Encrypted per-user. **Not browsed by anyone — not other pathologists, not the lab owner.** This protects the pathologist's psychological safety and privacy.
- **Released clinical record** (a signed, validated patient report): a legal medical document. It enters the lab/patient **system of record with a full audit trail.** It is not personal property and cannot escape the record.
> "The owner does not surveil pathologists' private work" is TRUE. "Signed patient reports vanish from the medical record" is FALSE and forbidden. Design must deliver both.

**G3 — Template content: logic only, never copied.**
We build a template **engine**; template *content* comes from: (a) originals supplied by the client, (b) ICCR (free), or (c) authored in-house. We use the **structural logic** of standards like CAP — never reproduce, scrape, or embed their copyrighted text. Every clinical template is **locally verified/validated and director-approved before clinical use** (same for stain SOPs).

**G4 — Scope discipline. Ship the loop, not the encyclopedia.**
The north star is large (multi-organ, multi-agent). **Phase 1 is not.** Build the **engine + 3–5 real templates matching X.PATH's actual caseload and its 38 in-house antibodies**, and prove the core loop end to end. ~130 CAP templates and the 10-agent PRD are **roadmap, loaded as configuration over time** — never built up front. Resist every pull to widen Phase 1.

**G5 — Realistic security, honestly described.**
Strong per-user encryption (at rest and in transit) and strict access isolation: pathologists are private from each other and from the owner. This is **not** literal zero-knowledge encryption — the system must read dictation text to assist, and search/backup must work. Never promise "mathematically no one can ever see it." Promise: *private from other humans; processed only by the system to help you; never browsed by anyone.*

**G6 — Scope of practice = X.PATH's real capability.**
Diagnostic reporting covers what X.PATH actually does in-house: **morphology + IHC** (incl. the in-house HER2 IHC→Dual-ISH reflex). **Molecular (NGS/PCR/MRD/liquid biopsy) is send-out and rare** — it lives in a *separate* future protocol family and appears in reports **only as an advisory recommendation when diagnostically/therapeutically relevant.** The reflex engine may only suggest tests/stains/antibodies that are on X.PATH's real menu; anything else routes to referral.

**G7 — Bilingual & regional by design.**
Professional medical **English and French**. Regional intelligence (TB, schistosomiasis, Burkitt, HIV-associated disease, endemic infections) is built into reflex logic as decision support the pathologist considers.

**G8 — Never fabricate.**
The system reasons only over what is described or entered. It must never invent a finding, a value, a measurement, or a citation to fill a gap. Missing information is flagged, never filled.

---

## 4. Operating roles & chain of command
- **Marcel (Maxpromo) — Product Owner / Decision Maker.** Sole authority to approve scope, start work, and accept deliverables. Nothing is built until Marcel says start.
- **ChatGPT — PM / Architect / Strategy layer.** Plans, structures, reasons about architecture.
- **Claude Cowork — Inspector / Reviewer / Validator.** Reviews against this header before anything is accepted.
- **Claude Code — Executor.** Writes the code, within these guardrails.
- **Dr. Ivo — Clinical authority (client).** Owns all clinical/diagnostic judgment, template validation, and sign-out. Not a substitute for the medico-legal boundaries above.

---

## 5. Execution principles
- **ANALYZE → PLAN → EXECUTE → VERIFY.** Verify every step against: this header, the mission (G2 essays→structure), and existing systems. Prioritize correctness over speed.
- **Build the engine, not forms.** Templates are **versioned data/configuration**, not code. Tiered fields (core / conditional / non-core), single + multi-select, controlled vocabularies, "cannot be determined," versioned classification bindings, and a version-and-approve workflow. Build once; templates and stain SOPs load as data.
- **Multi-tenant from the foundation** (G1 identity). Never a single-lab build with tenancy bolted on later.
- **One reflex/ancillary engine.** Reflex stains, IHC panels, deeper levels, referral routing, and the molecular send-out prompt are the *same engine* pointed at different test types. It writes the concise 3–5-item recommendation section.
- **The core loop is the first thing we prove and the first thing we show:** *log in → capture → speak → transcribe → suggest template (human confirms) → auto-fill values → pathologist reviews → validates/corrects → signs.* Template is **auto-suggested, human-confirmed** (never blind-routed across 130); fields are **auto-filled, human-validated.**
- **Pseudonymize before any external AI call.** Strip patient identifiers before dictation/scan data leaves the environment.
- **Everything deployable, maintainable, secure, reviewable, scalable.** No shortcuts, no "vibe code." Security, audit, and the advisory guardrail are checked before any release.

---

## 6. Hard NO list
- ✗ No diagnosing or interpreting patient images/specimens. No "benign/malignant" calls. (G1)
- ✗ No reproducing, scraping, or embedding CAP/WHO/AJCC copyrighted content. Logic only. (G3)
- ✗ No owner access into pathologists' private workspaces. (G2)
- ✗ No signed patient report existing outside the audited clinical record. (G2)
- ✗ No expanding Phase 1 to all templates or all ten agents. (G4)
- ✗ No zero-knowledge claims that the AI-assist model contradicts. (G5)
- ✗ No molecular data-entry sections bloating diagnostic templates. (G6)
- ✗ No fabricated findings, values, or citations. (G8)
- ✗ No VAT on Maxpromo invoices — Kleinunternehmer §19 UStG. State: *"Gemäß §19 UStG wird keine Umsatzsteuer berechnet."*

---

## 7. Quality gates (definition of done for any module)
Before anything is accepted: security validation · access-isolation check · audit-trail present for clinical records · advisory-frame check (no diagnostic overreach, AI content marked) · copyright check (no copied protocol content) · mobile + UX review · architecture/tech-debt review. Cowork inspects against this header.

---

## 8. Reference tech stack (default, confirmed)
Next.js (App Router) · TypeScript · Tailwind — on **Vercel** (GitHub CI/CD). Postgres on **Neon** · Drizzle ORM. Auth.js + TOTP 2FA (authenticator app, no SMS). Object storage: **Cloudflare R2** (audio, scans, PDFs). AI: **OpenAI** (Whisper transcription + structuring), provider kept swappable, pseudonymized input. Notifications: **Telegram bot** (free). Domain/DNS/WAF: **Cloudflare**. PDF generation off-Vercel (dedicated worker) to avoid serverless limits.

---

## 9. Locked vs. Open
**Locked:** name/domain (X-PATH / xpath.report) · advisory frame (G1) · private-vs-clinical principle (G2) · logic-only templates (G3) · Phase-1 scope discipline (G4) · morphology+IHC scope, molecular separate (G6) · multi-tenant foundation · the 38-antibody register + HER2 IHC→Dual-ISH in-house workflow · reflex engine as differentiator · EN/FR + regional.

**Open (to confirm, do not block Phase-1 planning):** PD-L1 clone (SP263 / SP142) & scoring context · TTF-1 clone · whether the LIS is Olivya, Roche navify, both, or neither, and its API · data-hosting jurisdiction (given Dubai holding / Cameroon operation) · commercial model & code-ownership on handover.

---

## 10. Standing rule
**Nothing is built until the Product Owner (Marcel) says start.** This header is loaded first, every time. When in doubt, stop and flag — do not drift, do not invent, do not simplify a critical detail.
