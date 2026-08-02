/**
 * X-PATH — Colon & Rectum (Resection), derived template data
 * ------------------------------------------------------------------
 * Structural logic derived from CAP protocol
 * "ColoRectal_4.4.0.1.REL_CAPCP.docx" (posted September 2025, AJCC 8th
 * Edition) — field names, tiers, controlled-vocabulary terms only
 * (Header G3). No paragraph text from the source document's
 * Explanatory Notes is reproduced here; `noteRef` values are
 * traceability pointers back to those notes, not their content. Source
 * file never committed to this repo.
 *
 * `approval.status` is "draft" — a stub gate (Header §5). Nothing here
 * is clinically valid until Dr. Ivo reviews and approves it (Header G3).
 */
import type { TemplateField, TemplateSection, TemplateVersion } from "../types";

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
        { key: "right-hemicolectomy", label: "Right hemicolectomy" },
        { key: "transverse-colectomy", label: "Transverse colectomy" },
        { key: "left-hemicolectomy", label: "Left hemicolectomy" },
        { key: "sigmoidectomy", label: "Sigmoidectomy" },
        { key: "low-anterior-resection", label: "Low anterior resection" },
        { key: "total-abdominal-colectomy", label: "Total abdominal colectomy" },
        { key: "abdominoperineal-resection", label: "Abdominoperineal resection" },
        { key: "other", label: "Other", requiresText: true, textLabel: "Specify" },
        { key: "not-specified", label: "Not specified" },
      ],
    },
    {
      key: "macroscopic-mesorectum",
      label: "Macroscopic Evaluation of Mesorectum (required only for rectal cancers)",
      tier: "conditional",
      type: "single-select",
      noteRef: "Note A",
      options: [
        { key: "not-applicable", label: "Not applicable" },
        { key: "complete", label: "Complete" },
        { key: "near-complete", label: "Near complete" },
        { key: "incomplete", label: "Incomplete" },
      ],
      cannotBeDetermined: true,
    },
  ],
};

