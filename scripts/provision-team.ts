/**
 * X-PATH — provision the real team (Cowork execution-order §1b)
 * ------------------------------------------------------------------
 * Creates the 8 real accounts with placeholder emails and a strong
 * random SESSION password each (bcrypt-hashed as normal). No TOTP secret
 * is generated here — that happens inside the claim wizard itself
 * (src/app/(auth)/claim-account/page.tsx), the first time the real
 * person reaches Step 2, so nobody but them ever sees their own QR code.
 * mustCompleteSetup starts true; the claim wizard flips it false.
 *
 * Session passwords are printed to console ONCE, for Marcel only — never
 * written to a tracked file, never logged anywhere else. Run against the
 * existing "bettahealth" tenant (must already exist — run `npm run
 * db:seed` first if this is a fresh database).
 *
 * Run: npx tsx scripts/provision-team.ts
 */
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { tenants, users, type Role } from "@/db/schema";

const ACCOUNTS: { role: Role; email: string; displayName: string }[] = [
  { role: "pathologist", email: "pathologist1@xpath.report", displayName: "Pathologist 1" },
  { role: "pathologist", email: "pathologist2@xpath.report", displayName: "Pathologist 2" },
  { role: "pathologist", email: "pathologist3@xpath.report", displayName: "Pathologist 3" },
  { role: "pathologist", email: "ivo@xpath.report", displayName: "Dr. Ivo" },
  { role: "technician", email: "technician1@xpath.report", displayName: "Technician 1" },
  { role: "technician", email: "technician2@xpath.report", displayName: "Technician 2" },
  { role: "technician", email: "technician3@xpath.report", displayName: "Technician 3" },
  { role: "technician", email: "technician4@xpath.report", displayName: "Technician 4" },
];

function generateSessionPassword(): string {
  // 18 random bytes -> 24-char base64url string, ~144 bits of entropy.
  return randomBytes(18).toString("base64url");
}

async function main() {
  const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, "bettahealth")).limit(1);
  if (!tenant) {
    console.error('No "bettahealth" tenant found — run `npm run db:seed` first.');
    process.exit(1);
  }

  console.log("\nProvisioned accounts — SESSION PASSWORDS, for Marcel only.");
  console.log("Never commit these. Not written to any file. Print once, hand off, then this terminal scrollback is the only copy.\n");

  for (const acct of ACCOUNTS) {
    const sessionPassword = generateSessionPassword();
    const passwordHash = await bcrypt.hash(sessionPassword, 10);

    await db.insert(users).values({
      tenantId: tenant.id,
      email: acct.email,
      displayName: acct.displayName,
      role: acct.role,
      passwordHash,
      mustCompleteSetup: true,
      totpEnabled: false,
    });

    console.log(`${acct.email}`);
    console.log(`  session password: ${sessionPassword}\n`);
  }

  console.log(`Provisioned ${ACCOUNTS.length} accounts under tenant "${tenant.slug}". Each must complete the claim wizard (real name/department/phone/email/password + TOTP) before reaching /dashboard.`);
}

main().then(() => process.exit(0));
