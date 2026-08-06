"use client";

// X-PATH — mobile IA redesign (DL-053): the top nav bar is gone. This
// floating avatar + full-screen sheet is now the only way to reach
// profile/features/settings/sign-out from anywhere in the dashboard
// shell. Pattern reference: Apple Health's profile screen (layout/IA
// only — existing design tokens throughout, not a rebrand, per Marcel's
// explicit instruction).
//
// Hidden on /dashboard/dictate (that's the one-tap capture screen — a
// floating control competing for attention during recording is wrong)
// and /dashboard/review/* (collides with that screen's own fixed
// bottom bar/flow) — same reasoning as the Dictate CTA bar (DL-051).
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { STRINGS, t, type Locale } from "@/lib/i18n";
import { setLocaleAction } from "@/lib/i18n-actions";
import { signOutAction } from "@/app/(app)/dashboard/actions";
import { Avatar } from "./avatar";
import { ONBOARDING_STORAGE_KEY } from "./onboarding-checklist";
import { AnnouncementTicker, type TickerAnnouncement } from "./announcement-ticker";
import {
  type FontSize,
  getStoredFontSize,
  getStoredHighContrast,
  applyFontSize,
  applyHighContrast,
} from "@/lib/accessibility";
import { usePwaInstall } from "@/lib/use-pwa-install";

type Role = "pathologist" | "technician" | "manager" | "administrator";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] font-semibold uppercase tracking-wide text-neutral-400 px-4 mb-2">{children}</p>;
}

function CardGroup({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[14px] bg-white divide-y divide-neutral-100 overflow-hidden shadow-sm">{children}</div>;
}

function MenuRow({ href, label, onNavigate }: { href: string; label: string; onNavigate: () => void }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex items-center justify-between px-4 min-h-[44px] py-3 active:bg-neutral-100 transition-colors"
    >
      <span className="text-[15px] text-neutral-800">{label}</span>
      <span className="text-neutral-300 text-lg">›</span>
    </Link>
  );
}

