"use server";

/**
 * X-PATH — structure/auto-fill server actions (M5)
 * ------------------------------------------------------------------
 * Template is auto-suggested, human-confirmed — never blind-routed
 * (Header §5). Once confirmed, the structuring engine fills fields it
 * can ground in the transcript; everything else stays blank for the
 * pathologist to complete. Report drafts are private-workspace data
 * (kind: "report_draft") until sign-out (M6) — not audited, matching
 * Header G2.
 */
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { privateWorkspaceItems } from "@/db/schema";
import { assertWorkspaceOwner, type Actor } from "@/lib/access";
import { getTemplate } from "@/lib/templates";
import { flattenTemplate } from "@/lib/templates/flatten";
import { structureTranscript } from "@/lib/structuring";
import { computeReflexSuggestions } from "@/lib/reflex";

async function requireActor(): Promise<Actor> {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!session || !userId) throw new Error("Not authenticated");
  return { id: userId, tenantId: (session as any).tenantId, role: (session as any).role };
}

export async function confirmTemplateAndStructure(dictationId: string, templateId: string) {
  const actor = await requireActor();

  const rows = await db.select().from(privateWorkspaceItems).where(eq(privateWorkspaceItems.id, dictationId)).limit(1);
  const dictation = rows[0];
  if (!dictation) throw new Error("Dictation not found");
  assertWorkspaceOwner(actor, dictation);
  if (!dictation.body) throw new Error("This dictation has no transcript yet");

  const template = getTemplate(templateId);
  if (!template) throw new Error("Unknown template");

  const fields = flattenTemplate(template);
  const structured = await structureTranscript(dictation.body, fields);

  const fieldValues: Record<string, string | string[]> = {};
  const quotes: Record<string, string> = {};
  for (const s of structured) {
    fieldValues[s.path] = s.value;
    quotes[s.path] = s.quote;
  }
  const reflexSuggestions = computeReflexSuggestions(templateId, fieldValues);

  const draftId = randomUUID();
  await db.insert(privateWorkspaceItems).values({
    id: draftId,
    tenantId: actor.tenantId,
    ownerId: actor.id,
    kind: "report_draft",
    title: `${template.title} — draft`,
    data: {
      templateId,
      dictationId,
      fieldValues,
      aiFieldPaths: Object.keys(fieldValues),
      quotes,
      reflexSuggestions,
    },
  });

  return { draftId };
}

/** Form-action wrapper: confirm + structure, then reload the page to show the draft. */
export async function confirmTemplateAction(dictationId: string, templateId: string) {
  await confirmTemplateAndStructure(dictationId, templateId);
  redirect(`/dashboard/structure/${dictationId}`);
}

/** Finds an existing report_draft for this dictation, if one was already created. */
export async function findDraftForDictation(dictationId: string) {
  const actor = await requireActor();
  const rows = await db
    .select()
    .from(privateWorkspaceItems)
    .where(and(eq(privateWorkspaceItems.ownerId, actor.id), eq(privateWorkspaceItems.kind, "report_draft")));
  return rows.find((r) => (r.data as any)?.dictationId === dictationId) ?? null;
}
