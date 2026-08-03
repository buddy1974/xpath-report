"use client";

/**
 * X-PATH — review form (DL-045, North-Star §8: "this is a REVIEW surface,
 * not a blank form")
 * ------------------------------------------------------------------
 * Client-side rewrite of the review/sign form: accordion sections that
 * collapse to a summary once their CORE fields are filled, a bottom-sheet
 * picker for long single-select lists (§8.3/§8.6), a bottom-sheet
 * multi-select, "…(specify)" companion fields revealed only after their
 * parent option is chosen, NON-CORE fields collapsed behind a toggle, and
 * a sticky top progress line + bottom action bar (§8.5).
 *
 * All fields still submit via the SAME native <form>/Server Action
 * wiring as before (field.path as `name`, values/companions mirrored
 * into hidden or controlled inputs) — actions.ts's parseFieldValues is
 * unchanged. This is presentation only.
 *
 * Deliberately out of scope for this pass (see docs/decision-log.md
 * DL-045): CONDITIONAL fields are NOT hidden until a trigger fires —
 * that needs new trigger metadata per field (which template/tumor site
 * etc. controls which conditional field applies) that doesn't exist yet
 * in the template data model, and a heuristic guess at it risks hiding a
 * field a pathologist actually needs to fill on a signed clinical
 * record. CONDITIONAL fields render inline with CORE fields instead
 * (safe default, no regression). Danger-zone banners are also out of
 * scope — there is no pathologist-facing "mark as urgent" mechanism yet,
 * and auto-inferring urgency from field values would be a clinical
 * judgment X-PATH doesn't have (Header G1/G8).
 */
import { useMemo, useRef, useState } from "react";
import { TierBadge } from "@/components/template-view";
import { PrivacyIndicator } from "@/components/privacy-indicator";
import { AccordionSection } from "@/components/form/accordion-section";
import { BottomSheetPicker } from "@/components/form/bottom-sheet-picker";
import { MultiSelectSheet } from "@/components/form/multi-select-sheet";
import { STRINGS, t, type Locale } from "@/lib/i18n";
import type { FlatField } from "@/lib/templates/flatten";

type Values = Record<string, string | string[]>;

function isFilled(v: string | string[] | undefined): boolean {
  if (v === undefined) return false;
  return Array.isArray(v) ? v.length > 0 : v.trim().length > 0;
}

interface Companion {
  field: FlatField;
  optionKey: string;
}

// A synthetic "…(specify)" or "cannot be determined, explain" field is
// always addressed as "<parentPath>.<optionKey>.text" by flatten.ts —
// detected generically here rather than hardcoded per template, so it
// keeps working as templates change.
function buildCompanionsByParent(fields: FlatField[]): Map<string, Companion[]> {
  const byPath = new Map(fields.map((f) => [f.path, f] as const));
  const map = new Map<string, Companion[]>();
  for (const f of fields) {
    if (!f.path.endsWith(".text")) continue;
    const withoutText = f.path.slice(0, -".text".length);
    const lastDot = withoutText.lastIndexOf(".");
    if (lastDot === -1) continue;
    const parentPath = withoutText.slice(0, lastDot);
    const optionKey = withoutText.slice(lastDot + 1);
    if (byPath.get(parentPath)?.options?.some((o) => o.key === optionKey)) {
      if (!map.has(parentPath)) map.set(parentPath, []);
      map.get(parentPath)!.push({ field: f, optionKey });
    }
  }
  return map;
}

function summarizeSection(fields: FlatField[], values: Values): string {
  const parts: string[] = [];
  for (const f of fields) {
    const v = values[f.path];
    if (!isFilled(v)) continue;
    if (Array.isArray(v)) {
      parts.push(v.map((k) => f.options?.find((o) => o.key === k)?.label ?? k).join(", "));
    } else {
      parts.push(f.options?.find((o) => o.key === v)?.label ?? v);
    }
    if (parts.length >= 3) break;
  }
  return parts.join(" · ");
}

