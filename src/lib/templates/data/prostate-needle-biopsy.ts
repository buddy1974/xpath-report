/**
 * X-PATH — Prostate: Needle Biopsy, derived template data
 * ------------------------------------------------------------------
 * Structural logic derived from a companion PAIR of CAP protocols —
 * "Prostate.Needle.Specimen.Bx_1.1.0.0.REL_CAPCP.docx" and
 * "Prostate.Needle.Case.Bx_1.1.0.0.REL_CAPCP.docx" (both v1.1.0.0,
 * posted September 2023) — field names, tiers, controlled-vocabulary
 * terms only (Header G3). No paragraph text from either source
 * document's Explanatory Notes is reproduced here; `noteRef` values are
 * traceability pointers back to those notes, not their content. Source
 * files never committed to this repo.
 *
 * A needle biopsy report synthesizes both levels: SPECIMEN_LEVEL holds
 * per-core/per-specimen findings (repeated for each positive
 * specimen/zone), CASE_LEVEL holds the overall-case synthesis (highest
 * grade across specimens, combined tumor quantitation, case-level
 * procedure/findings). Both source protocols share the same "Positive
 * Specimen Location" controlled-vocabulary list (by sextant/zone) —
 * factored into `positiveSpecimenLocationOptions()` rather than
 * duplicated three times, matching the CAP source itself reusing it.
 *
 * Complex per-Gleason-Grade-Group conditional percentage-of-pattern
 * sub-buckets (which differ by grade group in the source) are
 * flattened into separate labelled fields rather than deeply nested
 * per-option children — consistent with how pT/pN categories were
 * flattened in the Breast Invasive Resection template, for the same
 * reason: fidelity without over-nesting a schema not designed for
 * per-option-value-dependent bucket sets.
 *
 * `approval.status` is "draft" — a stub gate (Header §5). Nothing here
 * is clinically valid until Dr. Ivo reviews and approves it (Header G3).
 */
import type { TemplateField, TemplateSection } from "../types";
import type { TemplateVersion } from "../types";

function positiveSpecimenLocationOptions() {
  const zones = [
    ["right", "Right"],
    ["right-base", "Right Base (RB)"],
    ["right-base-lateral", "Right Base Lateral (RBL)"],
    ["right-base-medial", "Right Base Medial (RBM)"],
    ["right-mid", "Right Mid (RM)"],
    ["right-mid-lateral", "Right Mid Lateral (RML)"],
    ["right-mid-medial", "Right Mid Medial (RMM)"],
    ["right-apex", "Right Apex (RA)"],
    ["right-apex-lateral", "Right Apex Lateral (RAL)"],
    ["right-apex-medial", "Right Apex Medial (RAM)"],
    ["right-tz", "Right Transition Zone (RTZ)"],
    ["left", "Left"],
    ["left-base", "Left Base (LB)"],
    ["left-base-lateral", "Left Base Lateral (LBL)"],
    ["left-base-medial", "Left Base Medial (LBM)"],
    ["left-mid", "Left Mid (LM)"],
    ["left-mid-lateral", "Left Mid Lateral (LML)"],
    ["left-mid-medial", "Left Mid Medial (LMM)"],
    ["left-apex", "Left Apex (LA)"],
    ["left-apex-lateral", "Left Apex Lateral (LAL)"],
    ["left-apex-medial", "Left Apex Medial (LAM)"],
    ["left-tz", "Left Transition Zone (LTZ)"],
  ] as const;
  return [
    ...zones.map(([key, label]) => ({ key, label, requiresText: true, textLabel: "Specimen ID" })),
    { key: "other-trus", label: "Other Transrectal Ultrasound (TRUS) lesion", requiresText: true },
    { key: "mri-guided", label: "MRI-guided Biopsy", requiresText: true },
    { key: "other", label: "Other", requiresText: true },
  ];
}

