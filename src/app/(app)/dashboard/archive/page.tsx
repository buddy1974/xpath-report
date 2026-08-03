import Link from "next/link";
import { redirect } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { clinicalRecords, cases } from "@/db/schema";

export default async function ArchivePage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");
  const userId = (session.user as any).id as string;

  // Own signed records only, for now — "files into the pathologist's
  // archive" (Header roadmap M6). Cross-pathologist/manager visibility
  // into released records (lib/access.ts:canReadClinicalRecord already
  // allows it) is a real feature, deliberately not built into the UI
  // yet — M6's scope is the signing loop, not an operations dashboard.
  const rows = await db
    .select({ record: clinicalRecords, accession: cases.accession })
    .from(clinicalRecords)
    .innerJoin(cases, eq(cases.id, clinicalRecords.caseId))
    .where(and(eq(clinicalRecords.tenantId, (session as any).tenantId), eq(clinicalRecords.signedByPathologistId, userId)))
    .orderBy(desc(clinicalRecords.releasedAt));

  return (
    <main className="min-h-screen p-8 max-w-3xl">
      <h1 className="text-2xl font-semibold">Archive</h1>
      <p className="text-neutral-600 mt-1 text-sm">Your signed, released reports — the audited clinical record.</p>

      {rows.length === 0 && <p className="mt-6 text-sm text-neutral-500">Nothing signed yet.</p>}

      <ul className="mt-6 space-y-2">
        {rows.map(({ record, accession }) => {
          const content = record.content as { templateTitle: string };
          return (
            <li key={record.id}>
              <Link href={`/dashboard/archive/${record.id}`} className="block rounded-lg border border-neutral-300 p-4 hover:border-petrol">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-petrol">{content.templateTitle}</span>
                  <span className="text-xs text-neutral-400">{record.releasedAt.toLocaleString?.() ?? String(record.releasedAt)}</span>
                </div>
                <p className="text-sm text-neutral-500 mt-1">
                  Accession {accession} · v{record.version} · {record.status}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
