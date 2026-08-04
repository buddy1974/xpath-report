/**
 * X-PATH — genuine test-pathologist account for Marcel's own hands-on
 * walkthrough, separate from dev-pathologist-* fixtures and the seeded
 * demo-pathologist account.
 * ------------------------------------------------------------------
 * Blank starting state, real email (not a placeholder), so no claim-
 * wizard profile-swap step is needed (`mustCompleteSetup: false`) — but
 * `totpEnabled` starts false, so the first sign-in lands on `/verify`
 * and shows the real QR enrollment screen (DL-039's flow), same as any
 * first-time real pathologist. Session password is generated fresh and
 * printed once, never committed.
 *
 * Safely re-runnable: resets the account (fresh password, clears any
 * prior TOTP enrollment/lockout state) rather than erroring if it
 * already exists.
 *
 * Run: npx tsx --env-file=.env.local scripts/provision-test-pathologist.ts
 */
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { tenants, users } from "@/db/schema";

const EMAIL = "test-pathologist@xpath.report";
const DISPLAY_NAME = "Test Pathologist";

async function main() {
  const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, "bettahealth")).limit(1);
  if (!tenant) {
    console.error('No "bettahealth" tenant found — run `npm run db:seed` first.');
    process.exit(1);
  }

  const password = randomBytes(18).toString("base64url");
  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await db.select().from(users).where(eq(users.email, EMAIL)).limit(1);
  if (existing[0]) {
    await db
      .update(users)
      .set({
        passwordHash,
        totpSecretEncrypted: null,
        totpEnabled: false,
        totpFailedAttempts: 0,
        totpLockedUntil: null,
        mustCompleteSetup: false,
        isActive: true,
      })
      .where(eq(users.id, existing[0].id));
  } else {
    await db.insert(users).values({
      tenantId: tenant.id,
      email: EMAIL,
      displayName: DISPLAY_NAME,
      role: "pathologist",
      passwordHash,
      totpEnabled: false,
      mustCompleteSetup: false,
    });
  }

  console.log(`\nTest-pathologist account ready.`);
  console.log(`  email: ${EMAIL}`);
  console.log(`  password: ${password}`);
  console.log(`  Sign in -> lands on /verify -> real QR enrollment (no pre-exemption).\n`);
}

main().then(() => process.exit(0));