const HISTOLOGIC_TYPE_OPTIONS = [
  { key: "acinar-conventional", label: "Acinar adenocarcinoma, conventional (usual)" },
  { key: "acinar-signet-ring", label: "Acinar adenocarcinoma, signet-ring-like cell" },
  { key: "acinar-pleomorphic-giant-cell", label: "Acinar adenocarcinoma, pleomorphic giant cell" },
  { key: "acinar-sarcomatoid", label: "Acinar adenocarcinoma, sarcomatoid" },
  { key: "acinar-pin-like", label: "Acinar adenocarcinoma, prostatic intraepithelial neoplasia-like" },
  { key: "isolated-idc", label: "Isolated intraductal carcinoma" },
  { key: "ductal-adenocarcinoma", label: "Ductal adenocarcinoma" },
  { key: "adenosquamous", label: "Adenosquamous carcinoma" },
  { key: "squamous-cell", label: "Squamous cell carcinoma" },
  { key: "basal-cell", label: "Basal cell (adenoid cystic) carcinoma" },
  { key: "adenocarcinoma-neuroendocrine-diff", label: "Adenocarcinoma with neuroendocrine differentiation" },
  { key: "well-diff-net", label: "Well-differentiated neuroendocrine tumor" },
  { key: "small-cell-nec", label: "Small cell neuroendocrine carcinoma" },
  { key: "large-cell-nec", label: "Large cell neuroendocrine carcinoma" },
  { key: "other-not-listed", label: "Other histologic type not listed", requiresText: true, textLabel: "Specify" },
  { key: "cannot-determine-type", label: "Carcinoma, type cannot be determined", requiresText: true },
];

const GRADE_GROUP_OPTIONS = [
  { key: "not-applicable", label: "Not applicable", requiresText: true },
  { key: "cannot-be-assessed", label: "Cannot be assessed", requiresText: true },
  { key: "group-1", label: "Grade group 1 (Gleason Score 3 + 3 = 6)" },
  { key: "group-2", label: "Grade group 2 (Gleason Score 3 + 4 = 7)" },
  { key: "group-3", label: "Grade group 3 (Gleason Score 4 + 3 = 7)" },
  { key: "group-4-4-4", label: "Grade group 4 (Gleason Score 4 + 4 = 8)" },
  { key: "group-4-3-5", label: "Grade group 4 (Gleason Score 3 + 5 = 8)" },
  { key: "group-4-5-3", label: "Grade group 4 (Gleason Score 5 + 3 = 8)" },
  { key: "group-5-4-5", label: "Grade group 5 (Gleason Score 4 + 5 = 9)" },
  { key: "group-5-5-4", label: "Grade group 5 (Gleason Score 5 + 4 = 9)" },
  { key: "group-5-5-5", label: "Grade group 5 (Gleason Score 5 + 5 = 10)" },
];

const patternPercentageBucket = (key: string, label: string, tier: "core" | "non-core", ranges: string[]): TemplateField => ({
  key,
  label,
  tier,
  type: "single-select",
  options: ranges.map((r) => ({ key: `range-${r.replace(/[^a-z0-9]+/gi, "-")}`, label: r })),
});

function histologicGrade(): TemplateField {
  return {
    key: "histologic-grade",
    label: "Histologic Grade",
    tier: "core",
    type: "group",
    noteRef: "Note C",
    children: [
      { key: "grade", label: "Grade", tier: "core", type: "single-select", options: GRADE_GROUP_OPTIONS },
      {
        key: "tumor-microfocus",
        label: "Tumor Microfocus",
        tier: "core",
        type: "single-select",
        options: [{ key: "not-identified", label: "Not identified" }, { key: "present", label: "Present" }],
      },
      patternPercentageBucket("pct-pattern-4-group-2", "Percentage of Pattern 4 (Grade Group 2; not required if other specimens have Gleason Score 8+)", "non-core", [
        "Not applicable (other specimens have Gleason Scores of 8 or higher)",
        "Less than or equal to 5%",
        "6-10%",
        "11-20%",
        "21-30%",
        "31-40%",
        "Greater than 40%",
      ]),
      patternPercentageBucket("pct-pattern-4-group-3", "Percentage of Pattern 4 (Grade Group 3; not required if other specimens have Gleason Score 8+)", "non-core", [
        "Not applicable (other specimens have Gleason Scores of 8 or higher)",
        "Less than 61%",
        "61-70%",
        "71-80%",
        "81-90%",
        "Greater than 90%",
      ]),
      { key: "pct-pattern-4-gleason-8plus", label: "Percentage of Pattern 4 (Gleason Score 8 and above)", tier: "non-core", type: "number", unit: "%" },
      { key: "pct-pattern-5-gleason-8plus", label: "Percentage of Pattern 5 (Gleason Score 8 and above)", tier: "non-core", type: "number", unit: "%" },
    ],
  };
}

