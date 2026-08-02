import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTemplate } from "@/lib/templates";
import type { TemplateField, TemplateSection } from "@/lib/templates";
import { TierBadge } from "./tier-badge";

// Static structural render for M3 (Header §5: "renders as a structured
// form; version recorded; approval gate present"). No value binding yet
// — dictation/auto-fill wiring is M5. Inputs are disabled on purpose.

function FieldView({ field }: { field: TemplateField }) {
  return (
    <div className="border-l-2 border-neutral-200 pl-4 py-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-medium text-sm">{field.label}</span>
        <TierBadge tier={field.tier} />
        {field.noteRef && <span className="text-xs text-neutral-400">{field.noteRef}</span>}
        {field.repeatable && (
          <span className="text-xs text-neutral-400">repeatable, up to {field.repeatable.max}x</span>
        )}
      </div>

      {field.options && (
        <div className="mt-1 space-y-1">
          {field.options.map((opt) => (
            <div key={opt.key} className="text-sm text-neutral-700 flex items-center gap-2">
              <input type={field.type === "multi-select" ? "checkbox" : "radio"} disabled className="accent-petrol" />
              <span>{opt.label}</span>
              {opt.requiresText && (
                <input
                  disabled
                  placeholder={opt.textLabel ?? "specify"}
                  className="text-xs border-b border-dashed border-neutral-300 bg-transparent w-32"
                />
              )}
              {opt.textUnit && <span className="text-xs text-neutral-400">{opt.textUnit}</span>}
            </div>
          ))}
          {field.cannotBeDetermined && (
            <div className="text-sm text-neutral-500 flex items-center gap-2">
              <input type="radio" disabled />
              <span>Cannot be determined (explain)</span>
            </div>
          )}
        </div>
      )}

      {(field.type === "text" || field.type === "number") && !field.options && (
        <input
          disabled
          type={field.type === "number" ? "number" : "text"}
          className="mt-1 text-sm border border-neutral-300 rounded px-2 py-1 w-64 bg-neutral-50"
          placeholder={field.unit ? `value (${field.unit})` : "value"}
        />
      )}

      {field.children && field.children.length > 0 && (
        <div className="mt-2 space-y-1">
          {field.children.map((child) => (
            <FieldView key={child.key} field={child} />
          ))}
        </div>
      )}
    </div>
  );
}

function SectionView({ section }: { section: TemplateSection }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold uppercase tracking-wide text-petrol">{section.title}</h2>
      <div className="mt-3 space-y-3">
        {section.fields.map((f) => (
          <FieldView key={f.key} field={f} />
        ))}
      </div>
    </section>
  );
}

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
