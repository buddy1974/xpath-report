"use server";

/**
 * X-PATH — claim wizard server actions
 * ------------------------------------------------------------------
 * CSRF: these are genuine Next.js Server Actions (posted via a plain
 * <form action={fn}>), not custom Route Handlers — Next.js itself
 * verifies the Origin header against the deployment's allowed hosts for
 * every server action POST. That's the framework-level equivalent of the
 * manual same-origin check verify-totp/route.ts needs (custom Route
 * Handlers get no such protection automatically); no duplicate check
 * needed here.
 */
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";
import { auth, unstable_update } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { encrypt } from "@/lib/crypto";
import { writeAudit } from "@/lib/audit";
import { verifyTotpCode } from "@/lib/totp";

const ProfileSchema = z
  .object({
    displayName: z.string().trim().min(2, "name_required"),
    department: z.string().trim().min(1, "department_required"),
    phone: z.string().trim().min(5, "phone_required"),
    email: z.string().trim().toLowerCase().email("email_invalid"),
    password: z
      .string()
      .min(12, "password_weak")
      .regex(/[a-z]/, "password_weak")
      .regex(/[A-Z]/, "password_weak")
      .regex(/[0-9]/, "password_weak")
      .regex(/[^A-Za-z0-9]/, "password_weak"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "password_mismatch",
    path: ["confirmPassword"],
  });

async function requireSetupUser() {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!session || !userId) redirect("/sign-in");

  const rows = await db.select().from(users).where(eq(users.id, userId!)).limit(1);
  const user = rows[0];
  if (!user || !user.mustCompleteSetup) redirect("/dashboard");
  return user;
}

export async function completeProfile(formData: FormData) {
  const user = await requireSetupUser();

  const parsed = ProfileSchema.safeParse({
    displayName: formData.get("displayName"),
    department: formData.get("department"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const reason = parsed.error.issues[0]?.message ?? "invalid";
    redirect(`/claim-account?error=${reason}`);
  }

  const { displayName, department, phone, email, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await db
      .update(users)
      .set({ displayName, department, phone, email, passwordHash, profileCompletedAt: new Date() })
      .where(eq(users.id, user.id));
  } catch (err: any) {
    // Postgres unique_violation on (tenantId, email)
    if (err?.code === "23505") redirect("/claim-account?error=email_taken");
    throw err;
  }

  // Refresh the JWT's cached email/name immediately — otherwise anything
  // reading session.user.email/name (e.g. the dashboard header) shows the
  // placeholder until the next full login, even though the DB is already
  // correct (see the jwt callback comment in auth.config.ts).
  await unstable_update({ user: { email, name: displayName } } as any);

  redirect("/claim-account");
}

export async function confirmEnrollment(formData: FormData) {
  const user = await requireSetupUser();
  const code = String(formData.get("code") ?? "").trim();

  if (!user.profileCompletedAt) redirect("/claim-account"); // step 1 not done yet
  if (!user.totpSecretEncrypted) redirect("/claim-account?error=not_enrolled");

  const result = await verifyTotpCode(user, code);
  if (!result.ok) {
    redirect(`/claim-account?error=${result.reason === "locked" ? "locked" : "invalid"}`);
  }

  await db
    .update(users)
    .set({ totpEnabled: true, mustCompleteSetup: false })
    .where(eq(users.id, user.id));

  await writeAudit({ tenantId: user.tenantId, actorId: user.id, action: "account_claimed" });

  await unstable_update({ mustCompleteSetup: false, totpVerified: true } as any);

  redirect("/dashboard");
}
