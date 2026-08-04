/**
 * X-PATH — set/reset test-pathologist@xpath.report's password, once, reliably.
 * ------------------------------------------------------------------
 * Same treatment as scripts/set-admin-password.ts (DL-048), for the
 * pathologist-lens counterpart: this is Marcel's own permanent account for
 * testing the pathologist experience, not a shared/rotating fixture — see
 * docs/decision-log.md DL-049.
 *
 * Run locally (never in CI, never against anything but production on
 * purpose): npx tsx --env-file=.env.local scripts/set-pathologist-password.ts
 *
 * Prompts once for the new password (typed in plain, visible text — this
 * runs on your own machine only, never over a shared terminal/screen-share).
 * No confirm-retype second prompt, for the same reason as the admin script:
 * a fresh createInterface per question can lose buffered stdin data, and
 * readline auto-closes on stdin end, which races a second sequential
 * question() — a real bug found and fixed in the admin script (DL-048).
 * Mistype protection instead comes from the live login test this script's
 * output tells you to run immediately after.
 *
 * Hashes the password with bcrypt and writes it directly to one row
 * matched by BOTH email AND role="pathologist" — defense in depth so this
 * can never touch any row but the intended account, even if email were
 * ever to collide across tenants (users.email is only unique *within* a
 * tenant, not globally — src/db/schema.ts users_email_tenant_idx).
 *
 * Also reasserts isActive=true, mustCompleteSetup=false, totpEnabled=false
 * on every run, so a stray DB edit elsewhere can never silently lock this
 * account out again. TOTP exemption itself lives in code (src/auth.config.ts
 * TOTP_EXEMPT_EMAILS), not the DB, so it can't drift at all; this script
 * just keeps the DB-side flags consistent with that guarantee.
 *
 * The password is never logged, printed, or written anywhere but the
 * users table. Nothing about this script commits or transmits it.
 */
import { createInterface } from "readline";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";

const TARGET_EMAIL = process.argv[2] ?? "test-pathologist@xpath.report";

async function main() {
  const rows = await db
    .select()
    .from(users)
    .where(and(eq(users.email, TARGET_EMAIL), eq(users.role, "pathologist")));

  if (rows.length === 0) {
    console.error(`No pathologist account found for ${TARGET_EMAIL}. Nothing changed.`);
    process.exit(1);
  }
  if (rows.length > 1) {
    console.error(
      `Found ${rows.length} pathologist rows for ${TARGET_EMAIL} — refusing to guess which one. Nothing changed.`
    );
    process.exit(1);
  }
  const user = rows[0];

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const password = await new Promise<string>((resolve) => {
    rl.question(`New password for ${TARGET_EMAIL} (min 8 chars): `, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });

  if (password.length < 8) {
    console.error("Password must be at least 8 characters. Nothing changed.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await db
    .update(users)
    .set({
      passwordHash,
      isActive: true,
      mustCompleteSetup: false,
      totpEnabled: false,
    })
    .where(eq(users.id, user.id));

  const [verify] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);

  console.log(`\nPassword set for ${TARGET_EMAIL}.`);
  console.log(
    JSON.stringify(
      {
        email: verify.email,
        role: verify.role,
        isActive: verify.isActive,
        mustCompleteSetup: verify.mustCompleteSetup,
        totpEnabled: verify.totpEnabled,
      },
      null,
      2
    )
  );
  console.log("\nNow go test it for real: sign in at https://www.xpath.report/sign-in with this password.");
}

main().then(() => process.exit(0));
