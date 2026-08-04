/**
 * X-PATH — removes the seeded demo pathologist entirely (account +
 * all its data). Companion to scripts/seed-demo-pathologist.ts.
 *
 * Run: npx tsx --env-file=.env.local scripts/wipe-demo-pathologist.ts
 */
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { users, privateWorkspaceItems, clinicalRecords, cases } from "@/db/schema";

const DEMO_EMAIL = "demo-pathologist@xpath.report";
const DEMO_ACCESSION = "DEMO-0001";

async function main() {
  const rows = await db.select().from(users).where(eq(users.email, DEMO_EMAIL)).limit(1);
  const user = rows[0];
  if (!user) {
    console.log("No demo pathologist account found — nothing to wipe.");
    return;
  }

  const deletedItems = await db.delete(privateWorkspaceItems).where(eq(privateWorkspaceItems.ownerId, user.id)).returning();
  const priorRecords = await db.select().from(clinicalRecords).where(eq(clinicalRecords.signedByPathologistId, user.id));
  if (priorRecords.length) {
    await db.delete(clinicalRecords).where(inArray(clinicalRecords.id, priorRecords.map((r) => r.id)));
  }
  const priorCases = await db.select().from(cases).where(eq(cases.accession, DEMO_ACCESSION));
  if (priorCases.length) {
    await db.delete(cases).where(inArray(cases.id, priorCases.map((c) => c.id)));
  }
  await db.delete(users).where(eq(users.id, user.id));

  console.log(
    `Wiped demo pathologist: ${deletedItems.length} workspace item(s), ${priorRecords.length} clinical record(s), ${priorCases.length} case(s), and the account itself.`,
  );
}

main().then(() => process.exit(0));
