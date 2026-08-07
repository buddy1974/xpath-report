// X-PATH — role-based primary navigation, shared source of truth for
// both the mobile full-screen sheet (user-menu.tsx) and the desktop
// sidebar (DL-060) — one list, two presentations, never diverging.
import { STRINGS, t, type Locale } from "@/lib/i18n";

export type Role = "pathologist" | "technician" | "manager" | "administrator";

export function getNavFeatures(role: Role, locale: Locale): { href: string; label: string }[] {
  if (role === "pathologist") {
    return [
      { href: "/dashboard", label: t(STRINGS.navHomeTitle, locale) },
      { href: "/dashboard/dictate", label: t(STRINGS.navDictateTitle, locale) },
      { href: "/dashboard/workspace", label: t(STRINGS.navWorkspaceTitle, locale) },
      { href: "/dashboard/templates", label: t(STRINGS.navTemplatesTitle, locale) },
      { href: "/dashboard/archive", label: t(STRINGS.navArchiveTitle, locale) },
    ];
  }
  if (role === "administrator") {
    return [
      { href: "/dashboard/templates", label: t(STRINGS.navTemplatesTitle, locale) },
      // DL-054 — the three admin-only surfaces. Same list, no separate "admin nav".
      { href: "/dashboard/announcements", label: t(STRINGS.announcementsNavTitle, locale) },
      { href: "/dashboard/accounts", label: t(STRINGS.accountsNavTitle, locale) },
      { href: "/dashboard/content", label: t(STRINGS.contentAdminNavTitle, locale) },
      // DL-055 — TAT dashboard, reagent/equipment tracking, audit export.
      { href: "/dashboard/tat", label: t(STRINGS.tatNavTitle, locale) },
      { href: "/dashboard/reagents", label: t(STRINGS.reagentsNavTitle, locale) },
      { href: "/dashboard/audit", label: t(STRINGS.auditExportNavTitle, locale) },
    ];
  }
  return [{ href: "/dashboard/templates", label: t(STRINGS.navTemplatesTitle, locale) }];
}
