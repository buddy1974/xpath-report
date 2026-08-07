"use client";

// X-PATH — desktop-parity pass (DL-060). A persistent left sidebar,
// `lg:` and up only — the mobile floating-avatar/full-screen-menu
// pattern (DL-053) was a mobile-space solution to a problem desktop
// doesn't have: plenty of room for direct, always-visible nav. Same
// role-based link list as the mobile sheet (lib/nav-features.ts —
// one source of truth, never diverging), just presented differently
// per device, the way a native app's phone and desktop shells share
// logic but not layout. Purely presentational — no new data source,
// no new auth check (the layout above already gates every page).
import Link from "next/link";
import { usePathname } from "next/navigation";
import { STRINGS, t, type Locale } from "@/lib/i18n";
import { getNavFeatures, type Role } from "@/lib/nav-features";

export function DesktopSidebar({ role, locale }: { role: Role; locale: Locale }) {
  const pathname = usePathname();
  const features = getNavFeatures(role, locale);

  return (
    <nav
      className="hidden lg:flex lg:flex-col fixed left-0 top-0 bottom-0 w-64 border-r border-neutral-200 bg-white z-10"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      aria-label={t(STRINGS.navHomeTitle, locale)}
    >
      <div className="px-6 py-6">
        <span className="text-lg font-bold tracking-tight text-petrol">X-PATH</span>
      </div>
      <ul className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {features.map((f) => {
          const active = f.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(f.href);
          return (
            <li key={f.href}>
              <Link
                href={f.href}
                className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-petrol/10 text-petrol" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                {f.label}
              </Link>
            </li>
          );
        })}
      </ul>
      {/* Reserves the visual footer row that UserMenu's desktop-docked
          trigger (fixed-positioned, same z-index area) sits in — kept
          as a single source of truth in UserMenu rather than
          duplicating the settings sheet here. */}
      <div className="h-20 shrink-0" />
    </nav>
  );
}
