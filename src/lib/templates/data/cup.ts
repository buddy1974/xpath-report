/**
 * X-PATH — Carcinoma of Unknown Primary (CUP), derived template data
 * ------------------------------------------------------------------
 * CAP does not publish a standalone CUP cancer protocol — there is no
 * CAP source document behind this template. Built in-house from
 * PROJECT_HEADER.md §5's "generic fallback protocol when no
 * organ-specific one exists" pattern, combined with the CUP
 * immunohistochemistry panel already specified in XPATH_handover.md §13
 * (CK7, CK20, CDX2, TTF-1, GATA3, PAX8, CD45) — X.PATH's real in-house
 * antibody menu, not a generic textbook panel.
 *
 * PAX8's clone/availability is an unconfirmed open item
 * (XPATH_handover.md §25) — tagged explicitly in the field label and
 * option set below rather than silently included as if confirmed, and
 * without blocking the rest of the template on it (Header §9/§25:
 * open items don't block Phase-1 planning).
 *
 * Since this is authored in-house rather than extracted from a CAP
 * source, there is no "copying CAP prose" risk in the Header G3 sense —
 * but field labels are kept as concise, clinical checklist items
 * (matching the other Phase-1 templates' style), not narrative text.
 *
 * `approval.status` is "draft" — nothing here is clinically valid until
 * Dr. Ivo reviews and approves it (Header G3).
 */
import type { TemplateSection, TemplateVersion } from "../types";

const SPECIMEN: TemplateSection = {
  key: "specimen",
  title: "Specimen",
  fields: [
    {
      key: "procedure",
      label: "Procedure",
      tier: "core",
      type: "single-select",
      options: [
        { key: "biopsy", label: "Biopsy" },
        { key: "excision", label: "Excision" },
        { key: "other", label: "Other", requiresText: true, textLabel: "Specify" },
        { key: "not-specified", label: "Not specified" },
      ],
    },
    {
      key: "sample-site",
      label: "Site of specimen sampled (the biopsy/excision site itself — not the unknown primary)",
      tier: "core",
      type: "text",
    },
    {
      key: "clinical-context",
      label: "Relevant clinical / imaging context provided (e.g. sites of disease on imaging)",
      tier: "non-core",
      type: "text",
    },
  ],
};

const TUMOR_CHARACTERISTICS: TemplateSection = {
  key: "tumor-characteristics",
  title: "Tumor Characteristics",
  fields: [
    {
      key: "histologic-type",
      label: "Histologic Type",
      tier: "core",
      type: "single-select",
      options: [
        { key: "adenocarcinoma-nos", label: "Adenocarcinoma, NOS" },
        { key: "squamous-cell-carcinoma", label: "Squamous cell carcinoma" },
        { key: "poorly-differentiated-carcinoma-nos", label: "Poorly differentiated carcinoma, NOS" },
        { key: "neuroendocrine-carcinoma", label: "Neuroendocrine carcinoma" },
        { key: "undifferentiated-carcinoma", label: "Undifferentiated carcinoma" },
        { key: "other", label: "Other", requiresText: true, textLabel: "Specify" },
      ],
      cannotBeDetermined: true,
    },
    {
      key: "histologic-grade",
      label: "Histologic Grade (required only if applicable)",
      tier: "conditional",
      type: "single-select",
      options: [
        { key: "well-differentiated", label: "Well differentiated" },
        { key: "moderately-differentiated", label: "Moderately differentiated" },
        { key: "poorly-differentiated", label: "Poorly differentiated" },
        { key: "undifferentiated", label: "Undifferentiated" },
      ],
      cannotBeDetermined: true,
    },
    {
      key: "tumor-size",
      label: "Tumor Size (if measurable in this specimen)",
      tier: "non-core",
      type: "single-select",
      options: [{ key: "specify", label: "Largest dimension", requiresText: true, textUnit: "mm" }],
      cannotBeDetermined: true,
    },
    {
      key: "lymphovascular-invasion",
      label: "Lymphatic and / or Vascular Invasion",
      tier: "non-core",
      type: "single-select",
      options: [
        { key: "not-identified", label: "Not identified" },
        { key: "present", label: "Present" },
      ],
      cannotBeDetermined: true,
    },
  ],
};

function ihcField(name: string, tier: "core" | "conditional" = "core", labelSuffix = ""): TemplateSection["fields"][number] {
  return {
    key: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    label: `${name}${labelSuffix}`,
    tier,
    type: "single-select",
    options: [
      { key: "positive", label: "Positive" },
      { key: "negative", label: "Negative" },
      { key: "equivocal", label: "Equivocal" },
      { key: "not-performed", label: "Not performed" },
    ],
    cannotBeDetermined: true,
  };
}

const IHC_PANEL: TemplateSection = {
  key: "ihc-panel",
  title: "Immunohistochemistry Panel (CUP — X.PATH in-house menu)",
  fields: [
    ihcField("CK7"),
    ihcField("CK20"),
    ihcField("CDX2"),
    ihcField("TTF-1"),
    ihcField("GATA3"),
    // PAX8: clone/availability unconfirmed (XPATH_handover.md §25) — tagged
    // explicitly, conditional tier (not assumed available), with an
    // explicit "clone unconfirmed" option rather than silently omitted.
    {
      key: "pax8",
      label: "PAX8 (clone unconfirmed — open item, XPATH_handover.md §25)",
      tier: "conditional",
      type: "single-select",
      options: [
        { key: "positive", label: "Positive" },
        { key: "negative", label: "Negative" },
        { key: "equivocal", label: "Equivocal" },
        { key: "not-performed", label: "Not performed" },
        { key: "not-available-clone-unconfirmed", label: "Not available — clone not yet confirmed for this lab" },
      ],
      cannotBeDetermined: true,
    },
    ihcField("CD45", "core", " (LCA)"),
    { key: "ihc-panel-comment", label: "IHC Panel Comment", tier: "non-core", type: "text" },
  ],
};

const DIFFERENTIAL: TemplateSection = {
  key: "differential",
  title: "Differential / Interpretation",
  fields: [
    {
      // Pathologist's own synthesis of the IHC pattern — the platform
      // structures/suggests, it never originates this itself (Header G1).
      key: "likely-primary-sites",
      label: "Likely Primary Site(s) Suggested by IHC Pattern (pathologist's interpretation)",
      tier: "non-core",
      type: "text",
    },
    {
      key: "additional-studies-recommended",
      label: "Additional Studies Recommended",
      tier: "non-core",
      type: "text",
    },
  ],
};

const COMMENTS: TemplateSection = {
  key: "comments",
  title: "Comments",
  fields: [{ key: "comment", label: "Comment(s)", tier: "non-core", type: "text" }],
};

export const cup: TemplateVersion = {
  templateId: "cup",
  title: "Carcinoma of Unknown Primary (CUP)",
  category: "Carcinoma of Unknown Primary (CUP)",
  blurb: "In-house IHC panel to help narrow the likely primary site — advisory, pathologist-interpreted.",
  panelPreview: ["CK7", "CK20", "CDX2", "TTF-1", "GATA3", "PAX8", "CD45"],
  sourceVersion: "1.0.0-inhouse",
  sourceProtocolName:
    "X-PATH generic fallback protocol (no CAP source exists for CUP) — Header §5 pattern + XPATH_handover.md §13 CUP panel",
  sourcePostingDate: "2026-08",
  classificationBindings: [],
  sections: [SPECIMEN, TUMOR_CHARACTERISTICS, IHC_PANEL, DIFFERENTIAL, COMMENTS],
  approval: { status: "draft" },
};
