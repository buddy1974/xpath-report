import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { privateWorkspaceItems } from "@/db/schema";
import { getTemplate } from "@/lib/templates";
import { suggestTemplates } from "@/lib/templates/suggest";
import { SectionView } from "@/components/template-view";
import { PrivacyIndicator } from "@/components/privacy-indicator";
import { getLocale } from "@/lib/i18n-server";
import { STRINGS, t } from "@/lib/i18n";
import { confirmTemplateAction, findDraftForDictation } from "./actions";

export default async function StructurePage({ params }: { params: Promise<{ dictationId: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");
  const userId = (session.user as any).id as string;
  const locale = await getLocale();

  const { dictationId } = await params;
  const rows = await db.select().from(privateWorkspaceItems).where(eq(privateWorkspaceItems.id, dictationId)).limit(1);
  const dictation = rows[0];
  // Owner-only (Header G2) — a 404, not a 403, so existence isn't leaked either.
  if (!dictation || dictation.ownerId !== userId) notFound();

  if (!dictation.body) {
    return (
      <div className="max-w-2xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">{t(STRINGS.notTranscribedHeading, locale)}</h1>
        <p className="text-neutral-600 mt-1">{t(STRINGS.notTranscribedBody, locale)}</p>
      </div>
    );
  }

  const draft = await findDraftForDictation(dictationId);

  if (!draft) {
    const suggestions = suggestTemplates(dictation.body);
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold">{t(STRINGS.chooseTemplateHeading, locale)}</h1>
        <p className="text-neutral-600 mt-1">{t(STRINGS.chooseTemplateBody, locale)}</p>
        <div className="mt-3">
          <PrivacyIndicator locale={locale} />
        </div>
        <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600 whitespace-pre-wrap shadow-sm">
          <p className="font-semibold text-xs uppercase tracking-wide text-neutral-400 mb-1">
            {t(STRINGS.transcriptSectionLabel, locale)}
          </p>
          {dictation.body}
        </div>
        <div className="mt-6 space-y-2">
          {suggestions.length === 0 && <p className="text-sm text-neutral-500">{t(STRINGS.noTemplatesAvailable, locale)}</p>}
          {suggestions.map((s) => (
            <form key={s.templateId} action={confirmTemplateAction.bind(null, dictationId, s.templateId)}>
              <button className="w-full text-left rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-petrol/30 transition-all">
                <span className="font-semibold text-petrol">{s.title}</span>
                {s.score > 0 && (
                  <span className="ml-2 text-xs text-neutral-400">
                    {t(STRINGS.matchScorePrefix, locale)} {s.score}
                  </span>
                )}
              </button>
            </form>
          ))}
        </div>
      </div>
    );
  }

  const data = draft.data as {
    templateId: string;
    fieldValues: Record<string, string | string[]>;
    aiFieldPaths: string[];
    quotes: Record<string, string>;
    reflexSuggestions: { title: string; detail: string }[];
  };
  const template = getTemplate(data.templateId);
  if (!template) notFound();

  return (
    <div className="max-w-3xl">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">{template.title}</h1>
        <p className="text-sm text-neutral-500 mt-1">
          {t(STRINGS.autoFilledNote, locale)}{" "}
          <span className="text-hema font-medium">{t(STRINGS.aiSuggestedLabel, locale)}</span>{" "}
          {t(STRINGS.autoFilledNoteEnd, locale)}
        </p>
        <div className="mt-3">
          <PrivacyIndicator locale={locale} />
        </div>
        <Link
          href={`/dashboard/review/${draft.id}`}
          className="inline-flex items-center gap-1.5 mt-3 rounded-lg bg-petrol px-4 py-2 text-white text-sm font-semibold shadow-sm hover:bg-petrol-deep transition-colors"
        >
          {t(STRINGS.reviewAndSignLink, locale)}
        </Link>
      </div>

      {data.reflexSuggestions.length > 0 && (
        <div className="mt-4 space-y-2">
          {data.reflexSuggestions.map((r, i) => (
            <div key={i} className="rounded-xl border border-amber-300 bg-amber-50 p-3">
              <p className="font-semibold text-amber-800 text-sm">{r.title}</p>
              <p className="text-sm text-amber-700 mt-1">{r.detail}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        {template.sections.map((s) => (
          <SectionView
            key={s.key}
            section={s}
            filled={{ values: data.fieldValues, aiPaths: new Set(data.aiFieldPaths), quotes: data.quotes }}
          />
        ))}
      </div>
    </div>
  );
}
