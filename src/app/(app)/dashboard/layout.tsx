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
import { auth } from "@/auth";
import { getLocale } from "@/lib/i18n-server";
import { ROLE_LABELS, t } from "@/lib/i18n";
import { UserMenu } from "@/components/user-menu";
import { DictateCtaBar } from "@/components/dictate-cta-bar";

type Role = "pathologist" | "technician" | "manager" | "administrator";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");

  const role = (session as any).role as Role;
  const locale = await getLocale();
  const roleLabel = t(ROLE_LABELS[role], locale);
  const name = session.user.name ?? session.user.email ?? "?";
  const email = session.user.email ?? "";

  return (
    <div className="min-h-screen bg-neutral-50">
      <main
        className="max-w-6xl mx-auto px-4 sm:px-6 pb-28 sm:pb-8"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1.5rem)" }}
      >
        {children}
      </main>

      <UserMenu role={role} locale={locale} name={name} email={email} roleLabel={roleLabel} />
      {role === "pathologist" && <DictateCtaBar locale={locale} />}
    </div>
  );
}
