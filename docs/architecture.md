# X-PATH — Architecture

## Stack
Next.js (App Router) · TypeScript · Tailwind — Vercel (GitHub CI/CD).
Postgres on Neon · Drizzle ORM. Auth.js + TOTP 2FA (authenticator app, no SMS).
Cloudflare R2 (audio/scans/PDFs). OpenAI (Whisper transcription, required —
Anthropic has no speech-to-text API) + structuring swappable OpenAI/Anthropic,
pseudonymised input either way — Session 02+. Cloudflare DNS/WAF. PDF
generation off-Vercel (dedicated worker).

**No notification/alert/digest/reporting layer of any kind into pathologist
activity, for the owner or anyone but the pathologist themself (Header G2a).**
This is an infrastructure-level exclusion, not a feature deferral — it rules
out the *class* of service (bots, admin dashboards, digests), not just a
particular vendor. Telegram was struck for this reason and must not
reappear under any other name.

## The two data domains (Header G2) — the core architectural decision
1. **Private workspace** (`private_workspace_items`) — per-user, owner-only.
   Enforced by `lib/access.ts:assertWorkspaceOwner`. No role overrides it.
2. **Clinical record of truth** (`clinical_records` + `audit_log`) — released
   reports; immutable (amend = new version); every action audited.

A draft lives in the private domain; at sign-out it becomes a clinical record.

## Multi-tenancy (Header G1)
Every row is tenant-scoped. `lib/access.ts:assertSameTenant` guards all access.
Built for many tenants from commit one; BettaHealth = tenant 1.

## Access isolation
`lib/access.ts` is the single choke-point. No data path reads clinical or
workspace data without passing the actor through the guards. Enforced in code,
not convention.

## Engine, not forms (Session 02+)
Templates are versioned data/configuration, not code. Tiered fields
(core/conditional/non-core), single + multi-select, controlled vocabularies,
"cannot be determined", versioned classification bindings, version-and-approve
workflow. One reflex/ancillary engine (stains + IHC panels + send-out prompt).
