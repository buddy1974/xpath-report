/**
 * X-PATH — private-workspace indicator (M7, Header G2)
 * ------------------------------------------------------------------
 * Worded carefully, not just reassuringly: "encrypted" here means what's
 * actually true today — encrypted in transit (TLS) and at rest by the
 * underlying database, per PROJECT_HEADER G5 ("realistic security, not
 * zero-knowledge"). It does NOT mean per-value application-layer
 * encryption like TOTP secrets get (src/lib/crypto.ts) — this is private
 * workspace text/structured data, not a secret credential. The real,
 * load-bearing guarantee is the access-control one: owner-only reads are
 * enforced in code (assertWorkspaceOwner), with no role override — not
 * "hidden in the UI."
 */
import { STRINGS, t, type Locale } from "@/lib/i18n";

export function PrivacyIndicator({ locale = "en" }: { locale?: Locale }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 shrink-0">
        <path
          fillRule="evenodd"
          d="M10 1a4 4 0 0 0-4 4v2H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-1V5a4 4 0 0 0-4-4Zm2 6V5a2 2 0 1 0-4 0v2h4Z"
          clipRule="evenodd"
        />
      </svg>
      {t(STRINGS.privacyIndicatorText, locale)}
    </div>
  );
}
