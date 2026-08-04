// X-PATH — Workspace (DL-051): the persistent, always-reachable home for
// everything a pathologist has captured but not yet turned into a report
// — dictations, OCR'd notes, and in-progress drafts. Owner-only (Header
// G2, same isolation as the Dictate/Structure/Review screens this
// aggregates). Dictate itself stays a one-tap capture action (Marcel's
// decision); browsing/organizing saved items lives here instead.
import Link from "next/link";
import { redirect } from "next/navigation";
import { and, desc, eq, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { privateWorkspaceItems } from "@/db/schema";
import { getTemplate } from "@/lib/templates";
import { getLocale } from "@/lib/i18n-server";
import { STRINGS, t } from "@/lib/i18n";

const KIND_STYLE: Record<string, { badge: string; labelKey: keyof typeof STRINGS; icon: string }> = {
  dictation: { badge: "bg-petrol/10 text-petrol", labelKey: "workspaceKindDictation", icon: "M10 2a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3ZM5.5 9.5a.75.75 0 0 1 .75.75v.5a3.75 3.75 0 1 0 7.5 0v-.5a.75.75 0 0 1 1.5 0v.5a5.25 5.25 0 0 1-4.5 5.197V17.5h2a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1 0-1.5h2v-1.553A5.25 5.25 0 0 1 4.75 10.75v-.5a.75.75 0 0 1 .75-.75Z" },
  note: { badge: "bg-hema/10 text-hema", labelKey: "workspaceKindNote", icon: "M4 3.5A1.5 1.5 0 0 1 5.5 2h5.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12A1.5 1.5 0 0 1 15 5.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 4 16.5v-13Z" },
  report_draft: { badge: "bg-amber-100 text-amber-800", labelKey: "workspaceKindDraft", icon: "M5 3.5A1.5 1.5 0 0 1 6.5 2h4.379a1.5 1.5 0 0 1 1.06.44l2.122 2.12A1.5 1.5 0 0 1 14.5 5.62V16.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 4.5 16.5v-13Z" },
};

export default async function WorkspacePage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");
  if ((session as any).role !== "pathologist") redirect("/dashboard");

  const userId = (session.user as any).id as string;
  const locale = await getLocale();

  const items = await db
    .select()
    .from(privateWorkspaceItems)
    .where(
      and(
        eq(privateWorkspaceItems.ownerId, userId),
        inArray(privateWorkspaceItems.kind, ["dictation", "note", "report_draft"]),
      ),
    )
    .orderBy(desc(privateWorkspaceItems.updatedAt));

  // Map source item id -> existing report_draft id, so a dictation/note
  // that's already been sent to AI shows "Continue reviewing" instead of
  // offering to send it again (avoids confusion, not a duplicate-draft bug
  // — confirmTemplateAndStructure is only ever invoked from a template
  // choice, but the label should reflect reality either way).
  const draftBySourceId = new Map<string, string>();
  for (const item of items) {
    if (item.kind !== "report_draft") continue;
    const sourceId = (item.data as { dictationId?: string } | null)?.dictationId;
    if (sourceId) draftBySourceId.set(sourceId, item.id);
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">{t(STRINGS.workspaceHeading, locale)}</h1>
      <p className="text-neutral-600 mt-1.5">{t(STRINGS.workspaceBody, locale)}</p>

      {items.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">{t(STRINGS.workspaceEmpty, locale)}</p>
      ) : (
        <>
          <ul className="mt-6 space-y-2">
            {items.map((item) => {
              const style = KIND_STYLE[item.kind] ?? KIND_STYLE.dictation;
              const existingDraftId = draftBySourceId.get(item.id);

              let title = item.title ?? "";
              let href: string | null = null;
              let ctaLabel = "";
              if (item.kind === "report_draft") {
                const templateId = (item.data as { templateId?: string } | null)?.templateId;
                const template = templateId ? getTemplate(templateId) : undefined;
                title = template?.title ?? title;
                href = `/dashboard/review/${item.id}`;
                ctaLabel = t(STRINGS.workspaceContinueReviewing, locale);
              } else if (existingDraftId) {
                href = `/dashboard/review/${existingDraftId}`;
                ctaLabel = t(STRINGS.workspaceContinueReviewing, locale);
              } else if (item.body) {
                href = `/dashboard/structure/${item.id}`;
                ctaLabel = t(STRINGS.workspaceSendToAi, locale);
              }

              const snippet =
                item.kind === "report_draft"
                  ? title
                  : item.body
                    ? item.body
                    : item.kind === "dictation"
                      ? t(STRINGS.workspaceNotTranscribedYet, locale)
                      : t(STRINGS.workspaceEmptyBody, locale);

              return (
                <li
                  key={item.id}
                  className="rounded-xl border border-neutral-200 bg-white p-4 flex items-center gap-3 shadow-sm hover:shadow-md hover:border-petrol/30 transition-all"
                >
                  <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${style.badge}`}>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
                      <path d={style.icon} />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                      {t(STRINGS[style.labelKey], locale)}
                    </p>
                    <p className="text-sm text-neutral-700 truncate">{snippet}</p>
                  </div>
                  {href && (
                    <Link href={href} className="text-sm font-semibold text-petrol shrink-0 ml-2">
                      {ctaLabel}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="text-xs text-neutral-400 mt-4">{t(STRINGS.workspaceSendToAiExplainer, locale)}</p>
        </>
      )}
    </div>
  );
}
