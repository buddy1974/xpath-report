/**
 * X-PATH — TOTP verification (second factor, Node runtime)
 * ------------------------------------------------------------------
 * The credentials provider only proves the password. This route proves
 * the authenticator-app code and upgrades the session to totpVerified,
 * which middleware/authConfig.callbacks.authorized requires before any
 * /dashboard access. No SMS path exists (Header DL-008).
 *
 * CSRF: this is a cookie-authenticated POST that is NOT one of NextAuth's
 * own /api/auth/callback/* routes, so it does NOT get NextAuth's built-in
 * CSRF token protection automatically — that only covers Auth.js's own
 * handlers. Protection here is explicit and two-layered:
 *   1. Same-origin check (below) — the Origin header must match the
 *      request's own Host. Modern browsers always send Origin on POST,
 *      same-origin or cross-origin, so a missing Origin is treated as
 *      untrusted (fail closed) rather than silently allowed.
 *   2. Defense in depth: the session cookie Auth.js sets is SameSite=Lax
 *      by default (unmodified in this repo), so a forged cross-site form
 *      POST would not even carry the session cookie in most browsers.
 * (1) is the one actually enforced/verified here; (2) is a browser-level
 * backstop, not something this code controls.
 *
 * Rate limiting (security-checklist.md — required on /api/auth/*): after
 * MAX_FAILED_TOTP_ATTEMPTS wrong codes, the account is locked for
 * TOTP_LOCKOUT_MINUTES. Counters live on the `users` row (Neon), not in
 * memory — this app runs as stateless serverless functions, so an
 * in-process counter would not limit anything across invocations. Every
 * failed attempt and every lockout is written to audit_log.
 */
import { NextRequest, NextResponse } from "next/server";
import { authenticator } from "otplib";
import { eq } from "drizzle-orm";
import { auth, unstable_update } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { decrypt } from "@/lib/crypto";
import { writeAudit } from "@/lib/audit";
import { MAX_FAILED_TOTP_ATTEMPTS, TOTP_LOCKOUT_MINUTES } from "@/lib/totp-policy";

function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "cross-site request rejected" }, { status: 403 });
  }

  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;

  if (!session || !userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const form = await req.formData();
  const code = String(form.get("code") ?? "").trim();

  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = rows[0];

  if (!user?.totpEnabled || !user.totpSecretEncrypted) {
    return NextResponse.redirect(new URL("/verify?error=not_enrolled", req.url));
  }

  if (user.totpLockedUntil && user.totpLockedUntil.getTime() > Date.now()) {
    return NextResponse.redirect(new URL("/verify?error=locked", req.url));
  }

  const secret = decrypt(user.totpSecretEncrypted);
  const valid = /^\d{6}$/.test(code) && authenticator.verify({ token: code, secret });

  if (!valid) {
    const attempts = user.totpFailedAttempts + 1;

    if (attempts >= MAX_FAILED_TOTP_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + TOTP_LOCKOUT_MINUTES * 60_000);
      await db
        .update(users)
        .set({ totpFailedAttempts: 0, totpLockedUntil: lockedUntil })
        .where(eq(users.id, user.id));
      await writeAudit({
        tenantId: user.tenantId,
        actorId: user.id,
        action: "totp_locked",
        detail: { failedAttempts: attempts, lockedUntil: lockedUntil.toISOString() },
      });
      return NextResponse.redirect(new URL("/verify?error=locked", req.url));
    }

    await db.update(users).set({ totpFailedAttempts: attempts }).where(eq(users.id, user.id));
    await writeAudit({
      tenantId: user.tenantId,
      actorId: user.id,
      action: "totp_failed",
      detail: { attempt: attempts },
    });
    return NextResponse.redirect(new URL("/verify?error=invalid", req.url));
  }

  await db
    .update(users)
    .set({ totpFailedAttempts: 0, totpLockedUntil: null })
    .where(eq(users.id, user.id));

  await unstable_update({ totpVerified: true } as any);
  await writeAudit({
    tenantId: user.tenantId,
    actorId: user.id,
    action: "sign_in",
    detail: { via: "totp" },
  });

  return NextResponse.redirect(new URL("/dashboard", req.url));
}
