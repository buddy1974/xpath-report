/**
 * X-PATH — confirm TOTP (re-)enrollment for an already-claimed account
 * ------------------------------------------------------------------
 * Confirms the code for the QR step /verify shows when totpEnabled is
 * false (see DL-039). Deliberately a Route Handler at a fixed URL, NOT a
 * Server Action: a Server Action's <form action={fn}> posts back to
 * whatever URL the browser currently shows, which after the sign-in →
 * middleware-redirect chain (signInAction redirects to /dashboard,
 * middleware then redirects that to /verify) can still be "/dashboard"
 * even though /verify's content is what's rendered. Middleware then
 * redirects that Server Action POST too — and a redirect response is not
 * a Server Action protocol response, which crashes the client with
 * "unexpected response from server" (reproduced live, see DL-039).
 * middleware.ts's matcher does not include /api/auth/*, so a fixed-URL
 * Route Handler here sidesteps the whole class of bug, matching
 * verify-totp/route.ts's proven pattern (including same-origin CSRF
 * protection for the same reason that file documents).
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

  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = rows[0];
  if (!user) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
  if (user.totpEnabled) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (!user.totpSecretEncrypted) {
    return NextResponse.redirect(new URL("/verify", req.url));
  }

  const form = await req.formData();
  const code = String(form.get("code") ?? "").trim();

  const result = await verifyTotpCode(user, code);
  if (!result.ok) {
    return NextResponse.redirect(new URL(`/verify?error=${result.reason === "locked" ? "locked" : "invalid"}`, req.url));
  }

  await db.update(users).set({ totpEnabled: true }).where(eq(users.id, user.id));
  await writeAudit({ tenantId: user.tenantId, actorId: user.id, action: "sign_in", detail: { via: "totp_reenroll" } });
  await unstable_update({ totpVerified: true } as any);

  return NextResponse.redirect(new URL("/dashboard", req.url));
}
