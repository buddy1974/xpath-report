// Role-aware shell. No clinical AI/voice/reflex features yet (Header G4) —
// M3 adds the template engine + Phase-1 template data only, M4 adds
// private dictation capture.
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getLocale } from "@/lib/i18n-server";
import { setLocaleAction } from "@/lib/i18n-actions";
import { STRINGS, VIEW_TITLES, VIEW_BLURBS, ROLE_LABELS, t } from "@/lib/i18n";

type Role = "pathologist" | "technician" | "manager" | "administrator";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");

  const role = (session as any).role as Role;
  const locale = await getLocale();
  const viewTitle = t(VIEW_TITLES[role], locale);
  const viewBlurb = t(VIEW_BLURBS[role], locale);
  const roleLabel = t(ROLE_LABELS[role], locale);

  return (
    <main className="min-h-screen">
      <header className="min-h-14 bg-white border-b flex flex-wrap items-center gap-x-3 gap-y-1 px-4 sm:px-6 py-2">
        <span className="w-5 h-5 rounded bg-gradient-to-br from-eosin to-hema shrink-0" />
        <span className="font-bold">X-PATH</span>
        <span className="hidden sm:inline ml-auto text-xs text-neutral-500 truncate max-w-[14rem]">
          {session.user.email}
        </span>
        <span className="text-xs text-neutral-500 sm:ml-0 ml-auto">{roleLabel}</span>
        <div className="flex items-center gap-1 text-xs">
          <form action={setLocaleAction.bind(null, "en", "/dashboard")}>
            <button
              className={locale === "en" ? "font-bold text-petrol" : "text-neutral-400 hover:text-petrol"}
            >
              {t(STRINGS.localeSwitchEn, locale)}
            </button>
          </form>
          <span className="text-neutral-300">/</span>
          <form action={setLocaleAction.bind(null, "fr", "/dashboard")}>
            <button
              className={locale === "fr" ? "font-bold text-petrol" : "text-neutral-400 hover:text-petrol"}
            >
              {t(STRINGS.localeSwitchFr, locale)}
            </button>
          </form>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/sign-in" });
          }}
        >
          <button className="text-xs font-semibold text-petrol underline">
            {t(STRINGS.signOut, locale)}
          </button>
        </form>
      </header>
      <div className="p-8">
        <h1 className="text-2xl font-semibold">{viewTitle}</h1>
        <p className="text-neutral-600 mt-1">{viewBlurb}</p>
        {role === "pathologist" && (
          <>
            <Link
              href="/dashboard/dictate"
              className="mt-6 block rounded-lg border border-neutral-300 p-6 hover:border-petrol"
            >
              <span className="font-semibold text-petrol">{t(STRINGS.navDictateTitle, locale)}</span>
              <p className="text-sm text-neutral-500 mt-1">{t(STRINGS.navDictateBlurb, locale)}</p>
            </Link>
            <Link
              href="/dashboard/archive"
              className="mt-4 block rounded-lg border border-neutral-300 p-6 hover:border-petrol"
            >
              <span className="font-semibold text-petrol">{t(STRINGS.navArchiveTitle, locale)}</span>
              <p className="text-sm text-neutral-500 mt-1">{t(STRINGS.navArchiveBlurb, locale)}</p>
            </Link>
          </>
        )}
        <Link
          href="/dashboard/templates"
          className="mt-4 block rounded-lg border border-neutral-300 p-6 hover:border-petrol"
        >
          <span className="font-semibold text-petrol">{t(STRINGS.navTemplatesTitle, locale)}</span>
          <p className="text-sm text-neutral-500 mt-1">{t(STRINGS.navTemplatesBlurb, locale)}</p>
        </Link>
      </div>
    </main>
  );
}
