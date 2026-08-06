// X-PATH — Reagent/equipment tracking (DL-055). Admin-only. Seeded from
// the real 38-antibody register + BenchMark ULTRA (src/lib/reagents/
// register.ts, XPATH_handover.md §12) on first visit — genuinely more
// valuable here than in a well-supplied lab, since Cameroon's resupply
// logistics are slower than a typical Western lab's (Marcel's explicit
// reasoning for prioritizing this). Never touches privateWorkspaceItems
// or clinicalRecords (Header G2) — pure lab-operations data.
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOrSeedReagentItems } from "@/lib/reagents/data";
import { getLocale } from "@/lib/i18n-server";
import { STRINGS, t } from "@/lib/i18n";
import { addReagentItem, updateReagentStock, updateEquipmentCalibration } from "./actions";

function isoDate(d: Date | null): string {
  return d ? d.toISOString().slice(0, 10) : "";
}

export default async function ReagentsPage({ searchParams }: { searchParams?: Promise<{ edit?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");
  if ((session as any).role !== "administrator") redirect("/dashboard");

  const userId = (session.user as any).id as string;
  const tenantId = (session as any).tenantId as string;
  const locale = await getLocale();
  const params = await searchParams;
  const editId = params?.edit;

  const items = await getOrSeedReagentItems(tenantId, userId);
  const antibodies = items.filter((i) => i.type === "antibody");
  const equipment = items.filter((i) => i.type === "equipment");

  const now = Date.now();
  const DUE_SOON_MS = 14 * 24 * 60 * 60 * 1000;

  const lowStock = antibodies.filter(
    (a) => a.currentStock !== null && a.lowStockThreshold !== null && a.currentStock <= a.lowStockThreshold,
  );
  const equipmentDue = equipment
    .map((e) => {
      if (!e.lastCalibratedAt || !e.calibrationIntervalDays) return { item: e, dueAt: null as Date | null };
      const dueAt = new Date(e.lastCalibratedAt.getTime() + e.calibrationIntervalDays * 24 * 60 * 60 * 1000);
      return { item: e, dueAt };
    })
    .filter((x) => x.dueAt && x.dueAt.getTime() - now <= DUE_SOON_MS);

  const editingAntibody = editId ? antibodies.find((a) => a.id === editId) : undefined;
  const editingEquipment = editId ? equipment.find((e) => e.id === editId) : undefined;
  const adding = editId === "new";

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t(STRINGS.reagentsHeading, locale)}</h1>
          <p className="text-neutral-600 mt-1.5">{t(STRINGS.reagentsBody, locale)}</p>
        </div>
        <Link
          href="/dashboard/reagents?edit=new"
          className="shrink-0 rounded-lg bg-petrol px-4 py-2 text-white text-sm font-semibold hover:bg-petrol-deep transition-colors min-h-[44px] flex items-center"
        >
          {t(STRINGS.reagentNewButton, locale)}
        </Link>
      </div>

      {(lowStock.length > 0 || equipmentDue.length > 0) && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-sm font-semibold text-amber-900">{t(STRINGS.reagentAlertsHeading, locale)}</h2>
          <ul className="mt-2 space-y-1.5">
            {lowStock.map((a) => (
              <li key={a.id} className="text-sm text-amber-800 flex items-center gap-1.5">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
                  <path
                    fillRule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                    clipRule="evenodd"
                  />
                </svg>
                {t(STRINGS.reagentLowStockBadge, locale)} — {a.name} ({a.currentStock} {t(STRINGS.reagentUnitsLabel, locale)})
              </li>
            ))}
            {equipmentDue.map(({ item, dueAt }) => (
              <li key={item.id} className="text-sm text-amber-800 flex items-center gap-1.5">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
                  <path
                    fillRule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                    clipRule="evenodd"
                  />
                </svg>
                {(dueAt as Date).getTime() < now
                  ? t(STRINGS.reagentCalibrationDueBadge, locale)
                  : t(STRINGS.reagentDueSoonBadge, locale)}{" "}
                — {item.name} ({isoDate(dueAt)})
              </li>
            ))}
          </ul>
        </div>
      )}

      {adding && (
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-petrol">{t(STRINGS.reagentNewButton, locale)}</h2>
          <form action={addReagentItem} className="mt-4 space-y-4">
            <label className="block text-sm font-semibold">
              {t(STRINGS.reagentTypeLabel, locale)}
              <select name="type" defaultValue="antibody" className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal min-h-[44px]">
                <option value="antibody">{t(STRINGS.reagentTypeAntibody, locale)}</option>
                <option value="equipment">{t(STRINGS.reagentTypeEquipment, locale)}</option>
              </select>
            </label>
            <label className="block text-sm font-semibold">
              {t(STRINGS.reagentNameLabel, locale)}
              <input name="name" required className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal min-h-[44px]" />
            </label>
            <label className="block text-sm font-semibold">
              {t(STRINGS.reagentCloneLabel, locale)}
              <input name="clone" className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal min-h-[44px]" />
            </label>
            <label className="block text-sm font-semibold">
              {t(STRINGS.reagentCatalogueRefLabel, locale)}
              <input name="catalogueRef" className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal min-h-[44px]" />
            </label>
            <label className="block text-sm font-semibold">
              {t(STRINGS.reagentVendorLabel, locale)}
              <input name="vendor" className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal min-h-[44px]" />
            </label>
            <label className="block text-sm font-semibold">
              {t(STRINGS.reagentStockLabel, locale)}
              <input name="currentStock" type="number" min="0" className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal min-h-[44px]" />
            </label>
            <label className="block text-sm font-semibold">
              {t(STRINGS.reagentLowStockThresholdLabel, locale)}
              <input name="lowStockThreshold" type="number" min="0" defaultValue={5} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal min-h-[44px]" />
            </label>
            <label className="block text-sm font-semibold">
              {t(STRINGS.reagentLastCalibratedLabel, locale)}
              <input name="lastCalibratedAt" type="date" className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal min-h-[44px]" />
            </label>
            <label className="block text-sm font-semibold">
              {t(STRINGS.reagentCalibrationIntervalLabel, locale)}
              <input name="calibrationIntervalDays" type="number" min="1" defaultValue={90} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal min-h-[44px]" />
            </label>
            <div className="flex items-center gap-3">
              <button type="submit" className="rounded-lg bg-petrol px-4 py-2 text-white text-sm font-semibold hover:bg-petrol-deep transition-colors min-h-[44px]">
                {t(STRINGS.reagentSaveButton, locale)}
              </button>
              <Link href="/dashboard/reagents" className="text-sm text-neutral-500 hover:text-petrol">
                {t(STRINGS.announcementDetailBackLink, locale)}
              </Link>
            </div>
          </form>
        </div>
      )}

      {editingAntibody && (
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-petrol">{editingAntibody.name}</h2>
          <form action={updateReagentStock} className="mt-4 space-y-4">
            <input type="hidden" name="id" value={editingAntibody.id} />
            <label className="block text-sm font-semibold">
              {t(STRINGS.reagentStockLabel, locale)}
              <input
                name="currentStock"
                type="number"
                min="0"
                defaultValue={editingAntibody.currentStock ?? ""}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal min-h-[44px]"
              />
            </label>
            <label className="block text-sm font-semibold">
              {t(STRINGS.reagentLowStockThresholdLabel, locale)}
              <input
                name="lowStockThreshold"
                type="number"
                min="0"
                defaultValue={editingAntibody.lowStockThreshold ?? 5}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal min-h-[44px]"
              />
            </label>
            <label className="block text-sm font-semibold">
              {t(STRINGS.reagentLastRestockedLabel, locale)}
              <input
                name="lastRestockedAt"
                type="date"
                defaultValue={isoDate(editingAntibody.lastRestockedAt)}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal min-h-[44px]"
              />
            </label>
            <div className="flex items-center gap-3">
              <button type="submit" className="rounded-lg bg-petrol px-4 py-2 text-white text-sm font-semibold hover:bg-petrol-deep transition-colors min-h-[44px]">
                {t(STRINGS.reagentSaveButton, locale)}
              </button>
              <Link href="/dashboard/reagents" className="text-sm text-neutral-500 hover:text-petrol">
                {t(STRINGS.announcementDetailBackLink, locale)}
              </Link>
            </div>
          </form>
        </div>
      )}

      {editingEquipment && (
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-petrol">{editingEquipment.name}</h2>
          <form action={updateEquipmentCalibration} className="mt-4 space-y-4">
            <input type="hidden" name="id" value={editingEquipment.id} />
            <label className="block text-sm font-semibold">
              {t(STRINGS.reagentLastCalibratedLabel, locale)}
              <input
                name="lastCalibratedAt"
                type="date"
                defaultValue={isoDate(editingEquipment.lastCalibratedAt)}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal min-h-[44px]"
              />
            </label>
            <label className="block text-sm font-semibold">
              {t(STRINGS.reagentCalibrationIntervalLabel, locale)}
              <input
                name="calibrationIntervalDays"
                type="number"
                min="1"
                defaultValue={editingEquipment.calibrationIntervalDays ?? 90}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal min-h-[44px]"
              />
            </label>
            <div className="flex items-center gap-3">
              <button type="submit" className="rounded-lg bg-petrol px-4 py-2 text-white text-sm font-semibold hover:bg-petrol-deep transition-colors min-h-[44px]">
                {t(STRINGS.reagentSaveButton, locale)}
              </button>
              <Link href="/dashboard/reagents" className="text-sm text-neutral-500 hover:text-petrol">
                {t(STRINGS.announcementDetailBackLink, locale)}
              </Link>
            </div>
          </form>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 px-1 mb-2">
          {t(STRINGS.reagentAntibodiesGroupHeading, locale)}
        </h2>
        <ul className="rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100 overflow-hidden shadow-sm">
          {antibodies.map((a) => {
            const low = a.currentStock !== null && a.lowStockThreshold !== null && a.currentStock <= a.lowStockThreshold;
            return (
              <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm text-neutral-700 truncate">
                    {a.name}
                    {a.clone && <span className="text-neutral-400"> — {a.clone}</span>}
                  </p>
                  <p className="text-[11px] text-neutral-400 truncate">
                    {a.currentStock !== null
                      ? `${a.currentStock} ${t(STRINGS.reagentUnitsLabel, locale)}`
                      : t(STRINGS.reagentNotRecordedLabel, locale)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wide ${
                      low ? "text-amber-700" : a.currentStock !== null ? "text-emerald-700" : "text-neutral-400"
                    }`}
                  >
                    {low
                      ? t(STRINGS.reagentLowStockBadge, locale)
                      : a.currentStock !== null
                        ? t(STRINGS.reagentOkBadge, locale)
                        : ""}
                  </span>
                  <Link href={`/dashboard/reagents?edit=${a.id}`} className="text-sm font-semibold text-petrol">
                    {t(STRINGS.reagentEditLink, locale)}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 px-1 mb-2">
          {t(STRINGS.reagentEquipmentGroupHeading, locale)}
        </h2>
        <ul className="rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100 overflow-hidden shadow-sm">
          {equipment.map((e) => {
            const dueAt =
              e.lastCalibratedAt && e.calibrationIntervalDays
                ? new Date(e.lastCalibratedAt.getTime() + e.calibrationIntervalDays * 24 * 60 * 60 * 1000)
                : null;
            const overdue = dueAt ? dueAt.getTime() < now : false;
            const dueSoon = dueAt ? !overdue && dueAt.getTime() - now <= DUE_SOON_MS : false;
            return (
              <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm text-neutral-700 truncate">{e.name}</p>
                  <p className="text-[11px] text-neutral-400 truncate">
                    {dueAt ? `${t(STRINGS.reagentCalibrationDueLabel, locale)}: ${isoDate(dueAt)}` : t(STRINGS.reagentNotRecordedLabel, locale)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wide ${
                      overdue ? "text-red-700" : dueSoon ? "text-amber-700" : dueAt ? "text-emerald-700" : "text-neutral-400"
                    }`}
                  >
                    {overdue
                      ? t(STRINGS.reagentCalibrationDueBadge, locale)
                      : dueSoon
                        ? t(STRINGS.reagentDueSoonBadge, locale)
                        : dueAt
                          ? t(STRINGS.reagentOkBadge, locale)
                          : ""}
                  </span>
                  <Link href={`/dashboard/reagents?edit=${e.id}`} className="text-sm font-semibold text-petrol">
                    {t(STRINGS.reagentEditLink, locale)}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