function FieldRow({
  field,
  value,
  isAi,
  quote,
  locale,
  onChange,
  companions,
  values,
  onCompanionChange,
}: {
  field: FlatField;
  value: string | string[] | undefined;
  isAi: boolean;
  quote?: string;
  locale: Locale;
  onChange: (v: string | string[]) => void;
  companions: Companion[];
  values: Values;
  onCompanionChange: (path: string, v: string) => void;
}) {
  const hasOptions = !!field.options && field.options.length > 0;
  const isMulti = field.type === "multi-select";
  const isBoolean = !isMulti && hasOptions && field.options!.length === 2;
  const isLongSingle = !isMulti && hasOptions && field.options!.length > 5;

  function isOptionSelected(optionKey: string) {
    return isMulti ? Array.isArray(value) && value.includes(optionKey) : value === optionKey;
  }

  const companionNodes = hasOptions
    ? field
        .options!.map((o) => {
          const c = companions.find((c) => c.optionKey === o.key);
          if (!c || !isOptionSelected(o.key)) return null;
          const cv = values[c.field.path];
          return (
            <input
              key={c.field.path}
              type={c.field.type === "number" ? "number" : "text"}
              name={c.field.path}
              value={typeof cv === "string" ? cv : ""}
              onChange={(e) => onCompanionChange(c.field.path, e.target.value)}
              placeholder="specify"
              className="ml-6 mt-1 block text-sm border-b border-dashed border-hema bg-transparent px-1 py-1 w-48 focus:outline-none focus:border-petrol"
            />
          );
        })
        .filter(Boolean)
    : [];

  return (
    <div className="border-l-2 border-neutral-200 hover:border-petrol/40 pl-4 py-2 transition-colors">
      <label className="text-sm font-medium flex items-center gap-2 flex-wrap">
        {field.label}
        <TierBadge tier={field.tier} />
        {isAi && (
          <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-hema/10 text-hema">
            {t(STRINGS.aiSuggestedLabel, locale)}
          </span>
        )}
      </label>
      {isAi && quote && (
        <p className="text-xs text-hema bg-hema/5 border border-hema/20 rounded-lg px-2 py-1 mt-1 inline-block">
          <span className="font-semibold">{t(STRINGS.groundingQuoteLabel, locale)}</span> &quot;{quote}&quot;
        </p>
      )}

      {isMulti && hasOptions && (
        <MultiSelectSheet
          name={field.path}
          options={field.options!}
          defaultValue={Array.isArray(value) ? value : []}
          isAi={isAi}
          locale={locale}
          onChange={(v) => onChange(v)}
        />
      )}

      {!isMulti && isBoolean && (
        <div className="mt-1 inline-flex rounded-lg border border-neutral-300 overflow-hidden">
          {field.options!.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => onChange(o.key)}
              className={`px-4 py-2 text-sm font-medium min-h-[44px] transition-colors ${
                value === o.key ? "bg-petrol text-white" : "bg-white text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {o.label}
            </button>
          ))}
          <input type="hidden" name={field.path} value={typeof value === "string" ? value : ""} />
        </div>
      )}

      {!isMulti && hasOptions && !isBoolean && !isLongSingle && (
        <div className="mt-1 space-y-1">
          {field.options!.map((o) => (
            <label key={o.key} className="text-sm text-neutral-700 flex items-center gap-2 min-h-[32px]">
              <input
                type="radio"
                name={field.path}
                value={o.key}
                checked={value === o.key}
                onChange={() => onChange(o.key)}
                className="accent-petrol"
              />
              {o.label}
            </label>
          ))}
        </div>
      )}

      {!isMulti && hasOptions && isLongSingle && (
        <BottomSheetPicker
          name={field.path}
          options={field.options!}
          defaultValue={typeof value === "string" ? value : undefined}
          isAi={isAi}
          locale={locale}
          onChange={(v) => onChange(v ?? "")}
        />
      )}

      {companionNodes.length > 0 && <div className="mt-1 space-y-1">{companionNodes}</div>}

      {!hasOptions && field.tier === "non-core" && (field.type === "text" || field.type === "number") && (
        <textarea
          name={field.path}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="mt-1 w-full max-w-md rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-petrol focus:ring-1 focus:ring-petrol/30 outline-none"
        />
      )}
      {!hasOptions && field.tier !== "non-core" && (field.type === "text" || field.type === "number") && (
        <div className="mt-1 flex items-center gap-2">
          <input
            type={field.type === "number" ? "number" : "text"}
            name={field.path}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full max-w-md rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-petrol focus:ring-1 focus:ring-petrol/30 outline-none"
          />
          {field.unit && <span className="text-xs text-neutral-400">{field.unit}</span>}
        </div>
      )}
    </div>
  );
}

export function ReviewForm({
  templateTitle,
  bySection,
  initialValues,
  aiFieldPaths,
  quotes,
  reflexSuggestions,
  saveAction,
  signAction,
  locale,
  errorText,
  saved,
}: {
  templateTitle: string;
  bySection: [string, FlatField[]][];
  initialValues: Values;
  aiFieldPaths: string[];
  quotes: Record<string, string>;
  reflexSuggestions: { title: string; detail: string }[];
  saveAction: (formData: FormData) => void;
  signAction: (formData: FormData) => void;
  locale: Locale;
  errorText?: string;
  saved?: boolean;
}) {
  const [values, setValues] = useState<Values>(initialValues);
  const [showOptional, setShowOptional] = useState<Record<string, boolean>>({});
  const signRef = useRef<HTMLDivElement>(null);
  const aiPaths = useMemo(() => new Set(aiFieldPaths), [aiFieldPaths]);

  const companionsByParent = useMemo(
    () => buildCompanionsByParent(bySection.flatMap(([, fields]) => fields)),
    [bySection],
  );
  const allCompanionPaths = useMemo(
    () => new Set([...companionsByParent.values()].flat().map((c) => c.field.path)),
    [companionsByParent],
  );

  function setValue(path: string, v: string | string[]) {
    setValues((prev) => ({ ...prev, [path]: v }));
  }

  const remaining = useMemo(() => {
    let count = 0;
    for (const [, fields] of bySection) {
      for (const f of fields) {
        if (allCompanionPaths.has(f.path)) continue;
        if (f.tier !== "core") continue;
        if (!isFilled(values[f.path])) count++;
      }
    }
    return count;
  }, [bySection, values, allCompanionPaths]);

  const progressLabel =
    remaining === 0
      ? t(STRINGS.allRequiredComplete, locale)
      : `${remaining} ${t(STRINGS.requiredFieldsRemainingSuffix, locale)}`;

  return (
    <div className="max-w-3xl pb-28">
      <div className="sticky top-0 z-30 -mx-4 px-4 py-2.5 mb-4 bg-white/95 backdrop-blur border-b border-neutral-200">
        {remaining === 0 ? (
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-mint">
            <span className="w-4 h-4 rounded-full bg-mint text-white flex items-center justify-center text-[10px]">✓</span>
            {progressLabel}
          </p>
        ) : (
          <p className="text-xs font-semibold text-petrol">{progressLabel}</p>
        )}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">
          {t(STRINGS.reviewHeadingPrefix, locale)} {templateTitle}
        </h1>
        <p className="text-neutral-600 mt-1.5 text-sm">{t(STRINGS.reviewBody, locale)}</p>
        <div className="mt-3">
          <PrivacyIndicator locale={locale} />
        </div>
        {errorText && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errorText}</p>
        )}
        {saved && (
          <p className="mt-3 text-sm text-mint bg-mint/10 border border-mint/25 rounded-lg px-3 py-2 font-medium">
            {t(STRINGS.savedMessage, locale)}
          </p>
        )}
      </div>

      {reflexSuggestions.length > 0 && (
        <div className="mt-4 space-y-2">
          {reflexSuggestions.map((r, i) => (
            <div key={i} className="rounded-xl border border-amber-300 bg-amber-50 p-3">
              <p className="font-semibold text-amber-800 text-sm">{r.title}</p>
              <p className="text-sm text-amber-700 mt-1">{r.detail}</p>
            </div>
          ))}
        </div>
      )}

      <form className="mt-6 space-y-4">
        {bySection.map(([sectionTitle, fields]) => {
          const visibleFields = fields.filter((f) => !allCompanionPaths.has(f.path));
          const primaryFields = visibleFields.filter((f) => f.tier !== "non-core");
          const optionalFields = visibleFields.filter((f) => f.tier === "non-core");
          const missingCore = primaryFields.some((f) => f.tier === "core" && !isFilled(values[f.path]));
          const summary = summarizeSection(primaryFields, values);
          const isOptionalOpen = !!showOptional[sectionTitle];

          return (
            <AccordionSection
              key={sectionTitle}
              title={sectionTitle}
              defaultOpen={missingCore}
              summary={summary}
              complete={!missingCore}
            >
              <div className="space-y-3">
                {primaryFields.map((f) => (
                  <FieldRow
                    key={f.path}
                    field={f}
                    value={values[f.path]}
                    isAi={aiPaths.has(f.path)}
                    quote={quotes[f.path]}
                    locale={locale}
                    onChange={(v) => setValue(f.path, v)}
                    companions={companionsByParent.get(f.path) ?? []}
                    values={values}
                    onCompanionChange={(path, v) => setValue(path, v)}
                  />
                ))}
              </div>

              {optionalFields.length > 0 && (
                <div className="mt-3 border-t border-neutral-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowOptional((s) => ({ ...s, [sectionTitle]: !s[sectionTitle] }))}
                    className="text-xs font-semibold text-petrol hover:underline"
                  >
                    {isOptionalOpen
                      ? t(STRINGS.hideOptionalFields, locale)
                      : `${t(STRINGS.showOptionalFields, locale)} (${optionalFields.length})`}
                  </button>
                  {isOptionalOpen && (
                    <div className="mt-3 space-y-3">
                      {optionalFields.map((f) => (
                        <FieldRow
                          key={f.path}
                          field={f}
                          value={values[f.path]}
                          isAi={aiPaths.has(f.path)}
                          quote={quotes[f.path]}
                          locale={locale}
                          onChange={(v) => setValue(f.path, v)}
                          companions={companionsByParent.get(f.path) ?? []}
                          values={values}
                          onCompanionChange={(path, v) => setValue(path, v)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </AccordionSection>
          );
        })}

        <div
          ref={signRef}
          className="rounded-2xl border border-petrol/20 bg-gradient-to-br from-petrol/5 to-transparent p-6 space-y-3 shadow-sm"
        >
          <h2 className="text-lg font-semibold">{t(STRINGS.validateAndSign, locale)}</h2>
          <p className="text-sm text-neutral-600">{t(STRINGS.signingExplainer, locale)}</p>
          <label className="block text-sm font-semibold max-w-xs">
            {t(STRINGS.accessionNumberLabel, locale)}
            <input
              name="accession"
              required
              placeholder={t(STRINGS.accessionPlaceholder, locale)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-petrol focus:ring-1 focus:ring-petrol/30 outline-none"
            />
          </label>
          <button
            type="submit"
            formAction={signAction}
            className="rounded-lg bg-petrol px-4 py-2 text-white text-sm font-semibold shadow-sm hover:bg-petrol-deep transition-colors min-h-[44px]"
          >
            {t(STRINGS.signAndAssign, locale)}
          </button>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-neutral-200 bg-white/95 backdrop-blur px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <span className="text-xs text-neutral-500 hidden sm:inline">{progressLabel}</span>
            <div className="flex gap-2 ml-auto">
              <button
                type="submit"
                formAction={saveAction}
                formNoValidate
                className="rounded-lg border border-petrol text-petrol px-4 py-2 text-sm font-semibold hover:bg-petrol/5 transition-colors min-h-[44px]"
              >
                {t(STRINGS.saveChanges, locale)}
              </button>
              <button
                type="button"
                onClick={() => signRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
                className="rounded-lg bg-petrol px-4 py-2 text-white text-sm font-semibold shadow-sm hover:bg-petrol-deep transition-colors min-h-[44px]"
              >
                {t(STRINGS.validateAndSign, locale)}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
