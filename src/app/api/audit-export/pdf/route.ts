/**
 * X-PATH — audit log PDF export (DL-055, Node runtime)
 * ------------------------------------------------------------------
 * GET-only, no state change. Administrator only, tenant-scoped. Same
 * self-hosted @react-pdf/renderer approach as /api/pdf/[recordId] (DL-033).
 */
import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { auth } from "@/auth";
import { getAuditExportRows } from "@/lib/audit-export";
import { AuditLogDocument } from "@/lib/pdf/audit-log-document";

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
  const generatedAt = new Date().toISOString();

  const buffer = await renderToBuffer(
    AuditLogDocument({ rows, generatedAt, from: fromRaw ?? undefined, to: toRaw ?? undefined }),
  );

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="xpath-audit-log-${generatedAt.slice(0, 10)}.pdf"`,
    },
  });
}
