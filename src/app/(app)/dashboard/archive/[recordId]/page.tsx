import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { clinicalRecords, cases } from "@/db/schema";
import { assertCanReadClinicalRecord, type Actor } from "@/lib/access";
import { getTemplate } from "@/lib/templates";
import { SectionView } from "@/components/template-view";
import { writeAudit } from "@/lib/audit";

export default async function ArchiveRecordPage({ params }: { params: Promise<{ recordId: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");
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
  if (!row) notFound();

  // Released records are visible to clinical/record roles within the
  // tenant (Header G2 — this is the audited record of truth, not
  // private workspace data); still tenant-scoped, still denies
  // cross-tenant reads even for administrators of a different tenant.
  assertCanReadClinicalRecord(actor, {
    tenantId: row.record.tenantId,
    status: row.record.status,
    signedByPathologistId: row.record.signedByPathologistId,
  });

  if (actor.id !== row.record.signedByPathologistId) {
    await writeAudit({
      tenantId: actor.tenantId,
      actorId: actor.id,
      action: "view_clinical_record",
      detail: { clinicalRecordId: row.record.id },
    });
  }

  const content = row.record.content as {
    templateId: string;
    templateTitle: string;
    sourceVersion: string;
    fieldValues: Record<string, string | string[]>;
    reflexSuggestionsAtSignOut: { title: string; detail: string }[];
  };
  const template = getTemplate(content.templateId);

  const pdfConfigured = Boolean(process.env.PDF_WORKER_URL);

  return (
    <main className="min-h-screen p-8 max-w-3xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">{content.templateTitle}</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Accession {row.accession} · v{row.record.version} · {row.record.status} ·{" "}
          signed {row.record.releasedAt.toLocaleString?.() ?? String(row.record.releasedAt)}
        </p>
        <p className="text-sm text-neutral-500">Source template version {content.sourceVersion}</p>
        {pdfConfigured ? (
          <a href={`/api/pdf/${row.record.id}`} className="inline-block mt-2 text-sm font-semibold text-petrol underline">
            Download PDF
          </a>
        ) : (
          <p className="mt-2 text-xs text-neutral-400">PDF generation not yet configured (M6 SIGNAL pending).</p>
        )}
      </header>

      {content.reflexSuggestionsAtSignOut?.length > 0 && (
        <div className="mb-4 space-y-2">
          {content.reflexSuggestionsAtSignOut.map((r, i) => (
            <div key={i} className="rounded-md border border-amber-300 bg-amber-50 p-3">
              <p className="font-semibold text-amber-800 text-sm">{r.title}</p>
              <p className="text-sm text-amber-700 mt-1">{r.detail}</p>
            </div>
          ))}
        </div>
      )}

      {template &&
        template.sections.map((s) => <SectionView key={s.key} section={s} filled={{ values: content.fieldValues }} />)}
    </main>
  );
}
