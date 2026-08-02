/**
 * X-PATH — shared TOTP verification + rate limiting
 * ------------------------------------------------------------------
 * Used by both /api/auth/verify-totp (ongoing login 2FA) and the claim
 * wizard's enrollment-confirmation step (first-time TOTP setup). Same
 * lockout columns, same audit trail, one place to get it right.
 */
import { eq } from "drizzle-orm";
import { authenticator } from "otplib";
import { db } from "@/db";
import { users } from "@/db/schema";
import { decrypt } from "@/lib/crypto";
import { writeAudit } from "@/lib/audit";
import { MAX_FAILED_TOTP_ATTEMPTS, TOTP_LOCKOUT_MINUTES } from "@/lib/totp-policy";

type TotpUser = {
  id: string;
  tenantId: string;
  totpSecretEncrypted: string | null;
  totpFailedAttempts: number;
  totpLockedUntil: Date | null;
};

export type TotpCheckResult =
  | { ok: true }
  | { ok: false; reason: "locked" | "invalid" | "not-enrolled" };

/**
 * Verifies a submitted code against the user's (already-generated,
 * encrypted) TOTP secret. Handles lockout enforcement, attempt counting,
 * and audit logging — callers only decide what to do on success (e.g.
 * upgrade the session, or also flip totpEnabled/mustCompleteSetup).
 */
export async function verifyTotpCode(user: TotpUser, code: string): Promise<TotpCheckResult> {
  if (!user.totpSecretEncrypted) return { ok: false, reason: "not-enrolled" };

  if (user.totpLockedUntil && user.totpLockedUntil.getTime() > Date.now()) {
    return { ok: false, reason: "locked" };
  }

  const secret = decrypt(user.totpSecretEncrypted);
  const valid = /^\d{6}$/.test(code) && authenticator.verify({ token: code, secret });

  if (!valid) {
    const attempts = user.totpFailedAttempts + 1;

    if (attempts >= MAX_FAILED_TOTP_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + TOTP_LOCKOUT_MINUTES * 60_000);
      await db.update(users).set({ totpFailedAttempts: 0, totpLockedUntil: lockedUntil }).where(eq(users.id, user.id));
      await writeAudit({
        tenantId: user.tenantId,
        actorId: user.id,
        action: "totp_locked",
        detail: { failedAttempts: attempts, lockedUntil: lockedUntil.toISOString() },
      });
      return { ok: false, reason: "locked" };
    }

    await db.update(users).set({ totpFailedAttempts: attempts }).where(eq(users.id, user.id));
    await writeAudit({ tenantId: user.tenantId, actorId: user.id, action: "totp_failed", detail: { attempt: attempts } });
    return { ok: false, reason: "invalid" };
  }

  await db.update(users).set({ totpFailedAttempts: 0, totpLockedUntil: null }).where(eq(users.id, user.id));
  return { ok: true };
}
