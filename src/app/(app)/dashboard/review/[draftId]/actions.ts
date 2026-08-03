"use server";

/**
 * X-PATH — review, validate, sign (M6)
 * ------------------------------------------------------------------
 * `saveReview` just persists edits to the still-private report_draft.
 * `signAndAssign` is the real transition (Header G2): it creates the
 * audited, immutable clinical_records row, writes the audit_log entry,
 * and deletes the private_workspace_items draft — the draft's content
 * isn't lost, it becomes the clinical record's `content`, which is what
 * "a draft becomes a clinical record only at sign-out" means concretely.
 *
 * No case/specimen management UI exists (deliberately deferred,
 * XPATH_Roadmap_to_First_Login.md). But `clinical_records.caseId` is a
 * required FK — Session 01's schema already anticipated this need. The
 * minimal bridge here is a single accession-number input at sign-out;
 * find-or-create the case by (tenant, accession) rather than building
 * any case list/search/edit UI.
 */
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { privateWorkspaceItems, cases, clinicalRecords } from "@/db/schema";
import { assertWorkspaceOwner, type Actor } from "@/lib/access";
import { getTemplate } from "@/lib/templates";
import { flattenTemplate, type FlatField } from "@/lib/templates/flatten";
import { writeAudit } from "@/lib/audit";

async function requireActor(): Promise<Actor> {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!session || !userId) throw new Error("Not authenticated");
  return { id: userId, tenantId: (session as any).tenantId, role: (session as any).role };
}

function parseFieldValues(formData: FormData, fields: FlatField[]): Record<string, string | string[]> {
  const values: Record<string, string | string[]> = {};
  for (const f of fields) {
    if (f.type === "multi-select") {
      const all = formData.getAll(f.path).map(String).filter(Boolean);
      if (all.length > 0) values[f.path] = all;
    } else {
      const v = formData.get(f.path);
      if (typeof v === "string" && v.trim()) values[f.path] = v.trim();
    }
  }
  return values;
}

async function loadDraftAndFields(draftId: string, actor: Actor) {
  const rows = await db.select().from(privateWorkspaceItems).where(eq(privateWorkspaceItems.id, draftId)).limit(1);
  const draft = rows[0];
  if (!draft || draft.kind !== "report_draft") throw new Error("Draft not found");
  assertWorkspaceOwner(actor, draft);

  const data = draft.data as { templateId: string };
  const template = getTemplate(data.templateId);
  if (!template) throw new Error("Unknown template");

  const fields = flattenTemplate(template);
  return { draft, template, fields };
}

/** Persists edits without signing — the draft stays private (Header G2). */
export async function saveReview(draftId: string, formData: FormData) {
  const actor = await requireActor();
  const { draft, fields } = await loadDraftAndFields(draftId, actor);
  const fieldValues = parseFieldValues(formData, fields);

  await db
    .update(privateWorkspaceItems)
    .set({
      // A save from the full review form means the pathologist looked at
      // the whole draft, not just one field — every value is now
      // human-reviewed, not still "AI-suggested, unverified" (Header G1).
      data: { ...(draft.data as object), fieldValues, aiFieldPaths: [] },
      updatedAt: new Date(),
    })
    .where(eq(privateWorkspaceItems.id, draftId));

  redirect(`/dashboard/review/${draftId}?saved=1`);
}

/** The real transition: private draft -> audited clinical record. */
export async function signAndAssign(draftId: string, formData: FormData) {
  const actor = await requireActor();
  const { draft, template, fields } = await loadDraftAndFields(draftId, actor);
  const fieldValues = parseFieldValues(formData, fields);

  const accession = String(formData.get("accession") ?? "").trim();
  if (!accession) {
    redirect(`/dashboard/review/${draftId}?error=accession_required`);
  }

  const existingCase = await db
    .select()
    .from(cases)
    .where(and(eq(cases.tenantId, actor.tenantId), eq(cases.accession, accession)))
    .limit(1);

  let caseId = existingCase[0]?.id;
  if (!caseId) {
    const [created] = await db
      .insert(cases)
      .values({
        tenantId: actor.tenantId,
        accession,
        assignedPathologistId: actor.id,
        specimenType: template.title,
      })
      .returning();
    caseId = created.id;
  }

  const draftData = draft.data as {
    quotes?: Record<string, string>;
    reflexSuggestions?: { title: string; detail: string }[];
    dictationId?: string;
  };

  const [record] = await db
    .insert(clinicalRecords)
    .values({
      tenantId: actor.tenantId,
      caseId,
      signedByPathologistId: actor.id,
      status: "released",
      version: "1",
      content: {
        templateId: template.templateId,
        templateTitle: template.title,
        sourceVersion: template.sourceVersion,
        fieldValues,
        // AI grounding quotes preserved for audit traceability — what was
        // AI-suggested vs. entered/corrected by the pathologist stays
        // visible in the permanent record, not just the ephemeral draft.
        quotes: draftData.quotes ?? {},
        reflexSuggestionsAtSignOut: draftData.reflexSuggestions ?? [],
        dictationId: draftData.dictationId ?? null,
      },
    })
    .returning();

  await writeAudit({
    tenantId: actor.tenantId,
    actorId: actor.id,
    action: "sign_out_report",
    detail: { clinicalRecordId: record.id, caseId, accession, templateId: template.templateId },
  });

  // The draft's content now lives in the clinical record — this row's job
  // is done. Not data loss: the content was copied above, not moved.
  await db.delete(privateWorkspaceItems).where(eq(privateWorkspaceItems.id, draftId));

  redirect(`/dashboard/archive/${record.id}`);
}
