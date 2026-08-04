/**
 * X-PATH — seeded demo pathologist (North-Star §5)
 * ------------------------------------------------------------------
 * A dedicated, clearly-marked DEMO account for Marcel to present to
 * Dr. Ivo. Fictional identity, fake placeholder cases only — never real
 * patient data. Safely re-runnable: wipes its own prior demo data
 * before reseeding, so running this twice doesn't duplicate anything.
 *
 * The one "fully worked" case runs through the REAL structuring engine
 * (a real OpenAI call, same as a live pathologist would get) and the
 * REAL reflex engine — nothing about the extracted values is invented;
 * only the transcript itself is placeholder/fictional content. The
 * urgent flag on that case is a real exercise of the North-Star §4.5
 * danger-zone feature (R-034), set by this script the same way a
 * pathologist would set it from the review screen.
 *
 * Companion: scripts/wipe-demo-pathologist.ts removes everything this
 * script creates, including the account itself.
 *
 * Run: npx tsx --env-file=.env.local scripts/seed-demo-pathologist.ts
 */
import { randomUUID, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";
import { eq, and, inArray } from "drizzle-orm";
import { db } from "@/db";
import { users, tenants, privateWorkspaceItems, clinicalRecords, cases } from "@/db/schema";
import { encrypt } from "@/lib/crypto";
import { getTemplate } from "@/lib/templates";
import { flattenTemplate } from "@/lib/templates/flatten";
import { structureTranscript } from "@/lib/structuring";
import { computeReflexSuggestions } from "@/lib/reflex";

const DEMO_EMAIL = "demo-pathologist@xpath.report";
const DEMO_NAME = "Dr. Amara Kessler (DEMO)";
const DEMO_ACCESSION = "DEMO-0001";

const SAMPLE_DICTATIONS = [
  {
    title: "DEMO — Colon resection (sample)",
    body: "Colon resection specimen, right hemicolectomy. Invasive adenocarcinoma of the cecum, moderately differentiated, 3.5 cm. Twelve lymph nodes examined, all negative. Margins negative.",
  },
  {
    title: "DEMO — Prostate needle biopsy (sample)",
    body: "Prostate needle biopsy, twelve cores. Acinar adenocarcinoma identified in three cores from the right base, Gleason grade group 2 (3+4). Remaining cores benign.",
  },
];

// One unbroken line deliberately — validateAndGround does a literal
// substring check for each grounding quote against this transcript, so
// a hard-wrapped multi-line template literal here would insert "\n"
// mid-phrase and break otherwise-correct quotes (found live while
// building this script: 9 of 10 real, well-grounded model values were
// silently rejected because of exactly that formatting bug, not an
// engine problem — same failure mode a real multi-line transcript
// paste could hit, worth keeping in mind, not just a script quirk).
const HER2_TRANSCRIPT =
  "Breast biomarker panel on invasive ductal carcinoma, left breast, core biopsy. Estrogen receptor strongly positive, greater than ninety percent of tumor cells show nuclear positivity, strong intensity, internal controls present and staining as expected. Progesterone receptor negative, less than one percent of cells staining. HER2 by immunohistochemistry scored 2+, equivocal, incomplete moderate to intense membrane staining in more than ten percent of tumor cells, recommend reflex to dual in situ hybridization for a definitive result. Ki-67 proliferation index approximately twenty-five percent.";

async function main() {
  const tenantRows = await db.select().from(tenants).limit(1);
  const tenant = tenantRows[0];
  if (!tenant) throw new Error("No tenant found — run scripts/seed.ts first.");

  // --- wipe any prior demo data for this account (idempotent reseed) ---
  const existing = await db.select().from(users).where(eq(users.email, DEMO_EMAIL)).limit(1);
  let userId = existing[0]?.id;
  if (userId) {
    await db.delete(privateWorkspaceItems).where(eq(privateWorkspaceItems.ownerId, userId));
    const priorRecords = await db.select().from(clinicalRecords).where(eq(clinicalRecords.signedByPathologistId, userId));
    if (priorRecords.length) {
      await db.delete(clinicalRecords).where(inArray(clinicalRecords.id, priorRecords.map((r) => r.id)));
    }
    const priorCases = await db.select().from(cases).where(eq(cases.accession, DEMO_ACCESSION));
    if (priorCases.length) {
      await db.delete(cases).where(inArray(cases.id, priorCases.map((c) => c.id)));
    }
  }

  // --- account (fresh password + TOTP every run, printed once) ---
  const password = randomBytes(18).toString("base64url");
  const passwordHash = await bcrypt.hash(password, 10);
  const totpSecret = authenticator.generateSecret();
  const totpSecretEncrypted = encrypt(totpSecret);

  if (userId) {
    await db
      .update(users)
      .set({ displayName: DEMO_NAME, passwordHash, totpSecretEncrypted, totpEnabled: true, totpFailedAttempts: 0, totpLockedUntil: null, mustCompleteSetup: false, isActive: true })
      .where(eq(users.id, userId));
  } else {
    const [created] = await db
      .insert(users)
      .values({
        tenantId: tenant.id,
        email: DEMO_EMAIL,
        displayName: DEMO_NAME,
        role: "pathologist",
        passwordHash,
        totpSecretEncrypted,
        totpEnabled: true,
        mustCompleteSetup: false,
        isActive: true,
      })
      .returning();
    userId = created.id;
  }

  // --- sample dictations (decorative — populate Home's "recent work" list) ---
  for (const d of SAMPLE_DICTATIONS) {
    await db.insert(privateWorkspaceItems).values({
      tenantId: tenant.id,
      ownerId: userId,
      kind: "dictation",
      title: d.title,
      body: d.body,
      language: "en",
    });
  }

  // --- one in-progress draft (so "recent work" / recommendations show something real) ---
  const colorectalTemplate = getTemplate("colorectal-resection");
  if (colorectalTemplate) {
    await db.insert(privateWorkspaceItems).values({
      tenantId: tenant.id,
      ownerId: userId,
      kind: "report_draft",
      title: `${colorectalTemplate.title} — draft`,
      data: {
        templateId: colorectalTemplate.templateId,
        fieldValues: {},
        aiFieldPaths: [],
        quotes: {},
        reflexSuggestions: [],
      },
    });
  }

  // --- the one fully worked case: real structuring + real reflex engine ---
  const biomarkerTemplate = getTemplate("breast-biomarker");
  if (!biomarkerTemplate) throw new Error("breast-biomarker template not registered");
  const fields = flattenTemplate(biomarkerTemplate);
  console.log("Running real structuring call against the HER2 demo transcript...");
  const structured = await structureTranscript(HER2_TRANSCRIPT, fields);
  const fieldValues: Record<string, string | string[]> = {};
  const quotes: Record<string, string> = {};
  for (const s of structured) {
    fieldValues[s.path] = s.value;
    quotes[s.path] = s.quote;
  }
  const reflexSuggestions = computeReflexSuggestions(biomarkerTemplate.templateId, fieldValues);
  console.log(`Structured ${structured.length} field(s); ${reflexSuggestions.length} reflex suggestion(s).`);

  const [demoCase] = await db
    .insert(cases)
    .values({
      tenantId: tenant.id,
      accession: DEMO_ACCESSION,
      assignedPathologistId: userId,
      specimenType: biomarkerTemplate.title,
    })
    .returning();

  await db.insert(clinicalRecords).values({
    tenantId: tenant.id,
    caseId: demoCase.id,
    signedByPathologistId: userId,
    status: "released",
    version: "1",
    content: {
      templateId: biomarkerTemplate.templateId,
      templateTitle: biomarkerTemplate.title,
      sourceVersion: biomarkerTemplate.sourceVersion,
      fieldValues,
      quotes,
      reflexSuggestionsAtSignOut: reflexSuggestions,
      dictationId: null,
      urgentFlag: {
        urgent: true,
        severity: "attention",
        note: "HER2 2+ (Equivocal) — Dual-ISH reflex recommended for a definitive result",
      },
    },
  });

  console.log("\nDemo pathologist ready.");
  console.log(`  email: ${DEMO_EMAIL}`);
  console.log(`  password: ${password}`);
  console.log(`  totp secret (for enrollment / testing): ${totpSecret}`);
  console.log(`  fully-worked case accession: ${DEMO_ACCESSION}`);
}

main().then(() => process.exit(0));
