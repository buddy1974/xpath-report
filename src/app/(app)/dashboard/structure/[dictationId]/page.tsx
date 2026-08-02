import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { privateWorkspaceItems } from "@/db/schema";
import { getTemplate } from "@/lib/templates";
import { suggestTemplates } from "@/lib/templates/suggest";
import { SectionView } from "@/components/template-view";
import { confirmTemplateAction, findDraftForDictation } from "./actions";

export default async function StructurePage({ params }: { params: Promise<{ dictationId: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");
  const userId = (session.user as any).id as string;

  const { dictationId } = await params;
  const rows = await db.select().from(privateWorkspaceItems).where(eq(privateWorkspaceItems.id, dictationId)).limit(1);
  const dictation = rows[0];
  // Owner-only (Header G2) — a 404, not a 403, so existence isn't leaked either.
  if (!dictation || dictation.ownerId !== userId) notFound();

  if (!dictation.body) {
    return (
      <main className="min-h-screen p-8 max-w-2xl">
        <h1 className="text-2xl font-semibold">Not transcribed yet</h1>
        <p className="text-neutral-600 mt-1">This dictation has no transcript yet — finish it on the Dictate page first.</p>
      </main>
    );
  }

  const draft = await findDraftForDictation(dictationId);

  if (!draft) {
    const suggestions = suggestTemplates(dictation.body);
    return (
      <main className="min-h-screen p-8 max-w-2xl">
        <h1 className="text-2xl font-semibold">Choose a template</h1>
        <p className="text-neutral-600 mt-1">
          Suggested from your dictation — confirm the one that matches. Never auto-routed (Header §5).
        </p>
        <div className="mt-4 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-600 whitespace-pre-wrap">
          <p className="font-semibold text-xs uppercase tracking-wide text-neutral-400 mb-1">Transcript</p>
          {dictation.body}
        </div>
        <div className="mt-6 space-y-2">
          {suggestions.length === 0 && <p className="text-sm text-neutral-500">No templates available yet.</p>}
          {suggestions.map((s) => (
            <form key={s.templateId} action={confirmTemplateAction.bind(null, dictationId, s.templateId)}>
              <button className="w-full text-left rounded-lg border border-neutral-300 p-4 hover:border-petrol">
                <span className="font-semibold text-petrol">{s.title}</span>
                {s.score > 0 && <span className="ml-2 text-xs text-neutral-400">match score {s.score}</span>}
              </button>
            </form>
          ))}
        </div>
      </main>
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
    <main className="min-h-screen p-8 max-w-3xl">
      <h1 className="text-2xl font-semibold">{template.title}</h1>
      <p className="text-sm text-neutral-500 mt-1">
        Auto-filled from your dictation. Fields marked <span className="text-hema font-medium">AI-suggested</span> need
        your review before this becomes a signed record (Header G1/G8) — review, correction, and sign-out is M6, not
        yet built. Nothing here is part of the clinical record yet.
      </p>

      {data.reflexSuggestions.length > 0 && (
        <div className="mt-4 space-y-2">
          {data.reflexSuggestions.map((r, i) => (
            <div key={i} className="rounded-md border border-amber-300 bg-amber-50 p-3">
              <p className="font-semibold text-amber-800 text-sm">{r.title}</p>
              <p className="text-sm text-amber-700 mt-1">{r.detail}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        {template.sections.map((s) => (
          <SectionView
            key={s.key}
            section={s}
            filled={{ values: data.fieldValues, aiPaths: new Set(data.aiFieldPaths), quotes: data.quotes }}
          />
        ))}
      </div>
    </main>
  );
}