const TUMOR: TemplateSection = {
  key: "tumor",
  title: "Tumor",
  fields: [
    {
      key: "tumor-site",
      label: "Tumor Site",
      tier: "core",
      type: "multi-select",
      noteRef: "Note B",
      options: [
        { key: "cecum", label: "Cecum", requiresText: true },
        { key: "ileocecal-valve", label: "Ileocecal valve", requiresText: true },
        { key: "ascending-colon", label: "Ascending colon", requiresText: true },
        { key: "hepatic-flexure", label: "Hepatic flexure", requiresText: true },
        { key: "transverse-colon", label: "Transverse colon", requiresText: true },
        { key: "splenic-flexure", label: "Splenic flexure", requiresText: true },
        { key: "descending-colon", label: "Descending colon", requiresText: true },
        { key: "sigmoid-colon", label: "Sigmoid colon", requiresText: true },
        { key: "rectosigmoid", label: "Rectosigmoid", requiresText: true },
        { key: "rectum", label: "Rectum", requiresText: true },
      ],
    },
    {
      key: "rectal-tumor-location",
      label: "Rectal Tumor Location (required only for rectal primaries)",
      tier: "conditional",
      type: "single-select",
      noteRef: "Note B",
      options: [
        { key: "not-applicable", label: "Not applicable" },
        { key: "above-reflection", label: "Entirely above anterior peritoneal reflection" },
        { key: "below-reflection", label: "Entirely below anterior peritoneal reflection" },
        { key: "straddles-reflection", label: "Straddles anterior peritoneal reflection" },
        { key: "not-specified", label: "Not specified" },
        { key: "colon-nos", label: "Colon, NOS", requiresText: true },
      ],
      cannotBeDetermined: true,
    },
    {
      key: "histologic-type",
      label: "Histologic Type",
      tier: "core",
      type: "single-select",
      noteRef: "Note C",
      options: [
        { key: "adenocarcinoma", label: "Adenocarcinoma" },
        { key: "mucinous-adenocarcinoma", label: "Mucinous adenocarcinoma" },
        { key: "poorly-cohesive", label: "Poorly cohesive carcinoma" },
        { key: "signet-ring", label: "Signet-ring cell carcinoma" },
        { key: "medullary", label: "Medullary carcinoma" },
        { key: "serrated-adenocarcinoma", label: "Serrated adenocarcinoma" },
        { key: "micropapillary", label: "Micropapillary adenocarcinoma" },
        { key: "adenoma-like", label: "Adenoma-like adenocarcinoma" },
        { key: "adenosquamous", label: "Adenosquamous carcinoma" },
        { key: "undifferentiated-nos", label: "Undifferentiated carcinoma, NOS" },
        { key: "sarcomatoid", label: "Carcinoma with sarcomatoid component" },
        { key: "large-cell-nec", label: "Large cell neuroendocrine carcinoma" },
        { key: "small-cell-nec", label: "Small cell neuroendocrine carcinoma" },
        { key: "minen", label: "Mixed neuroendocrine-non-neuroendocrine neoplasm (MiNEN)", requiresText: true, textLabel: "Specify components" },
        { key: "other-not-listed", label: "Other histologic type not listed", requiresText: true, textLabel: "Specify" },
        { key: "type-cannot-be-determined", label: "Carcinoma, type cannot be determined", requiresText: true },
      ],
    },
    { key: "histologic-type-comment", label: "Histologic Type Comment", tier: "non-core", type: "text" },
    {
      key: "histologic-grade",
      label: "Histologic Grade",
      tier: "core",
      type: "single-select",
      noteRef: "Note D",
      options: [
        { key: "g1", label: "G1, well-differentiated" },
        { key: "g2", label: "G2, moderately differentiated" },
        { key: "g3", label: "G3, poorly differentiated" },
        { key: "g4", label: "G4, undifferentiated" },
        { key: "other", label: "Other", requiresText: true },
        { key: "gx", label: "GX, cannot be assessed", requiresText: true },
        { key: "not-applicable", label: "Not applicable", requiresText: true },
      ],
    },
    {
      key: "tumor-size",
      label: "Tumor Size",
      tier: "core",
      type: "single-select",
      options: [
        { key: "greatest-dimension", label: "Greatest dimension", requiresText: true, textLabel: "Exact measurement", textUnit: "cm" },
      ],
      cannotBeDetermined: true,
    },
    { key: "tumor-size-additional-dimension", label: "Additional Dimension", tier: "non-core", type: "text", unit: "cm" },
    {
      key: "multiple-primary-sites",
      label: "Multiple Primary Sites (e.g., hepatic flexure and transverse colon) (required only if applicable)",
      tier: "conditional",
      type: "single-select",
      options: [
        { key: "not-applicable", label: "Not applicable (no additional primary site(s) present)" },
        { key: "present", label: "Present", requiresText: true },
      ],
    },
    {
      key: "tumor-extent",
      label: "Tumor Extent",
      tier: "core",
      type: "single-select",
      options: [
        { key: "no-invasion", label: "No invasion (high-grade dysplasia)" },
        { key: "invades-lamina-propria", label: "Invades lamina propria / muscularis mucosae (intramucosal carcinoma)" },
        { key: "invades-submucosa", label: "Invades submucosa" },
        { key: "invades-muscularis-propria", label: "Invades into muscularis propria" },
        { key: "invades-pericolic-tissue", label: "Invades through muscularis propria into the pericolic or perirectal tissue" },
        { key: "invades-visceral-peritoneum", label: "Invades visceral peritoneum (including tumor continuous with serosal surface through area of inflammation)" },
        { key: "invades-adjacent-structure", label: "Directly invades or adheres to adjacent structure(s)", requiresText: true },
        { key: "no-evidence-of-tumor", label: "No evidence of primary tumor" },
      ],
      cannotBeDetermined: true,
    },
    {
      key: "submucosal-invasion",
      label: "Sub-mucosal Invasion (required only for pT1 tumors)",
      tier: "conditional",
      type: "single-select",
      options: [
        { key: "not-applicable", label: "Not applicable (not a pT1 tumor)" },
        { key: "not-identified", label: "Not identified" },
        { key: "present", label: "Present" },
      ],
    },
    {
      key: "depth-of-submucosal-invasion",
      label: "Depth of Sub-mucosal Invasion",
      tier: "non-core",
      type: "single-select",
      noteRef: "Note E",
      options: [
        { key: "lt-1mm", label: "Less than 1 mm" },
        { key: "1-2mm", label: "Greater than or equal to 1 mm and less than 2 mm" },
        { key: "gt-2mm", label: "Greater than 2 mm" },
        { key: "exact", label: "Exact depth", requiresText: true, textUnit: "mm" },
      ],
      cannotBeDetermined: true,
    },
    {
      key: "extent-of-submucosal-invasion",
      label: "Extent of Sub-mucosal Invasion",
      tier: "non-core",
      type: "single-select",
      noteRef: "Note E",
      options: [
        { key: "upper-third", label: "Tumor invades into upper one third of submucosa" },
        { key: "middle-third", label: "Tumor invades into middle one third of submucosa" },
        { key: "lower-third", label: "Tumor invades into lower one third of submucosa" },
      ],
      cannotBeDetermined: true,
    },
    {
      key: "macroscopic-tumor-perforation",
      label: "Macroscopic Tumor Perforation",
      tier: "core",
      type: "single-select",
      noteRef: "Note F",
      options: [
        { key: "not-identified", label: "Not identified" },
        { key: "present", label: "Present" },
      ],
      cannotBeDetermined: true,
    },
    {
      key: "lymphatic-vascular-invasion",
      label: "Lymphatic and / or Vascular Invasion",
      tier: "core",
      type: "multi-select",
      noteRef: "Note G",
      options: [
        { key: "not-identified", label: "Not identified" },
        { key: "small-vessel", label: "Small vessel", requiresText: true },
        { key: "large-vessel-intramural", label: "Large vessel (venous), intramural", requiresText: true },
        { key: "large-vessel-extramural", label: "Large vessel (venous), extramural", requiresText: true },
        { key: "present-nos", label: "Present, NOS", requiresText: true },
      ],
      cannotBeDetermined: true,
    },
    {
      key: "perineural-invasion",
      label: "Perineural Invasion",
      tier: "core",
      type: "single-select",
      noteRef: "Note G",
      options: [
        { key: "not-identified", label: "Not identified" },
        { key: "present", label: "Present" },
      ],
      cannotBeDetermined: true,
    },
    {
      key: "tumor-budding-score",
      label: "Tumor Budding Score (required only when applicable)",
      tier: "conditional",
      type: "single-select",
      noteRef: "Note H",
      options: [
        { key: "not-applicable", label: "Not applicable" },
        { key: "low", label: "Low (0-4)" },
        { key: "intermediate", label: "Intermediate (5-9)" },
        { key: "high", label: "High (10 or more)" },
      ],
      cannotBeDetermined: true,
    },
    {
      key: "number-of-tumor-buds",
      label: "Number of Tumor Buds (per 'hotspot' field)",
      tier: "non-core",
      type: "single-select",
      noteRef: "Note H",
      options: [
        { key: "specify", label: "Specify number in one 'hotspot' field (area = 0.785 mm2)", requiresText: true, textLabel: "Number per field" },
        { key: "other", label: "Other", requiresText: true },
      ],
      cannotBeDetermined: true,
    },
    {
      key: "polyp-type-of-origin",
      label: "Type of Polyp in which Invasive Carcinoma Arose",
      tier: "non-core",
      type: "single-select",
      noteRef: "Note I",
      options: [
        { key: "none-identified", label: "None identified" },
        { key: "tubular-adenoma", label: "Tubular adenoma" },
        { key: "villous-adenoma", label: "Villous adenoma" },
        { key: "tubulovillous-adenoma", label: "Tubulovillous adenoma" },
        { key: "traditional-serrated-adenoma", label: "Traditional serrated adenoma" },
        { key: "sessile-serrated-polyp", label: "Sessile serrated adenoma / sessile serrated polyp" },
        { key: "hamartomatous-polyp", label: "Hamartomatous polyp" },
        { key: "other", label: "Other", requiresText: true },
      ],
    },
    {
      key: "treatment-effect",
      label: "Treatment Effect",
      tier: "core",
      type: "single-select",
      noteRef: "Note J",
      options: [
        { key: "no-presurgical-therapy", label: "No known presurgical therapy" },
        { key: "complete-response", label: "Present, with no viable cancer cells (complete response, score 0)" },
        { key: "near-complete-response", label: "Present, with single cells or rare small groups of cancer cells (near complete response, score 1)" },
        { key: "partial-response", label: "Present, with residual cancer showing evident tumor regression, but more than single cells or rare small groups (partial response, score 2)" },
        { key: "present-nos", label: "Present, NOS" },
        { key: "poor-or-no-response", label: "Absent, with extensive residual cancer and no evident tumor regression (poor or no response, score 3)" },
      ],
      cannotBeDetermined: true,
    },
    { key: "tumor-comment", label: "Tumor Comment", tier: "non-core", type: "text" },
  ],
};

