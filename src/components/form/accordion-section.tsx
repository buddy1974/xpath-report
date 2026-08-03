"use client";

/**
 * X-PATH — collapsible CAP-section wrapper (DL-045, North-Star §8.2)
 * ------------------------------------------------------------------
 * Pure CSS grid-row collapse (no animation plugin dependency). A
 * completed section collapses to a one-line summary; incomplete/missing-
 * core sections default open.
 */
import { useState } from "react";

export function AccordionSection({
  title,
  defaultOpen,
  summary,
  complete,
  children,
}: {
  title: string;
  defaultOpen: boolean;
  summary?: string;
  complete?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-6 py-4 text-left min-h-[44px]"
      >
        <div className="flex items-center gap-2 min-w-0">
          {complete && (
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-petrol text-white text-xs flex items-center justify-center">
              ✓
            </span>
          )}
          <div className="min-w-0">
            <h2 className="text-lg font-semibold uppercase tracking-wide text-petrol">{title}</h2>
            {!open && summary && <p className="text-sm text-neutral-500 truncate mt-0.5">{summary}</p>}
          </div>
        </div>
        <span className={`text-neutral-400 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="px-6 pb-6">{children}</div>
        </div>
      </div>
    </section>
  );
}
