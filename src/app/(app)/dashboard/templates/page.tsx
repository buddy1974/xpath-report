import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { templates } from "@/lib/templates";
import { getLocale } from "@/lib/i18n-server";
import { STRINGS, APPROVAL_STATUS_LABELS, t } from "@/lib/i18n";

export default async function TemplatesIndexPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");
  const locale = await getLocale();

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold">{t(STRINGS.templatesHeading, locale)}</h1>
      <p className="text-neutral-600 mt-1">{t(STRINGS.templatesBody, locale)}</p>
      <ul className="mt-6 space-y-3">
        {templates.map((t2) => {
          const statusLabel = t(APPROVAL_STATUS_LABELS[t2.approval.status] ?? APPROVAL_STATUS_LABELS.draft, locale);
          return (
            <li key={t2.templateId} className="rounded-lg border border-neutral-300 p-4">
              <Link href={`/dashboard/templates/${t2.templateId}`} className="font-semibold text-petrol">
                {t2.title}
              </Link>
              <p className="text-sm text-neutral-500 mt-1">
                v{t2.sourceVersion} · {statusLabel} · {t2.sections.length} {t(STRINGS.sectionsWord, locale)}
              </p>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
