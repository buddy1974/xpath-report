import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { privateWorkspaceItems } from "@/db/schema";
import { getTemplate } from "@/lib/templates";
import { flattenTemplate, type FlatField } from "@/lib/templates/flatten";
import { getLocale } from "@/lib/i18n-server";
import { STRINGS, t, type Locale } from "@/lib/i18n";
import { saveReview, signAndAssign } from "./actions";
import { ReviewForm } from "./review-form";

function errorMessage(code: string | undefined, locale: Locale): string | undefined {
  if (!code) return undefined;
  if (code === "accession_required") return t(STRINGS.accessionRequiredError, locale);
  return t(STRINGS.somethingWentWrong, locale);
}

// Data-fetch + auth stays server-side; the interactive accordion/bottom-
// sheet/specify-reveal rendering lives in review-form.tsx (client) — see
// DL-045. Server Actions are passed down as props, a supported Next.js
// pattern; the client form still submits through the same field `name`s
// actions.ts's parseFieldValues already expects, so nothing there changed.
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
    urgentFlag?: { urgent: boolean; severity: "attention" | "critical"; note: string } | null;
  };
  const template = getTemplate(data.templateId);
  if (!template) notFound();

  const fields = flattenTemplate(template);

  const bySection = new Map<string, FlatField[]>();
  for (const f of fields) {
    if (!bySection.has(f.sectionTitle)) bySection.set(f.sectionTitle, []);
    bySection.get(f.sectionTitle)!.push(f);
  }

  const saveAction = saveReview.bind(null, draftId);
  const signAction = signAndAssign.bind(null, draftId);
  const errorText = errorMessage(sp?.error, locale);

  return (
    <ReviewForm
      templateTitle={template.title}
      bySection={[...bySection.entries()]}
      initialValues={data.fieldValues ?? {}}
      aiFieldPaths={data.aiFieldPaths ?? []}
      quotes={data.quotes ?? {}}
      reflexSuggestions={data.reflexSuggestions ?? []}
      initialUrgentFlag={data.urgentFlag}
      saveAction={saveAction}
      signAction={signAction}
      locale={locale}
      errorText={errorText}
      saved={!!sp?.saved}
    />
  );
}
