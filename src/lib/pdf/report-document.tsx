/**
 * X-PATH — Signed report PDF layout (M6)
 * ------------------------------------------------------------------
 * @react-pdf/renderer, not headless Chromium (DL-033) — self-hosted inside
 * the existing Vercel Node function, no third-party rendering service ever
 * sees clinical report content, no browser binary to deploy/maintain.
 *
 * Only fields with an actual value are rendered — this is the signed
 * record, not the blank template. Values are resolved from flattenTemplate
 * paths against the record's stored `fieldValues`, same source of truth as
 * the review/archive HTML views.
 */
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { TemplateVersion } from "@/lib/templates/types";
import { flattenTemplate } from "@/lib/templates/flatten";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 2 },
  meta: { fontSize: 9, color: "#555555", marginBottom: 10 },
  reflexBox: {
    borderWidth: 1,
    borderColor: "#d4a72c",
    backgroundColor: "#fef9e7",
    padding: 8,
    marginBottom: 12,
  },
  reflexTitle: { fontWeight: 700, marginBottom: 3, color: "#7a5c00" },
  reflexDetail: { color: "#7a5c00" },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 10,
    marginBottom: 4,
    textTransform: "uppercase",
    color: "#0f4c4c",
  },
  row: { flexDirection: "row", marginBottom: 3 },
  label: { width: "45%", fontWeight: 700 },
  value: { width: "55%" },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    fontSize: 8,
    color: "#999999",
  },
});

function resolveDisplayValue(
  value: string | string[] | undefined,
  options?: { key: string; label: string }[],
): string | null {
  if (value === undefined || value === null) return null;
  const lookup = (key: string) => options?.find((o) => o.key === key)?.label ?? key;
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    return value.map(lookup).join(", ");
  }
  if (value === "") return null;
  return lookup(value);
}

export function ReportDocument({
  template,
  accession,
  version,
  status,
  releasedAt,
  fieldValues,
  reflexSuggestions,
}: {
  template: TemplateVersion;
  accession: string;
  version: string;
  status: string;
  releasedAt: string;
  fieldValues: Record<string, string | string[]>;
  reflexSuggestions: { title: string; detail: string }[];
}) {
  const fields = flattenTemplate(template);

  const bySection = new Map<string, typeof fields>();
  for (const f of fields) {
    const value = resolveDisplayValue(fieldValues[f.path], f.options);
    if (value === null) continue;
    if (!bySection.has(f.sectionTitle)) bySection.set(f.sectionTitle, []);
    bySection.get(f.sectionTitle)!.push(f);
  }

  return (
    <Document title={`${template.title} — ${accession}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{template.title}</Text>
        <Text style={styles.meta}>
          Accession {accession} · v{version} · {status} · signed {releasedAt}
        </Text>
        <Text style={styles.meta}>Source template version {template.sourceVersion}</Text>

        {reflexSuggestions.length > 0 &&
          reflexSuggestions.map((r, i) => (
            <View key={i} style={styles.reflexBox}>
              <Text style={styles.reflexTitle}>Reflex: {r.title}</Text>
              <Text style={styles.reflexDetail}>{r.detail}</Text>
            </View>
          ))}

        {[...bySection.entries()].map(([sectionTitle, sectionFields]) => (
          <View key={sectionTitle}>
            <Text style={styles.sectionTitle}>{sectionTitle}</Text>
            {sectionFields.map((f) => {
              const value = resolveDisplayValue(fieldValues[f.path], f.options)!;
              return (
                <View key={f.path} style={styles.row} wrap={false}>
                  <Text style={styles.label}>{f.label}</Text>
                  <Text style={styles.value}>{value}</Text>
                </View>
              );
            })}
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