function tumorQuantitationSpecimenLevel(): TemplateField {
  return {
    key: "tumor-quantitation",
    label: "Tumor Quantitation",
    tier: "core",
    type: "group",
    noteRef: "Note E",
    children: [
      {
        key: "total-cores",
        label: "Total Number of Cores",
        tier: "core",
        type: "single-select",
        options: [{ key: "specify", label: "Specify number", requiresText: true }, { key: "cannot-determine", label: "Cannot be determined" }],
      },
      {
        key: "positive-cores",
        label: "Number of Positive Cores",
        tier: "core",
        type: "single-select",
        options: [{ key: "specify", label: "Specify number", requiresText: true }, { key: "cannot-determine", label: "Cannot be determined" }],
      },
      {
        key: "measurement-technique",
        label: "Tumor Measurement Technique",
        tier: "core",
        type: "multi-select",
        options: [
          { key: "single-continuous-focus", label: "Single continuous focus" },
          { key: "multiple-foci-continuous", label: "Consider multiple foci as continuous tumor" },
          { key: "multiple-foci-discontinuous", label: "Consider multiple foci as discontinuous tumor" },
        ],
      },
      {
        key: "pct-tissue-involved",
        label: "Percentage of Prostatic Tissue Involved by Tumor (repeat for multiple cores)",
        tier: "core",
        type: "single-select",
        options: [
          "Less than 1%", "1-5%", "6-10%", "11-20%", "21-30%", "31-40%", "41-50%",
          "51-60%", "61-70%", "71-80%", "81-90%", "Greater than 90%",
        ].map((r) => ({ key: `range-${r.replace(/[^a-z0-9]+/gi, "-")}`, label: r })),
        cannotBeDetermined: true,
      },
      {
        key: "length-tissue-involved",
        label: "Length of Prostatic Tissue Involved by Tumor (repeat for multiple cores)",
        tier: "non-core",
        type: "single-select",
        options: [
          { key: "specify-mm", label: "Specify", requiresText: true, textUnit: "mm" },
          { key: "less-than-1mm", label: "Less than 1 mm" },
        ],
      },
    ],
  };
}

