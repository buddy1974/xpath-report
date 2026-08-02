// Role-aware shell. In Session 01 this renders an empty, role-scoped landing.
// No clinical features yet (Header G4).

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

export default function DashboardPage() {
  // TODO(session-01): read the authenticated user's role from the session.
  const role: Role = "pathologist";
  const view = VIEWS[role];

  return (
    <main className="min-h-screen">
      <header className="h-14 bg-white border-b flex items-center px-6 gap-3">
        <span className="w-5 h-5 rounded bg-gradient-to-br from-eosin to-hema" />
        <span className="font-bold">X-PATH</span>
        <span className="ml-auto text-xs text-neutral-500 capitalize">
          {role}
        </span>
      </header>
      <div className="p-8">
        <h1 className="text-2xl font-semibold">{view.title}</h1>
        <p className="text-neutral-600 mt-1">{view.blurb}</p>
        <div className="mt-6 rounded-lg border border-dashed border-neutral-300 p-10 text-center text-neutral-400">
          Foundation ready. Clinical features arrive in Session 02.
        </div>
      </div>
    </main>
  );
}
