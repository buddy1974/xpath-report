import Link from "next/link";
import { redirect } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { privateWorkspaceItems } from "@/db/schema";
import { Recorder } from "./recorder";

export default async function DictatePage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");
  const userId = (session.user as any).id as string;

  const dictations = await db
    .select()
    .from(privateWorkspaceItems)
    .where(and(eq(privateWorkspaceItems.ownerId, userId), eq(privateWorkspaceItems.kind, "dictation")))
    .orderBy(desc(privateWorkspaceItems.updatedAt))
    .limit(20);

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold">Dictate</h1>
      <p className="text-neutral-600 mt-1">
        Private to you until you save it — no one else, including the lab, can see this (Header G2).
      </p>
      <div className="mt-6">
        <Recorder />
      </div>

      {dictations.length > 0 && (
        <div className="mt-10 max-w-xl">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Your dictations</h2>
          <ul className="mt-3 space-y-2">
            {dictations.map((d) => (
              <li key={d.id} className="rounded-md border border-neutral-200 p-3 flex items-center justify-between">
                <span className="text-sm text-neutral-600 truncate max-w-xs">{d.body ? d.body : "(not transcribed)"}</span>
                <Link href={`/dashboard/structure/${d.id}`} className="text-sm font-semibold text-petrol shrink-0 ml-3">
                  Structure →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
