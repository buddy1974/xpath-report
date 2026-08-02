# X-PATH — Decision Log

Format: DL-nnn · decision · rationale.

- **DL-001 — Two separate data domains (private workspace vs clinical record).**
  Dr. Ivo requires pathologists' private professional space to be inaccessible
  to anyone, including him; a signed patient report must remain in the audited
  medical record of truth. Modelled as two tables with different access rules.
- **DL-002 — Audit log is append-only.** Legal/ISO 15189 requirement; no update
  or delete path in code (`lib/audit.ts` write-only).
- **DL-003 — Multi-tenant from the foundation.** X-PATH expands beyond
  BettaHealth; retrofitting tenancy is a rebuild. Every row tenant-scoped.
- **DL-004 — Advisory frame.** Platform never interprets patient images or
  originates a diagnosis. Keeps X-PATH out of IVDR/FDA device scope and off the
  pathologist's medico-legal responsibility.
- **DL-005 — Template logic only, not content.** CAP/WHO/AJCC text is
  copyrighted. Content comes from client originals, ICCR (free), or in-house
  authoring; only structural logic is reused.
- **DL-006 — Strong encryption + isolation, not zero-knowledge.** The AI must
  read dictation to assist; search/backup must work. Promise: private from other
  humans, never browsed — not "mathematically unreadable".
- **DL-007 — Scope discipline.** Phase 1 = engine + 3–5 real templates; not 130
  templates, not 10 agents.
- **DL-008 — Auth: TOTP authenticator, not SMS.** Free, works with no mobile
  signal in the lab, nothing to intercept.
