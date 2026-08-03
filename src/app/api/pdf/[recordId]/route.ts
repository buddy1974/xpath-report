/**
 * X-PATH — Signed report PDF download (M6, Node runtime)
 * ------------------------------------------------------------------
 * GET-only, no state change — not a CSRF target. Same read-access check as
 * the archive detail page (assertCanReadClinicalRecord): released records
 * are visible to clinical/record roles within the tenant, never cross-
 * tenant. A PDF download is treated as another read of the clinical
 * record for audit purposes (reuses `view_clinical_record`, tagged
 * `format: "pdf"` in `detail` — no new audit_action enum value for this).
 */
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { renderToBuffer } from "@react-pdf/renderer";
import { auth } from "@/auth";
import { db } from "@/db";
import { clinicalRecords, cases } from "@/db/schema";
import { assertCanReadClinicalRecord, AccessError, type Actor } from "@/lib/access";
import { getTemplate } from "@/lib/templates";
import { writeAudit } from "@/lib/audit";
import { ReportDocument } from "@/lib/pdf/report-document";

export async function GET(req: NextRequest, { params }: { params: Promise<{ recordId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if ((session as any).totpVerified !== true) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const actor: Actor = {
    id: (session.user as any).id,
    tenantId: (session as any).tenantId,
    role: (session as any).role,
  };

  const { recordId } = await params;
  const rows = await db
    .select({ record: clinicalRecords, accession: cases.accession })
    .from(clinicalRecords)
    .innerJoin(cases, eq(cases.id, clinicalRecords.caseId))
    .where(eq(clinicalRecords.id, recordId))
    .limit(1);
  const row = rows[0];
  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });

  try {
    assertCanReadClinicalRecord(actor, {
      tenantId: row.record.tenantId,
      status: row.record.status,
      signedByPathologistId: row.record.signedByPathologistId,
    });
  } catch (err) {
    if (err instanceof AccessError) return NextResponse.json({ error: "forbidden" }, { status: 403 });
    throw err;
  }

  const content = row.record.content as {
    templateId: string;
    fieldValues: Record<string, string | string[]>;
    reflexSuggestionsAtSignOut: { title: string; detail: string }[];
  };
  const template = getTemplate(content.templateId);
  if (!template) return NextResponse.json({ error: "template_unavailable" }, { status: 500 });

  const buffer = await renderToBuffer(
    ReportDocument({
      template,
      accession: row.accession,
      version: row.record.version,
      status: row.record.status,
      releasedAt: row.record.releasedAt.toLocaleString?.() ?? String(row.record.releasedAt),
      fieldValues: content.fieldValues,
      reflexSuggestions: content.reflexSuggestionsAtSignOut ?? [],
    }),
  );

  await writeAudit({
    tenantId: actor.tenantId,
    actorId: actor.id,
    action: "view_clinical_record",
    detail: { clinicalRecordId: row.record.id, format: "pdf" },
  });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${row.accession}-${content.templateId}.pdf"`,
    },
  });
}