const POSITIVE_SPECIMEN_OR_ZONE: TemplateField = {
  key: "positive-specimen-zone",
  label: "Positive Specimen / Zone",
  tier: "core",
  type: "group",
  repeatable: { max: 24, unitLabel: "positive specimen/core" },
  children: [
    { key: "location", label: "Positive Specimen Location", tier: "core", type: "multi-select", options: positiveSpecimenLocationOptions() },
    { key: "histologic-type", label: "Histologic Type", tier: "core", type: "multi-select", noteRef: "Note B", options: HISTOLOGIC_TYPE_OPTIONS },
    { key: "histologic-type-comment", label: "Histologic Type Comment", tier: "non-core", type: "text" },
    histologicGrade(),
    {
      key: "idc",
      label: "Intraductal Carcinoma (IDC)",
      tier: "core",
      type: "single-select",
      noteRef: "Note D",
      options: [{ key: "not-identified", label: "Not identified" }, { key: "present", label: "Present" }],
    },
    {
      key: "idc-incorporated-into-grade",
      label: "IDC Incorporated into Grade",
      tier: "conditional",
      type: "single-select",
      options: [{ key: "yes", label: "Yes" }, { key: "no", label: "No" }],
      cannotBeDetermined: true,
    },
    {
      key: "cribriform-glands",
      label: "Cribriform Glands (applicable to Gleason Score 7 or 8 cancer only)",
      tier: "conditional",
      type: "single-select",
      options: [
        { key: "not-applicable", label: "Not applicable" },
        { key: "not-identified", label: "Not identified" },
        { key: "present", label: "Present", requiresText: true },
        { key: "equivocal", label: "Equivocal", requiresText: true, textLabel: "Explain" },
      ],
      cannotBeDetermined: true,
    },
    tumorQuantitationSpecimenLevel(),
    {
      key: "periprostatic-fat-invasion",
      label: "Periprostatic Fat Invasion (report if identified in specimen)",
      tier: "core",
      type: "single-select",
      noteRef: "Note F",
      options: [
        { key: "not-identified", label: "Not identified" },
        { key: "present", label: "Present" },
        { key: "equivocal", label: "Equivocal", requiresText: true, textLabel: "Explain" },
      ],
      cannotBeDetermined: true,
    },
    {
      key: "seminal-vesicle-invasion",
      label: "Seminal Vesicle Invasion / Ejaculatory Duct Invasion (report if identified in specimen)",
      tier: "core",
      type: "single-select",
      noteRef: "Note F",
      options: [
        { key: "not-identified", label: "Not identified" },
        { key: "present", label: "Present" },
        { key: "equivocal", label: "Equivocal", requiresText: true, textLabel: "Explain" },
      ],
      cannotBeDetermined: true,
    },
    {
      key: "lvi",
      label: "Lymphatic and / or Vascular Invasion",
      tier: "non-core",
      type: "single-select",
      options: [
        { key: "not-identified", label: "Not identified" },
        { key: "present", label: "Present" },
        { key: "equivocal", label: "Equivocal", requiresText: true, textLabel: "Explain" },
      ],
      cannotBeDetermined: true,
    },
    {
      key: "perineural-invasion",
      label: "Perineural Invasion",
      tier: "non-core",
      type: "single-select",
      noteRef: "Note G",
      options: [{ key: "not-identified", label: "Not identified" }, { key: "present", label: "Present" }],
    },
    {
      key: "additional-findings",
      label: "Additional Findings",
      tier: "core",
      type: "multi-select",
      options: [
        { key: "none-identified", label: "None identified", requiresText: true },
        { key: "aip", label: "Atypical intraductal proliferation (AIP)" },
        { key: "high-grade-pin", label: "High-grade prostatic intraepithelial neoplasia (PIN)", requiresText: true, textLabel: "Specify" },
        { key: "asap", label: "Atypical small acinar proliferation / small focus of atypical glands (ASAP / ATYP)", requiresText: true },
        { key: "inflammation", label: "Inflammation", requiresText: true, textLabel: "Specify type" },
        { key: "other", label: "Other", requiresText: true },
      ],
    },
  ],
};

const TREATMENT_EFFECT_SPECIMEN: TemplateField = {
  key: "treatment-effect",
  label: "Treatment Effect",
  tier: "core",
  type: "multi-select",
  options: [
    { key: "no-known-presurgical", label: "No known presurgical therapy" },
    { key: "not-identified", label: "Not identified" },
    { key: "radiation", label: "Radiation therapy effect present", requiresText: true },
    { key: "hormonal", label: "Hormonal therapy effect present", requiresText: true },
    { key: "other", label: "Other therapy effect(s) present", requiresText: true, textLabel: "Specify" },
  ],
  cannotBeDetermined: true,
};

const SPECIMEN_LEVEL: TemplateSection = {
  key: "specimen-level",
  title: "Specimen-Level Findings",
  fields: [TREATMENT_EFFECT_SPECIMEN, POSITIVE_SPECIMEN_OR_ZONE],
};

// ---------------------------------------------------------------------
// CASE-LEVEL (synthesizes across all specimens/cores for the case)
// ---------------------------------------------------------------------

