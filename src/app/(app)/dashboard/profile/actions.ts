"use server";

/**
 * X-PATH — profile picture upload
 * ------------------------------------------------------------------
 * Routed through this Server Action (server-side R2 PUT via
 * lib/r2.ts:putObject) rather than a direct browser-to-R2 presigned
 * PUT. Found live: the R2 bucket's CORS policy rejects the browser's
 * preflight OPTIONS request for a direct PUT (403) — a Cloudflare-
 * dashboard configuration gap outside application code, logged as
 * R-036. Avatar images are small (<5MB), so proxying through a Vercel
 * function is a reasonable, scoped exception to the direct-to-R2
 * pattern used for audio (which stays direct, for its own good reason
 * — avoiding Vercel's request-body/time limits on longer dictations).
 */
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { putObject } from "@/lib/r2";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

function extensionFor(contentType: string): string {
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  return "jpg";
}

export async function uploadAvatar(formData: FormData) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!session || !userId) throw new Error("Not authenticated");

  const file = formData.get("avatar");
  if (!(file instanceof File)) throw new Error("No file provided");
  if (!ALLOWED_TYPES.has(file.type)) throw new Error("Unsupported image type");
  if (file.size > MAX_BYTES) throw new Error("Image too large");

  const tenantId = (session as any).tenantId as string;
  const key = `tenants/${tenantId}/users/${userId}/avatar/${randomUUID()}.${extensionFor(file.type)}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  await putObject(key, bytes, file.type);
  await db.update(users).set({ avatarKey: key }).where(eq(users.id, userId));
}
