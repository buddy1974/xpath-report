// X-PATH — turnaround-time dashboard (DL-055). Admin-only. Aggregated
// stats ONLY, grouped by template — never per-case, never per-
// pathologist. This measures the system's speed, not a person's
// judgment (Header G1: never turn operational metrics into
// surveillance of a pathologist's work).
//
// A real, deliberate G2 judgment call, documented here and in
// docs/decision-log.md DL-055: computing this requires reading
// `privateWorkspaceItems.createdAt` (the originating dictation's
// timestamp) for signed records that carry a `dictationId`. That query
// selects ONLY the `id` and `createdAt` columns — never `body`,
// `data`, or `title` — so no workspace CONTENT is ever read, only a
// timestamp used to compute an elapsed-time statistic. Results are
// grouped by template only, with no per-case drill-down, matching the
// instruction's own explicit framing that this must stay
// aggregate-only. If this reasoning ever needs revisiting, that's a
// call for Marcel/Dr. Ivo, not something to silently expand later.
import { redirect } from "next/navigation";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { clinicalRecords, privateWorkspaceItems } from "@/db/schema";
import { getLocale } from "@/lib/i18n-server";
import { STRINGS, t } from "@/lib/i18n";
import { TriageBadge, triageForHours } from "@/components/triage-badge";

export default async function TatDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");
  if ((session as any).role !== "administrator") redirect("/dashboard");

  const tenantId = (session as any).tenantId as string;
  const locale = await getLocale();

  const records = await db
    .select({ content: clinicalRecords.content, releasedAt: clinicalRecords.releasedAt })
    .from(clinicalRecords)
    .where(eq(clinicalRecords.tenantId, tenantId));

  const dictationIds = records
    .map((r) => (r.content as { dictationId?: string | null })?.dictationId)
    .filter((id): id is string => !!id);

  // Timestamps only — never body/data/title (see file header).
  const dictationTimestamps =
    dictationIds.length === 0
      ? []
      : await db
          .select({ id: privateWorkspaceItems.id, createdAt: privateWorkspaceItems.createdAt })
          .from(privateWorkspaceItems)
          .where(inArray(privateWorkspaceItems.id, dictationIds));
  const createdAtById = new Map(dictationTimestamps.map((d) => [d.id, d.createdAt]));

  const byTemplate = new Map<string, number[]>();
  for (const r of records) {
    const content = r.content as { dictationId?: string | null; templateTitle?: string };
    if (!content.dictationId) continue;
    const dictationCreatedAt = createdAtById.get(content.dictationId);
    if (!dictationCreatedAt) continue;
    const hours = (new Date(r.releasedAt).getTime() - new Date(dictationCreatedAt).getTime()) / (1000 * 60 * 60);
    if (hours < 0) continue; // defensive — shouldn't happen, never show a negative TAT
    const templateTitle = content.templateTitle ?? "—";
    if (!byTemplate.has(templateTitle)) byTemplate.set(templateTitle, []);
    byTemplate.get(templateTitle)!.push(hours);
  }

  const stats = [...byTemplate.entries()]
    .map(([templateTitle, hoursList]) => {
      const sorted = [...hoursList].sort((a, b) => a - b);
      const avg = hoursList.reduce((a, b) => a + b, 0) / hoursList.length;
      const median = sorted[Math.floor(sorted.length / 2)];
      return { templateTitle, count: hoursList.length, avg, median };
    })
    .sort((a, b) => b.count - a.count);

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">{t(STRINGS.tatHeading, locale)}</h1>
      <p className="text-neutral-600 mt-1.5">{t(STRINGS.tatBody, locale)}</p>

      {stats.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">{t(STRINGS.tatEmpty, locale)}</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {stats.map((s) => (
            <li key={s.templateTitle} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-neutral-800">{s.templateTitle}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <TriageBadge level={triageForHours(s.avg)} locale={locale} />
                  <span className="text-xs text-neutral-400">
                    {s.count} {t(STRINGS.tatCountSuffix, locale)}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-end gap-6">
                <div>
                  <p className="text-2xl font-bold text-petrol">
                    {s.avg.toFixed(1)}
                    <span className="text-sm font-medium">{t(STRINGS.tatHoursSuffix, locale)}</span>
                  </p>
                  <p className="text-[11px] uppercase tracking-wide text-neutral-400">{t(STRINGS.tatAvgLabel, locale)}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-600">
                    {s.median.toFixed(1)}
                    <span className="text-sm font-medium">{t(STRINGS.tatHoursSuffix, locale)}</span>
                  </p>
                  <p className="text-[11px] uppercase tracking-wide text-neutral-400">{t(STRINGS.tatMedianLabel, locale)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
