// X-PATH — capture/dictate screen (North-Star §4.4, restored to its own
// route). /dashboard is now the Home/Summary screen (§4.1); the capture
// loop lives here so Home can stay a real summary, not a wrapper around
// the recorder. Onboarding checklist + capture prompt moved with it.
// DL-051: Dictate stays a one-tap capture action (Marcel's explicit
// decision) — the list of past dictations/notes/drafts moved to its own
// Workspace screen, linked below, rather than living at the bottom of
// this page as before.
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PrivacyIndicator } from "@/components/privacy-indicator";
import { OnboardingChecklist } from "@/components/onboarding-checklist";
import { getLocale } from "@/lib/i18n-server";
import { STRINGS, t } from "@/lib/i18n";
import { Recorder } from "./recorder";
import { OcrScan } from "@/components/ocr-scan";

export default async function DictatePage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");
  if ((session as any).role !== "pathologist") redirect("/dashboard");

  const locale = await getLocale();

  return (
    <div>
      <p className="text-xs font-bold tracking-widest uppercase text-petrol">{t(STRINGS.navDictateTitle, locale)}</p>
      <h1 className="text-2xl font-semibold mt-1">{t(STRINGS.dictateHeading, locale)}</h1>
      <p className="text-neutral-600 mt-1">{t(STRINGS.dictatePrivacyLine, locale)}</p>
      <div className="mt-3">
        <PrivacyIndicator locale={locale} />
      </div>

      <div className="mt-6">
        <OnboardingChecklist locale={locale} />
      </div>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-neutral-600 mb-4">{t(STRINGS.capturePrompt, locale)}</p>
        <Recorder locale={locale} />
      </div>

      <div className="mt-6">
        <OcrScan locale={locale} />
      </div>

      <Link
        href="/dashboard/workspace"
        className="mt-10 flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-petrol/30 transition-all max-w-xl"
      >
        <span className="text-sm text-neutral-600">{t(STRINGS.workspaceBody, locale)}</span>
        <span className="text-sm font-semibold text-petrol shrink-0 ml-3">{t(STRINGS.navWorkspaceTitle, locale)} →</span>
      </Link>
    </div>
  );
}
