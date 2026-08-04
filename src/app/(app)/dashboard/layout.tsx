// X-PATH — persistent dashboard shell (UX/IA correction, DL-043).
// Single place for the header/nav so every /dashboard/* page shares it,
// instead of each page duplicating (or omitting) its own header. Auth/
// TOTP checks here are a display-layer convenience only — every page
// underneath still does its own checks too (untouched, unchanged).
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getLocale } from "@/lib/i18n-server";
import { setLocaleAction } from "@/lib/i18n-actions";
import { STRINGS, ROLE_LABELS, t } from "@/lib/i18n";
import { PathologistNav } from "@/components/nav-links";
import { Avatar } from "@/components/avatar";
import { DictateCtaBar } from "@/components/dictate-cta-bar";

type Role = "pathologist" | "technician" | "manager" | "administrator";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");

  const role = (session as any).role as Role;
  const locale = await getLocale();
  const roleLabel = t(ROLE_LABELS[role], locale);

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-20 border-b border-neutral-200/80 bg-white/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-eosin to-hema shadow-sm" />
            <span className="font-bold tracking-tight text-[15px]">X-PATH</span>
          </Link>

          {role === "pathologist" && <PathologistNav locale={locale} />}
          {role !== "pathologist" && (
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/dashboard/templates"
                className="min-h-[40px] flex items-center px-3.5 rounded-full font-medium text-neutral-500 hover:text-petrol hover:bg-petrol/5 transition-colors"
              >
                {t(STRINGS.navTemplatesTitle, locale)}
              </Link>
            </nav>
          )}

          <span className="hidden sm:inline ml-auto text-xs text-neutral-500 truncate max-w-[14rem]">
            {session.user.email}
          </span>
          <span className="text-xs text-neutral-500 sm:ml-0 ml-auto bg-neutral-100 rounded-full px-2.5 py-1 font-medium">
            {roleLabel}
          </span>
          <Link href="/dashboard/profile" title={t(STRINGS.navProfileTitle, locale)} className="shrink-0">
            <Avatar label={session.user.name ?? session.user.email ?? "?"} size={28} />
          </Link>
          <div className="flex items-center gap-1 text-xs">
            <form action={setLocaleAction.bind(null, "en", "/dashboard")}>
              <button className={locale === "en" ? "font-bold text-petrol" : "text-neutral-400 hover:text-petrol"}>
                {t(STRINGS.localeSwitchEn, locale)}
              </button>
            </form>
            <span className="text-neutral-300">/</span>
            <form action={setLocaleAction.bind(null, "fr", "/dashboard")}>
              <button className={locale === "fr" ? "font-bold text-petrol" : "text-neutral-400 hover:text-petrol"}>
                {t(STRINGS.localeSwitchFr, locale)}
              </button>
            </form>
          </div>
          <form
            action={async () => {
              "use server";
              const { signOut } = await import("@/auth");
              await signOut({ redirectTo: "/sign-in" });
            }}
          >
            <button className="min-h-[40px] px-3 rounded-full text-xs font-semibold text-petrol border border-petrol/25 hover:bg-petrol/5 transition-colors">
              {t(STRINGS.signOut, locale)}
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-28 sm:pb-8">{children}</main>

      {role === "pathologist" && <DictateCtaBar locale={locale} />}
    </div>
  );
}
