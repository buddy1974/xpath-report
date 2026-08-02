import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTemplate } from "@/lib/templates";
import { SectionView } from "@/components/template-view";

// Static structural render for M3 (Header §5: "renders as a structured
// form; version recorded; approval gate present"). No value binding
// here — this is the blank-template view; auto-filled values render at
// /dashboard/structure/[dictationId] (M5).

export default async function TemplateDetailPage({ params }: { params: Promise<{ templateId: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");

  const { templateId } = await params;
  const template = getTemplate(templateId);
  if (!template) notFound();

  return (
    <main className="min-h-screen p-8 max-w-3xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">{template.title}</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Source: {template.sourceProtocolName} · v{template.sourceVersion} · posted {template.sourcePostingDate}
        </p>
        <p className="text-sm text-neutral-500">
          {template.classificationBindings.map((b) => `${b.system} ${b.edition}`).join(" · ")}
        </p>
        <p className="text-sm mt-2">
          Approval:{" "}
          <span className={template.approval.status === "approved" ? "text-green-700 font-semibold" : "text-amber-700 font-semibold"}>
            {template.approval.status}
          </span>
          {template.approval.status !== "approved" && (
            <span className="text-neutral-500"> — not yet valid for clinical use (Header G3)</span>
          )}
        </p>
      </header>
      {template.sections.map((s) => (
        <SectionView key={s.key} section={s} />
      ))}
    </main>
  );
}
