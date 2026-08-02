/**
 * X-PATH — seed: tenant BettaHealth + one user per role (two pathologists,
 * so M1's isolation check has a second pathologist to test against).
 * Each user is enrolled with a real TOTP secret (encrypted at rest) so
 * login + 2FA can be demonstrated end to end. Run: npm run db:seed
 * (after db:migrate). Prints each otpauth:// URI once, to console only.
 */
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";
import { db } from "@/db";
import { tenants, users, type Role } from "@/db/schema";
import { encrypt } from "@/lib/crypto";

const SEED_USERS: { role: Role; email: string; displayName: string }[] = [
  { role: "pathologist", email: "pathologist@xpath.report", displayName: "Test Pathologist" },
  { role: "pathologist", email: "pathologist2@xpath.report", displayName: "Test Pathologist 2" },
  { role: "technician", email: "technician@xpath.report", displayName: "Test Technician" },
  { role: "manager", email: "manager@xpath.report", displayName: "Test Manager" },
  { role: "administrator", email: "administrator@xpath.report", displayName: "Test Administrator" },
];

async function main() {
  const [tenant] = await db
    .insert(tenants)
    .values({ name: "BettaHealth / X.PATH Labs", slug: "bettahealth" })
    .returning();

  const pw = await bcrypt.hash("change-me-now", 10);

  console.log("\nSeeded users — TOTP enrollment (add each to an authenticator app):\n");

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
    });

    console.log(`${u.email}  (password: change-me-now)`);
    console.log(`  ${otpauth}\n`);
  }

  console.log(`Seeded tenant "${tenant.slug}" + ${SEED_USERS.length} users. CHANGE the default password before any real use.`);
}

main().then(() => process.exit(0));
