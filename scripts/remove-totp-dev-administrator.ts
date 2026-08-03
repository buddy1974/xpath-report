/**
 * X-PATH — DL-038: remove TOTP for dev-administrator@xpath.report only.
 * ------------------------------------------------------------------
 * Marcel's explicit, direct instruction (not a default, not a pattern to
 * repeat): password-only login for this one administrator account. Every
 * other account (pathologists, technicians, managers) keeps 2FA as-is —
 * this script touches exactly one row, matched by email.
 *
 * Clears the encrypted TOTP secret and any lockout state along with the
 * enabled flag, so no stale secret sits in the DB for an account that no
 * longer uses it. See docs/decision-log.md DL-038.
 *
 * Run: npx tsx scripts/remove-totp-dev-administrator.ts
 */
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

const TARGET_EMAIL = "dev-administrator@xpath.report";

async function main() {
  const rows = await db.select().from(users).where(eq(users.email, TARGET_EMAIL)).limit(1);
  const user = rows[0];
  if (!user) {
    console.error(`No user found for ${TARGET_EMAIL}. Nothing changed.`);
    process.exit(1);
  }

  await db
    .update(users)
    .set({
      totpEnabled: false,
      totpSecretEncrypted: null,
      totpFailedAttempts: 0,
      totpLockedUntil: null,
    })
    .where(eq(users.id, user.id));

  console.log(`TOTP removed for ${TARGET_EMAIL}. Password-only login now in effect for this account.`);
}

main().then(() => process.exit(0));
