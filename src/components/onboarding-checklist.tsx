"use client";

/**
 * X-PATH — first-time onboarding checklist (DL-044)
 * ------------------------------------------------------------------
 * Static guidance only — describes the workflow, doesn't track real
 * per-step completion (that would need backend state, out of scope for
 * a presentation-layer pass). Dismiss state lives in localStorage only;
 * never fully disappears, reachable again via the nav's "?" button.
 */
import { useEffect, useState } from "react";
import { STRINGS, t, type Locale } from "@/lib/i18n";

export const ONBOARDING_STORAGE_KEY = "xpath_onboarding_dismissed";

export function OnboardingChecklist({ locale }: { locale: Locale }) {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setMounted(true);
    setDismissed(localStorage.getItem(ONBOARDING_STORAGE_KEY) === "1");
  }, []);

  if (!mounted || dismissed) return null;

  return (
    <div className="rounded-2xl border border-petrol/20 bg-gradient-to-br from-petrol/5 to-transparent p-5 mb-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-semibold text-petrol">{t(STRINGS.onboardingTitle, locale)}</h2>
        <button
          type="button"
          onClick={() => {
            localStorage.setItem(ONBOARDING_STORAGE_KEY, "1");
            setDismissed(true);
          }}
          className="text-xs font-semibold text-neutral-400 hover:text-petrol shrink-0"
        >
          {t(STRINGS.onboardingDismiss, locale)}
        </button>
      </div>
      <ol className="mt-3 space-y-1.5 text-sm text-neutral-700 list-decimal list-inside">
        <li>{t(STRINGS.onboardingStep1, locale)}</li>
        <li>{t(STRINGS.onboardingStep2, locale)}</li>
        <li>{t(STRINGS.onboardingStep3, locale)}</li>
        <li>{t(STRINGS.onboardingStep4, locale)}</li>
      </ol>
    </div>
  );
}
