/**
 * X-PATH — claim wizard Step 2 (TOTP enrollment confirmation)
 * ------------------------------------------------------------------
 * DL-040: converted from a Server Action to a Route Handler for the same
 * reason as /api/auth/claim-profile (see that file's comment) and
 * /api/auth/enroll-totp (DL-039).
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
  if (!user || !user.mustCompleteSetup) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (!user.profileCompletedAt) {
    return NextResponse.redirect(new URL("/claim-account", req.url)); // step 1 not done yet
  }
  if (!user.totpSecretEncrypted) {
    return NextResponse.redirect(new URL("/claim-account?error=not_enrolled", req.url));
  }

  const form = await req.formData();
  const code = String(form.get("code") ?? "").trim();

  const result = await verifyTotpCode(user, code);
  if (!result.ok) {
    return NextResponse.redirect(
      new URL(`/claim-account?error=${result.reason === "locked" ? "locked" : "invalid"}`, req.url),
    );
  }

  await db.update(users).set({ totpEnabled: true, mustCompleteSetup: false }).where(eq(users.id, user.id));
  await writeAudit({ tenantId: user.tenantId, actorId: user.id, action: "account_claimed" });
  await unstable_update({ mustCompleteSetup: false, totpVerified: true } as any);

  return NextResponse.redirect(new URL("/dashboard", req.url));
}
