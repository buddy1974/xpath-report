# X-PATH — Workflow Map

## The core loop (the thing Session 02+ proves end to end — Header §5)
log in → capture case → speak (dictate) → transcribe → suggest template
(human confirms) → auto-fill values → pathologist reviews → validates/
corrects → signs → report enters `clinical_records` (audited).

## Session 01 (this session) — foundation only
```
log in ──► TOTP verify ──► role-aware dashboard (empty)
```
No dictation, no templates, no AI yet (Header G4 — scope discipline).
What Session 01 proves: tenant isolation, workspace/clinical separation,
audit-log presence, auth + 2FA end to end.

## Data lifecycle of a report (Session 02+ target)
```
draft (private_workspace_items, owner-only)
   │  pathologist reviews & validates AI-suggested fields
   ▼
sign-out ──► clinical_records (status=released) + audit_log entry
   │
   ▼
amendment (new version, never overwrite) + audit_log entry
```

## Roles touching the loop
- **pathologist** — dictates, reviews, signs. Owns their private workspace.
- **technician** — case intake / specimen data, no sign-out rights.
- **manager** — operational visibility into released records, not private
  workspaces.
- **administrator** — tenant/user administration, not private workspaces
  (Header G2 — no role override on workspace privacy).

## Out of scope until named sessions unlock them (Header G4)
Templates · voice/dictation/transcription · OCR · reflex/ancillary engine ·
IHC/antibody logic · PDF generation · LIS (Olivya) integration ·
notifications (Telegram).