const marginLocationOptions = () => [
  { key: "proximal", label: "Proximal", requiresText: true },
  { key: "distal", label: "Distal", requiresText: true },
  { key: "radial", label: "Radial (circumferential)", requiresText: true },
  { key: "mesenteric", label: "Mesenteric", requiresText: true },
  { key: "deep", label: "Deep", requiresText: true },
  { key: "mucosal", label: "Mucosal", requiresText: true, textLabel: "Specify location" },
  { key: "other", label: "Other", requiresText: true },
];

const distanceOptions = () => [
  { key: "exact-cm", label: "Exact distance", requiresText: true, textUnit: "cm" },
  { key: "gt-1cm", label: "Greater than 1 cm" },
  { key: "exact-mm", label: "Exact distance", requiresText: true, textUnit: "mm" },
  { key: "gt-10mm", label: "Greater than 10 mm" },
  { key: "other", label: "Other", requiresText: true },
];

const MARGINS: TemplateSection = {
  key: "margins",
  title: "Margins",
  fields: [
    {
      key: "margin-status-invasive",
      label: "Margin Status for Invasive Carcinoma",
      tier: "core",
      type: "single-select",
      noteRef: "Note K",
      options: [
        { key: "all-negative", label: "All margins negative for invasive carcinoma" },
        { key: "present-at-margin", label: "Invasive carcinoma present at margin" },
        { key: "other", label: "Other", requiresText: true },
        { key: "not-applicable", label: "Not applicable" },
      ],
      cannotBeDetermined: true,
    },
    { key: "closest-margins-invasive", label: "Closest Margin(s) to Invasive Carcinoma", tier: "non-core", type: "multi-select", options: marginLocationOptions(), cannotBeDetermined: true },
    { key: "distance-to-closest-margin", label: "Distance from Invasive Carcinoma to Closest Margin", tier: "non-core", type: "single-select", options: distanceOptions(), cannotBeDetermined: true },
    {
      key: "distance-to-radial-margin",
      label: "Distance from Invasive Carcinoma to Radial (Circumferential) Margin (required only for rectal tumors)",
      tier: "conditional",
      type: "single-select",
      options: [
        { key: "not-applicable", label: "Not applicable (not a rectal tumor)" },
        { key: "already-reported", label: "Distance already reported as closest margin" },
        ...distanceOptions(),
      ],
      cannotBeDetermined: true,
    },
    {
      key: "distance-to-distal-margin",
      label: "Distance from Invasive Carcinoma to Distal Margin (required only for rectal tumors)",
      tier: "conditional",
      type: "single-select",
      options: [
        { key: "not-applicable", label: "Not applicable (not a rectal tumor)" },
        { key: "already-reported", label: "Distance already reported as closest margin" },
        ...distanceOptions(),
      ],
      cannotBeDetermined: true,
    },
    { key: "margins-involved-invasive", label: "Margin(s) Involved by Invasive Carcinoma", tier: "non-core", type: "multi-select", options: marginLocationOptions(), cannotBeDetermined: true },
    {
      key: "margin-status-non-invasive",
      label: "Margin Status for Non-Invasive Tumor",
      tier: "core",
      type: "multi-select",
      options: [
        { key: "all-negative", label: "All margins negative for high-grade dysplasia / intramucosal carcinoma and low-grade dysplasia" },
        { key: "hgd-present", label: "High-grade dysplasia / intramucosal carcinoma present at margin" },
        { key: "lgd-present", label: "Low-grade dysplasia present at margin" },
        { key: "other", label: "Other", requiresText: true },
        { key: "not-applicable", label: "Not applicable" },
      ],
      cannotBeDetermined: true,
    },
    {
      key: "margins-involved-hgd",
      label: "Margin(s) Involved by High-Grade Dysplasia / Intramucosal Carcinoma",
      tier: "non-core",
      type: "multi-select",
      options: [
        { key: "proximal", label: "Proximal", requiresText: true },
        { key: "distal", label: "Distal", requiresText: true },
        { key: "mucosal", label: "Mucosal", requiresText: true, textLabel: "Specify location" },
        { key: "other", label: "Other", requiresText: true },
      ],
      cannotBeDetermined: true,
    },
    {
      key: "margins-involved-lgd",
      label: "Margin(s) Involved by Low-Grade Dysplasia",
      tier: "non-core",
      type: "multi-select",
      options: [
        { key: "proximal", label: "Proximal", requiresText: true },
        { key: "distal", label: "Distal", requiresText: true },
        { key: "mucosal", label: "Mucosal", requiresText: true, textLabel: "Specify location" },
        { key: "other", label: "Other", requiresText: true },
      ],
      cannotBeDetermined: true,
    },
    { key: "margin-comment", label: "Margin Comment", tier: "non-core", type: "text" },
  ],
};

