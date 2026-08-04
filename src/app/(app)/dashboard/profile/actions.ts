"use server";

/**
 * X-PATH — profile picture upload (Cowork addendum, test-pathologist
 * walkthrough request)
 * ------------------------------------------------------------------
 * Same pattern as dictation audio (lib/r2.ts): direct browser-to-R2
 * presigned upload, not routed through a serverless function. The R2
 * object key is tenant/owner-scoped and stored on the user's own row;
 * it is never a public URL — only /api/avatar/me (session-gated) ever
 * reads it back.
 */
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { presignUpload } from "@/lib/r2";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function extensionFor(contentType: string): string {
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  return "jpg";
}

export async function presignAvatarUpload(contentType: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!session || !userId) throw new Error("Not authenticated");
  if (!ALLOWED_TYPES.has(contentType)) throw new Error("Unsupported image type");

  const tenantId = (session as any).tenantId as string;
  const key = `tenants/${tenantId}/users/${userId}/avatar/${randomUUID()}.${extensionFor(contentType)}`;
  const uploadUrl = await presignUpload(key, contentType);
  return { key, uploadUrl };
}

export async function saveAvatarKey(key: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!session || !userId) throw new Error("Not authenticated");
  await db.update(users).set({ avatarKey: key }).where(eq(users.id, userId));
}
