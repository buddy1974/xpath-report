// Role-aware shell. No clinical AI/voice/reflex features yet (Header G4) —
// M3 adds the template engine + Phase-1 template data only, M4 adds
// private dictation capture.
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

type Role = "pathologist" | "technician" | "manager" | "administrator";

const VIEWS: Record<Role, { title: string; blurb: string }> = {
  pathologist: {
    title: "Worklist",
    blurb: "Cases assigned to you. Your drafts are private to you.",
  },
  technician: {
    title: "Accessioning",
    blurb: "Specimens to accession and assign.",
  },
  manager: {
    title: "Operations",
    blurb: "Turnaround and workload. No access to private workspaces.",
  },
  administrator: {
    title: "Administration",
    blurb: "Users, roles and audit. No clinical interpretation.",
  },
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");

  const role = (session as any).role as Role;
  const view = VIEWS[role];

  return (
    <main className="min-h-screen">
      <header className="h-14 bg-white border-b flex items-center px-6 gap-3">
        <span className="w-5 h-5 rounded bg-gradient-to-br from-eosin to-hema" />
        <span className="font-bold">X-PATH</span>
        <span className="ml-auto text-xs text-neutral-500">
          {session.user.email}
        </span>
        <span className="text-xs text-neutral-500 capitalize">{role}</span>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/sign-in" });
          }}
        >
          <button className="text-xs font-semibold text-petrol underline">
            Sign out
          </button>
        </form>
      </header>
      <div className="p-8">
        <h1 className="text-2xl font-semibold">{view.title}</h1>
        <p className="text-neutral-600 mt-1">{view.blurb}</p>
        {role === "pathologist" && (
          <Link
            href="/dashboard/dictate"
            className="mt-6 block rounded-lg border border-neutral-300 p-6 hover:border-petrol"
          >
            <span className="font-semibold text-petrol">Dictate</span>
            <p className="text-sm text-neutral-500 mt-1">
              Speak a case; get an editable, AI-generated transcript. Private until you save it.
            </p>
          </Link>
        )}
        <Link
          href="/dashboard/templates"
          className="mt-4 block rounded-lg border border-neutral-300 p-6 hover:border-petrol"
        >
          <span className="font-semibold text-petrol">Templates</span>
          <p className="text-sm text-neutral-500 mt-1">
            Phase-1 CAP-derived templates (structural logic only, draft — pending director approval).
          </p>
        </Link>
      </div>
    </main>
  );
}
