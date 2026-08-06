// X-PATH — Profile / My Space (North-Star §4.2). Identity, real G2
// privacy framing, and links to what actually exists (archive,
// templates) — no fabricated links to personal notes/references,
// which aren't built yet (DL-034 deferred them; said so honestly here
// rather than pretending a feature exists).
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { getLocale } from "@/lib/i18n-server";
import { setLocaleAction } from "@/lib/i18n-actions";
import { STRINGS, ROLE_LABELS, t } from "@/lib/i18n";
import Link from "next/link";
import { AvatarUpload } from "@/components/avatar-upload";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");

  const role = (session as any).role as string;
  const tenantId = (session as any).tenantId as string;
  const locale = await getLocale();

  const tenantRows = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
  const tenantName = tenantRows[0]?.name ?? "—";
  const roleLabel = t(ROLE_LABELS[role] ?? ROLE_LABELS.pathologist, locale);

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">{t(STRINGS.profileHeading, locale)}</h1>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <AvatarUpload label={session.user.name ?? session.user.email ?? "?"} locale={locale} />
          <div className="min-w-0">
            <p className="font-semibold text-lg truncate">{session.user.name ?? session.user.email}</p>
            <p className="text-sm text-neutral-500 truncate">{session.user.email}</p>
          </div>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-neutral-400 text-xs uppercase tracking-wide">Role</dt>
            <dd className="mt-0.5 font-medium capitalize">{roleLabel}</dd>
          </div>
          <div>
            <dt className="text-neutral-400 text-xs uppercase tracking-wide">{t(STRINGS.profileLabWord, locale)}</dt>
            <dd className="mt-0.5 font-medium">{tenantName}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-4 rounded-2xl border border-mint/25 bg-mint/5 p-6 shadow-sm">
        <h2 className="font-semibold text-mint">{t(STRINGS.profilePrivacyPanelTitle, locale)}</h2>
        <p className="text-sm text-neutral-700 mt-2 leading-relaxed">{t(STRINGS.profilePrivacyPanelBody, locale)}</p>
      </div>

      {role === "pathologist" && (
        <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-petrol">{t(STRINGS.profileMySpaceHeading, locale)}</h2>
          <div className="mt-3 space-y-2">
            <Link
              href="/dashboard/archive"
              className="flex items-center justify-between rounded-xl border border-neutral-200 p-4 hover:border-petrol/30 hover:shadow-sm transition-all"
            >
              <span>
                <span className="font-medium text-sm text-neutral-800">{t(STRINGS.profileArchiveLink, locale)}</span>
                <p className="text-xs text-neutral-500 mt-0.5">{t(STRINGS.profileArchiveBlurb, locale)}</p>
              </span>
              <span className="text-petrol text-sm font-semibold shrink-0">→</span>
            </Link>
            <Link
              href="/dashboard/templates"
              className="flex items-center justify-between rounded-xl border border-neutral-200 p-4 hover:border-petrol/30 hover:shadow-sm transition-all"
            >
              <span>
                <span className="font-medium text-sm text-neutral-800">{t(STRINGS.profileTemplatesLink, locale)}</span>
                <p className="text-xs text-neutral-500 mt-0.5">{t(STRINGS.navTemplatesBlurb, locale)}</p>
              </span>
              <span className="text-petrol text-sm font-semibold shrink-0">→</span>
            </Link>
          </div>
          <p className="text-xs text-neutral-400 mt-3">{t(STRINGS.profileNotesComingSoon, locale)}</p>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-petrol">{t(STRINGS.profileLanguageHeading, locale)}</h2>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <form action={setLocaleAction.bind(null, "en", "/dashboard/profile")}>
            <button
              className={`px-3.5 py-2 rounded-full font-semibold transition-colors min-h-[44px] ${locale === "en" ? "bg-petrol text-white" : "text-neutral-500 hover:bg-neutral-100"}`}
            >
              {t(STRINGS.localeSwitchEn, locale)}
            </button>
          </form>
          <form action={setLocaleAction.bind(null, "fr", "/dashboard/profile")}>
            <button
              className={`px-3.5 py-2 rounded-full font-semibold transition-colors min-h-[44px] ${locale === "fr" ? "bg-petrol text-white" : "text-neutral-500 hover:bg-neutral-100"}`}
            >
              {t(STRINGS.localeSwitchFr, locale)}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
