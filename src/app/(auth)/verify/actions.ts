"use server";

/**
 * X-PATH — /verify re-enrollment action
 * ------------------------------------------------------------------
 * Handles the case where a signed-in, already-claimed account reaches
 * /verify with no active TOTP secret (totpEnabled false) — e.g. an admin
 * cleared it. VerifyPage renders a QR step for this case instead of a
 * code box with nothing to scan; this confirms that enrollment.
 *
 * Mirrors claim-account/actions.ts:confirmEnrollment, minus the
 * mustCompleteSetup/profile-step gating that only applies to first-time
 * claim.
 */
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth, unstable_update } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { writeAudit } from "@/lib/audit";
import { verifyTotpCode } from "@/lib/totp";

export async function confirmVerifyEnrollment(formData: FormData) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!session || !userId) redirect("/sign-in");

  const rows = await db.select().from(users).where(eq(users.id, userId!)).limit(1);
  const user = rows[0];
  if (!user) redirect("/sign-in");
  if (user.totpEnabled) redirect("/dashboard"); // already enrolled — nothing to confirm here
  if (!user.totpSecretEncrypted) redirect("/verify"); // page will generate one on reload

  const code = String(formData.get("code") ?? "").trim();
  const result = await verifyTotpCode(user, code);
  if (!result.ok) {
    redirect(`/verify?error=${result.reason === "locked" ? "locked" : "invalid"}`);
  }

  await db.update(users).set({ totpEnabled: true }).where(eq(users.id, user.id));
  await writeAudit({ tenantId: user.tenantId, actorId: user.id, action: "sign_in", detail: { via: "totp_reenroll" } });
  await unstable_update({ totpVerified: true } as any);

  redirect("/dashboard");
}
