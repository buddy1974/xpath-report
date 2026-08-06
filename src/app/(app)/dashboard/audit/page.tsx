// X-PATH — audit log export (DL-055). Admin-only. A read/format layer
// over the existing append-only audit_log — not a new logging
// mechanism, no new writes here at all. CSV/PDF downloads are plain
// GET links (no state change), so no server action is needed — the
// date-range fields just become query params on those links.
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getLocale } from "@/lib/i18n-server";
import { STRINGS, t } from "@/lib/i18n";
import { AuditExportForm } from "./audit-export-form";

export default async function AuditExportPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");
  if ((session as any).role !== "administrator") redirect("/dashboard");

  const locale = await getLocale();

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">{t(STRINGS.auditExportHeading, locale)}</h1>
      <p className="text-neutral-600 mt-1.5">{t(STRINGS.auditExportBody, locale)}</p>

      <AuditExportForm locale={locale} />
    </div>
  );
}
