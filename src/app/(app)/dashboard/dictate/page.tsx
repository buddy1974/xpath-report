// X-PATH — capture/dictate screen (North-Star §4.4, restored to its own
// route). /dashboard is now the Home/Summary screen (§4.1); the capture
// loop lives here so Home can stay a real summary, not a wrapper around
// the recorder. Onboarding checklist + capture prompt moved with it.
import Link from "next/link";
import { redirect } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { privateWorkspaceItems } from "@/db/schema";
import { PrivacyIndicator } from "@/components/privacy-indicator";
import { OnboardingChecklist } from "@/components/onboarding-checklist";
import { getLocale } from "@/lib/i18n-server";
import { STRINGS, t } from "@/lib/i18n";
import { Recorder } from "./recorder";

export default async function DictatePage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");
  if ((session as any).role !== "pathologist") redirect("/dashboard");

  const userId = (session.user as any).id as string;
  const locale = await getLocale();

  const dictations = await db
    .select()
    .from(privateWorkspaceItems)
    .where(and(eq(privateWorkspaceItems.ownerId, userId), eq(privateWorkspaceItems.kind, "dictation")))
    .orderBy(desc(privateWorkspaceItems.updatedAt))
    .limit(20);

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

      {dictations.length > 0 && (
        <div className="mt-10 max-w-xl">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">{t(STRINGS.yourDictations, locale)}</h2>
          <ul className="mt-3 space-y-2">
            {dictations.map((d) => (
              <li
                key={d.id}
                className="rounded-xl border border-neutral-200 bg-white p-4 flex items-center justify-between shadow-sm hover:shadow-md hover:border-petrol/30 transition-all"
              >
                <span className="text-sm text-neutral-600 truncate max-w-xs">
                  {d.body ? d.body : t(STRINGS.notTranscribedPlaceholder, locale)}
                </span>
                <Link href={`/dashboard/structure/${d.id}`} className="text-sm font-semibold text-petrol shrink-0 ml-3">
                  {t(STRINGS.structureLink, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
