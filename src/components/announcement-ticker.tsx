"use client";

// X-PATH — Announcements ticker/chip strip (DL-054). Same
// hide-on-capture-and-review carve-out as the Dictate CTA bar and the
// floating avatar (DL-051/DL-053): a compact strip fits everywhere else,
// but not while actively recording or signing. Per-user dismiss via
// localStorage only (no server round-trip, same pattern already
// established by the onboarding checklist) — dismissing never affects
// what anyone else sees.
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { STRINGS, t, type Locale } from "@/lib/i18n";

export const ANNOUNCEMENT_DISMISS_KEY = "xpath_announcements_dismissed";

export type TickerAnnouncement = {
  id: string;
  tickerTextEn: string;
  tickerTextFr: string;
  category: "news" | "operational" | "emergency";
};

const CATEGORY_CLASS: Record<string, string> = {
  emergency: "bg-red-50 border border-red-300 text-red-800",
  operational: "bg-amber-50 border border-amber-300 text-amber-800",
  news: "bg-neutral-100 border border-neutral-200 text-neutral-700",
};

export function AnnouncementTicker({ items, locale }: { items: TickerAnnouncement[]; locale: Locale }) {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setDismissed(JSON.parse(localStorage.getItem(ANNOUNCEMENT_DISMISS_KEY) ?? "[]"));
    } catch {
      setDismissed([]);
    }
  }, []);

  // R-039 follow-up: Structure now has its own back link.
  const hidden =
    pathname.startsWith("/dashboard/dictate") ||
    pathname.startsWith("/dashboard/review") ||
    pathname.startsWith("/dashboard/structure");
  if (hidden || !mounted) return null;

  const visible = items.filter((a) => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  function dismiss(id: string) {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem(ANNOUNCEMENT_DISMISS_KEY, JSON.stringify(next));
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {visible.map((a) => (
        <div key={a.id} className={`flex items-center gap-2 rounded-full pl-4 pr-2 py-1.5 text-sm max-w-full ${CATEGORY_CLASS[a.category]}`}>
          <Link href={`/dashboard/announcements/${a.id}`} className="min-w-0 truncate font-medium hover:underline">
            {locale === "fr" ? a.tickerTextFr : a.tickerTextEn}
          </Link>
          <button
            type="button"
            onClick={() => dismiss(a.id)}
            aria-label={t(STRINGS.announcementDismiss, locale)}
            className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center hover:bg-black/5 active:bg-black/10 transition-colors"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
