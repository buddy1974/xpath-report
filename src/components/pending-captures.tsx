"use client";

// X-PATH — locally-queued (not yet synced to the server) captures
// (DL-055). Renders above the server-rendered Workspace list so a
// dictation/note that hasn't reached the database yet is still visibly
// "there" — the whole point of optimistic UI: nothing looks lost just
// because the network hasn't caught up.
import { STRINGS, t, type Locale } from "@/lib/i18n";
import { useSyncQueue } from "@/lib/use-sync-queue";
import { retryItem, type QueueItem } from "@/lib/offline-queue";

function StatusBadge({ item, locale }: { item: QueueItem; locale: Locale }) {
  // Icon + text together, never color alone (Header: non-color-dependent
  // status — a real accessibility requirement, not a nice-to-have).
  if (item.status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700">
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
        </svg>
        {t(STRINGS.syncItemStatusFailed, locale)}
      </span>
    );
  }
  if (item.status === "syncing") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-petrol">
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 animate-spin">
          <path d="M10 3a7 7 0 1 0 7 7h-1.5A5.5 5.5 0 1 1 10 4.5V3Z" />
        </svg>
        {t(STRINGS.syncItemStatusSyncing, locale)}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.5a.75.75 0 0 0-1.5 0v4c0 .199.079.39.22.53l2.5 2.5a.75.75 0 1 0 1.06-1.06L10.75 10.19V6.5Z" clipRule="evenodd" />
      </svg>
      {t(STRINGS.syncItemStatusQueued, locale)}
    </span>
  );
}

export function PendingCaptures({ locale }: { locale: Locale }) {
  const items = useSyncQueue();
  if (items.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 px-1 mb-2">
        {t(STRINGS.syncPendingSectionHeading, locale)}
      </h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.localId}
            className="rounded-xl border border-neutral-200 bg-white p-4 flex items-center gap-3 shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                {t(item.kind === "dictation" ? STRINGS.syncKindDictation : STRINGS.syncKindNote, locale)}
              </p>
              <div className="mt-0.5 flex items-center gap-2">
                <StatusBadge item={item} locale={locale} />
                <span className="text-xs text-neutral-400">{new Date(item.createdAt).toLocaleString(locale === "fr" ? "fr-FR" : "en-US")}</span>
              </div>
              {item.status === "failed" && item.lastError && (
                <p className="text-xs text-red-600 mt-1">{item.lastError}</p>
              )}
            </div>
            {item.status === "failed" && (
              <button
                type="button"
                onClick={() => void retryItem(item.localId)}
                className="shrink-0 text-sm font-semibold text-petrol active:opacity-70 min-h-[36px] px-2"
              >
                {t(STRINGS.syncItemRetryButton, locale)}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