export function UserMenu({
  role,
  locale,
  name,
  email,
  roleLabel,
  announcements = [],
}: {
  role: Role;
  locale: Locale;
  name: string;
  email: string;
  roleLabel: string;
  announcements?: TickerAnnouncement[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>("normal");
  const [highContrast, setHighContrast] = useState(false);
  const { canInstall, promptInstall } = usePwaInstall();

  // R-039 follow-up: Structure now has its own back link
  // (structure/page.tsx), so it's safe to extend the standing
  // hide-chrome-during-focused-work rule (DL-055 item 6) here too.
  const hiddenAvatar =
    pathname.startsWith("/dashboard/dictate") ||
    pathname.startsWith("/dashboard/review") ||
    pathname.startsWith("/dashboard/structure");

  useEffect(() => {
    setFontSize(getStoredFontSize());
    setHighContrast(getStoredHighContrast());
  }, []);

  useEffect(() => {
    if (!open) return;
    // setTimeout, not requestAnimationFrame: rAF is suspended entirely for
    // backgrounded/hidden tabs (never fires until the tab is foregrounded
    // again), which silently stuck the sheet at translate-y-full during
    // testing with multiple tabs open. A real user's active tab is always
    // visible when they open this menu, but there's no reason to depend on
    // that — setTimeout doesn't have this failure mode.
    const timer = setTimeout(() => setMounted(true), 10);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      setMounted(false);
    };
  }, [open]);

  const close = () => setOpen(false);

  const FEATURES =
    role === "pathologist"
      ? [
          { href: "/dashboard", label: t(STRINGS.navHomeTitle, locale) },
          { href: "/dashboard/dictate", label: t(STRINGS.navDictateTitle, locale) },
          { href: "/dashboard/workspace", label: t(STRINGS.navWorkspaceTitle, locale) },
          { href: "/dashboard/templates", label: t(STRINGS.navTemplatesTitle, locale) },
          { href: "/dashboard/archive", label: t(STRINGS.navArchiveTitle, locale) },
        ]
      : role === "administrator"
        ? [
            { href: "/dashboard/templates", label: t(STRINGS.navTemplatesTitle, locale) },
            // DL-054 — the three new admin-only surfaces. Same list, same
            // card group as everything else; no separate "admin nav".
            { href: "/dashboard/announcements", label: t(STRINGS.announcementsNavTitle, locale) },
            { href: "/dashboard/accounts", label: t(STRINGS.accountsNavTitle, locale) },
            { href: "/dashboard/content", label: t(STRINGS.contentAdminNavTitle, locale) },
            // DL-055 — TAT dashboard, reagent/equipment tracking, audit export.
            { href: "/dashboard/tat", label: t(STRINGS.tatNavTitle, locale) },
            { href: "/dashboard/reagents", label: t(STRINGS.reagentsNavTitle, locale) },
            { href: "/dashboard/audit", label: t(STRINGS.auditExportNavTitle, locale) },
          ]
        : [{ href: "/dashboard/templates", label: t(STRINGS.navTemplatesTitle, locale) }];

  return (
    <>
      {!hiddenAvatar && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t(STRINGS.userMenuOpenLabel, locale)}
          className="fixed right-4 z-30 active:scale-95 transition-transform"
          style={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
        >
          <Avatar label={name} size={44} />
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={t(STRINGS.userMenuOpenLabel, locale)}>
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${mounted ? "opacity-100" : "opacity-0"}`}
            onClick={close}
          />
          <div
            className={`absolute inset-0 bg-neutral-50 overflow-y-auto transition-transform duration-300 ease-out ${
              mounted ? "translate-y-0" : "translate-y-full"
            }`}
            style={{
              paddingTop: "env(safe-area-inset-top, 0px)",
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
          >
            <div className="px-2 pt-3">
              <button
                type="button"
                onClick={close}
                aria-label={t(STRINGS.userMenuCloseLabel, locale)}
                className="w-11 h-11 rounded-full flex items-center justify-center active:bg-neutral-200 transition-colors"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-neutral-600">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col items-center pt-2 pb-8">
              <Avatar label={name} size={88} />
              <p className="mt-3 text-xl font-bold text-neutral-900 text-center px-6">{name}</p>
              <p className="text-sm text-neutral-500">{email}</p>
            </div>

            <div className="px-4 pb-10 space-y-8 max-w-md mx-auto w-full">
              {announcements.length > 0 && <AnnouncementTicker items={announcements} locale={locale} />}

              <div>
                <CardGroup>
                  <MenuRow href="/dashboard/profile" label={t(STRINGS.userMenuViewProfile, locale)} onNavigate={close} />
                </CardGroup>
              </div>

              <div>
                <SectionLabel>{t(STRINGS.userMenuFeaturesHeading, locale)}</SectionLabel>
                <CardGroup>
                  {FEATURES.map((f) => (
                    <MenuRow key={f.href} href={f.href} label={f.label} onNavigate={close} />
                  ))}
                </CardGroup>
              </div>

              <div>
                <SectionLabel>{t(STRINGS.userMenuSettingsHeading, locale)}</SectionLabel>
                <CardGroup>
                  <div className="flex items-center justify-between px-4 min-h-[44px] py-3">
                    <span className="text-[15px] text-neutral-800">{t(STRINGS.profileLanguageHeading, locale)}</span>
                    <div className="flex items-center gap-1">
                      <form action={setLocaleAction.bind(null, "en", pathname)}>
                        <button
                          className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors active:scale-95 min-h-[44px] min-w-[44px] ${
                            locale === "en" ? "bg-petrol text-white" : "text-neutral-500"
                          }`}
                        >
                          {t(STRINGS.localeSwitchEn, locale)}
                        </button>
                      </form>
                      <form action={setLocaleAction.bind(null, "fr", pathname)}>
                        <button
                          className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors active:scale-95 min-h-[44px] min-w-[44px] ${
                            locale === "fr" ? "bg-petrol text-white" : "text-neutral-500"
                          }`}
                        >
                          {t(STRINGS.localeSwitchFr, locale)}
                        </button>
                      </form>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 min-h-[44px] py-3">
                    <span className="text-[15px] text-neutral-800">{t(STRINGS.settingsFontSizeLabel, locale)}</span>
                    <div className="flex items-center gap-1">
                      {(["normal", "large", "xlarge"] as const).map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            setFontSize(size);
                            applyFontSize(size);
                          }}
                          className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors active:scale-95 min-h-[44px] ${
                            fontSize === size ? "bg-petrol text-white" : "text-neutral-500"
                          }`}
                        >
                          {size === "normal"
                            ? t(STRINGS.settingsFontSizeNormal, locale)
                            : size === "large"
                              ? t(STRINGS.settingsFontSizeLarge, locale)
                              : t(STRINGS.settingsFontSizeXLarge, locale)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 min-h-[44px] py-3">
                    <span className="text-[15px] text-neutral-800">{t(STRINGS.settingsHighContrastLabel, locale)}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={highContrast}
                      onClick={() => {
                        const next = !highContrast;
                        setHighContrast(next);
                        applyHighContrast(next);
                      }}
                      className={`relative w-11 h-6 rounded-full transition-colors ${highContrast ? "bg-petrol" : "bg-neutral-300"}`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          highContrast ? "translate-x-5" : ""
                        }`}
                      />
                    </button>
                  </div>
                  {canInstall && (
                    <button
                      type="button"
                      onClick={promptInstall}
                      className="w-full text-left flex items-center px-4 min-h-[44px] py-3 text-[15px] text-neutral-800 active:bg-neutral-100 transition-colors"
                    >
                      {t(STRINGS.installAppLabel, locale)}
                    </button>
                  )}
                  {role === "pathologist" && (
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem(ONBOARDING_STORAGE_KEY);
                        close();
                        window.location.href = "/dashboard/dictate";
                      }}
                      className="w-full text-left flex items-center px-4 min-h-[44px] py-3 text-[15px] text-neutral-800 active:bg-neutral-100 transition-colors"
                    >
                      {t(STRINGS.helpIconLabel, locale)}
                    </button>
                  )}
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="w-full text-left flex items-center px-4 min-h-[44px] py-3 text-[15px] font-semibold text-petrol active:bg-neutral-100 transition-colors"
                    >
                      {t(STRINGS.signOut, locale)}
                    </button>
                  </form>
                </CardGroup>
              </div>

              <p className="text-center text-xs text-neutral-400">{roleLabel}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
