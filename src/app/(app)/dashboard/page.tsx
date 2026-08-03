// Role-aware landing. Pathologists land directly on the capture/dictate
// screen (Header mission: "log in → capture → speak → transcribe →
// suggest template → auto-fill → review → sign" is the core loop and the
// first thing shown, DL-043) — other roles keep their existing view,
// visually elevated to match.
import Link from "next/link";
import { redirect } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { privateWorkspaceItems } from "@/db/schema";
import { PrivacyIndicator } from "@/components/privacy-indicator";
import { OnboardingChecklist } from "@/components/onboarding-checklist";
import { getLocale } from "@/lib/i18n-server";
import { STRINGS, VIEW_TITLES, VIEW_BLURBS, t } from "@/lib/i18n";
import { Recorder } from "./dictate/recorder";

type Role = "pathologist" | "technician" | "manager" | "administrator";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");

  const role = (session as any).role as Role;
  const userId = (session.user as any).id as string;
  const locale = await getLocale();

  if (role === "pathologist") {
    const dictations = await db
      .select()
      .from(privateWorkspaceItems)
      .where(and(eq(privateWorkspaceItems.ownerId, userId), eq(privateWorkspaceItems.kind, "dictation")))
      .orderBy(desc(privateWorkspaceItems.updatedAt))
      .limit(20);

    return (
      <div>
        <p className="text-xs font-bold tracking-widest uppercase text-petrol">
          {t(VIEW_TITLES.pathologist, locale)}
        </p>
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
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              {t(STRINGS.yourDictations, locale)}
            </h2>
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

  const viewTitle = t(VIEW_TITLES[role], locale);
  const viewBlurb = t(VIEW_BLURBS[role], locale);

  return (
    <div>
      <h1 className="text-2xl font-semibold">{viewTitle}</h1>
      <p className="text-neutral-600 mt-1">{viewBlurb}</p>
      {role === "administrator" && (
        <p className="text-sm text-neutral-500 mt-1">{t(STRINGS.adminIntroExtra, locale)}</p>
      )}

      <Link
        href="/dashboard/templates"
        className="mt-6 flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-petrol/30 transition-all"
      >
        <span className="w-11 h-11 rounded-xl bg-petrol/10 text-petrol flex items-center justify-center shrink-0">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path d="M4 3.5A1.5 1.5 0 0 1 5.5 2h5.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12A1.5 1.5 0 0 1 15 5.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 4 16.5v-13Z" />
          </svg>
        </span>
        <span>
          <span className="font-semibold text-petrol">{t(STRINGS.navTemplatesTitle, locale)}</span>
          <p className="text-sm text-neutral-500 mt-1">{t(STRINGS.navTemplatesBlurb, locale)}</p>
        </span>
      </Link>

      {role === "administrator" && (
        <div className="mt-10 max-w-xl">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            {t(STRINGS.teasersSectionHeading, locale)}
          </h2>
          <ul className="mt-3 space-y-2">
            {[
              STRINGS.teaserBilling,
              STRINGS.teaserNavify,
              STRINGS.teaserReferring,
              STRINGS.teaserSecondOpinion,
              STRINGS.teaserAddTenant,
              STRINGS.teaserRegistryFhir,
            ].map((teaser) => {
              const label = t(teaser, locale);
              return (
                <li key={label}>
                  <button
                    type="button"
                    disabled
                    title={`${label} ${t(STRINGS.teaserPlannedSuffix, locale)}`}
                    className="w-full text-left rounded-xl border border-dashed border-neutral-300 p-3 text-sm text-neutral-400 bg-neutral-50 cursor-not-allowed"
                  >
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
