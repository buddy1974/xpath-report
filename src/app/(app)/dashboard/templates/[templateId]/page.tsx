import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTemplate } from "@/lib/templates";
import { SectionView } from "@/components/template-view";
import { getLocale } from "@/lib/i18n-server";
import { STRINGS, APPROVAL_STATUS_LABELS, t } from "@/lib/i18n";

// Static structural render for M3 (Header §5: "renders as a structured
// form; version recorded; approval gate present"). No value binding
// here — this is the blank-template view; auto-filled values render at
// /dashboard/structure/[dictationId] (M5).

export default async function TemplateDetailPage({ params }: { params: Promise<{ templateId: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");
  const locale = await getLocale();

  const { templateId } = await params;
  const template = getTemplate(templateId);
  if (!template) notFound();

  const statusLabel = t(APPROVAL_STATUS_LABELS[template.approval.status] ?? APPROVAL_STATUS_LABELS.draft, locale);

  return (
    <div className="max-w-3xl">
      <p className="text-xs font-bold tracking-widest uppercase text-petrol">{template.category}</p>
      <header className="mt-1 mb-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">{template.title}</h1>
        <p className="text-sm text-neutral-500 mt-1">
          {t(STRINGS.templateSourcePrefix, locale)} {template.sourceProtocolName} · v{template.sourceVersion} ·{" "}
          {t(STRINGS.templatePosted, locale)} {template.sourcePostingDate}
        </p>
        <p className="text-sm text-neutral-500">
          {template.classificationBindings.map((b) => `${b.system} ${b.edition}`).join(" · ")}
        </p>
        <p className="text-sm mt-2">
          {t(STRINGS.approvalLabel, locale)}{" "}
          <span className={template.approval.status === "approved" ? "text-green-700 font-semibold" : "text-amber-700 font-semibold"}>
            {statusLabel}
          </span>
          {template.approval.status !== "approved" && (
            <span className="text-neutral-500"> {t(STRINGS.notYetValidSuffix, locale)}</span>
          )}
        </p>
      </header>
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        {template.sections.map((s) => (
          <SectionView key={s.key} section={s} />
        ))}
      </div>
    </div>
  );
}
