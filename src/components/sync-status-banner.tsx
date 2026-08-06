"use client";

// X-PATH — global offline-queue banner (DL-055). Same hide-on-focused-
// work carve-out as the Dictate CTA bar/avatar/announcement ticker
// (DL-051/053/054) — the Recorder's own inline status already covers
// feedback while actively on that page.
import { usePathname } from "next/navigation";
import { STRINGS, t, type Locale } from "@/lib/i18n";
import { useSyncQueue } from "@/lib/use-sync-queue";
import { forceSyncAll } from "@/lib/offline-queue";

export function SyncStatusBanner({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const items = useSyncQueue();
  // R-039 follow-up: Structure now has its own back link.
  const hidden =
    pathname.startsWith("/dashboard/dictate") ||
    pathname.startsWith("/dashboard/review") ||
    pathname.startsWith("/dashboard/structure");

  if (hidden || items.length === 0) return null;

  const syncing = items.filter((i) => i.status === "syncing").length;
  const queued = items.filter((i) => i.status === "queued" || i.status === "failed").length;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 mb-4 text-sm">
      {/* Icon, not color alone — carries the same meaning for color-blind users */}
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-amber-700 shrink-0">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.5a.75.75 0 0 0-1.5 0v4c0 .199.079.39.22.53l2.5 2.5a.75.75 0 1 0 1.06-1.06L10.75 10.19V6.5Z"
          clipRule="evenodd"
        />
      </svg>
      <span className="text-amber-800 font-medium flex-1">
        {syncing > 0
          ? `${syncing} ${t(STRINGS.syncBannerSyncingSuffix, locale)}`
          : `${queued} ${t(STRINGS.syncBannerQueuedSuffix, locale)}`}
      </span>
      <button
        type="button"
        onClick={() => void forceSyncAll()}
        className="shrink-0 text-amber-800 font-semibold hover:underline active:opacity-70 min-h-[32px] px-2"
      >
        {t(STRINGS.syncForceSyncButton, locale)}
      </button>
    </div>
  );
}
