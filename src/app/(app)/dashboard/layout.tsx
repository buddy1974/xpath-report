// X-PATH — dashboard shell (DL-053 mobile IA redesign).
// ------------------------------------------------------------------
// The persistent top nav bar is gone entirely — Marcel's explicit
// instruction, modeled on Apple Health's profile-screen pattern (layout
// only; existing design tokens throughout, not a rebrand). The only
// persistent navigation surface now is the floating avatar (UserMenu),
// which opens a full-screen sheet with the same destinations the old
// header exposed (profile, features, language, sign-out) — nothing
// removed, only re-presented. Auth/TOTP checks here are a display-layer
// convenience only — every page underneath still does its own checks
// too (untouched, unchanged).
import { redirect } from "next/navigation";
import { and, eq, gt, isNull, or } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import { getLocale } from "@/lib/i18n-server";
import { ROLE_LABELS, t } from "@/lib/i18n";
import { UserMenu } from "@/components/user-menu";
import { DictateCtaBar } from "@/components/dictate-cta-bar";
import { AnnouncementTicker } from "@/components/announcement-ticker";
import { SyncStatusBanner } from "@/components/sync-status-banner";
import { OfflineQueueInit } from "@/components/offline-queue-init";
import { IosInstallHint } from "@/components/ios-install-hint";

type Role = "pathologist" | "technician" | "manager" | "administrator";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");

  const role = (session as any).role as Role;
  const tenantId = (session as any).tenantId as string;
  const locale = await getLocale();
  const roleLabel = t(ROLE_LABELS[role], locale);
  const name = session.user.name ?? session.user.email ?? "?";
  const email = session.user.email ?? "";

  // DL-054 — active announcements: published, and either indefinite
  // (expiresAt null) or not yet expired. Emergency always sorts first
  // regardless of publish time (Marcel's explicit call) — a system-
  // failure notice must never be buried under routine news.
  const now = new Date();
  const activeAnnouncements = await db
    .select()
    .from(announcements)
    .where(
      and(
        eq(announcements.tenantId, tenantId),
        eq(announcements.status, "published"),
        or(isNull(announcements.expiresAt), gt(announcements.expiresAt, now)),
      ),
    );
  activeAnnouncements.sort((a, b) => (a.category === "emergency" ? -1 : 0) - (b.category === "emergency" ? -1 : 0));

  return (
    <div className="min-h-screen bg-neutral-50">
      <main
        className="max-w-6xl mx-auto px-4 sm:px-6 pb-28 sm:pb-8"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1.5rem)" }}
      >
        <AnnouncementTicker items={activeAnnouncements} locale={locale} />
        <IosInstallHint locale={locale} />
        {role === "pathologist" && <SyncStatusBanner locale={locale} />}
        {children}
      </main>

      <UserMenu
        role={role}
        locale={locale}
        name={name}
        email={email}
        roleLabel={roleLabel}
        announcements={activeAnnouncements}
      />
      {role === "pathologist" && <DictateCtaBar locale={locale} />}
      {role === "pathologist" && <OfflineQueueInit />}
    </div>
  );
}
