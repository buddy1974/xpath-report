import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Recorder } from "./recorder";

export default async function DictatePage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold">Dictate</h1>
      <p className="text-neutral-600 mt-1">
        Private to you until you save it — no one else, including the lab, can see this (Header G2).
      </p>
      <div className="mt-6">
        <Recorder />
      </div>
    </main>
  );
}
