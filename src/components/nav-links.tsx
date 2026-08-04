"use client";

// X-PATH — dashboard nav links with real active-route highlighting.
// Split out from the (Server Component) layout because Next.js only
// exposes the current pathname to Client Components (usePathname) —
// the previous version always highlighted "Dictate" regardless of the
// actual page, a static simplification that stopped being defensible
// once Home became a separate, distinct landing screen.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { STRINGS, t, type Locale } from "@/lib/i18n";
import { HelpButton } from "./help-button";

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`min-h-[40px] flex items-center px-3.5 rounded-full font-semibold transition-colors ${
        active ? "text-petrol bg-petrol/8 hover:bg-petrol/12" : "text-neutral-500 font-medium hover:text-petrol hover:bg-petrol/5"
      }`}
    >
      {label}
    </Link>
  );
}

export function PathologistNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1 text-sm">
      <NavLink href="/dashboard" label={t(STRINGS.navHomeTitle, locale)} active={pathname === "/dashboard"} />
      <NavLink
        href="/dashboard/dictate"
        label={t(STRINGS.navDictateTitle, locale)}
        active={pathname.startsWith("/dashboard/dictate") || pathname.startsWith("/dashboard/structure")}
      />
      <NavLink
        href="/dashboard/templates"
        label={t(STRINGS.navTemplatesTitle, locale)}
        active={pathname.startsWith("/dashboard/templates")}
      />
      <NavLink
        href="/dashboard/archive"
        label={t(STRINGS.navArchiveTitle, locale)}
        active={pathname.startsWith("/dashboard/archive")}
      />
      <NavLink
        href="/dashboard/profile"
        label={t(STRINGS.navProfileTitle, locale)}
        active={pathname.startsWith("/dashboard/profile")}
      />
      <HelpButton locale={locale} />
    </nav>
  );
}