const CASE_PROCEDURE: TemplateField = {
  key: "procedure",
  label: "Procedure",
  tier: "core",
  type: "multi-select",
  noteRef: "Note A",
  options: [
    { key: "systematic", label: "Systematic biopsy" },
    { key: "targeted", label: "Targeted biopsy" },
    { key: "other", label: "Other", requiresText: true },
  ],
};

const CASE_POSITIVE_LOCATIONS: TemplateField = {
  key: "positive-specimen-locations",
  label: "Positive Specimen Location(s)",
  tier: "non-core",
  type: "multi-select",
  options: positiveSpecimenLocationOptions(),
};

function overallGrade(): TemplateField {
  return {
    key: "overall-grade",
    label: "Overall Grade",
    tier: "core",
    type: "group",
    children: [
      {
        key: "highest-grade",
        label: "Highest Grade (applies when 2+ sites/containers contain cancer with different Gleason Scores)",
        tier: "core",
        type: "single-select",
        options: GRADE_GROUP_OPTIONS,
        cannotBeDetermined: true,
      },
      { key: "sites-with-highest-gleason", label: "Site(s) with Highest Gleason Score", tier: "non-core", type: "multi-select", options: positiveSpecimenLocationOptions() },
      {
        key: "systematic-overall-grade",
        label: "Systematic Biopsy Overall Grade (required only if 2+ sites have different Gleason Scores)",
        tier: "conditional",
        type: "single-select",
        options: [{ key: "not-applicable", label: "Not applicable" }, ...GRADE_GROUP_OPTIONS.slice(1)],
        cannotBeDetermined: true,
      },
      {
        key: "systematic-overall-grade-technique",
        label: "Systematic Overall Grade Technique",
        tier: "non-core",
        type: "single-select",
        options: [{ key: "global", label: "Global" }, { key: "composite", label: "Composite" }],
      },
      {
        key: "targeted-biopsy-grade",
        label: "Targeted Biopsy Grade",
        tier: "non-core",
        type: "single-select",
        options: [{ key: "not-applicable", label: "Not applicable" }, ...GRADE_GROUP_OPTIONS.slice(1)],
        repeatable: { max: 10, unitLabel: "targeted biopsy site" },
        cannotBeDetermined: true,
      },
      { key: "targeted-biopsy-identifier", label: "Targeted Biopsy Identifier", tier: "non-core", type: "text" },
      {
        key: "combined-systematic-targeted-grade",
        label: "Combined Systematic and Targeted Biopsy Grade",
        tier: "non-core",
        type: "single-select",
        options: GRADE_GROUP_OPTIONS,
        cannotBeDetermined: true,
      },
      patternPercentageBucket("pct-pattern-4", "Percentage of Pattern 4 (applicable for Gleason Score 8 and above, any grading level)", "non-core", [
        "Less than or equal to 5%", "6-10%", "11-20%", "21-30%", "31-40%", "Greater than 40%",
      ]),
      patternPercentageBucket("pct-pattern-5", "Percentage of Pattern 5 (applicable for Gleason Score 8 and above, any grading level)", "non-core", [
        "Less than 61%", "61-70%", "71-80%", "81-90%", "Greater than 90%",
      ]),
    ],
  };
}

const CASE_HISTOLOGIC_TYPE: TemplateField = {
  key: "histologic-type",
  label: "Histologic Type",
  tier: "core",
  type: "multi-select",
  noteRef: "Note B",
  options: HISTOLOGIC_TYPE_OPTIONS,
};

const CASE_IDC: TemplateField = {
  key: "idc",
  label: "Intraductal Carcinoma (IDC)",
  tier: "core",
  type: "single-select",
  noteRef: "Note D",
  options: [{ key: "not-identified", label: "Not identified" }, { key: "present", label: "Present" }],
};

const CASE_IDC_GRADE: TemplateField = {
  key: "idc-incorporated-into-grade",
  label: "IDC Incorporated into Grade",
  tier: "conditional",
  type: "single-select",
  options: [{ key: "yes", label: "Yes" }, { key: "no", label: "No" }],
  cannotBeDetermined: true,
};

