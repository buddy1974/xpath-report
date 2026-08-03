/**
 * X-PATH — shared template renderer (M3 static view, M5 read-only
 * auto-filled view). Path construction here MUST match
 * lib/templates/flatten.ts exactly — same "{prefix}.{field.key}" and
 * option-child "{path}.{opt.key}" scheme — since `values`/`aiPaths`/
 * `quotes` are keyed by that path.
 */
import type { TemplateField, TemplateSection, FieldTier } from "@/lib/templates";
import { STRINGS, t, type Locale } from "@/lib/i18n";

const TIER_STYLES: Record<FieldTier, string> = {
  core: "bg-petrol/10 text-petrol",
  conditional: "bg-amber-100 text-amber-700",
  "non-core": "bg-neutral-100 text-neutral-500",
};

export function TierBadge({ tier }: { tier: FieldTier }) {
  return <span className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded ${TIER_STYLES[tier]}`}>{tier}</span>;
}

export interface FilledValues {
  values?: Record<string, string | string[]>;
  aiPaths?: Set<string>;
  quotes?: Record<string, string>;
}

function isSelected(values: Record<string, string | string[]> | undefined, path: string, optionKey: string): boolean {
  const v = values?.[path];
  if (v === undefined) return false;
  return Array.isArray(v) ? v.includes(optionKey) : v === optionKey;
}

export function FieldView({
  field,
  pathPrefix,
  filled,
  locale = "en",
}: {
  field: TemplateField;
  pathPrefix: string;
  filled?: FilledValues;
  locale?: Locale;
}) {
  const path = `${pathPrefix}.${field.key}`;
  const isAi = filled?.aiPaths?.has(path);
  const quote = filled?.quotes?.[path];
  const textValue = typeof filled?.values?.[path] === "string" ? (filled?.values?.[path] as string) : undefined;

  return (
    <div className="border-l-2 border-neutral-200 hover:border-petrol/40 pl-4 py-2 transition-colors">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-medium text-sm">{field.label}</span>
        <TierBadge tier={field.tier} />
        {isAi && (
          <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-hema/10 text-hema">AI-suggested</span>
        )}
        {field.noteRef && <span className="text-xs text-neutral-400">{field.noteRef}</span>}
        {field.repeatable && (
          <span className="text-xs text-neutral-400">repeatable, up to {field.repeatable.max}x</span>
        )}
      </div>

      {field.options && (
        <div className="mt-1 space-y-1">
          {field.options.map((opt) => {
            const selected = isSelected(filled?.values, path, opt.key);
            const optTextPath = `${path}.${opt.key}.text`;
            const optTextValue = filled?.values?.[optTextPath];
            const optTextQuote = filled?.quotes?.[optTextPath];
            return (
              <div key={opt.key}>
                <div className={`text-sm flex items-center gap-2 ${selected ? "text-petrol font-medium" : "text-neutral-700"}`}>
                  <input
                    type={field.type === "multi-select" ? "checkbox" : "radio"}
                    disabled
                    checked={selected}
                    readOnly
                    className="accent-petrol"
                  />
                  <span>{opt.label}</span>
                  {opt.requiresText && (
                    <input
                      disabled
                      value={typeof optTextValue === "string" ? optTextValue : ""}
                      readOnly
                      placeholder={opt.textLabel ?? "specify"}
                      className={`text-xs border-b border-dashed bg-transparent w-32 ${optTextValue ? "border-hema text-hema font-medium" : "border-neutral-300"}`}
                    />
                  )}
                  {opt.textUnit && <span className="text-xs text-neutral-400">{opt.textUnit}</span>}
                </div>
                {optTextQuote && (
                  <p className="ml-6 text-xs text-hema bg-hema/5 border border-hema/20 rounded-lg px-2 py-1 mt-1 inline-block">
                    <span className="font-semibold">{t(STRINGS.groundingQuoteLabel, locale)}</span> "{optTextQuote}"
                  </p>
                )}
              </div>
            );
          })}
          {field.cannotBeDetermined && (
            <div className="text-sm text-neutral-500 flex items-center gap-2">
              <input type="radio" disabled />
              <span>Cannot be determined (explain)</span>
            </div>
          )}
        </div>
      )}

      {(field.type === "text" || field.type === "number") && !field.options && (
        <input
          disabled
          type={field.type === "number" ? "number" : "text"}
          value={textValue ?? ""}
          readOnly
          className={`mt-1 text-sm border rounded px-2 py-1 w-64 ${textValue ? "border-hema bg-hema/5" : "border-neutral-300 bg-neutral-50"}`}
          placeholder={field.unit ? `value (${field.unit})` : "value"}
        />
      )}

      {quote && (
        <p className="mt-1 text-xs text-hema bg-hema/5 border border-hema/20 rounded-lg px-2 py-1 inline-block">
          <span className="font-semibold">{t(STRINGS.groundingQuoteLabel, locale)}</span> "{quote}"
        </p>
      )}

      {field.children && field.children.length > 0 && (
        <div className="mt-2 space-y-1">
          {field.children.map((child) => (
            <FieldView key={child.key} field={child} pathPrefix={path} filled={filled} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}

export function SectionView({ section, filled, locale = "en" }: { section: TemplateSection; filled?: FilledValues; locale?: Locale }) {
  return (
    <section className="mb-8 last:mb-0">
      <h2 className="text-lg font-semibold uppercase tracking-wide text-petrol pb-2 border-b border-petrol/10">{section.title}</h2>
      <div className="mt-3 space-y-3">
        {section.fields.map((f) => (
          <FieldView key={f.key} field={f} pathPrefix={section.key} filled={filled} locale={locale} />
        ))}
      </div>
    </section>
  );
}
