"use client";

/**
 * X-PATH — bottom-sheet multi-select (DL-045, North-Star §8.6)
 * ------------------------------------------------------------------
 * Multi-select fields render as checkable chips in a searchable sheet.
 * Selections submit as repeated hidden inputs sharing `name` — matches
 * what actions.ts's parseFieldValues already expects via
 * `formData.getAll(path)`, so no Server Action change is needed.
 */
import { useMemo, useState } from "react";
import { STRINGS, t, type Locale } from "@/lib/i18n";
import type { PickerOption } from "./bottom-sheet-picker";

export function MultiSelectSheet({
  name,
  options,
  defaultValue,
  isAi,
  locale = "en",
  onChange,
}: {
  name: string;
  options: PickerOption[];
  defaultValue?: string[];
  isAi?: boolean;
  locale?: Locale;
  onChange?: (value: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(defaultValue ?? []);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(search.trim().toLowerCase())),
    [options, search],
  );

  function toggle(key: string) {
    const next = selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key];
    setSelected(next);
    onChange?.(next);
  }

  const selectedLabels = selected.map((k) => options.find((o) => o.key === k)?.label ?? k);

  return (
    <div>
      {selected.map((k) => (
        <input key={k} type="hidden" name={name} value={k} />
      ))}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`w-full max-w-md flex flex-wrap items-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm text-left shadow-sm transition-colors min-h-[44px] ${
          isAi && selected.length > 0 ? "border-hema/40 bg-hema/5" : "border-neutral-300 bg-white hover:border-petrol/40"
        }`}
      >
        {selectedLabels.length === 0 ? (
          <span className="text-neutral-400">{t(STRINGS.selectPlaceholder, locale)}</span>
        ) : (
          selectedLabels.map((l, i) => (
            <span key={i} className="rounded-full bg-petrol/10 text-petrol text-xs px-2 py-1">
              {l}
            </span>
          ))
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl bg-white shadow-xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-neutral-200">
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t(STRINGS.searchOptionsPlaceholder, locale)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-petrol focus:ring-1 focus:ring-petrol/30"
              />
            </div>
            <div className="overflow-y-auto flex-1 py-2">
              {filtered.length === 0 && (
                <p className="px-4 py-6 text-sm text-neutral-400 text-center">{t(STRINGS.noOptionsFound, locale)}</p>
              )}
              {filtered.map((o) => {
                const checked = selected.includes(o.key);
                return (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => toggle(o.key)}
                    className={`w-full text-left px-4 py-3 text-sm min-h-[44px] flex items-center justify-between hover:bg-petrol/5 transition-colors ${
                      checked ? "text-petrol font-semibold bg-petrol/5" : "text-neutral-800"
                    }`}
                  >
                    {o.label}
                    {checked && <span>✓</span>}
                  </button>
                );
              })}
            </div>
            <div className="p-3 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full rounded-lg bg-petrol px-4 py-2.5 text-sm font-semibold text-white hover:bg-petrol-deep transition-colors min-h-[44px]"
              >
                {t(STRINGS.doneButton, locale)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
