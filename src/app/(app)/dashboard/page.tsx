// X-PATH — Home / Summary screen for pathologists (North-Star §4.1).
// Card-stack landing: greeting, recent work, real activity trend, a few
// factual learning cards, and a recommendation line. The capture loop
// itself lives at /dashboard/dictate (its own route again, see that
// file's header comment). Other roles keep their existing view.
import Link from "next/link";
import { redirect } from "next/navigation";
import { and, desc, eq, gte } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { privateWorkspaceItems, clinicalRecords } from "@/db/schema";
import { getTemplate } from "@/lib/templates";
import { getLocale } from "@/lib/i18n-server";
import { STRINGS, VIEW_TITLES, VIEW_BLURBS, t } from "@/lib/i18n";

type Role = "pathologist" | "technician" | "manager" | "administrator";

const WEEKS = 8;

function startOfWeek(d: Date): string {
  const date = new Date(d);
  const day = date.getUTCDay();
  const diff = (day + 6) % 7; // Monday-start week
  date.setUTCDate(date.getUTCDate() - diff);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}

const LEARNING_CARDS = [
  { titleKey: STRINGS.homeLearnHer2Title, bodyKey: STRINGS.homeLearnHer2Body },
  { titleKey: STRINGS.homeLearnGradeTitle, bodyKey: STRINGS.homeLearnGradeBody },
  { titleKey: STRINGS.homeLearnCannotDetermineTitle, bodyKey: STRINGS.homeLearnCannotDetermineBody },
  { titleKey: STRINGS.homeLearnAiSuggestedTitle, bodyKey: STRINGS.homeLearnAiSuggestedBody },
];

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");

  const role = (session as any).role as Role;
  const userId = (session.user as any).id as string;
  const locale = await getLocale();

  if (role === "pathologist") {
    const drafts = await db
      .select()
      .from(privateWorkspaceItems)
      .where(and(eq(privateWorkspaceItems.ownerId, userId), eq(privateWorkspaceItems.kind, "report_draft")))
      .orderBy(desc(privateWorkspaceItems.updatedAt))
      .limit(5);

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - WEEKS * 7);
    const recentSigned = await db
      .select({ releasedAt: clinicalRecords.releasedAt })
      .from(clinicalRecords)
      .where(and(eq(clinicalRecords.signedByPathologistId, userId), gte(clinicalRecords.releasedAt, sinceDate)));

    // Danger-zone alerts (North-Star §4.1/§4.5, R-034) — real data only:
    // drafts and signed records where the pathologist set the urgent
    // flag themselves. Nothing here is inferred.
    const allDrafts = await db
      .select()
      .from(privateWorkspaceItems)
      .where(and(eq(privateWorkspaceItems.ownerId, userId), eq(privateWorkspaceItems.kind, "report_draft")));
    const flaggedDrafts = allDrafts
      .map((d) => {
        const data = d.data as { templateId?: string; urgentFlag?: { urgent: boolean; severity: "attention" | "critical" } } | null;
        if (!data?.urgentFlag?.urgent) return null;
        const template = data.templateId ? getTemplate(data.templateId) : undefined;
        return { id: d.id, title: template?.title ?? "Draft", severity: data.urgentFlag.severity, href: `/dashboard/review/${d.id}` };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    const signedRows = await db
      .select({ id: clinicalRecords.id, content: clinicalRecords.content })
      .from(clinicalRecords)
      .where(eq(clinicalRecords.signedByPathologistId, userId));
    const flaggedSigned = signedRows
      .map((r) => {
        const content = r.content as { templateTitle?: string; urgentFlag?: { urgent: boolean; severity: "attention" | "critical" } };
        if (!content?.urgentFlag?.urgent) return null;
        return { id: r.id, title: content.templateTitle ?? "Record", severity: content.urgentFlag.severity, href: `/dashboard/archive/${r.id}` };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    const alerts = [...flaggedDrafts, ...flaggedSigned];

    const bucketed = new Map<string, number>();
    const weekLabels: string[] = [];
    for (let i = WEEKS - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * 7);
      const key = startOfWeek(d);
      weekLabels.push(key);
      bucketed.set(key, 0);
    }
    for (const r of recentSigned) {
      const key = startOfWeek(new Date(r.releasedAt));
      if (bucketed.has(key)) bucketed.set(key, (bucketed.get(key) ?? 0) + 1);
    }
    const maxCount = Math.max(1, ...weekLabels.map((k) => bucketed.get(k) ?? 0));
    const totalSigned = recentSigned.length;

    return (
      <div className="max-w-3xl">
        <p className="text-xs font-bold tracking-widest uppercase text-petrol">{t(VIEW_TITLES.pathologist, locale)}</p>
        <h1 className="text-3xl font-bold tracking-tight mt-1">
          {t(STRINGS.homeGreetingPrefix, locale)} {session.user.name ?? session.user.email}
        </h1>
        <p className="text-neutral-500 text-sm mt-1">🔒 {t(STRINGS.privacyIndicatorText, locale)}</p>

        {/* Recommendation line */}
        <div className="mt-6 rounded-2xl border border-petrol/20 bg-gradient-to-br from-petrol/5 to-transparent p-5 shadow-sm">
          <p className="text-sm font-medium text-petrol">
            {drafts.length > 0
              ? `${drafts.length} ${t(STRINGS.homeRecommendationDraftsSuffix, locale)}`
              : t(STRINGS.homeRecommendationAllClear, locale)}
          </p>
        </div>

        {/* Danger-zone alerts */}
        {alerts.length > 0 && (
          <section className="mt-4 space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 px-1">
              {t(STRINGS.homeAlertsHeading, locale)}
            </h2>
            {alerts.map((a) => (
              <Link
                key={a.id}
                href={a.href}
                className={`block rounded-xl border p-4 transition-shadow hover:shadow-sm ${
                  a.severity === "critical" ? "border-red-300 bg-red-50" : "border-amber-300 bg-amber-50"
                }`}
              >
                <p className={`font-semibold text-sm ${a.severity === "critical" ? "text-red-800" : "text-amber-800"}`}>
                  {t(STRINGS.urgentFlagBannerPrefix, locale)}{" "}
                  {t(a.severity === "critical" ? STRINGS.urgentFlagSeverityCritical : STRINGS.urgentFlagSeverityAttention, locale)} —{" "}
                  {a.title}
                </p>
              </Link>
            ))}
          </section>
        )}

        {/* Recent work */}
        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-petrol">{t(STRINGS.homeRecentWorkHeading, locale)}</h2>
          {drafts.length === 0 ? (
            <p className="text-sm text-neutral-500 mt-2">{t(STRINGS.homeRecentWorkEmpty, locale)}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {drafts.map((d) => {
                const data = d.data as { templateId?: string } | null;
                const template = data?.templateId ? getTemplate(data.templateId) : undefined;
                return (
                  <li
                    key={d.id}
                    className="rounded-xl border border-neutral-200 p-4 flex items-center justify-between hover:border-petrol/30 hover:shadow-sm transition-all"
                  >
                    <span className="text-sm font-medium text-neutral-800">{template?.title ?? "Draft"}</span>
                    <Link href={`/dashboard/review/${d.id}`} className="text-sm font-semibold text-petrol shrink-0 ml-3">
                      {t(STRINGS.homeRecentWorkCta, locale)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Trends */}
        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-petrol">{t(STRINGS.homeTrendsHeading, locale)}</h2>
          <p className="text-sm text-neutral-500 mt-1">{t(STRINGS.homeTrendsBody, locale)}</p>
          {totalSigned === 0 ? (
            <p className="text-sm text-neutral-500 mt-4">{t(STRINGS.homeTrendsEmpty, locale)}</p>
          ) : (
            <div className="mt-5 flex items-end gap-2 h-24">
              {weekLabels.map((key) => {
                const count = bucketed.get(key) ?? 0;
                const heightPct = Math.max(6, Math.round((count / maxCount) * 100));
                return (
                  <div key={key} className="flex-1 flex flex-col items-center justify-end h-full" title={`${key}: ${count}`}>
                    <div
                      className={`w-full rounded-t-md ${count > 0 ? "bg-petrol" : "bg-neutral-100"}`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Learning */}
        <section className="mt-6">
          <h2 className="text-lg font-semibold text-petrol px-1">{t(STRINGS.homeLearningHeading, locale)}</h2>
          <div className="mt-3 grid sm:grid-cols-2 gap-4">
            {LEARNING_CARDS.map((card, i) => (
              <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                <p className="font-semibold text-hema text-sm">{t(card.titleKey, locale)}</p>
                <p className="text-sm text-neutral-600 mt-2 leading-relaxed">{t(card.bodyKey, locale)}</p>
              </div>
            ))}
          </div>
        </section>
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