const CASE_CRIBRIFORM: TemplateField = {
  key: "cribriform-glands",
  label: "Cribriform Glands (applicable to Gleason Score 7 or 8 cancer only)",
  tier: "conditional",
  type: "single-select",
  options: [
    { key: "not-applicable", label: "Not applicable" },
    { key: "not-identified", label: "Not identified" },
    { key: "present", label: "Present", requiresText: true },
    { key: "equivocal", label: "Equivocal", requiresText: true, textLabel: "Explain" },
  ],
  cannotBeDetermined: true,
};

const CASE_TREATMENT_EFFECT: TemplateField = {
  key: "treatment-effect",
  label: "Treatment Effect (required only if applicable)",
  tier: "conditional",
  type: "multi-select",
  options: [
    { key: "no-known-presurgical", label: "No known presurgical therapy" },
    { key: "not-identified", label: "Not identified" },
    { key: "de-novo", label: "Treatment effect present and de novo cancer present", requiresText: true },
    { key: "radiation", label: "Radiation therapy effect present", requiresText: true },
    { key: "hormonal", label: "Hormonal therapy effect present", requiresText: true },
    { key: "other", label: "Other therapy effect(s) present", requiresText: true, textLabel: "Specify" },
  ],
  cannotBeDetermined: true,
};

function tumorQuantitationCaseLevel(): TemplateField {
  return {
    key: "tumor-quantitation",
    label: "Tumor Quantitation",
    tier: "core",
    type: "group",
    noteRef: "Note E",
    children: [
      {
        key: "total-cores",
        label: "Total Number of Cores",
        tier: "core",
        type: "single-select",
        options: [{ key: "specify", label: "Specify number", requiresText: true }, { key: "cannot-determine", label: "Cannot be determined" }],
      },
      {
        key: "positive-cores",
        label: "Number of Positive Cores",
        tier: "core",
        type: "single-select",
        options: [{ key: "specify", label: "Specify number", requiresText: true }, { key: "cannot-determine", label: "Cannot be determined" }],
      },
      {
        key: "measurement-technique",
        label: "Tumor Measurement Technique",
        tier: "non-core",
        type: "multi-select",
        options: [
          { key: "single-continuous-focus", label: "Single continuous focus" },
          { key: "multiple-foci-continuous", label: "Consider multiple foci as continuous tumor" },
          { key: "multiple-foci-discontinuous", label: "Consider multiple foci as discontinuous tumor" },
        ],
      },
      {
        key: "greatest-pct-core-involvement",
        label: "Greatest Percentage of Core Involvement by Cancer in Any Core",
        tier: "core",
        type: "single-select",
        options: [
          "Less than 1%", "1-5%", "6-10%", "11-20%", "21-30%", "31-40%", "41-50%",
          "51-60%", "61-70%", "71-80%", "81-90%", "Greater than 90%",
        ].map((r) => ({ key: `range-${r.replace(/[^a-z0-9]+/gi, "-")}`, label: r })),
        cannotBeDetermined: true,
      },
      { key: "site-of-greatest-involvement", label: "Site(s) of Greatest Core Involvement", tier: "non-core", type: "multi-select", options: positiveSpecimenLocationOptions() },
      { key: "greatest-length-core-involvement", label: "Greatest Length of Core Involvement by Cancer in Any Core", tier: "non-core", type: "number", unit: "mm" },
      { key: "pct-total-tissue-involved", label: "Percentage of Total Prostatic Tissue Involved by Tumor", tier: "non-core", type: "number", unit: "%" },
      { key: "total-linear-mm-carcinoma", label: "Total Linear Millimeters of Carcinoma", tier: "non-core", type: "number", unit: "mm" },
      { key: "total-linear-mm-core-tissue", label: "Total Linear Millimeters of Needle Core Tissue", tier: "non-core", type: "number", unit: "mm" },
    ],
  };
}

