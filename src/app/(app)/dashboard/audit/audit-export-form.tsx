"use client";

/**
 * X-PATH — audit log export date-range picker (DL-055)
 * ------------------------------------------------------------------
 * Client-only for the live href update as From/To change — the actual
 * downloads are plain GET requests to /api/audit-export/{csv,pdf},
 * no server action needed (no state change).
 */
import { useState } from "react";
import { STRINGS, t, type Locale } from "@/lib/i18n";

export function AuditExportForm({ locale }: { locale: Locale }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString() ? `?${params.toString()}` : "";

  return (
    <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap gap-4">
        <label className="block text-sm font-semibold">
          {t(STRINGS.auditExportDateFromLabel, locale)}
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 block rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal min-h-[44px]"
          />
        </label>
        <label className="block text-sm font-semibold">
          {t(STRINGS.auditExportDateToLabel, locale)}
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 block rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal min-h-[44px]"
          />
        </label>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <a
          href={`/api/audit-export/csv${qs}`}
          className="rounded-lg bg-petrol px-4 py-2 text-white text-sm font-semibold hover:bg-petrol-deep transition-colors min-h-[44px] flex items-center"
        >
          {t(STRINGS.auditExportCsvButton, locale)}
        </a>
        <a
          href={`/api/audit-export/pdf${qs}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-petrol px-4 py-2 text-petrol text-sm font-semibold hover:bg-petrol/5 transition-colors min-h-[44px] flex items-center"
        >
          {t(STRINGS.auditExportPdfButton, locale)}
        </a>
      </div>
    </div>
  );
}