const REGIONAL_LYMPH_NODES: TemplateSection = {
  key: "regional-lymph-nodes",
  title: "Regional Lymph Nodes",
  fields: [
    {
      key: "regional-lymph-node-status",
      label: "Regional Lymph Node Status",
      tier: "core",
      type: "single-select",
      options: [
        { key: "not-applicable", label: "Not applicable (no regional lymph nodes submitted or found)" },
        { key: "present", label: "Regional lymph nodes present" },
        { key: "all-negative", label: "All regional lymph nodes negative for tumor" },
        { key: "tumor-present", label: "Tumor present in regional lymph node(s)" },
      ],
    },
    {
      key: "number-nodes-with-tumor",
      label: "Number of Lymph Nodes with Tumor",
      tier: "core",
      type: "single-select",
      options: [
        { key: "exact", label: "Exact number", requiresText: true },
        { key: "at-least", label: "At least", requiresText: true },
        { key: "other", label: "Other", requiresText: true },
      ],
      cannotBeDetermined: true,
    },
    {
      key: "number-nodes-examined",
      label: "Number of Lymph Nodes Examined",
      tier: "core",
      type: "single-select",
      options: [
        { key: "exact", label: "Exact number", requiresText: true },
        { key: "at-least", label: "At least", requiresText: true },
        { key: "other", label: "Other", requiresText: true },
      ],
      cannotBeDetermined: true,
    },
    {
      key: "tumor-deposits",
      label: "Tumor Deposits",
      tier: "core",
      type: "single-select",
      noteRef: "Note L",
      options: [
        { key: "not-identified", label: "Not identified" },
        { key: "present", label: "Present" },
      ],
    },
    {
      key: "number-of-tumor-deposits",
      label: "Number of Tumor Deposits",
      tier: "non-core",
      type: "single-select",
      options: [
        { key: "specify", label: "Specify number", requiresText: true },
        { key: "other", label: "Other", requiresText: true },
      ],
      cannotBeDetermined: true,
    },
    { key: "regional-lymph-node-comment", label: "Regional Lymph Node Comment", tier: "non-core", type: "text" },
  ],
};

