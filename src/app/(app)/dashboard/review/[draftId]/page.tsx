import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { privateWorkspaceItems } from "@/db/schema";
import { getTemplate } from "@/lib/templates";
import { flattenTemplate, type FlatField } from "@/lib/templates/flatten";
import { TierBadge } from "@/components/template-view";
import { PrivacyIndicator } from "@/components/privacy-indicator";
import { getLocale } from "@/lib/i18n-server";
import { STRINGS, t, type Locale } from "@/lib/i18n";
import { saveReview, signAndAssign } from "./actions";

function errorMessage(code: string | undefined, locale: Locale): string | undefined {
  if (!code) return undefined;
  if (code === "accession_required") return t(STRINGS.accessionRequiredError, locale);
  return t(STRINGS.somethingWentWrong, locale);
}

// Flat, uniform field-per-row editor rather than replicating the nested
// tree UI from template-view.tsx — every field type this needs (single/
// multi-select, text/number, "specify" companion values, "cannot be
// determined") already has one addressable path from flattenTemplate,
// so one render function covers all of them. Known simplification: a
// selected single-select radio can't be un-selected without JS — a real
// but minor rough edge for this first version, not hidden here.
function FieldEditor({
  field,
  value,
  isAi,
  quote,
  locale,
}: {
  field: FlatField;
  value?: string | string[];
  isAi: boolean;
  quote?: string;
  locale: Locale;
}) {
  return (
    <div className="border-l-2 border-neutral-200 hover:border-petrol/40 pl-4 py-1 transition-colors">
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
          <span className="font-semibold">{t(STRINGS.groundingQuoteLabel, locale)}</span> "{quote}"
        </p>
      )}
      {field.options ? (
        <div className="mt-1 space-y-1">
          {field.options.map((opt) => {
            const checked = field.type === "multi-select" ? Array.isArray(value) && value.includes(opt.key) : value === opt.key;
            return (
              <label key={opt.key} className="text-sm text-neutral-700 flex items-center gap-2">
                <input
                  type={field.type === "multi-select" ? "checkbox" : "radio"}
                  name={field.path}
                  value={opt.key}
                  defaultChecked={checked}
                  className="accent-petrol"
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      ) : (
        <input
          type={field.type === "number" ? "number" : "text"}
          name={field.path}
          defaultValue={typeof value === "string" ? value : ""}
          className="mt-1 w-full max-w-md rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      )}
    </div>
  );
}

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ draftId: string }>;
  searchParams?: Promise<{ saved?: string; error?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");
  const userId = (session.user as any).id as string;
  const locale = await getLocale();

  const { draftId } = await params;
  const sp = await searchParams;

  const rows = await db.select().from(privateWorkspaceItems).where(eq(privateWorkspaceItems.id, draftId)).limit(1);
  const draft = rows[0];
  // Owner-only (Header G2) — 404, not 403, so existence isn't leaked.
  if (!draft || draft.ownerId !== userId || draft.kind !== "report_draft") notFound();

  const data = draft.data as {
    templateId: string;
    fieldValues: Record<string, string | string[]>;
    aiFieldPaths: string[];
    quotes?: Record<string, string>;
    reflexSuggestions: { title: string; detail: string }[];
  };
  const template = getTemplate(data.templateId);
  if (!template) notFound();

  const fields = flattenTemplate(template);
  const aiPaths = new Set(data.aiFieldPaths ?? []);

  const bySection = new Map<string, FlatField[]>();
  for (const f of fields) {
    if (!bySection.has(f.sectionTitle)) bySection.set(f.sectionTitle, []);
    bySection.get(f.sectionTitle)!.push(f);
  }

  const saveAction = saveReview.bind(null, draftId);
  const signAction = signAndAssign.bind(null, draftId);
  const errorText = errorMessage(sp?.error, locale);

  return (
    <div className="max-w-3xl">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">
          {t(STRINGS.reviewHeadingPrefix, locale)} {template.title}
        </h1>
        <p className="text-neutral-600 mt-1 text-sm">{t(STRINGS.reviewBody, locale)}</p>
        <div className="mt-3">
          <PrivacyIndicator locale={locale} />
        </div>

        {errorText && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errorText}</p>
        )}
        {sp?.saved && (
          <p className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            {t(STRINGS.savedMessage, locale)}
          </p>
        )}
      </div>

      {data.reflexSuggestions?.length > 0 && (
        <div className="mt-4 space-y-2">
          {data.reflexSuggestions.map((r, i) => (
            <div key={i} className="rounded-xl border border-amber-300 bg-amber-50 p-3">
              <p className="font-semibold text-amber-800 text-sm">{r.title}</p>
              <p className="text-sm text-amber-700 mt-1">{r.detail}</p>
            </div>
          ))}
        </div>
      )}

      {/* One form, two submit buttons routed to different Server Actions
          via formAction — avoids nested/sibling <form> problems while
          keeping "sign" able to pick up last-second edits too. */}
      <form className="mt-6 space-y-6">
        {[...bySection.entries()].map(([sectionTitle, sectionFields]) => (
          <section key={sectionTitle} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold uppercase tracking-wide text-petrol">{sectionTitle}</h2>
            <div className="mt-3 space-y-4">
              {sectionFields.map((f) => (
                <FieldEditor
                  key={f.path}
                  field={f}
                  value={data.fieldValues?.[f.path]}
                  isAi={aiPaths.has(f.path)}
                  quote={data.quotes?.[f.path]}
                  locale={locale}
                />
              ))}
            </div>
          </section>
        ))}

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <button type="submit" formAction={saveAction} className="rounded-lg border border-petrol text-petrol px-4 py-2 text-sm font-semibold hover:bg-petrol/5 transition-colors">
            {t(STRINGS.saveChanges, locale)}
          </button>
        </div>

        <div className="rounded-2xl border border-petrol/20 bg-gradient-to-br from-petrol/5 to-transparent p-6 space-y-3 shadow-sm">
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
          <button type="submit" formAction={signAction} className="rounded-lg bg-petrol px-4 py-2 text-white text-sm font-semibold shadow-sm hover:bg-petrol-deep transition-colors">
            {t(STRINGS.signAndAssign, locale)}
          </button>
        </div>
      </form>
    </div>
  );
}
