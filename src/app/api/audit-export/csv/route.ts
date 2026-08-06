/**
 * X-PATH — audit log CSV export (DL-055, Node runtime)
 * ------------------------------------------------------------------
 * GET-only, no state change. Administrator only, tenant-scoped. Not a
 * new logging mechanism — reads the existing audit_log verbatim.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAuditExportRows } from "@/lib/audit-export";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if ((session as any).totpVerified !== true) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if ((session as any).role !== "administrator") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const tenantId = (session as any).tenantId as string;
  const { searchParams } = new URL(req.url);
  const fromRaw = searchParams.get("from");
  const toRaw = searchParams.get("to");
  const from = fromRaw ? new Date(fromRaw) : undefined;
  const to = toRaw ? new Date(toRaw) : undefined;

  const rows = await getAuditExportRows(tenantId, from, to);

  const header = ["Timestamp", "Actor", "Action", "Detail"];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        csvEscape(r.at.toISOString()),
        csvEscape(r.actorName ?? "—"),
        csvEscape(r.action),
        csvEscape(r.detail ? JSON.stringify(r.detail) : ""),
      ].join(","),
    );
  }

  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="xpath-audit-log-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