const DISTANT_METASTASIS: TemplateSection = {
  key: "distant-metastasis",
  title: "Distant Metastasis",
  fields: [
    {
      key: "distant-sites",
      label: "Distant Site(s) Involved, if applicable",
      tier: "core",
      type: "multi-select",
      options: [
        { key: "not-applicable", label: "Not applicable" },
        { key: "non-regional-ln", label: "Non-regional lymph node(s)", requiresText: true },
        { key: "liver", label: "Liver", requiresText: true },
        { key: "other", label: "Other", requiresText: true },
      ],
      cannotBeDetermined: true,
    },
  ],
};

const PTNM: TemplateSection = {
  key: "ptnm",
  title: "pTNM Classification (AJCC 8th Edition)",
  fields: [
    {
      key: "modified-classification",
      label: "Modified Classification (required only if applicable)",
      tier: "conditional",
      type: "multi-select",
      options: [
        { key: "not-applicable", label: "Not applicable" },
        { key: "y", label: "y (post-neoadjuvant therapy)" },
        { key: "r", label: "r (recurrence)" },
      ],
    },
    {
      key: "pt-category",
      label: "pT Category",
      tier: "core",
      type: "single-select",
      noteRef: "Note E",
      options: [
        { key: "ptx", label: "pT not assigned (cannot be determined based on available pathological information)" },
        { key: "pt0", label: "pT0: No evidence of primary tumor" },
        { key: "ptis", label: "pTis: Carcinoma in situ, intramucosal carcinoma (involvement of lamina propria with no extension through muscularis mucosae)" },
        { key: "pt1", label: "pT1: Tumor invades the submucosa (through the muscularis mucosa but not into the muscularis propria)" },
        { key: "pt2", label: "pT2: Tumor invades the muscularis propria" },
        { key: "pt3", label: "pT3: Tumor invades through the muscularis propria into pericolorectal tissues" },
        { key: "pt4a", label: "pT4a: Tumor invades through the visceral peritoneum" },
        { key: "pt4b", label: "pT4b: Tumor directly invades or adheres to adjacent organs or structures" },
        { key: "pt4-nos", label: "pT4 (subcategory cannot be determined)" },
      ],
    },
    {
      key: "t-suffix",
      label: "T Suffix (required only if applicable)",
      tier: "conditional",
      type: "single-select",
      options: [
        { key: "not-applicable", label: "Not applicable" },
        { key: "m", label: "(m) multiple primary synchronous tumors in a single organ" },
      ],
    },
    {
      key: "pn-category",
      label: "pN Category",
      tier: "core",
      type: "single-select",
      options: [
        { key: "pn-not-assigned-no-nodes", label: "pN not assigned (no nodes submitted or found)" },
        { key: "pn-not-assigned-indeterminate", label: "pN not assigned (cannot be determined based on available pathological information)" },
        { key: "pn0", label: "pN0: No regional lymph node metastasis" },
        { key: "pn1a", label: "pN1a: One regional lymph node is positive" },
        { key: "pn1b", label: "pN1b: Two or three regional lymph nodes are positive" },
        { key: "pn1c", label: "pN1c: No regional lymph nodes positive, but tumor deposits present in subserosa/mesentery/nonperitonealized pericolic or perirectal/mesorectal tissues" },
        { key: "pn1-nos", label: "pN1 (subcategory cannot be determined)" },
        { key: "pn2a", label: "pN2a: Four to six regional lymph nodes are positive" },
        { key: "pn2b", label: "pN2b: Seven or more regional lymph nodes are positive" },
        { key: "pn2-nos", label: "pN2 (subcategory cannot be assessed)" },
      ],
    },
    {
      key: "pm-category",
      label: "pM Category (required only if confirmed pathologically)",
      tier: "conditional",
      type: "single-select",
      options: [
        { key: "not-applicable", label: "Not applicable - pM cannot be determined from the submitted specimen(s)" },
        { key: "pm1a", label: "pM1a: Metastasis to one site or organ identified, without peritoneal metastasis" },
        { key: "pm1b", label: "pM1b: Metastasis to two or more sites or organs identified, without peritoneal metastasis" },
        { key: "pm1c", label: "pM1c: Metastasis to the peritoneal surface identified, alone or with other site/organ metastases" },
        { key: "pm1-nos", label: "pM1 (subcategory cannot be determined)" },
      ],
    },
  ],
};

