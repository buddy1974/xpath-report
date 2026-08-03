import Link from "next/link";
import { redirect } from "next/navigation";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { clinicalRecords, cases } from "@/db/schema";
import { getLocale } from "@/lib/i18n-server";
import { STRINGS, RECORD_STATUS_LABELS, t } from "@/lib/i18n";

export default async function ArchivePage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");
  const userId = (session.user as any).id as string;
  const locale = await getLocale();

  const sp = await searchParams;
  const q = sp?.q?.trim();

  // Own signed records only, for now — "files into the pathologist's
  // archive" (Header roadmap M6). Cross-pathologist/manager visibility
  // into released records (lib/access.ts:canReadClinicalRecord already
  // allows it) is a real feature, deliberately not built into the UI
  // yet — M6's scope is the signing loop, not an operations dashboard.
  const rows = await db
    .select({ record: clinicalRecords, accession: cases.accession })
    .from(clinicalRecords)
    .innerJoin(cases, eq(cases.id, clinicalRecords.caseId))
    .where(
      and(
        eq(clinicalRecords.tenantId, (session as any).tenantId),
        eq(clinicalRecords.signedByPathologistId, userId),
        q
          ? or(
              ilike(cases.accession, `%${q}%`),
              ilike(sql`${clinicalRecords.content}->>'templateTitle'`, `%${q}%`),
            )
          : undefined,
      ),
    )
    .orderBy(desc(clinicalRecords.releasedAt));

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">{t(STRINGS.archiveHeading, locale)}</h1>
      <p className="text-neutral-600 mt-1 text-sm">{t(STRINGS.archiveBody, locale)}</p>

      <form method="get" className="mt-4 max-w-sm">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder={t(STRINGS.archiveSearchPlaceholder, locale)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-petrol focus:ring-1 focus:ring-petrol/30 outline-none"
        />
      </form>

      {q && rows.length === 0 && (
        <p className="mt-6 text-sm text-neutral-500">
          {t(STRINGS.noSearchMatchPrefix, locale)} &quot;{q}&quot;.{" "}
          <Link href="/dashboard/archive" className="text-petrol underline">
            {t(STRINGS.clearSearch, locale)}
          </Link>
        </p>
      )}
      {!q && rows.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center">
          <h2 className="font-semibold text-petrol">{t(STRINGS.archiveEmptyTitle, locale)}</h2>
          <p className="text-sm text-neutral-500 mt-1 max-w-sm mx-auto">{t(STRINGS.archiveEmptyBody, locale)}</p>
          <Link
            href="/dashboard"
            className="inline-block mt-4 rounded-lg bg-petrol px-4 py-2 text-white text-sm font-semibold shadow-sm hover:bg-petrol-deep transition-colors"
          >
            {t(STRINGS.archiveEmptyCta, locale)}
          </Link>
        </div>
      )}

      <ul className="mt-6 space-y-2">
        {rows.map(({ record, accession }) => {
          const content = record.content as { templateTitle: string };
          const statusLabel = t(RECORD_STATUS_LABELS[record.status] ?? RECORD_STATUS_LABELS.released, locale);
          return (
            <li key={record.id}>
              <Link
                href={`/dashboard/archive/${record.id}`}
                className="block rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-petrol/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-petrol">{content.templateTitle}</span>
                  <span className="text-xs text-neutral-400">{record.releasedAt.toLocaleString?.() ?? String(record.releasedAt)}</span>
                </div>
                <p className="text-sm text-neutral-500 mt-1">
                  {t(STRINGS.accessionWord, locale)} {accession} · v{record.version} · {statusLabel}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
