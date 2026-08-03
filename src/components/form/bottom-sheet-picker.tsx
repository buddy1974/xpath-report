"use client";

/**
 * X-PATH — bottom-sheet searchable picker (DL-045, North-Star §8.3, §8.6)
 * ------------------------------------------------------------------
 * Replaces long inline radio walls (>5 options) with a single tappable
 * row that opens a searchable slide-up sheet. Submits via a hidden input
 * so the surrounding native <form> / Server Action wiring is unchanged —
 * this is a presentation-layer swap, not a data-model change.
 */
import { useMemo, useState } from "react";
import { STRINGS, t, type Locale } from "@/lib/i18n";

export interface PickerOption {
  key: string;
  label: string;
}

export function BottomSheetPicker({
  name,
  options,
  defaultValue,
  isAi,
  locale = "en",
  placeholder,
  onChange,
}: {
  name: string;
  options: PickerOption[];
  defaultValue?: string;
  isAi?: boolean;
  locale?: Locale;
  placeholder?: string;
  onChange?: (value: string | undefined) => void;
}) {
  const [value, setValue] = useState<string | undefined>(defaultValue);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(search.trim().toLowerCase())),
    [options, search],
  );
  const selectedLabel = options.find((o) => o.key === value)?.label;

  function choose(key: string) {
    setValue(key);
    onChange?.(key);
    setOpen(false);
    setSearch("");
  }

  return (
    <div className="mt-1">
      <input type="hidden" name={name} value={value ?? ""} />
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`w-full max-w-md flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm text-left shadow-sm transition-colors min-h-[44px] ${
          isAi && value ? "border-hema/40 bg-hema/5" : "border-neutral-300 bg-white hover:border-petrol/40"
        }`}
      >
        <span className={selectedLabel ? "text-neutral-900" : "text-neutral-400"}>
          {selectedLabel ?? placeholder ?? t(STRINGS.selectPlaceholder, locale)}
        </span>
        <span className="text-neutral-400 text-xs">▾</span>
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
              {filtered.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => choose(o.key)}
                  className={`w-full text-left px-4 py-3 text-sm min-h-[44px] flex items-center justify-between hover:bg-petrol/5 transition-colors ${
                    o.key === value ? "text-petrol font-semibold bg-petrol/5" : "text-neutral-800"
                  }`}
                >
                  {o.label}
                  {o.key === value && <span>✓</span>}
                </button>
              ))}
            </div>
            <div className="p-3 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full rounded-lg border border-petrol text-petrol px-4 py-2.5 text-sm font-semibold hover:bg-petrol/5 transition-colors min-h-[44px]"
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