const ADDITIONAL_FINDINGS: TemplateSection = {
  key: "additional-findings",
  title: "Additional Findings",
  fields: [
    {
      key: "additional-findings",
      label: "Additional Findings",
      tier: "non-core",
      type: "multi-select",
      options: [
        { key: "none", label: "None identified" },
        { key: "adenomas", label: "Adenoma(s)" },
        { key: "ulcerative-colitis", label: "Ulcerative colitis" },
        { key: "crohn-disease", label: "Crohn disease" },
        { key: "diverticulosis", label: "Diverticulosis" },
        { key: "dysplasia-ibd", label: "Dysplasia arising in inflammatory bowel disease" },
        { key: "other", label: "Other", requiresText: true },
      ],
    },
  ],
};

const SPECIAL_STUDIES: TemplateSection = {
  key: "special-studies",
  title: "Special Studies",
  fields: [
    {
      key: "special-studies-note",
      label: "Special Studies (molecular / IHC for mismatch repair / other biomarkers — use the CAP Colorectal Biomarker Template)",
      tier: "non-core",
      type: "text",
      noteRef: "Note M",
    },
  ],
};

const COMMENTS: TemplateSection = {
  key: "comments",
  title: "Comments",
  fields: [{ key: "comment", label: "Comment(s)", tier: "non-core", type: "text" }],
};

export const colorectalResection: TemplateVersion = {
  templateId: "colorectal-resection",
  title: "Colon & Rectum (Resection)",
  sourceVersion: "4.4.0.1",
  sourceProtocolName: "CAP Protocol for the Examination of Resection Specimens from Patients with Primary Carcinoma of the Colon and/or Rectum",
  sourcePostingDate: "2025-09",
  classificationBindings: [{ system: "AJCC", edition: "8th Edition" }],
  sections: [SPECIMEN, TUMOR, MARGINS, REGIONAL_LYMPH_NODES, DISTANT_METASTASIS, PTNM, ADDITIONAL_FINDINGS, SPECIAL_STUDIES, COMMENTS],
  approval: { status: "draft" },
};
