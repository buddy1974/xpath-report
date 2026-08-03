"use client";

// Reopens the onboarding checklist (DL-044) — it never fully disappears,
// just tucks away; this brings it back.
import { STRINGS, t, type Locale } from "@/lib/i18n";
import { ONBOARDING_STORAGE_KEY } from "./onboarding-checklist";

export function HelpButton({ locale }: { locale: Locale }) {
  return (
    <button
      type="button"
      title={t(STRINGS.helpIconLabel, locale)}
      aria-label={t(STRINGS.helpIconLabel, locale)}
      onClick={() => {
        localStorage.removeItem(ONBOARDING_STORAGE_KEY);
        window.location.href = "/dashboard";
      }}
      className="w-6 h-6 rounded-full border border-petrol/30 text-petrol text-xs font-bold flex items-center justify-center hover:bg-petrol/10 transition-colors shrink-0"
    >
      ?
    </button>
  );
}
