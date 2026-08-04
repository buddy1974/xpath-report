"use server";

/**
 * X-PATH — dictation capture server actions (M4)
 * ------------------------------------------------------------------
 * A dictation lives in the private workspace (kind: "dictation") until
 * the pathologist reviews/edits/saves it — it is never audited (Header
 * G2: private workspace is not surveilled, not part of the clinical
 * record). It only becomes part of the audited record at sign-out
 * (M6, not yet built), same as any other draft.
 *
 * CSRF: genuine Next.js Server Actions, protected by Next.js's built-in
 * Origin-header check — same as the claim wizard and sign-in actions.
 */
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { privateWorkspaceItems } from "@/db/schema";
import { assertWorkspaceOwner, type Actor } from "@/lib/access";
import { presignUpload, getObjectBytes } from "@/lib/r2";
import { transcribeAudio } from "@/lib/transcription";

async function requireActor(): Promise<Actor> {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!session || !userId) throw new Error("Not authenticated");
  return { id: userId, tenantId: (session as any).tenantId, role: (session as any).role };
}

function extensionFor(contentType: string): string {
  if (contentType.includes("webm")) return "webm";
  if (contentType.includes("mp4")) return "mp4";
  if (contentType.includes("ogg")) return "ogg";
  if (contentType.includes("wav")) return "wav";
  return "bin";
}

/** Creates the workspace-item row and returns a presigned R2 upload URL. */
export async function createCapture(language: "en" | "fr", contentType: string) {
  const actor = await requireActor();
  const id = randomUUID();
  const key = `tenants/${actor.tenantId}/users/${actor.id}/dictations/${id}.${extensionFor(contentType)}`;

  await db.insert(privateWorkspaceItems).values({
    id,
    tenantId: actor.tenantId,
    ownerId: actor.id,
    kind: "dictation",
    title: `Dictation — ${new Date().toISOString()}`,
    fileRef: key,
    language,
  });

  const uploadUrl = await presignUpload(key, contentType);
  return { itemId: id, uploadUrl };
}

/** Downloads the uploaded audio from R2 and transcribes it via Whisper. */
export async function transcribeCapture(itemId: string) {
  const actor = await requireActor();
  const rows = await db.select().from(privateWorkspaceItems).where(eq(privateWorkspaceItems.id, itemId)).limit(1);
  const item = rows[0];
  if (!item) throw new Error("Capture not found");
  assertWorkspaceOwner(actor, item);
  if (!item.fileRef) throw new Error("No audio uploaded for this capture");

  const bytes = await getObjectBytes(item.fileRef);
  const filename = item.fileRef.split("/").pop() ?? "audio.webm";
  const text = await transcribeAudio(bytes, filename, (item.language as "en" | "fr" | null) ?? undefined);

  await db.update(privateWorkspaceItems).set({ body: text, updatedAt: new Date() }).where(eq(privateWorkspaceItems.id, itemId));
  return { text };
}

/** Saves the pathologist's corrected transcript. */
export async function saveTranscriptEdit(itemId: string, text: string) {
  const actor = await requireActor();
  const rows = await db.select().from(privateWorkspaceItems).where(eq(privateWorkspaceItems.id, itemId)).limit(1);
  const item = rows[0];
  if (!item) throw new Error("Capture not found");
  assertWorkspaceOwner(actor, item);
  await db.update(privateWorkspaceItems).set({ body: text, updatedAt: new Date() }).where(eq(privateWorkspaceItems.id, itemId));
}

/**
 * Saves a photo-to-text scan result (notes/requisition forms/labels) as
 * its own workspace item — kind "note", distinct from a dictation.
 * Deliberately does no AI processing of any kind: this only stores text
 * the pathologist already reviewed on-device (Tesseract.js, ocr-scan.tsx).
 * Sending a saved note to AI structuring is a separate, later, explicit
 * action from the Workspace list (Header G1 — see DL-051).
 */
export async function saveOcrNote(text: string) {
  const actor = await requireActor();
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Nothing to save");

  const id = randomUUID();
  await db.insert(privateWorkspaceItems).values({
    id,
    tenantId: actor.tenantId,
    ownerId: actor.id,
    kind: "note",
    title: `Scanned note — ${new Date().toISOString()}`,
    body: trimmed,
  });
  return { itemId: id };
}
