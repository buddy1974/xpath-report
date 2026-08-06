// X-PATH — wait-time triage badge (DL-055 item 6). Color-coded but
// never color-only: an icon + text label always ships alongside the
// color, so the status reads correctly for color-blind users and in
// black-and-white print (accessibility fix, not decoration).
import { STRINGS, t, type Locale } from "@/lib/i18n";

export type TriageLevel = "on-track" | "watch" | "slow";

const STYLE: Record<TriageLevel, { text: string; bg: string; icon: string }> = {
  "on-track": { text: "text-emerald-700", bg: "bg-emerald-50", icon: "M16.704 5.29a1 1 0 010 1.415l-7.5 7.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 111.414-1.415L8.5 12.086l6.79-6.795a1 1 0 011.414 0z" },
  watch: { text: "text-amber-700", bg: "bg-amber-50", icon: "M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" },
  slow: { text: "text-red-700", bg: "bg-red-50", icon: "M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" },
};

const LABEL_KEY: Record<TriageLevel, keyof typeof STRINGS> = {
  "on-track": "triageOnTrack",
  watch: "triageWatch",
  slow: "triageSlow",
};

/** hours <= 24 -> on-track, <= 72 -> watch, else slow. */
export function triageForHours(hours: number): TriageLevel {
  if (hours <= 24) return "on-track";
  if (hours <= 72) return "watch";
  return "slow";
}

export function TriageBadge({ level, locale }: { level: TriageLevel; locale: Locale }) {
  const s = STYLE[level];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.text} ${s.bg}`}>
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 shrink-0">
        <path d={s.icon} />
      </svg>
      {t(STRINGS[LABEL_KEY[level]], locale)}
    </span>
  );
}
