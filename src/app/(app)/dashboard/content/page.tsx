// X-PATH — admin-editable default content (DL-054). Template titles/
// blurbs/section titles + the Reflex Testing preview text. NEVER
// pathologist personal content — this page only ever reads/writes
// `editableContent`, which has no owner/patient concept at all
// (Header G2). Saving is the director-approval step (Header G3).
import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { templates } from "@/lib/templates";
import { getAllContentOverrides, getContentVersions } from "@/lib/editable-content";
import { getLocale } from "@/lib/i18n-server";
import { STRINGS, t } from "@/lib/i18n";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { saveContentOverride, restoreContentVersion, deleteContentVersion } from "./actions";

const REFLEX_KEYS: { key: string; label: string }[] = [
  { key: "reflex_preview.17_1", label: "Reflex preview — §17.1 Purpose" },
  { key: "reflex_preview.17_2", label: "Reflex preview — §17.2 Reflex-testing logic" },
  { key: "reflex_preview.17_3", label: "Reflex preview — §17.3 Reflex-test categories" },
  { key: "reflex_preview.17_4", label: "Reflex preview — §17.4 Special-stain menu" },
  { key: "reflex_preview.17_5", label: "Reflex preview — §17.5 Morphology-to-stain rules" },
  { key: "reflex_preview.17_6", label: "Reflex preview — §17.6 Reflex IHC" },
  { key: "reflex_preview.17_7", label: "Reflex preview — §17.7 Report section" },
  { key: "reflex_preview.17_8", label: "Reflex preview — §17.8 Protocol library" },
  { key: "reflex_preview.17_9", label: "Reflex preview — §17.9 Knowledge updating" },
  { key: "reflex_preview.core_requirement", label: "Reflex preview — Core requirement" },
];

function buildRegistry() {
  const entries: { key: string; label: string; group: string; defaultValue: string | null }[] = REFLEX_KEYS.map((r) => ({
    ...r,
    group: "Reflex Testing preview",
    // No plain-text default available here (the preview renders formatted
    // JSX, not a stored string) — first edit starts blank; check the live
    // preview page for the current text before overriding it.
    defaultValue: null,
  }));
  for (const tpl of templates) {
    entries.push({
      key: `template.${tpl.templateId}.title`,
      label: `${tpl.title} — Title`,
      group: tpl.title,
      defaultValue: tpl.title,
    });
    entries.push({
      key: `template.${tpl.templateId}.blurb`,
      label: `${tpl.title} — Blurb`,
      group: tpl.title,
      defaultValue: tpl.blurb,
    });
    for (const s of tpl.sections) {
      entries.push({
        key: `template.${tpl.templateId}.section.${s.key}.title`,
        label: `${tpl.title} — Section: ${s.title}`,
        group: tpl.title,
        defaultValue: s.title,
      });
    }
  }
  return entries;
}