const CASE_PERIPROSTATIC_FAT: TemplateField = {
  key: "periprostatic-fat-invasion",
  label: "Periprostatic Fat Invasion (report if identified in specimen)",
  tier: "core",
  type: "single-select",
  noteRef: "Note F",
  options: [
    { key: "not-identified", label: "Not identified" },
    { key: "present", label: "Present", requiresText: true },
    { key: "equivocal", label: "Equivocal", requiresText: true, textLabel: "Explain" },
  ],
  cannotBeDetermined: true,
};

const CASE_SEMINAL_VESICLE: TemplateField = {
  key: "seminal-vesicle-invasion",
  label: "Seminal Vesicle Invasion (report if seminal vesicle is submitted)",
  tier: "core",
  type: "single-select",
  noteRef: "Note F",
  options: [
    { key: "not-identified", label: "Not identified" },
    { key: "present", label: "Present", requiresText: true },
    { key: "equivocal", label: "Equivocal", requiresText: true, textLabel: "Explain" },
  ],
  cannotBeDetermined: true,
};

const CASE_LVI: TemplateField = {
  key: "lvi",
  label: "Lymphatic and / or Vascular Invasion",
  tier: "non-core",
  type: "single-select",
  options: [
    { key: "not-identified", label: "Not identified" },
    { key: "present", label: "Present" },
    { key: "equivocal", label: "Equivocal", requiresText: true, textLabel: "Explain" },
  ],
  cannotBeDetermined: true,
};

const CASE_PNI: TemplateField = {
  key: "perineural-invasion",
  label: "Perineural Invasion",
  tier: "non-core",
  type: "single-select",
  noteRef: "Note G",
  options: [{ key: "not-identified", label: "Not identified" }, { key: "present", label: "Present" }],
};

const CASE_ADDITIONAL_FINDINGS: TemplateField = {
  key: "additional-findings",
  label: "Additional Findings",
  tier: "non-core",
  type: "multi-select",
  options: [
    { key: "none-identified", label: "None identified", requiresText: true },
    { key: "aip", label: "Atypical intraductal proliferation (AIP)" },
    { key: "high-grade-pin", label: "High-grade prostatic intraepithelial neoplasia (PIN)", requiresText: true, textLabel: "Specify" },
    { key: "asap", label: "Atypical small acinar proliferation / small focus of atypical glands (ASAP / ATYP)", requiresText: true },
    { key: "inflammation", label: "Inflammation", requiresText: true, textLabel: "Specify type" },
    { key: "other", label: "Other", requiresText: true },
  ],
};

const CASE_LEVEL: TemplateSection = {
  key: "case-level",
  title: "Case-Level Summary",
  fields: [
    CASE_PROCEDURE,
    CASE_POSITIVE_LOCATIONS,
    CASE_HISTOLOGIC_TYPE,
    { key: "histologic-type-comment", label: "Histologic Type Comment", tier: "non-core", type: "text" },
    overallGrade(),
    CASE_IDC,
    CASE_IDC_GRADE,
    CASE_CRIBRIFORM,
    CASE_TREATMENT_EFFECT,
    tumorQuantitationCaseLevel(),
    CASE_PERIPROSTATIC_FAT,
    CASE_SEMINAL_VESICLE,
    CASE_LVI,
    CASE_PNI,
    CASE_ADDITIONAL_FINDINGS,
  ],
};

const COMMENTS: TemplateSection = {
  key: "comments",
  title: "Comments",
  fields: [{ key: "comment", label: "Comment(s)", tier: "non-core", type: "text" }],
};

export const prostateNeedleBiopsy: TemplateVersion = {
  templateId: "prostate-needle-biopsy",
  title: "Prostate — Needle Biopsy",
  category: "Prostate",
  blurb: "Needle biopsy — histologic type, Gleason grade group, tumor extent, per-core quantitation.",
  sourceVersion: "1.1.0.0",
  sourceProtocolName: "CAP Prostate Needle Biopsies — Specimen Level + Case Level Reporting",
  sourcePostingDate: "2023-09",
  classificationBindings: [{ system: "WHO", edition: "5th Edition" }],
  sections: [SPECIMEN_LEVEL, CASE_LEVEL, COMMENTS],
  approval: { status: "draft" },
};
