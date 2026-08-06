"use server";

/**
 * X-PATH — Announcements/news ticker server actions (DL-054)
 * ------------------------------------------------------------------
 * Single-role broadcast: administrator authors/publishes/manages, no
 * editor/moderator sub-roles. Every action is audit-logged. Nothing
 * shows on the ticker until explicitly published (status defaults to
 * "draft" on create).
 */
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import { writeAudit } from "@/lib/audit";

type DurationPreset = "1d" | "1w" | "1m" | "custom" | "indefinite";

async function requireAdmin() {
  const session = await auth();
  const role = (session as any)?.role as string | undefined;
  const userId = (session?.user as any)?.id as string | undefined;
  const tenantId = (session as any)?.tenantId as string | undefined;
  if (!session || !userId || !tenantId) throw new Error("Not authenticated");
  if (role !== "administrator") throw new Error("Administrator only");
  return { userId, tenantId };
}

function computeExpiresAt(preset: DurationPreset, customDate: string | null): Date | null {
  if (preset === "indefinite") return null;
  if (preset === "custom") return customDate ? new Date(customDate) : null;
  const d = new Date();
  if (preset === "1d") d.setDate(d.getDate() + 1);
  if (preset === "1w") d.setDate(d.getDate() + 7);
  if (preset === "1m") d.setMonth(d.getMonth() + 1);
  return d;
}

/** Create or update. Publishes only when the "publishNow" checkbox is set. */
export async function saveAnnouncement(formData: FormData) {
  const { userId, tenantId } = await requireAdmin();

  const existingId = formData.get("id") as string | null;
  const id = existingId || randomUUID();
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "news") as "news" | "operational" | "emergency";
  const tickerTextEn = String(formData.get("tickerTextEn") ?? "").trim();
  const tickerTextFr = String(formData.get("tickerTextFr") ?? "").trim();
  const bodyEn = String(formData.get("bodyEn") ?? "").trim();
  const bodyFr = String(formData.get("bodyFr") ?? "").trim();
  const link = String(formData.get("link") ?? "").trim() || null;
  const publishNow = formData.get("publishNow") === "on";
  const durationPreset = (formData.get("durationPreset") as DurationPreset) || "indefinite";
  const customDate = (formData.get("customDate") as string | null) || null;

  if (!title || !tickerTextEn || !tickerTextFr || !bodyEn || !bodyFr) {
    throw new Error("Title, ticker text, and full detail (EN + FR) are all required.");
  }

  const patch: Record<string, unknown> = {
    tenantId,
    authorId: userId,
    title,
    category,
    tickerTextEn,
    tickerTextFr,
    bodyEn,
    bodyFr,
    link,
    updatedAt: new Date(),
  };
  if (publishNow) {
    patch.status = "published";
    patch.publishedAt = new Date();
    patch.expiresAt = computeExpiresAt(durationPreset, customDate);
  }

  if (existingId) {
    await db.update(announcements).set(patch).where(eq(announcements.id, existingId));
  } else {
    await db.insert(announcements).values({ id, status: "draft", ...patch } as typeof announcements.$inferInsert);
  }

  await writeAudit({
    tenantId,
    actorId: userId,
    action: publishNow ? "announcement_published" : "announcement_edited",
    detail: { announcementId: id, title, category, published: publishNow },
  });

  redirect("/dashboard/announcements");
}

export async function unpublishAnnouncement(id: string) {
  const { userId, tenantId } = await requireAdmin();
  await db.update(announcements).set({ status: "draft", updatedAt: new Date() }).where(eq(announcements.id, id));
  await writeAudit({ tenantId, actorId: userId, action: "announcement_unpublished", detail: { announcementId: id } });
  redirect("/dashboard/announcements");
}
