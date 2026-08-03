/**
 * X-PATH — Breast: Invasive Carcinoma (Resection), derived template data
 * ------------------------------------------------------------------
 * Structural logic derived from CAP protocol
 * "Breast.Invasive.Res_4.11.0.0.REL_CAPCP.docx" (posted June 2026, AJCC 8th
 * Edition, WHO 6th Edition) — field names, tiers, controlled-vocabulary
 * terms, and repeatable-block structure only (Header G3). No paragraph
 * text from the source document's Explanatory Notes is reproduced here;
 * `noteRef` values are traceability pointers back to those notes, not
 * their content. Source file never committed to this repo.
 *
 * `approval.status` is "draft" — a stub gate (Header §5). Nothing here is
 * clinically valid until Dr. Ivo reviews and approves it (Header G3).
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
      noteRef: "Note A",
      options: [
        { key: "excision", label: "Excision (less than total mastectomy, including lumpectomy and partial mastectomy)" },
        { key: "total-mastectomy", label: "Total mastectomy (including nipple-sparing and skin-sparing mastectomy)" },
        { key: "other", label: "Other", requiresText: true, textLabel: "Specify" },
        { key: "not-specified", label: "Not specified" },
      ],
    },
    {
      key: "specimen-laterality",
      label: "Specimen Laterality",
      tier: "core",
      type: "single-select",
      options: [
        { key: "right", label: "Right" },
        { key: "left", label: "Left" },
        { key: "not-specified", label: "Not specified" },
      ],
    },
  ],
};

const TUMOR_CHARACTERISTICS: TemplateField = {
  key: "tumor-characteristics",
  label: "Tumor Characteristics",
  tier: "core",
  type: "group",
  repeatable: { max: 5, unitLabel: "distinct invasive carcinoma" },
  children: [
    { key: "tumor-identifier", label: "Tumor Identifier (required only for cases with multiple tumors)", tier: "conditional", type: "text" },
    {
      key: "tumor-site",
      label: "Tumor Site",
      tier: "non-core",
      type: "single-select",
      noteRef: "Note C",
      options: [
        { key: "specify", label: "Specify tumor site / location", requiresText: true, textLabel: "Location" },
        { key: "not-specified", label: "Not specified" },
      ],
    },
    {
      key: "histologic-type",
      label: "Histologic Type",
      tier: "core",
      type: "single-select",
      noteRef: "Note D",
      options: [
        { key: "no-residual", label: "No residual invasive carcinoma" },
        { key: "nst", label: "Invasive carcinoma of no special type (ductal)" },
        { key: "nst-pattern", label: "Invasive carcinoma of no special type (ductal) with specific morphologic pattern", requiresText: true, textLabel: "Specify pattern" },
        { key: "ilc-classic", label: "Invasive lobular carcinoma, classic" },
        { key: "ilc-variant", label: "Invasive lobular carcinoma, variant pattern", requiresText: true, textLabel: "Specify" },
        { key: "mixed", label: "Mixed histologic types", requiresText: true, textLabel: "Specify types and percentages" },
        { key: "tubular", label: "Tubular carcinoma, pure or greater than 90%" },
        { key: "cribriform", label: "Invasive cribriform carcinoma, pure or greater than 90%" },
        { key: "mucinous", label: "Mucinous carcinoma, pure or greater than 90%" },
        { key: "micropapillary", label: "Invasive micropapillary carcinoma, pure or greater than 90%" },
        { key: "apocrine", label: "Invasive apocrine carcinoma" },
        { key: "metaplastic-spindle", label: "Metaplastic carcinoma, spindle cell" },
        { key: "metaplastic-heterologous", label: "Metaplastic carcinoma, with heterologous differentiation / matrix production" },
        { key: "metaplastic-squamous", label: "Metaplastic carcinoma, squamous cell" },
        { key: "metaplastic-mixed", label: "Metaplastic carcinoma, mixed", requiresText: true, textLabel: "Specify types and percentages" },
        { key: "metaplastic-adenosquamous", label: "Metaplastic carcinoma, favorable type, low-grade adenosquamous" },
        { key: "metaplastic-fibromatosis-like", label: "Metaplastic carcinoma, favorable type, low-grade fibromatosis-like" },
        { key: "metaplastic-other", label: "Metaplastic carcinoma, other type", requiresText: true, textLabel: "Specify" },
        { key: "solid-papillary", label: "Invasive solid papillary carcinoma" },
        { key: "adenoid-cystic", label: "Adenoid cystic carcinoma, classic" },
        { key: "secretory", label: "Secretory carcinoma" },
        { key: "other-not-listed", label: "Other histologic type not listed", requiresText: true, textLabel: "Specify" },
      ],
    },
    { key: "histologic-type-comment", label: "Histologic Type Comment", tier: "non-core", type: "text" },
    {
      key: "histologic-grade",
      label: "Histologic Grade (Nottingham Histologic Score) (required only if applicable)",
      tier: "conditional",
      type: "group",
      noteRef: "Note E",
      children: [
        {
          key: "tubule-formation",
          label: "Tubule Formation",
          tier: "core",
          type: "single-select",
          options: [
            { key: "score-1", label: "Score 1 (greater than 75% of tumor area forming glandular / tubular structures)" },
            { key: "score-2", label: "Score 2 (10 to 75% of tumor area forming glandular / tubular structures)" },
            { key: "score-3", label: "Score 3 (less than 10% of tumor area forming glandular / tubular structures)" },
            { key: "microinvasion-only", label: "Only microinvasion present (not graded)" },
          ],
          cannotBeDetermined: true,
        },
        {
          key: "nuclear-pleomorphism",
          label: "Nuclear Pleomorphism",
          tier: "core",
          type: "single-select",
          options: [
            { key: "score-1", label: "Score 1 (similar / less than 1.5x benign epithelial nuclei, minimal pleomorphism)" },
            { key: "score-2", label: "Score 2 (1.5-2x benign epithelial nuclei, mild-moderate pleomorphism)" },
            { key: "score-3", label: "Score 3 (greater than 2x benign epithelial nuclei, marked variation, often prominent nucleoli)" },
            { key: "microinvasion-only", label: "Only microinvasion present (not graded)" },
          ],
          cannotBeDetermined: true,
        },
        {
          key: "mitotic-rate",
          label: "Mitotic Rate",
          tier: "core",
          type: "single-select",
          options: [
            { key: "score-1", label: "Score 1" },
            { key: "score-2", label: "Score 2" },
            { key: "score-3", label: "Score 3" },
            { key: "microinvasion-only", label: "Only microinvasion present (not graded)" },
          ],
          cannotBeDetermined: true,
        },
        {
          key: "overall-grade",
          label: "Overall Grade",
          tier: "core",
          type: "single-select",
          options: [
            { key: "grade-1", label: "Grade 1 (scores of 3, 4 or 5)" },
            { key: "grade-2", label: "Grade 2 (scores of 6 or 7)" },
            { key: "grade-3", label: "Grade 3 (scores of 8 or 9)" },
            { key: "microinvasion-only", label: "Only microinvasion present (not graded)" },
          ],
          cannotBeDetermined: true,
        },
      ],
    },
    { key: "histologic-grade-comment", label: "Histologic Grade Comment", tier: "non-core", type: "text" },
    {
      key: "tumor-size",
      label: "Tumor Size",
      tier: "core",
      type: "single-select",
      noteRef: "Note F",
      options: [
        { key: "no-residual", label: "No residual invasive carcinoma" },
        { key: "microinvasion-only", label: "Microinvasion only (less than or equal to 1 mm)" },
        { key: "largest-focus", label: "Largest contiguous focus of invasive carcinoma", requiresText: true, textLabel: "Exact measurement", textUnit: "mm" },
      ],
      cannotBeDetermined: true,
    },
    {
      key: "additional-foci-size-location",
      label: "Size(s) and Location(s) of Additional Foci (if additional invasive foci have similar features)",
      tier: "non-core",
      type: "single-select",
      options: [
        { key: "specify", label: "Specify size(s) and location(s)", requiresText: true },
        { key: "cannot-determine", label: "Cannot be determined" },
        { key: "not-applicable", label: "Not applicable" },
      ],
    },
    { key: "tumor-size-comment", label: "Tumor Size Comment", tier: "non-core", type: "text" },
    {
      key: "dcis",
      label: "Ductal Carcinoma In Situ (DCIS)",
      tier: "core",
      type: "single-select",
      noteRef: "Note G",
      options: [
        { key: "not-identified", label: "Not identified" },
        { key: "present", label: "Present" },
      ],
    },
    {
      key: "extent-of-dcis",
      label: "Extent of DCIS",
      tier: "conditional",
      type: "multi-select",
      options: [
        { key: "admixed", label: "Admixed with invasive carcinoma" },
        { key: "extends-beyond", label: "Extends beyond the invasive carcinoma" },
        { key: "separate", label: "Separate from the invasive carcinoma" },
        { key: "other", label: "Other", requiresText: true },
      ],
      cannotBeDetermined: true,
    },
    { key: "dcis-percentage-of-tumor", label: "DCIS as a Percentage of Entire Tumor", tier: "non-core", type: "number", unit: "%" },
    {
      key: "estimated-size-of-dcis",
      label: "Estimated Size of DCIS",
      tier: "non-core",
      type: "single-select",
      options: [
        { key: "largest-dimension", label: "Largest dimension of DCIS", requiresText: true, textUnit: "mm" },
        { key: "other", label: "Other", requiresText: true },
      ],
    },
    {
      key: "architectural-patterns",
      label: "Architectural Pattern(s)",
      tier: "non-core",
      type: "multi-select",
      options: [
        { key: "comedo", label: "Comedo" },
        { key: "cribriform", label: "Cribriform" },
        { key: "micropapillary", label: "Micropapillary" },
        { key: "papillary", label: "Papillary" },
        { key: "solid", label: "Solid" },
        { key: "solid-papillary-cis", label: "Solid papillary carcinoma in situ" },
        { key: "encapsulated-papillary-cis", label: "Encapsulated papillary carcinoma in situ" },
        { key: "paget", label: "Paget disease (DCIS involving nipple skin)" },
        { key: "other", label: "Other", requiresText: true },
      ],
    },
    {
      key: "dcis-nuclear-grade",
      label: "Nuclear Grade",
      tier: "non-core",
      type: "single-select",
      options: [
        { key: "grade-1", label: "Grade I (low)" },
        { key: "grade-2", label: "Grade II (intermediate)" },
        { key: "grade-3", label: "Grade III (high)" },
      ],
    },
    {
      key: "dcis-necrosis",
      label: "Necrosis",
      tier: "non-core",
      type: "single-select",
      options: [
        { key: "not-identified", label: "Not identified" },
        { key: "focal", label: "Present, focal (small foci or single cell necrosis)" },
        { key: "central", label: "Present, central (expansive \"comedo\" necrosis)" },
        { key: "cannot-exclude", label: "Cannot be excluded", requiresText: true, textLabel: "Explain" },
      ],
    },
    { key: "dcis-comment", label: "DCIS Comment", tier: "non-core", type: "text" },
    {
      key: "additional-lesions",
      label: "Additional Lesion(s)",
      tier: "non-core",
      type: "multi-select",
      options: [
        { key: "not-identified", label: "Not identified" },
        { key: "lcis-classic", label: "Lobular carcinoma in situ, classic" },
        { key: "lcis-pleomorphic", label: "Lobular carcinoma in situ, pleomorphic" },
        { key: "lcis-other", label: "Lobular carcinoma in situ", requiresText: true, textLabel: "Specify" },
        { key: "alh", label: "Atypical lobular hyperplasia" },
        { key: "adh", label: "Atypical ductal hyperplasia" },
        { key: "fea", label: "Flat epithelial atypia" },
        { key: "other", label: "Other", requiresText: true },
      ],
    },
    { key: "extent-of-lcis", label: "Extent of LCIS", tier: "non-core", type: "text" },
    { key: "additional-lesions-comment", label: "Additional Lesion(s) Comment", tier: "non-core", type: "text" },
  ],
};

const TUMOR: TemplateSection = {
  key: "tumor",
  title: "Tumor",
  fields: [
    {
      key: "tumor-focality",
      label: "Tumor Focality",
      tier: "core",
      type: "single-select",
      noteRef: "Note B",
      options: [
        { key: "unifocal", label: "Unifocal" },
        { key: "multifocal", label: "Multifocal" },
        { key: "multiple-similar", label: "Multiple foci of invasive carcinoma with similar features (complete only one Tumor Characteristics section)" },
        { key: "multiple-different", label: "Multiple foci of invasive carcinoma with different features (complete a separate Tumor Characteristics section for each)" },
        { key: "other", label: "Other", requiresText: true, textLabel: "Specify" },
      ],
      cannotBeDetermined: true,
    },
    {
      key: "number-of-foci",
      label: "Number of Foci",
      tier: "non-core",
      type: "single-select",
      options: [
        { key: "specify", label: "Specify number", requiresText: true },
        { key: "at-least", label: "At least", requiresText: true },
        { key: "cannot-determine", label: "Cannot be determined" },
        { key: "no-residual", label: "No residual invasive carcinoma" },
      ],
      cannotBeDetermined: true,
    },
    TUMOR_CHARACTERISTICS,
    {
      key: "tumor-extent",
      label: "Tumor Extent (required only if nipple, skin, or skeletal muscle are present and involved)",
      tier: "conditional",
      type: "single-select",
      noteRef: "Note H",
      options: [
        { key: "not-applicable", label: "Not applicable (skin, nipple, and skeletal muscle absent or uninvolved and not documented)" },
        { key: "applicable", label: "Applicable (nipple, skin or skeletal muscle involved, or uninvolved and documented)" },
      ],
    },
    {
      key: "nipple-status",
      label: "Nipple Status",
      tier: "conditional",
      type: "multi-select",
      options: [
        { key: "not-present", label: "Not present in specimen" },
        { key: "present-not-involved", label: "Present and not involved" },
        { key: "pagets", label: "Paget's disease present" },
        { key: "involved-invasive", label: "Involved by invasive carcinoma" },
        { key: "dcis-ducts", label: "DCIS in major lactiferous ducts present" },
        { key: "other", label: "Other", requiresText: true },
      ],
      cannotBeDetermined: true,
    },
    {
      key: "skin-status",
      label: "Skin Status",
      tier: "conditional",
      type: "single-select",
      options: [
        { key: "not-present", label: "Not present in specimen" },
        { key: "present-not-involved", label: "Present and not involved" },
        { key: "invades-no-ulceration", label: "Carcinoma directly invades dermis / epidermis without macroscopic ulceration" },
        { key: "invades-with-ulceration", label: "Carcinoma directly invades dermis / epidermis with macroscopic ulceration (T4b)" },
        { key: "other", label: "Other", requiresText: true },
      ],
      cannotBeDetermined: true,
    },
    {
      key: "macroscopic-skin-satellite-foci",
      label: "Macroscopic Skin Satellite Foci",
      tier: "conditional",
      type: "single-select",
      options: [
        { key: "not-identified", label: "Not identified" },
        { key: "present", label: "Present (T4b)" },
      ],
      cannotBeDetermined: true,
    },
    {
      key: "skeletal-muscle",
      label: "Skeletal Muscle",
      tier: "conditional",
      type: "single-select",
      options: [
        { key: "not-present", label: "Not present in specimen" },
        { key: "present-not-involved", label: "Present and not involved" },
        { key: "invades-muscle", label: "Carcinoma invades skeletal muscle" },
        { key: "invades-chest-wall", label: "Carcinoma invades into chest wall deep to pectoralis muscle (T4a)" },
        { key: "other", label: "Other", requiresText: true },
      ],
      cannotBeDetermined: true,
    },
    { key: "tumor-extent-comment", label: "Tumor Extent Comment", tier: "non-core", type: "text" },
    {
      key: "lymphatic-vascular-invasion",
      label: "Lymphatic and / or Vascular Invasion",
      tier: "core",
      type: "single-select",
      noteRef: "Note I",
      options: [
        { key: "not-identified", label: "Not identified" },
        { key: "present-focal", label: "Present, focal (one to two vessels in one block)" },
        { key: "present-extensive", label: "Present, extensive (more than two vessels in one block, or in two or more blocks)" },
        { key: "other", label: "Other", requiresText: true },
      ],
      cannotBeDetermined: true,
    },
    { key: "lvi-comment", label: "Lymphatic and / or Vascular Invasion Comment", tier: "non-core", type: "text" },
    {
      key: "dermal-lvi",
      label: "Dermal Lymphatic and / or Vascular Invasion (required only if applicable)",
      tier: "conditional",
      type: "single-select",
      options: [
        { key: "not-applicable", label: "Not applicable (no skin present)" },
        { key: "not-identified", label: "Not identified" },
        { key: "present", label: "Present" },
        { key: "other", label: "Other", requiresText: true },
      ],
      cannotBeDetermined: true,
    },
    {
      key: "microcalcifications",
      label: "Microcalcifications",
      tier: "non-core",
      type: "multi-select",
      noteRef: "Note J",
      options: [
        { key: "not-identified", label: "Not identified" },
        { key: "present-dcis", label: "Present in DCIS" },
        { key: "present-invasive", label: "Present in invasive carcinoma" },
        { key: "present-non-neoplastic", label: "Present in non-neoplastic tissue" },
        { key: "other", label: "Other", requiresText: true },
      ],
    },
    {
      key: "treatment-effect-breast",
      label: "Treatment Effect in Breast",
      tier: "core",
      type: "single-select",
      noteRef: "Note K",
      options: [
        { key: "no-presurgical", label: "No known presurgical therapy" },
        { key: "no-response", label: "No definite response to presurgical therapy" },
        { key: "response", label: "Evidence of response to presurgical therapy" },
        { key: "no-residual", label: "No residual invasive carcinoma present after presurgical therapy" },
        { key: "other", label: "Other", requiresText: true },
      ],
      cannotBeDetermined: true,
    },
    { key: "treatment-effect-breast-comment", label: "Treatment Effect in Breast Comment", tier: "non-core", type: "text" },
    {
      key: "treatment-effect-lymph-nodes",
      label: "Treatment Effect in Lymph Node(s) (required if nodes submitted and presurgical therapy known)",
      tier: "conditional",
      type: "single-select",
      options: [
        { key: "not-applicable", label: "Not applicable" },
        { key: "no-response", label: "No definite response to presurgical therapy in metastatic carcinoma" },
        { key: "response", label: "Metastatic carcinoma present with evidence of response to presurgical therapy" },
        { key: "no-mets-scarring", label: "No lymph node metastases; fibrous scarring / histiocytic aggregates possibly related to prior metastases" },
        { key: "no-mets-no-scarring", label: "No lymph node metastases and no fibrous scarring / histiocytic aggregates" },
      ],
      cannotBeDetermined: true,
    },
    { key: "treatment-effect-ln-comment", label: "Treatment Effect in Lymph Node(s) Comment", tier: "non-core", type: "text" },
    {
      key: "rcb-parameters",
      label: "Residual Cancer Burden (RCB) Parameters",
      tier: "non-core",
      type: "group",
      noteRef: "Note K",
      children: [
        { key: "primary-tumor-bed-dim-1", label: "Greatest Dimension of Primary Tumor Bed Area (involved by residual invasive carcinoma)", tier: "non-core", type: "number", unit: "mm" },
        { key: "primary-tumor-bed-dim-2", label: "Second Greatest Dimension of Primary Tumor Bed Area", tier: "non-core", type: "number", unit: "mm" },
        { key: "overall-cellularity-pct", label: "Percentage of Overall Cancer Cellularity", tier: "non-core", type: "number", unit: "%" },
        { key: "in-situ-pct", label: "Percentage of Cancer that is In Situ Disease", tier: "non-core", type: "number", unit: "%" },
        { key: "positive-lymph-nodes", label: "Number of Positive Lymph Nodes", tier: "non-core", type: "number" },
        { key: "largest-nodal-met-diameter", label: "Diameter of Largest Nodal Metastasis", tier: "non-core", type: "number", unit: "mm" },
        { key: "rcb-score", label: "Residual Cancer Burden Score", tier: "non-core", type: "number" },
        {
          key: "rcb-class",
          label: "Residual Cancer Burden Class",
          tier: "non-core",
          type: "single-select",
          options: [
            { key: "rcb-0", label: "RCB-0 (pCR)" },
            { key: "rcb-1", label: "RCB-I" },
            { key: "rcb-2", label: "RCB-II" },
            { key: "rcb-3", label: "RCB-III" },
          ],
        },
        { key: "rcb-comment", label: "RCB Comment", tier: "non-core", type: "text" },
      ],
    },
  ],
};

const marginBlock = (target: "Invasive Carcinoma" | "DCIS", conditionLabel: string): TemplateField => ({
  key: `final-margin-status-${target === "DCIS" ? "dcis" : "invasive"}`,
  label: `Final Margin Status for ${target} (${conditionLabel})`,
  tier: "conditional",
  type: "group",
  noteRef: "Note L",
  children: [
    {
      key: "status",
      label: "Status",
      tier: "core",
      type: "single-select",
      options: [
        { key: "not-applicable", label: `Not applicable (no residual ${target === "DCIS" ? "DCIS" : "invasive carcinoma"} in specimen)` },
        { key: "greater-than-2mm", label: `All final margins greater than 2 mm from ${target}` },
        { key: "within-0-2mm", label: `${target} present within 0-2 mm of final margins` },
      ],
      cannotBeDetermined: true,
    },
    {
      key: `margins-involved-${target === "DCIS" ? "dcis" : "invasive"}`,
      label: `Margin(s) Involved by ${target} (at ink)`,
      tier: "core",
      type: "single-select",
      options: [
        { key: "none", label: "None identified" },
        { key: "specify", label: "Specify involved margins", requiresText: true },
      ],
    },
    { key: "margins-lt-1mm", label: `Margin(s) Less than 1 mm from ${target} (but not at ink)`, tier: "non-core", type: "text" },
    { key: "margins-1-2mm", label: `Margin(s) 1 to 2 mm from ${target}`, tier: "non-core", type: "text" },
    { key: "margins-gt-2mm", label: `Margin(s) Greater than 2 mm from ${target}`, tier: "non-core", type: "text" },
    { key: "other", label: "Other", tier: "non-core", type: "text" },
    { key: "margin-comment", label: `Margin Comment for ${target}`, tier: "non-core", type: "text" },
  ],
});

const MARGINS: TemplateSection = {
  key: "margins",
  title: "Margins",
  fields: [
    marginBlock("Invasive Carcinoma", "required only if residual invasive carcinoma is present in specimen"),
    marginBlock("DCIS", "required only if DCIS is present in specimen"),
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
      noteRef: "Note M",
      options: [
        { key: "not-applicable", label: "Not applicable (no regional lymph nodes submitted or found)" },
        { key: "present", label: "Regional lymph nodes present" },
        { key: "all-negative", label: "All regional lymph nodes negative for tumor" },
        { key: "tumor-present", label: "Tumor present in regional lymph node(s)" },
      ],
    },
    {
      key: "macrometastases-count",
      label: "Number of Lymph Nodes with Macrometastases (greater than 2 mm)",
      tier: "core",
      type: "single-select",
      options: [{ key: "exact", label: "Exact number", requiresText: true }, { key: "other", label: "Other", requiresText: true }],
      cannotBeDetermined: true,
    },
    {
      key: "micrometastases-count",
      label: "Number of Lymph Nodes with Micrometastases (0.2-2 mm and / or greater than 200 cells)",
      tier: "core",
      type: "single-select",
      options: [{ key: "exact", label: "Exact number", requiresText: true }, { key: "other", label: "Other", requiresText: true }],
      cannotBeDetermined: true,
    },
    {
      key: "itc-count",
      label: "Number of Lymph Nodes with Isolated Tumor Cells (0.2 mm or less, or 200 cells or less) (required only if applicable)",
      tier: "conditional",
      type: "single-select",
      options: [
        { key: "not-applicable", label: "Not applicable" },
        { key: "exact", label: "Exact number", requiresText: true },
        { key: "other", label: "Other", requiresText: true },
      ],
      cannotBeDetermined: true,
    },
    {
      key: "total-positive-nodes-for-pn",
      label: "Total Number of Positive Macroscopic and Microscopic Lymph Nodes Counted Towards pN Category",
      tier: "non-core",
      type: "single-select",
      options: [{ key: "exact", label: "Exact number", requiresText: true }, { key: "other", label: "Other", requiresText: true }],
      cannotBeDetermined: true,
    },
    {
      key: "largest-nodal-deposit-size",
      label: "Size of Largest Nodal Metastatic Deposit",
      tier: "core",
      type: "single-select",
      options: [{ key: "exact", label: "Exact size", requiresText: true, textUnit: "mm" }, { key: "other", label: "Other", requiresText: true }],
      cannotBeDetermined: true,
    },
    {
      key: "extranodal-extension",
      label: "Extranodal Extension (ENE)",
      tier: "core",
      type: "single-select",
      options: [
        { key: "not-identified", label: "Not identified" },
        { key: "present", label: "Present" },
      ],
    },
    {
      key: "largest-ene-measurement",
      label: "Largest Measurement of Extranodal Extension",
      tier: "non-core",
      type: "single-select",
      options: [{ key: "exact", label: "Exact measurement", requiresText: true, textUnit: "mm" }, { key: "other", label: "Other", requiresText: true }],
      cannotBeDetermined: true,
    },
    {
      key: "nodes-with-ene-count",
      label: "Number of Lymph Nodes with Extranodal Extension",
      tier: "non-core",
      type: "single-select",
      options: [{ key: "exact", label: "Exact number", requiresText: true }, { key: "other", label: "Other", requiresText: true }],
      cannotBeDetermined: true,
    },
    {
      key: "total-nodes-examined",
      label: "Total Number of Lymph Nodes Examined (sentinel and non-sentinel)",
      tier: "core",
      type: "single-select",
      options: [{ key: "exact", label: "Exact number", requiresText: true }, { key: "other", label: "Other", requiresText: true }],
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
        { key: "lung", label: "Lung", requiresText: true },
        { key: "liver", label: "Liver", requiresText: true },
        { key: "bone", label: "Bone", requiresText: true },
        { key: "brain", label: "Brain", requiresText: true },
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
      noteRef: "Note N",
      options: [
        { key: "ptx", label: "pT not assigned (cannot be determined based on available pathological information)" },
        { key: "pt0", label: "pT0: No evidence of primary tumor" },
        { key: "ptis-dcis", label: "pTis (DCIS): Ductal carcinoma in situ" },
        { key: "ptis-paget", label: "pTis (Paget): Paget disease of the nipple NOT associated with invasive carcinoma / DCIS" },
        { key: "pt1mi", label: "pT1mi: Tumor less than or equal to 1 mm in greatest dimension" },
        { key: "pt1a", label: "pT1a: Tumor greater than 1 mm but less than or equal to 5 mm" },
        { key: "pt1b", label: "pT1b: Tumor greater than 5 mm but less than or equal to 10 mm" },
        { key: "pt1c", label: "pT1c: Tumor greater than 10 mm but less than or equal to 20 mm" },
        { key: "pt1-nos", label: "pT1 (subcategory cannot be determined)" },
        { key: "pt2", label: "pT2: Tumor greater than 20 mm but less than or equal to 50 mm" },
        { key: "pt3", label: "pT3: Tumor greater than 50 mm" },
        { key: "pt4a", label: "pT4a: Extension to the chest wall" },
        { key: "pt4b", label: "pT4b: Ulceration and / or ipsilateral satellite nodules and / or edema of the skin" },
        { key: "pt4c", label: "pT4c: Both T4a and T4b present" },
        { key: "pt4d", label: "pT4d: Inflammatory carcinoma" },
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
        { key: "pn0", label: "pN0: No regional lymph node metastasis identified or ITCs only" },
        { key: "pn0-i-plus", label: "pN0 (i+): ITCs only (no larger than 0.2 mm) in regional lymph node(s)" },
        { key: "pn0-mol-plus", label: "pN0 (mol+): Positive molecular findings by RT-PCR; no ITCs detected" },
        { key: "pn1mi", label: "pN1mi: Micrometastases (approximately 200 cells, larger than 0.2 mm, none larger than 2.0 mm)" },
        { key: "pn1a", label: "pN1a: Metastases in 1-3 axillary lymph nodes, at least one larger than 2.0 mm" },
        { key: "pn1b", label: "pN1b: Metastases in ipsilateral internal mammary sentinel nodes, excluding ITCs" },
        { key: "pn1c", label: "pN1c: pN1a and pN1b combined" },
        { key: "pn2a", label: "pN2a: Metastases in 4-9 axillary lymph nodes (at least one deposit larger than 2.0 mm)" },
        { key: "pn2b", label: "pN2b: Clinically detected internal mammary lymph nodes; pathologically negative axillary nodes" },
        { key: "pn3a", label: "pN3a: Metastases in 10 or more axillary lymph nodes, or infraclavicular (Level III) nodes" },
        { key: "pn3b", label: "pN3b: pN1a/pN2a with cN2b (positive internal mammary nodes by imaging), or pN2a with pN1b" },
        { key: "pn3c", label: "pN3c: Metastases in ipsilateral supraclavicular lymph nodes" },
      ],
    },
    {
      key: "n-suffix",
      label: "N Suffix (required only if applicable)",
      tier: "conditional",
      type: "multi-select",
      options: [
        { key: "not-applicable", label: "Not applicable" },
        { key: "sn", label: "(sn): Sentinel node(s) evaluated (fewer than six nodes removed)" },
        { key: "f", label: "(f): Nodal metastasis confirmed by fine needle aspiration or core needle biopsy" },
      ],
    },
    {
      key: "pm-category",
      label: "pM Category (required only if confirmed pathologically)",
      tier: "conditional",
      type: "single-select",
      options: [
        { key: "not-applicable", label: "Not applicable - pM cannot be determined from the submitted specimen(s)" },
        { key: "pm1", label: "pM1: Histologically proven metastases larger than 0.2 mm" },
      ],
    },
    { key: "pm-case-numbers", label: "Specify Case Number(s) with Metastasis (if from a previous procedure)", tier: "non-core", type: "text" },
  ],
};

const ADDITIONAL_FINDINGS: TemplateSection = {
  key: "additional-findings",
  title: "Additional Findings",
  fields: [{ key: "additional-findings", label: "Additional Findings", tier: "non-core", type: "text", noteRef: "Note O" }],
};

const priorBiomarker = (name: string): TemplateField => ({
  key: `prior-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  label: `Prior ${name} Result (from previous biopsy)`,
  tier: "non-core",
  type: "text",
});

const SPECIAL_STUDIES: TemplateSection = {
  key: "special-studies",
  title: "Special Studies",
  fields: [
    { key: "biomarker-testing-prior-case", label: "Biomarker Testing Performed on Prior Case", tier: "non-core", type: "text" },
    { key: "tumor-identifier-for-biomarkers", label: "Tumor Identifier (if multiple tumors present)", tier: "non-core", type: "text" },
    {
      key: "prior-biomarker-tests",
      label: "Breast Biomarker Testing Performed on Previous Biopsy",
      tier: "non-core",
      type: "multi-select",
      options: [
        { key: "er", label: "Estrogen Receptor (ER)" },
        { key: "pgr", label: "Progesterone Receptor (PgR)" },
        { key: "her2-ihc", label: "HER2 (by immunohistochemistry)" },
        { key: "her2-ish", label: "HER2 (by in situ hybridization)" },
        { key: "ki67", label: "Ki-67" },
      ],
      children: [priorBiomarker("ER"), priorBiomarker("PgR"), priorBiomarker("HER2 IHC"), priorBiomarker("HER2 ISH"), priorBiomarker("Ki-67")],
    },
    {
      key: "prior-biomarkers-additional-foci",
      label: "Prior Biomarkers on Additional Foci of Invasion (if relevant; specify tumor identifier for each)",
      tier: "non-core",
      type: "text",
      repeatable: { max: 10, unitLabel: "focus" },
    },
  ],
};

const COMMENTS: TemplateSection = {
  key: "comments",
  title: "Comments",
  fields: [{ key: "comment", label: "Comment(s)", tier: "non-core", type: "text" }],
};

export const breastInvasiveResection: TemplateVersion = {
  templateId: "breast-invasive-resection",
  title: "Breast — Invasive Carcinoma (Resection)",
  category: "Breast",
  sourceVersion: "4.11.0.0",
  sourceProtocolName: "CAP Invasive Carcinoma of the Breast: Resection",
  sourcePostingDate: "2026-06",
  classificationBindings: [
    { system: "AJCC", edition: "8th Edition" },
    { system: "WHO", edition: "6th Edition" },
  ],
  sections: [SPECIMEN, TUMOR, MARGINS, REGIONAL_LYMPH_NODES, DISTANT_METASTASIS, PTNM, ADDITIONAL_FINDINGS, SPECIAL_STUDIES, COMMENTS],
  approval: { status: "draft" },
};
