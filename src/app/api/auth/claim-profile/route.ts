/**
 * X-PATH — claim wizard Step 1 (profile + password replacement)
 * ------------------------------------------------------------------
 * DL-040: was a Server Action (`<form action={completeProfile}>`).
 * Reached via the sign-in -> middleware-redirect chain (signInAction
 * redirects to /dashboard; middleware redirects that to /claim-account
 * for mustCompleteSetup accounts), which leaves the browser's address
 * bar on /dashboard even though /claim-account's content is what's
 * rendered — so the Server Action's implicit POST target was wrong, and
 * middleware redirecting that POST crashed the client ("unexpected
 * response from server", reproduced live with a disposable test
 * account). Route Handler at a fixed URL sidesteps this entirely:
 * middleware.ts's matcher does not cover /api/auth/*, matching the
 * already-proven /api/auth/verify-totp and /api/auth/enroll-totp
 * pattern (see DL-039).
 */
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth, unstable_update } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

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

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "cross-site request rejected" }, { status: 403 });
  }

  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!session || !userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = rows[0];
  if (!user || !user.mustCompleteSetup) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const form = await req.formData();
  const parsed = ProfileSchema.safeParse({
    displayName: form.get("displayName"),
    department: form.get("department"),
    phone: form.get("phone"),
    email: form.get("email"),
    password: form.get("password"),
    confirmPassword: form.get("confirmPassword"),
  });

  if (!parsed.success) {
    const reason = parsed.error.issues[0]?.message ?? "invalid";
    return NextResponse.redirect(new URL(`/claim-account?error=${reason}`, req.url));
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
    if (err?.code === "23505") {
      return NextResponse.redirect(new URL("/claim-account?error=email_taken", req.url));
    }
    throw err;
  }

  // Refresh the JWT's cached email/name immediately — otherwise anything
  // reading session.user.email/name (e.g. the dashboard header) shows the
  // placeholder until the next full login, even though the DB is already
  // correct (see the jwt callback comment in auth.config.ts).
  await unstable_update({ user: { email, name: displayName } } as any);

  return NextResponse.redirect(new URL("/claim-account", req.url));
}
