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
 * Rate limiting + code verification itself live in lib/totp.ts, shared
 * with the claim wizard's enrollment-confirmation step.
 */
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth, unstable_update } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { writeAudit } from "@/lib/audit";
import { verifyTotpCode } from "@/lib/totp";

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

  if (!user?.totpEnabled) {
    return NextResponse.redirect(new URL("/verify?error=not_enrolled", req.url));
  }

  const result = await verifyTotpCode(user, code);

  if (!result.ok) {
    return NextResponse.redirect(new URL(`/verify?error=${result.reason === "locked" ? "locked" : "invalid"}`, req.url));
  }

  await unstable_update({ totpVerified: true } as any);
  await writeAudit({ tenantId: user.tenantId, actorId: user.id, action: "sign_in", detail: { via: "totp" } });

  return NextResponse.redirect(new URL("/dashboard", req.url));
}
