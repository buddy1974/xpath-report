import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { templates } from "@/lib/templates";
import { accentForCategory } from "@/lib/templates/category-colors";
import { getLocale } from "@/lib/i18n-server";
import { STRINGS, APPROVAL_STATUS_LABELS, t } from "@/lib/i18n";

// Fixed per-category color (DL-051) — cosmetic only, not a clinical
// color code. Full literal class strings so Tailwind's scanner picks
// them up (dynamic `bg-${accent}` interpolation would not).
const ACCENT_BADGE: Record<string, string> = {
  categoryRose: "bg-categoryRose/10 text-categoryRose",
  categoryAmber: "bg-categoryAmber/10 text-categoryAmber",
  categoryIndigo: "bg-categoryIndigo/10 text-categoryIndigo",
  categoryViolet: "bg-categoryViolet/10 text-categoryViolet",
  categoryOlive: "bg-categoryOlive/10 text-categoryOlive",
  petrol: "bg-petrol/10 text-petrol",
};

export default async function TemplatesIndexPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");
  const locale = await getLocale();

  // Group by category (DL-043) — scales cleanly as templates are added:
  // grouping comes from each template's own `category` field, not a
  // hardcoded UI mapping. Order: first-seen order in the registry.
  const groups = new Map<string, typeof templates>();
  for (const template of templates) {
    if (!groups.has(template.category)) groups.set(template.category, []);
    groups.get(template.category)!.push(template);
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">{t(STRINGS.templatesHeading, locale)}</h1>
      <p className="text-neutral-600 mt-1.5">{t(STRINGS.templatesBody, locale)}</p>

      <div className="mt-6 space-y-3">
        {[...groups.entries()].map(([category, categoryTemplates]) => {
          const accent = accentForCategory(category);
          const initial = category.replace(/[^A-Za-z]/g, "")[0] ?? "?";
          return (
            <details
              key={category}
              className="group rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              open
            >
              <summary className="cursor-pointer list-none px-5 py-4 flex items-center gap-3 hover:bg-petrol/5 transition-colors">
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${ACCENT_BADGE[accent]}`}>
                  {initial}
                </span>
                <span className="font-semibold text-petrol">{category}</span>
                <span className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-neutral-400">
                    {categoryTemplates.length} {categoryTemplates.length === 1 ? t(STRINGS.templateWord, locale) : t(STRINGS.templatesWord, locale)}
                  </span>
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4 text-neutral-400 transition-transform group-open:rotate-180"
                  >
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
                  </svg>
                </span>
              </summary>
              <ul className="border-t border-neutral-100 divide-y divide-neutral-100">
                {categoryTemplates.map((template) => {
                  const statusLabel = t(APPROVAL_STATUS_LABELS[template.approval.status] ?? APPROVAL_STATUS_LABELS.draft, locale);
                  return (
                    <li key={template.templateId}>
                      <Link
                        href={`/dashboard/templates/${template.templateId}`}
                        className="block px-5 py-4 hover:bg-petrol/5 transition-colors"
                      >
                        <span className="font-medium text-petrol">{template.title}</span>
                        <p className="text-sm text-neutral-500 mt-0.5">
                          v{template.sourceVersion} · {statusLabel} · {template.sections.length} {t(STRINGS.sectionsWord, locale)}
                        </p>
                        <p className="text-sm text-neutral-600 mt-1">{template.blurb}</p>
                        {template.panelPreview && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {template.panelPreview.map((marker) => (
                              <span
                                key={marker}
                                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${ACCENT_BADGE[accent]}`}
                              >
                                {marker}
                              </span>
                            ))}
                          </div>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </div>
    </div>
  );
}
