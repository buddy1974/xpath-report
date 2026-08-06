// X-PATH — Announcement detail (DL-054). Read-only, any authenticated
// role — the ticker links here. Draft announcements 404 for everyone
// except the administrator who authored the system (kept simple: any
// administrator can preview a draft by id; non-admins never see an
// unpublished one since the ticker itself only ever links to published
// items).
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import { getLocale } from "@/lib/i18n-server";
import { STRINGS, t } from "@/lib/i18n";

const CATEGORY_STYLE: Record<string, string> = {
  news: "border-neutral-200 bg-white",
  operational: "border-amber-300 bg-amber-50",
  emergency: "border-red-300 bg-red-50",
};

export default async function AnnouncementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");

  const role = (session as any).role as string;
  const tenantId = (session as any).tenantId as string;
  const locale = await getLocale();
  const { id } = await params;

  const rows = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
  const item = rows[0];
  if (!item || item.tenantId !== tenantId) notFound();
  if (item.status !== "published" && role !== "administrator") notFound();

  const body = locale === "fr" ? item.bodyFr : item.bodyEn;

  return (
    <div className="max-w-2xl">
      <a href="/dashboard" className="text-sm font-semibold text-petrol">
        {t(STRINGS.announcementDetailBackLink, locale)}
      </a>
      <div className={`mt-4 rounded-2xl border p-6 shadow-sm ${CATEGORY_STYLE[item.category]}`}>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
          {t(
            item.category === "emergency"
              ? STRINGS.announcementCategoryEmergency
              : item.category === "operational"
                ? STRINGS.announcementCategoryOperational
                : STRINGS.announcementCategoryNews,
            locale,
          )}
        </span>
        <h1 className="text-2xl font-bold tracking-tight mt-1">{item.title}</h1>
        <p className="text-neutral-700 mt-4 whitespace-pre-wrap leading-relaxed">{body}</p>
        {item.link && (
          <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-sm font-semibold text-petrol">
            {item.link} →
          </a>
        )}
      </div>
    </div>
  );
}
