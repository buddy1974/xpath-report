// X-PATH — Announcements admin (DL-054). Administrator-only authoring/
// publishing/management. The public-facing ticker + detail page live
// elsewhere (components/announcement-ticker.tsx, this folder's
// [id]/page.tsx) and are visible to every role once published.
import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import { getLocale } from "@/lib/i18n-server";
import { STRINGS, t } from "@/lib/i18n";
import { saveAnnouncement, unpublishAnnouncement } from "./actions";

const CATEGORY_BADGE: Record<string, string> = {
  news: "bg-neutral-100 text-neutral-600",
  operational: "bg-amber-100 text-amber-800",
  emergency: "bg-red-100 text-red-700",
};

export default async function AnnouncementsAdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ edit?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");
  if ((session as any).role !== "administrator") redirect("/dashboard");

  const tenantId = (session as any).tenantId as string;
  const locale = await getLocale();
  const params = await searchParams;
  const editId = params?.edit;

  const all = await db
    .select()
    .from(announcements)
    .where(eq(announcements.tenantId, tenantId))
    .orderBy(desc(announcements.createdAt));
  const editing = editId ? all.find((a) => a.id === editId) : undefined;

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">{t(STRINGS.announcementsHeading, locale)}</h1>
      <p className="text-neutral-600 mt-1.5">{t(STRINGS.announcementsBody, locale)}</p>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-petrol">
          {editing ? t(STRINGS.announcementEditLink, locale) : t(STRINGS.announcementNewButton, locale)}
        </h2>
        <form action={saveAnnouncement} className="mt-4 space-y-4" key={editing?.id ?? "new"}>
          {editing && <input type="hidden" name="id" value={editing.id} />}

          <label className="block text-sm font-semibold">
            {t(STRINGS.announcementTitleLabel, locale)}
            <input
              name="title"
              required
              defaultValue={editing?.title}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal"
            />
          </label>

          <label className="block text-sm font-semibold">
            {t(STRINGS.announcementCategoryLabel, locale)}
            <select
              name="category"
              defaultValue={editing?.category ?? "news"}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal bg-white"
            >
              <option value="news">{t(STRINGS.announcementCategoryNews, locale)}</option>
              <option value="operational">{t(STRINGS.announcementCategoryOperational, locale)}</option>
              <option value="emergency">{t(STRINGS.announcementCategoryEmergency, locale)}</option>
            </select>
          </label>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block text-sm font-semibold">
              {t(STRINGS.announcementTickerEnLabel, locale)}
              <input
                name="tickerTextEn"
                required
                defaultValue={editing?.tickerTextEn}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal"
              />
            </label>
            <label className="block text-sm font-semibold">
              {t(STRINGS.announcementTickerFrLabel, locale)}
              <input
                name="tickerTextFr"
                required
                defaultValue={editing?.tickerTextFr}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal"
              />
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block text-sm font-semibold">
              {t(STRINGS.announcementBodyEnLabel, locale)}
              <textarea
                name="bodyEn"
                required
                rows={4}
                defaultValue={editing?.bodyEn}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal"
              />
            </label>
            <label className="block text-sm font-semibold">
              {t(STRINGS.announcementBodyFrLabel, locale)}
              <textarea
                name="bodyFr"
                required
                rows={4}
                defaultValue={editing?.bodyFr}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal"
              />
            </label>
          </div>

          <label className="block text-sm font-semibold">
            {t(STRINGS.announcementLinkLabel, locale)}
            <input
              name="link"
              type="url"
              defaultValue={editing?.link ?? ""}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal"
            />
          </label>

          <div className="rounded-xl border border-petrol/20 bg-petrol/5 p-4 space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" name="publishNow" defaultChecked={editing?.status === "published"} />
              {t(STRINGS.announcementPublishNowLabel, locale)}
            </label>
            <label className="block text-sm font-semibold">
              {t(STRINGS.announcementDurationLabel, locale)}
              <select
                name="durationPreset"
                defaultValue="indefinite"
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal bg-white"
              >
                <option value="1d">{t(STRINGS.announcementDuration1Day, locale)}</option>
                <option value="1w">{t(STRINGS.announcementDuration1Week, locale)}</option>
                <option value="1m">{t(STRINGS.announcementDuration1Month, locale)}</option>
                <option value="custom">{t(STRINGS.announcementDurationCustom, locale)}</option>
                <option value="indefinite">{t(STRINGS.announcementDurationIndefinite, locale)}</option>
              </select>
            </label>
            <label className="block text-sm font-semibold">
              {t(STRINGS.announcementDurationCustom, locale)}
              <input
                type="date"
                name="customDate"
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal"
              />
            </label>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-petrol px-4 py-2 text-white text-sm font-semibold hover:bg-petrol-deep transition-colors min-h-[44px]"
          >
            {t(STRINGS.announcementSaveButton, locale)}
          </button>
          {editing && (
            <Link href="/dashboard/announcements" className="ml-3 text-sm text-neutral-500 hover:text-petrol">
              {t(STRINGS.announcementNewButton, locale)}
            </Link>
          )}
        </form>
      </div>

      <div className="mt-8">
        {all.length === 0 ? (
          <p className="text-sm text-neutral-500">{t(STRINGS.announcementsEmpty, locale)}</p>
        ) : (
          <ul className="space-y-2">
            {all.map((a) => (
              <li
                key={a.id}
                className="rounded-xl border border-neutral-200 bg-white p-4 flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${CATEGORY_BADGE[a.category]}`}>
                      {t(
                        a.category === "emergency"
                          ? STRINGS.announcementCategoryEmergency
                          : a.category === "operational"
                            ? STRINGS.announcementCategoryOperational
                            : STRINGS.announcementCategoryNews,
                        locale,
                      )}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {t(a.status === "published" ? STRINGS.announcementStatusPublished : STRINGS.announcementStatusDraft, locale)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-neutral-800 truncate mt-1">{a.title}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Link href={`/dashboard/announcements?edit=${a.id}`} className="text-sm font-semibold text-petrol">
                    {t(STRINGS.announcementEditLink, locale)}
                  </Link>
                  {a.status === "published" && (
                    <form action={unpublishAnnouncement.bind(null, a.id)}>
                      <button type="submit" className="text-sm font-semibold text-neutral-500 hover:text-red-600">
                        {t(STRINGS.announcementUnpublishButton, locale)}
                      </button>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
