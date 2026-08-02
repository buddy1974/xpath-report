/**
 * X-PATH — seed: tenant BettaHealth + one dev/test user per role (two
 * pathologists, so M1's isolation check has a second pathologist to test
 * against). Each user is enrolled with a real TOTP secret (encrypted at
 * rest) so login + 2FA can be demonstrated end to end.
 *
 * Emails are "dev-" prefixed and deliberately distinct from the real
 * team-provisioning placeholder emails (scripts/provision-team.ts —
 * pathologist1-3@, ivo@, technician1-4@) so the two scripts can never
 * collide on the (tenant, email) unique constraint.
 *
 * Idempotent on the tenant (looks up "bettahealth" before creating it)
 * so this can be safely re-run. Run: npm run db:seed (after db:migrate).
 * Prints each otpauth:// URI once, to console only.
 */
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { tenants, users, type Role } from "@/db/schema";
import { encrypt } from "@/lib/crypto";

const SEED_USERS: { role: Role; email: string; displayName: string }[] = [
  { role: "pathologist", email: "dev-pathologist-a@xpath.report", displayName: "Dev Pathologist A" },
  { role: "pathologist", email: "dev-pathologist-b@xpath.report", displayName: "Dev Pathologist B" },
  { role: "technician", email: "dev-technician@xpath.report", displayName: "Dev Technician" },
  { role: "manager", email: "dev-manager@xpath.report", displayName: "Dev Manager" },
  { role: "administrator", email: "dev-administrator@xpath.report", displayName: "Dev Administrator" },
];

async function main() {
  let [tenant] = await db.select().from(tenants).where(eq(tenants.slug, "bettahealth")).limit(1);
  if (!tenant) {
    [tenant] = await db
      .insert(tenants)
      .values({ name: "BettaHealth / X.PATH Labs", slug: "bettahealth" })
      .returning();
  }

  const pw = await bcrypt.hash("change-me-now", 10);

  console.log("\nSeeded dev/test users — TOTP enrollment (add each to an authenticator app):\n");

  for (const u of SEED_USERS) {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(u.email, "X-PATH", secret);

    await db.insert(users).values({
      tenantId: tenant.id,
      email: u.email,
      displayName: u.displayName,
      role: u.role,
      passwordHash: pw,
      totpSecretEncrypted: encrypt(secret),
      totpEnabled: true,
      mustCompleteSetup: false, // dev/test fixtures, not the real-team claim flow
    });

    console.log(`${u.email}  (password: change-me-now)`);
    console.log(`  ${otpauth}\n`);
  }

  console.log(`Seeded tenant "${tenant.slug}" + ${SEED_USERS.length} dev/test users. CHANGE the default password before any real use.`);
}

main().then(() => process.exit(0));
