import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { templates } from "@/lib/templates";

export default async function TemplatesIndexPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if ((session as any).totpVerified !== true) redirect("/verify");

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold">Templates</h1>
      <p className="text-neutral-600 mt-1">
        Phase-1 template engine (Header G4) — structural logic only, no CAP text reproduced.
      </p>
      <ul className="mt-6 space-y-3">
        {templates.map((t) => (
          <li key={t.templateId} className="rounded-lg border border-neutral-300 p-4">
            <Link href={`/dashboard/templates/${t.templateId}`} className="font-semibold text-petrol">
              {t.title}
            </Link>
            <p className="text-sm text-neutral-500 mt-1">
              v{t.sourceVersion} · {t.approval.status} · {t.sections.length} sections
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