export default async function ContentAdminPage({ searchParams }: { searchParams?: Promise<{ edit?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");
  if ((session as any).role !== "administrator") redirect("/dashboard");

  const tenantId = (session as any).tenantId as string;
  const locale = await getLocale();
  const params = await searchParams;
  const editKey = params?.edit;

  const registry = buildRegistry();
  const overrides = await getAllContentOverrides(tenantId);
  const editing = editKey ? registry.find((r) => r.key === editKey) : undefined;
  const editingOverride = editing ? overrides[editing.key] : undefined;

  const versions = editing ? await getContentVersions(tenantId, editing.key) : [];
  const editorRows = versions.length > 0 ? await db.select().from(users).where(eq(users.tenantId, tenantId)) : [];
  const editorName = new Map(editorRows.map((u) => [u.id, u.displayName]));

  const groups = new Map<string, typeof registry>();
  for (const entry of registry) {
    if (!groups.has(entry.group)) groups.set(entry.group, []);
    groups.get(entry.group)!.push(entry);
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">{t(STRINGS.contentAdminHeading, locale)}</h1>
      <p className="text-neutral-600 mt-1.5">{t(STRINGS.contentAdminBody, locale)}</p>

      {editing && (
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-petrol">{editing.label}</h2>
          {editingOverride && (
            <p className="text-xs text-neutral-400 mt-1">
              {t(STRINGS.contentVersionLabel, locale)} {editingOverride.version}
            </p>
          )}
          <form action={saveContentOverride} className="mt-4 space-y-4">
            <input type="hidden" name="contentKey" value={editing.key} />
            <label className="block text-sm font-semibold">
              {t(STRINGS.contentValueLabel, locale)}
              <textarea
                name="value"
                required
                rows={editing.group === "Reflex Testing preview" ? 8 : 2}
                defaultValue={editingOverride?.value ?? editing.defaultValue ?? ""}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal"
              />
            </label>
            <label className="block text-sm font-semibold">
              {t(STRINGS.contentDirectorNoteLabel, locale)}
              <textarea
                name="directorNote"
                rows={2}
                defaultValue={editingOverride?.directorNote ?? ""}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal"
              />
            </label>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="rounded-lg bg-petrol px-4 py-2 text-white text-sm font-semibold hover:bg-petrol-deep transition-colors min-h-[44px]"
              >
                {t(STRINGS.contentSaveButton, locale)}
              </button>
              <Link
                href="/dashboard/content"
                className="text-sm text-neutral-500 hover:text-petrol inline-flex items-center min-h-[44px]"
              >
                {t(STRINGS.announcementDetailBackLink, locale)}
              </Link>
            </div>
          </form>

          {/* DL-059 — full version history: restore any prior save
              (including all the way back to the untouched system
              default) or permanently delete a specific historical
              entry. The admin/owner account gets full freedom here —
              Marcel's explicit call. */}
          <details className="mt-6 group rounded-xl border border-neutral-200 overflow-hidden">
            <summary className="cursor-pointer list-none px-4 min-h-[44px] py-2.5 flex items-center justify-between hover:bg-petrol/5 transition-colors">
              <span className="text-sm font-semibold text-petrol">
                {t(STRINGS.contentHistoryToggle, locale)} ({versions.length})
              </span>
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-neutral-400 transition-transform group-open:rotate-180 shrink-0">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
              </svg>
            </summary>
            <ul className="divide-y divide-neutral-100 border-t border-neutral-100">
              <li className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm text-neutral-700">{t(STRINGS.contentHistoryDefaultLabel, locale)}</p>
                  {editing.defaultValue && <p className="text-xs text-neutral-400 truncate mt-0.5">{editing.defaultValue}</p>}
                </div>
                {!editingOverride ? (
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-mint shrink-0">
                    {t(STRINGS.contentHistoryCurrentBadge, locale)}
                  </span>
                ) : (
                  <form action={restoreContentVersion} className="shrink-0">
                    <input type="hidden" name="contentKey" value={editing.key} />
                    <input type="hidden" name="versionId" value="default" />
                    <button type="submit" className="text-sm font-semibold text-petrol inline-flex items-center min-h-[44px]">
                      {t(STRINGS.contentHistoryRestoreButton, locale)}
                    </button>
                  </form>
                )}
              </li>
              {versions.length === 0 && (
                <li className="px-4 py-3 text-sm text-neutral-400">{t(STRINGS.contentHistoryEmpty, locale)}</li>
              )}
              {versions.map((v) => {
                const isCurrent = editingOverride?.currentVersionId === v.id;
                return (
                  <li key={v.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm text-neutral-700 truncate">{v.value}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {v.createdAt.toLocaleString?.() ?? String(v.createdAt)} · {t(STRINGS.contentHistoryEditedByPrefix, locale)}{" "}
                        {editorName.get(v.editedBy) ?? "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {isCurrent ? (
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-mint">
                          {t(STRINGS.contentHistoryCurrentBadge, locale)}
                        </span>
                      ) : (
                        <form action={restoreContentVersion}>
                          <input type="hidden" name="contentKey" value={editing.key} />
                          <input type="hidden" name="versionId" value={v.id} />
                          <button type="submit" className="text-sm font-semibold text-petrol inline-flex items-center min-h-[44px]">
                            {t(STRINGS.contentHistoryRestoreButton, locale)}
                          </button>
                        </form>
                      )}
                      <form action={deleteContentVersion}>
                        <input type="hidden" name="contentKey" value={editing.key} />
                        <input type="hidden" name="versionId" value={v.id} />
                        <ConfirmSubmitButton
                          confirmMessage={t(STRINGS.contentHistoryConfirmDelete, locale)}
                          className="text-sm font-semibold text-neutral-500 hover:text-red-600 inline-flex items-center min-h-[44px]"
                        >
                          {t(STRINGS.contentHistoryDeleteButton, locale)}
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </li>
                );
              })}
            </ul>
          </details>
        </div>
      )}

      <div className="mt-8 space-y-6">
        {[...groups.entries()].map(([group, entries]) => (
          <div key={group}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 px-1 mb-2">{group}</h2>
            <ul className="rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100 overflow-hidden shadow-sm">
              {entries.map((entry) => {
                const hasOverride = !!overrides[entry.key];
                return (
                  <li key={entry.key} className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className="text-sm text-neutral-700 truncate">{entry.label}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      {!hasOverride && (
                        <span className="text-[11px] text-neutral-400">{t(STRINGS.contentDefaultBadge, locale)}</span>
                      )}
                      <Link
                        href={`/dashboard/content?edit=${encodeURIComponent(entry.key)}`}
                        className="text-sm font-semibold text-petrol inline-flex items-center min-h-[44px]"
                      >
                        {t(STRINGS.contentEditLink, locale)}
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
