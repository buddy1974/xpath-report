/**
 * X-PATH — audit log export PDF layout (DL-055)
 * ------------------------------------------------------------------
 * @react-pdf/renderer, same self-hosted approach as report-document.tsx
 * (DL-033) — no third-party rendering service, no browser binary.
 */
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { AuditExportRow } from "@/lib/audit-export";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 8, fontFamily: "Helvetica" },
  title: { fontSize: 14, fontWeight: 700, marginBottom: 2 },
  meta: { fontSize: 8, color: "#555555", marginBottom: 10 },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#0f4c4c",
    paddingBottom: 3,
    marginBottom: 3,
  },
  headerCell: { fontWeight: 700, color: "#0f4c4c" },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e5e5",
    paddingVertical: 2,
  },
  colAt: { width: "18%" },
  colActor: { width: "18%" },
  colAction: { width: "20%" },
  colDetail: { width: "44%" },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 32,
    right: 32,
    fontSize: 7,
    color: "#999999",
  },
});

export function AuditLogDocument({
  rows,
  generatedAt,
  from,
  to,
}: {
  rows: AuditExportRow[];
  generatedAt: string;
  from?: string;
  to?: string;
}) {
  return (
    <Document title="X-PATH — Audit log export">
      <Page size="A4" style={styles.page} orientation="landscape">
        <Text style={styles.title}>Audit log export</Text>
        <Text style={styles.meta}>
          Generated {generatedAt} · {rows.length} entries
          {from ? ` · from ${from}` : ""}
          {to ? ` · to ${to}` : ""}
        </Text>

        <View style={styles.headerRow}>
          <Text style={[styles.headerCell, styles.colAt]}>Timestamp</Text>
          <Text style={[styles.headerCell, styles.colActor]}>Actor</Text>
          <Text style={[styles.headerCell, styles.colAction]}>Action</Text>
          <Text style={[styles.headerCell, styles.colDetail]}>Detail</Text>
        </View>

        {rows.map((r, i) => (
          <View key={i} style={styles.row} wrap={false}>
            <Text style={styles.colAt}>{r.at.toISOString()}</Text>
            <Text style={styles.colActor}>{r.actorName ?? "—"}</Text>
            <Text style={styles.colAction}>{r.action}</Text>
            <Text style={styles.colDetail}>{r.detail ? JSON.stringify(r.detail) : ""}</Text>
          </View>
        ))}

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) => `X-PATH — page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}
