// X-PATH — super-admin account management (DL-054). Full profile/status
// control over every account, structured so a future payment/
// subscription-status column can be added to this same table without a
// rework (it's a plain list of rows — a new column just becomes a new
// cell). No billing logic here now (that's a later phase).
//
// Explicitly, structurally out of reach from this page: private
// workspace content and signed clinical records — this file never
// imports privateWorkspaceItems or clinicalRecords at all (Header G2).
import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users, roleEnum } from "@/db/schema";
import { getLocale } from "@/lib/i18n-server";
import { STRINGS, ROLE_LABELS, t } from "@/lib/i18n";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { updateAccountProfile, changeAccountStatus } from "./actions";

const STATUS_BADGE: Record<string, string> = {
  active: "bg-mint/10 text-mint",
  suspended: "bg-amber-100 text-amber-800",
  blocked: "bg-red-100 text-red-700",
  deactivated: "bg-neutral-200 text-neutral-500",
};

const STATUS_LABEL_KEY = {
  active: STRINGS.accountStatusActive,
  suspended: STRINGS.accountStatusSuspended,
  blocked: STRINGS.accountStatusBlocked,
  deactivated: STRINGS.accountStatusDeactivated,
} as const;

export default async function AccountsAdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ edit?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");
  if ((session as any).role !== "administrator") redirect("/dashboard");

  const tenantId = (session as any).tenantId as string;
  const myId = (session.user as any).id as string;
  const locale = await getLocale();
  const params = await searchParams;
  const editId = params?.edit;

  const all = await db.select().from(users).where(eq(users.tenantId, tenantId)).orderBy(users.displayName);
  const editing = editId ? all.find((u) => u.id === editId) : undefined;

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">{t(STRINGS.accountsHeading, locale)}</h1>
      <p className="text-neutral-600 mt-1.5">{t(STRINGS.accountsBody, locale)}</p>

      {editing && (
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-petrol">{editing.displayName}</h2>
          <form action={updateAccountProfile} className="mt-4 space-y-4">
            <input type="hidden" name="id" value={editing.id} />
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block text-sm font-semibold">
                {t(STRINGS.accountNameLabel, locale)}
                <input
                  name="displayName"
                  required
                  defaultValue={editing.displayName}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal"
                />
              </label>
              <label className="block text-sm font-semibold">
                {t(STRINGS.accountEmailLabel, locale)}
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={editing.email}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal"
                />
              </label>
              <label className="block text-sm font-semibold">
                {t(STRINGS.accountUnitLabel, locale)}
                <input
                  name="department"
                  defaultValue={editing.department ?? ""}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal"
                />
              </label>
              <label className="block text-sm font-semibold">
                {t(STRINGS.accountPhoneLabel, locale)}
                <input
                  name="phone"
                  defaultValue={editing.phone ?? ""}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal"
                />
              </label>
              <label className="block text-sm font-semibold">
                {t(STRINGS.accountRoleLabel, locale)}
                <select
                  name="role"
                  defaultValue={editing.role}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal bg-white"
                >
                  {roleEnum.enumValues.map((r) => (
                    <option key={r} value={r}>
                      {t(ROLE_LABELS[r], locale)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="rounded-lg bg-petrol px-4 py-2 text-white text-sm font-semibold hover:bg-petrol-deep transition-colors min-h-[44px]"
              >
                {t(STRINGS.accountSaveButton, locale)}
              </button>
              <Link href="/dashboard/accounts" className="text-sm text-neutral-500 hover:text-petrol">
                {t(STRINGS.announcementDetailBackLink, locale)}
              </Link>
            </div>
          </form>
        </div>
      )}

      <ul className="mt-6 space-y-2">
        {all.map((u) => (
          <li key={u.id} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-neutral-800">{u.displayName}</span>
                  <span className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${STATUS_BADGE[u.status]}`}>
                    {t(STATUS_LABEL_KEY[u.status as keyof typeof STATUS_LABEL_KEY], locale)}
                  </span>
                  {u.id === myId && <span className="text-[11px] text-neutral-400">(you)</span>}
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {u.email} · {t(ROLE_LABELS[u.role], locale)}
                  {u.department ? ` · ${u.department}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 text-sm">
                <Link href={`/dashboard/accounts?edit=${u.id}`} className="font-semibold text-petrol">
                  {t(STRINGS.accountEditLink, locale)}
                </Link>
                {u.status === "active" && (
                  <form action={changeAccountStatus.bind(null, u.id, "suspend")}>
                    <button type="submit" className="text-neutral-500 hover:text-amber-700">
                      {t(STRINGS.accountSuspendButton, locale)}
                    </button>
                  </form>
                )}
                {(u.status === "active" || u.status === "suspended") && u.id !== myId && (
                  <form action={changeAccountStatus.bind(null, u.id, "block")}>
                    <ConfirmSubmitButton
                      confirmMessage={t(STRINGS.accountConfirmBlock, locale)}
                      className="text-neutral-500 hover:text-red-700"
                    >
                      {t(STRINGS.accountBlockButton, locale)}
                    </ConfirmSubmitButton>
                  </form>
                )}
                {(u.status === "suspended" || u.status === "blocked") && (
                  <form action={changeAccountStatus.bind(null, u.id, "reactivate")}>
                    <button type="submit" className="text-neutral-500 hover:text-mint">
                      {t(STRINGS.accountReactivateButton, locale)}
                    </button>
                  </form>
                )}
                {u.status !== "deactivated" && u.id !== myId && (
                  <form action={changeAccountStatus.bind(null, u.id, "deactivate")}>
                    <ConfirmSubmitButton
                      confirmMessage={t(STRINGS.accountConfirmDeactivate, locale)}
                      className="text-neutral-500 hover:text-red-700"
                    >
                      {t(STRINGS.accountDeactivateButton, locale)}
                    </ConfirmSubmitButton>
                  </form>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
