/**
 * X-PATH — reagent/equipment tracking data access (DL-055)
 * ------------------------------------------------------------------
 * `getOrSeedReagentItems` seeds the real register (register.ts) into
 * `reagentItems` on a tenant's first visit — a lazy, idempotent seed
 * rather than a migration-time insert, so it works correctly however
 * many tenants this app eventually has (Header G1). `onConflictDoNothing`
 * guards the (tenantId, registerKey) unique index against a double
 * request racing the seed.
 */
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { reagentItems } from "@/db/schema";
import { ANTIBODY_REGISTER, EQUIPMENT_REGISTER } from "./register";

export async function getOrSeedReagentItems(tenantId: string, updatedBy: string) {
  const existing = await db
    .select()
    .from(reagentItems)
    .where(eq(reagentItems.tenantId, tenantId))
    .orderBy(asc(reagentItems.name));
  if (existing.length > 0) return existing;

  const seedRows: (typeof reagentItems.$inferInsert)[] = [
    ...ANTIBODY_REGISTER.map((a) => ({
      tenantId,
      registerKey: a.key,
      type: "antibody" as const,
      name: a.name,
      clone: a.clone,
      catalogueRef: a.catalogueRef,
      vendor: a.vendor,
      lowStockThreshold: 5,
      updatedBy,
    })),
    ...EQUIPMENT_REGISTER.map((e) => ({
      tenantId,
      registerKey: e.key,
      type: "equipment" as const,
      name: e.name,
      calibrationIntervalDays: 90,
      updatedBy,
    })),
  ];
  await db.insert(reagentItems).values(seedRows).onConflictDoNothing();

  return db
    .select()
    .from(reagentItems)
    .where(eq(reagentItems.tenantId, tenantId))
    .orderBy(asc(reagentItems.name));
}
