/**
 * X-PATH — seed: tenant BettaHealth + one user per role.
 * Run: npm run db:seed   (after db:migrate)
 */
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { tenants, users } from "@/db/schema";

async function main() {
  const [tenant] = await db
    .insert(tenants)
    .values({ name: "BettaHealth / X.PATH Labs", slug: "bettahealth" })
    .returning();

  const pw = await bcrypt.hash("change-me-now", 10);
  const roles = ["pathologist", "technician", "manager", "administrator"] as const;
  for (const role of roles) {
    await db.insert(users).values({
      tenantId: tenant.id,
      email: `${role}@xpath.report`,
      displayName: `Test ${role}`,
      role,
      passwordHash: pw,
    });
  }
  console.log("Seeded tenant + 4 users. CHANGE the default password.");
}

main().then(() => process.exit(0));
