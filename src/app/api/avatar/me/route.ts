/**
 * X-PATH — current user's own profile picture (Node runtime)
 * ------------------------------------------------------------------
 * Session-gated, self only — no userId param, always the caller's own
 * avatar. Not a public asset URL; this route is the only read path.
 * 404 if the user hasn't uploaded one (the client falls back to the
 * initials avatar it already renders everywhere else).
 */
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getObjectWithContentType } from "@/lib/r2";

export async function GET(_req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!session || !userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const rows = await db.select({ avatarKey: users.avatarKey }).from(users).where(eq(users.id, userId)).limit(1);
  const key = rows[0]?.avatarKey;
  if (!key) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { bytes, contentType } = await getObjectWithContentType(key);
  return new NextResponse(bytes, {
    status: 200,
    headers: { "Content-Type": contentType, "Cache-Control": "private, max-age=300" },
  });
}
