/**
 * X-PATH — one-off: rotate dev-administrator@xpath.report's password to a
 * freshly generated value, for live verification of DL-038 (TOTP removal).
 * Prints the new password to this terminal only, once. Touches exactly
 * one row, matched by email.
 *
 * Run: npx tsx --env-file=.env.local scripts/reset-dev-administrator-password.ts
 */
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
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

  const newPassword = randomBytes(18).toString("base64url");
  const passwordHash = await bcrypt.hash(newPassword, 10);

  await db.update(users).set({ passwordHash }).where(eq(users.id, user.id));

  console.log(`Password rotated for ${TARGET_EMAIL}.`);
  console.log(`  new password: ${newPassword}`);
}

main().then(() => process.exit(0));
