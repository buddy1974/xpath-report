/**
 * X-PATH — G1/G2 isolation verification (M1 private workspace + M6 clinical records)
 * ------------------------------------------------------------------
 * Proves, against the real database, that:
 *   1. A private workspace item is readable by its owner only — not a second
 *      pathologist, not an administrator (no role override, G2).
 *   2. Tenant scoping denies cross-tenant access.
 *   3. A RELEASED clinical record is readable by any pathologist, manager, or
 *      administrator within the tenant — the audited record of truth, not a
 *      private workspace (G2's other half).
 *   4. A DRAFT clinical record is readable only by its signer — status, not
 *      role, gates draft visibility (canReadClinicalRecord's real behavior,
 *      not just the released-record path M6's UI actually exercises).
 *   5. Cross-tenant access to a released record is still denied.
 * This does not build the M2 workspace UI — it exercises the lib/access.ts
 * guard layer directly, which is what the guardrail actually depends on.
 * Run: npx tsx scripts/verify-isolation.ts (after db:seed).
 */
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, privateWorkspaceItems, cases, clinicalRecords } from "@/db/schema";
import {
  assertWorkspaceOwner,
  assertSameTenant,
  canReadClinicalRecord,
  AccessError,
  type Actor,
} from "@/lib/access";

function expectOk(label: string, fn: () => void) {
  try {
    fn();
    console.log(`  PASS  ${label}`);
  } catch (err) {
    console.error(`  FAIL  ${label} — expected to pass, threw: ${(err as Error).message}`);
    process.exitCode = 1;
  }
}

function expectDenied(label: string, fn: () => void) {
  try {
    fn();
    console.error(`  FAIL  ${label} — expected AccessError, nothing thrown`);
    process.exitCode = 1;
  } catch (err) {
    if (err instanceof AccessError) {
      console.log(`  PASS  ${label} (denied: ${err.message})`);
    } else {
      console.error(`  FAIL  ${label} — threw non-AccessError: ${(err as Error).message}`);
      process.exitCode = 1;
    }
  }
}

function expectTrue(label: string, actual: boolean) {
  if (actual) {
    console.log(`  PASS  ${label}`);
  } else {
    console.error(`  FAIL  ${label} — expected true, got false`);
    process.exitCode = 1;
  }
}

function expectFalse(label: string, actual: boolean) {
  if (!actual) {
    console.log(`  PASS  ${label}`);
  } else {
    console.error(`  FAIL  ${label} — expected false, got true`);
    process.exitCode = 1;
  }
}

async function main() {
  const [pathologistA] = await db
    .select()
    .from(users)
    .where(eq(users.email, "dev-pathologist-a@xpath.report"))
    .limit(1);
  const [pathologistB] = await db
    .select()
    .from(users)
    .where(eq(users.email, "dev-pathologist-b@xpath.report"))
    .limit(1);
  const [administrator] = await db
    .select()
    .from(users)
    .where(eq(users.email, "dev-administrator@xpath.report"))
    .limit(1);
  const [manager] = await db
    .select()
    .from(users)
    .where(eq(users.email, "dev-manager@xpath.report"))
    .limit(1);

  if (!pathologistA || !pathologistB || !administrator || !manager) {
    console.error("Seed data missing — run `npm run db:seed` first.");
    process.exit(1);
  }

  const [item] = await db
    .insert(privateWorkspaceItems)
    .values({
      tenantId: pathologistA.tenantId,
      ownerId: pathologistA.id,
      kind: "note",
      title: "isolation check",
      body: "throwaway — deleted at the end of this script",
    })
    .returning();

  console.log("\nG2 — private workspace isolation:\n");

  expectOk("owner (pathologist A) can open their own item", () =>
    assertWorkspaceOwner(pathologistA, item),
  );
  expectDenied("second pathologist cannot open pathologist A's item", () =>
    assertWorkspaceOwner(pathologistB, item),
  );
  expectDenied("administrator cannot open pathologist A's item", () =>
    assertWorkspaceOwner(administrator, item),
  );

  console.log("\nG1 — tenant scoping:\n");

  expectOk("same-tenant access allowed", () =>
    assertSameTenant(pathologistA, pathologistA.tenantId),
  );
  expectDenied("cross-tenant access denied", () =>
    assertSameTenant(pathologistA, "00000000-0000-0000-0000-000000000000"),
  );

  await db.delete(privateWorkspaceItems).where(eq(privateWorkspaceItems.id, item.id));

  console.log("\nG2 — clinical record isolation (M6):\n");

  const [testCase] = await db
    .insert(cases)
    .values({
      tenantId: pathologistA.tenantId,
      accession: "ISO-CHECK-TEMP",
      assignedPathologistId: pathologistA.id,
      specimenType: "isolation check — throwaway",
    })
    .returning();

  const [released] = await db
    .insert(clinicalRecords)
    .values({
      tenantId: pathologistA.tenantId,
      caseId: testCase.id,
      signedByPathologistId: pathologistA.id,
      status: "released",
      content: { note: "throwaway — deleted at the end of this script" },
    })
    .returning();

  const [draft] = await db
    .insert(clinicalRecords)
    .values({
      tenantId: pathologistA.tenantId,
      caseId: testCase.id,
      signedByPathologistId: pathologistA.id,
      status: "draft",
      content: { note: "throwaway — deleted at the end of this script" },
    })
    .returning();

  const crossTenantActor: Actor = {
    id: pathologistA.id,
    tenantId: "00000000-0000-0000-0000-000000000000",
    role: "pathologist",
  };

  expectTrue(
    "released record: signer (pathologist A) can read",
    canReadClinicalRecord(pathologistA, released),
  );
  expectTrue(
    "released record: second pathologist (same tenant) can read — audited record of truth, not private",
    canReadClinicalRecord(pathologistB, released),
  );
  expectTrue(
    "released record: manager (same tenant) can read",
    canReadClinicalRecord(manager, released),
  );
  expectTrue(
    "released record: administrator (same tenant) can read",
    canReadClinicalRecord(administrator, released),
  );
  expectFalse(
    "released record: cross-tenant actor denied",
    canReadClinicalRecord(crossTenantActor, released),
  );

  expectTrue(
    "draft record: signer (pathologist A) can read",
    canReadClinicalRecord(pathologistA, draft),
  );
  expectFalse(
    "draft record: second pathologist (same tenant) denied — status gates visibility, not just tenant",
    canReadClinicalRecord(pathologistB, draft),
  );
  expectFalse(
    "draft record: administrator denied — no role override on an unsigned draft",
    canReadClinicalRecord(administrator, draft),
  );
  expectFalse(
    "draft record: manager denied — same reason",
    canReadClinicalRecord(manager, draft),
  );

  await db.delete(clinicalRecords).where(eq(clinicalRecords.caseId, testCase.id));
  await db.delete(cases).where(eq(cases.id, testCase.id));

  if (process.exitCode === 1) {
    console.error("\nIsolation check FAILED.\n");
  } else {
    console.log("\nIsolation check PASSED.\n");
  }
}

main().then(() => process.exit(process.exitCode ?? 0));
