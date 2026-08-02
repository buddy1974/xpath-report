/**
 * X-PATH — M1 isolation verification (Header G1/G2)
 * ------------------------------------------------------------------
 * Proves, against the real database, that:
 *   1. A private workspace item is readable by its owner.
 *   2. A second pathologist in the same tenant is denied.
 *   3. An administrator in the same tenant is denied (no role override).
 *   4. Cross-tenant access is denied even for a matching user id.
 * This does not build the M2 workspace UI — it exercises the M1/M0
 * guard layer (lib/access.ts) directly, which is what the guardrail
 * actually depends on. Run: npx tsx scripts/verify-isolation.ts
 * (after db:seed).
 */
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, privateWorkspaceItems } from "@/db/schema";
import { assertWorkspaceOwner, assertSameTenant, AccessError } from "@/lib/access";

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

  if (!pathologistA || !pathologistB || !administrator) {
    console.error("Seed data missing — run `npm run db:seed` first.");
    process.exit(1);
  }

  const [item] = await db
    .insert(privateWorkspaceItems)
    .values({
      tenantId: pathologistA.tenantId,
      ownerId: pathologistA.id,
      kind: "note",
      title: "M1 isolation check",
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

  if (process.exitCode === 1) {
    console.error("\nIsolation check FAILED — do not consider M1 done.\n");
  } else {
    console.log("\nIsolation check PASSED.\n");
  }
}

main().then(() => process.exit(process.exitCode ?? 0));
