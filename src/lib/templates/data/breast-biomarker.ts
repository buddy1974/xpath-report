/**
 * X-PATH — Breast Biomarker Reporting Template, derived template data
 * ------------------------------------------------------------------
 * Structural logic derived from CAP protocol
 * "Breast.Bmk_1.6.1.0.-REL_CAPCP.docx" (posted June 2025; interpretive
 * content references the ASCO/CAP HER2 Guidelines 2018) — field names,
 * tiers, controlled-vocabulary terms only (Header G3).
 *
 * IMPORTANT: this source protocol includes several "standardized comment"
 * checklist options that are full authored paragraphs (clinical guidance
 * text), not just a field label or controlled-vocabulary term — e.g. the
 * ER low-positive comment and the HER2 ISH Group 2/3/4 comments. Those
 * are OUT OF BOUNDS to copy verbatim under G3. Each is represented below
 * with a short, in-house-written label and `needsInHouseAuthoring: true`
 * — the actual comment text must be authored in-house or licensed before
 * clinical use, then filled in as part of the director-approval step.
 * Source file never committed to this repo.
 */
import type { TemplateField, TemplateSection, TemplateVersion } from "../types";

const percentRangeOptions = (ranges: string[]) => ranges.map((r) => ({ key: `range-${r}`, label: r }));

const intensityField: TemplateField = {
  key: "average-intensity",
  label: "Average Intensity of Staining",
  tier: "core",
  type: "single-select",
  options: [
    { key: "weak", label: "Weak (1+)" },
    { key: "moderate", label: "Moderate (2+)" },
    { key: "strong", label: "Strong (3+)" },
  ],
};

const alternativeScoringSystem: TemplateField = {
  key: "alternative-scoring-system",
  label: "Alternative Scoring System Scores",
  tier: "non-core",
  type: "single-select",
  options: [
    { key: "allred", label: "Allred" },
    { key: "other-system", label: "Other scoring system", requiresText: true, textLabel: "Specify system" },
  ],
  children: [
    { key: "allred-proportion", label: "Proportion Score", tier: "non-core", type: "number" },
    { key: "allred-intensity", label: "Intensity Score", tier: "non-core", type: "number" },
    { key: "allred-total", label: "Total Allred Score", tier: "non-core", type: "number" },
    { key: "other-score-result", label: "Specify Score Result", tier: "non-core", type: "text" },
  ],
};

const internalControls = (requiredWhen: string): TemplateField => ({
  key: "internal-controls",
  label: `Status of Internal Controls (${requiredWhen})`,
  tier: "conditional",
  type: "single-select",
  options: [
    { key: "not-applicable", label: "Not applicable" },
    { key: "present-expected", label: "Internal control present and stains as expected" },
    { key: "absent-external-expected", label: "Internal control absent; external controls stain as expected" },
    { key: "other", label: "Other", requiresText: true },
  ],
});

const ER_STATUS: TemplateField = {
  key: "er-status",
  label: "Estrogen Receptor (ER) Status",
  tier: "core",
  type: "group",
  noteRef: "Note B",
  children: [
    {
      key: "result",
      label: "Result",
      tier: "core",
      type: "single-select",
      options: [
        { key: "positive", label: "Positive (greater than 10% of cells demonstrate nuclear positivity)" },
        { key: "low-positive", label: "Low Positive (1-10% of cells with nuclear positivity)" },
        { key: "negative", label: "Negative (less than 1%)" },
      ],
      cannotBeDetermined: true,
    },
    {
      key: "percentage-positive",
      label: "Percentage of Cells with Nuclear Positivity",
      tier: "core",
      type: "single-select",
      options: [
        { key: "specify", label: "Specify percentage", requiresText: true, textUnit: "%" },
        ...percentRangeOptions(["11-20%", "21-30%", "31-40%", "41-50%", "51-60%", "61-70%", "71-80%", "81-90%", "91-100%"]),
      ],
    },
    { key: "low-positive-percentage", label: "Percentage of Cells with Nuclear Positivity (low positive)", tier: "non-core", type: "number", unit: "%" },
    intensityField,
    internalControls("required only if low positive or negative"),
    alternativeScoringSystem,
    {
      key: "comment-on-result",
      label: "Comment(s) on ER Result",
      tier: "non-core",
      type: "single-select",
      options: [
        { key: "standard-low-positive-eligibility", label: "Standard comment: low-positive ER — endocrine therapy eligibility guidance", needsInHouseAuthoring: true },
        { key: "standard-no-internal-controls", label: "Standard comment: no internal controls present, external controls appropriate", needsInHouseAuthoring: true },
        { key: "other", label: "Other", requiresText: true },
      ],
    },
  ],
};

const PGR_STATUS: TemplateField = {
  key: "pgr-status",
  label: "Progesterone Receptor (PgR) Status",
  tier: "core",
  type: "group",
  noteRef: "Note B",
  children: [
    {
      key: "result",
      label: "Result",
      tier: "core",
      type: "single-select",
      options: [
        { key: "positive", label: "Positive" },
        { key: "negative", label: "Negative (less than 1%)" },
      ],
      cannotBeDetermined: true,
    },
    {
      key: "percentage-positive",
      label: "Percentage of Cells with Nuclear Positivity",
      tier: "core",
      type: "single-select",
      options: [
        { key: "specify", label: "Specify percentage", requiresText: true, textUnit: "%" },
        { key: "range-1-10", label: "1-10%", requiresText: true },
        ...percentRangeOptions(["11-20%", "21-30%", "31-40%", "41-50%", "51-60%", "61-70%", "71-80%", "81-90%", "91-100%"]),
      ],
    },
    intensityField,
    internalControls("required only if negative"),
    alternativeScoringSystem,
    { key: "comment-on-result", label: "Comment(s) on PgR Results", tier: "non-core", type: "text" },
  ],
};

const HER2_IHC_STATUS: TemplateField = {
  key: "her2-ihc-status",
  label: "HER2 by Immunohistochemistry (IHC) Status",
  tier: "core",
  type: "group",
  noteRef: "Note C",
  children: [
    {
      key: "result",
      label: "Result",
      tier: "core",
      type: "single-select",
      options: [
        { key: "negative-0", label: "Negative (Score 0): no membrane staining detected" },
        { key: "negative-0-plus", label: "Negative (Score 0+): incomplete, faint / barely perceptible staining in <=10% of cells" },
        { key: "negative-1-plus", label: "Negative (Score 1+): incomplete, faint / barely perceptible staining in >10% of cells" },
        { key: "equivocal-2-plus", label: "Equivocal (Score 2+)" },
        { key: "positive-3-plus", label: "Positive (Score 3+): circumferential, complete, intense staining in >10% of cells" },
      ],
      cannotBeDetermined: true,
    },
    {
      key: "equivocal-2-plus-pattern",
      label: "Score 2+ Staining Pattern",
      tier: "conditional",
      type: "single-select",
      options: [
        { key: "weak-moderate-complete-gt10", label: "Weak to moderate complete membrane staining in >10% of tumor cells" },
        { key: "moderate-intense-incomplete-basolateral", label: "Moderate to intense but incomplete (basolateral) membrane staining" },
        { key: "limited-3plus-lte10", label: "<=10% of the cancer has complete, intense (3+) circumferential staining" },
        { key: "cytoplasmic-obscuring", label: "Abundant cytoplasmic staining obscuring membrane stain evaluation" },
        { key: "other", label: "Other", requiresText: true },
      ],
    },
    {
      key: "clustered-heterogeneity",
      label: "Clustered Heterogeneity (required only if present as discrete populations, one with 3+ staining)",
      tier: "conditional",
      type: "single-select",
      options: [
        { key: "not-applicable", label: "Not applicable" },
        { key: "not-identified", label: "Not identified (3+ staining homogeneous throughout sample)" },
        { key: "present", label: "Present (distinct 3+ and non-3+ staining populations)" },
      ],
    },
    { key: "pct-3plus-staining", label: "Percentage of Cancer with 3+ Staining (must be greater than 10%)", tier: "conditional", type: "number", unit: "%" },
    {
      key: "staining-score-non-3plus",
      label: "Staining Score in Non-3+ Areas",
      tier: "conditional",
      type: "single-select",
      options: [
        { key: "0", label: "0" },
        { key: "1-plus", label: "1+" },
        { key: "2-plus", label: "2+" },
        { key: "other", label: "Other", requiresText: true },
      ],
    },
    {
      key: "comment-on-ihc",
      label: "Comment(s) on HER2 IHC",
      tier: "non-core",
      type: "single-select",
      options: [
        { key: "standard-ultralow-low", label: "Standard comment: HER2 \"ultralow\"/\"low\" — metastatic-setting eligibility guidance (DESTINY-Breast04/06)", needsInHouseAuthoring: true },
        { key: "other", label: "Other", requiresText: true },
      ],
    },
  ],
};

const HER2_ISH_STATUS: TemplateField = {
  key: "her2-ish-status",
  label: "HER2 by In Situ Hybridization (ISH) Status",
  tier: "core",
  type: "group",
  noteRef: "Note C",
  children: [
    {
      key: "result",
      label: "Result",
      tier: "core",
      type: "single-select",
      options: [
        { key: "not-performed", label: "Not performed" },
        { key: "pending", label: "Pending" },
        { key: "negative", label: "Negative (not amplified, Group 5 result)" },
        { key: "negative-ihc-ish", label: "Negative, based on IHC and ISH results" },
        { key: "group-2-ihc-0-2", label: "Group 2 ISH result (with IHC 0-2+)" },
        { key: "group-3-ihc-0-1", label: "Group 3 ISH result (with IHC 0-1+)" },
        { key: "group-4-ihc-0-2", label: "Group 4 ISH result (with IHC 0-2+)" },
        { key: "positive", label: "Positive (amplified, Group 1 result in greater than 10% of cell population)" },
        { key: "positive-ihc-ish", label: "Positive based on IHC and ISH results" },
        { key: "group-2-ihc-3", label: "Group 2 ISH result (with IHC 3+)" },
        { key: "group-3-ihc-2-3", label: "Group 3 ISH result (with IHC 2-3+)" },
        { key: "group-4-ihc-3", label: "Group 4 ISH result (with IHC 3+)" },
        { key: "other", label: "Other", requiresText: true },
      ],
      cannotBeDetermined: true,
    },
    { key: "avg-her2-signals", label: "Average Number of HER2 Signals per Cell (required only if applicable)", tier: "conditional", type: "number" },
    { key: "avg-cep17-signals", label: "Average Number of CEP17 Signals per Cell (required only if applicable)", tier: "conditional", type: "number" },
    { key: "her2-cep17-ratio", label: "HER2 / CEP17 Ratio (required only if applicable)", tier: "conditional", type: "number" },
    { key: "number-of-observers", label: "Number of Observers (required only if applicable)", tier: "conditional", type: "number" },
    { key: "invasive-cells-counted", label: "Number of Invasive Tumor Cells Counted (required only if applicable)", tier: "conditional", type: "number", unit: "cells" },
    {
      key: "heterogeneity",
      label: "Heterogeneity (distinct clustered populations with different scores)",
      tier: "non-core",
      type: "single-select",
      options: [
        { key: "not-identified", label: "Not identified" },
        { key: "present", label: "Present" },
      ],
    },
    { key: "pct-amplified-population", label: "Percentage of Cell Population HER2 Amplified by ISH", tier: "non-core", type: "number", unit: "%" },
    {
      key: "ihc-score-amplified-population",
      label: "IHC Score in this Amplified Population",
      tier: "non-core",
      type: "single-select",
      options: [
        { key: "0", label: "0" },
        { key: "1-plus", label: "1+" },
        { key: "2-plus", label: "2+" },
        { key: "3-plus", label: "3+" },
        { key: "not-known", label: "Not known" },
      ],
    },
    { key: "heterogeneity-description", label: "Description of Heterogeneity Present", tier: "non-core", type: "text" },
    {
      key: "comment-on-ish",
      label: "Comment(s) on HER2 ISH Result",
      tier: "non-core",
      type: "single-select",
      noteRef: "Note C",
      options: [
        { key: "standard-group-2", label: "Standard comment: Group 2 ISH result — limited efficacy evidence guidance", needsInHouseAuthoring: true },
        { key: "standard-group-3", label: "Standard comment: Group 3 ISH result — insufficient efficacy evidence guidance", needsInHouseAuthoring: true },
        { key: "standard-group-4", label: "Standard comment: Group 4 ISH result — uncertain benefit guidance", needsInHouseAuthoring: true },
        { key: "other", label: "Other", requiresText: true },
      ],
    },
  ],
};

const KI67: TemplateField = {
  key: "ki67",
  label: "Ki-67 Proliferative Index",
  tier: "core",
  type: "group",
  noteRef: "Note D",
  children: [
    {
      key: "percentage-positive-nuclei",
      label: "Percentage of Positive Nuclei",
      tier: "core",
      type: "single-select",
      options: [
        { key: "specify", label: "Specify percentage", requiresText: true, textUnit: "%" },
        ...percentRangeOptions(["0-5%", "6-10%", "11-15%", "16-20%", "21-30%", "31-40%", "41-50%", "51-60%", "61-70%", "71-80%", "81-90%", "91-100%"]),
      ],
    },
    { key: "comment", label: "Comment(s) on Ki-67 Results", tier: "non-core", type: "text" },
  ],
};

const TESTS_PERFORMED: TemplateSection = {
  key: "tests-performed",
  title: "Test(s) Performed",
  fields: [
    { key: "specimen-block-numbers", label: "Testing Performed on Specimen / Block Number(s)", tier: "core", type: "text" },
    {
      key: "tests-performed",
      label: "Test(s) Performed",
      tier: "core",
      type: "multi-select",
      noteRef: "Note A",
      options: [
        { key: "er", label: "Estrogen Receptor (ER) Status" },
        { key: "pgr", label: "Progesterone Receptor (PgR) Status" },
        { key: "her2-ihc", label: "HER2 by Immunohistochemistry (IHC) Status" },
        { key: "her2-ish", label: "HER2 by In Situ Hybridization (ISH) Status" },
        { key: "ki67", label: "Ki-67 Proliferative Index" },
      ],
      children: [ER_STATUS, PGR_STATUS, HER2_IHC_STATUS, HER2_ISH_STATUS, KI67],
    },
  ],
};

const testType = (name: string): TemplateField => ({
  key: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-test-type`,
  label: `${name} Test Type (required only if applicable)`,
  tier: "conditional",
  type: "single-select",
  options: [
    { key: "not-applicable", label: "Not applicable" },
    { key: "fda-cleared", label: "Food and Drug Administration (FDA) cleared", requiresText: true, textLabel: "Specify test / vendor" },
    { key: "laboratory-developed", label: "Laboratory-developed test" },
    { key: "non-us-health-systems", label: "Non-U.S.-based health systems" },
    { key: "health-canada-approved", label: "Health Canada Approved", requiresText: true, textLabel: "Specify test / vendor" },
    { key: "other", label: "Other", requiresText: true },
  ],
});

const METHODS: TemplateSection = {
  key: "methods",
  title: "Methods",
  fields: [
    {
      key: "cold-ischemia-fixation-times",
      label: "Cold Ischemia and Fixation Times",
      tier: "core",
      type: "single-select",
      options: [
        { key: "meets", label: "Meet requirements specified in latest version of the ASCO / CAP Guidelines" },
        { key: "does-not-meet", label: "Do not meet requirements specified in latest version of the ASCO / CAP Guidelines", requiresText: true, textLabel: "Explain" },
      ],
      cannotBeDetermined: true,
    },
    {
      key: "cold-ischemia-time",
      label: "Cold Ischemia Time",
      tier: "non-core",
      type: "single-select",
      options: [
        { key: "lt-60min", label: "Less than 60 minutes" },
        { key: "specify", label: "Specify", requiresText: true, textUnit: "minutes" },
        { key: "other", label: "Other", requiresText: true },
        { key: "not-known", label: "Not known" },
      ],
    },
    { key: "fixation-time", label: "Fixation Time", tier: "non-core", type: "number", unit: "hours" },
    {
      key: "fixative",
      label: "Fixative",
      tier: "non-core",
      type: "multi-select",
      options: [
        { key: "formalin", label: "Formalin" },
        { key: "decalcification", label: "Decalcification" },
        { key: "other", label: "Other", requiresText: true },
      ],
    },
    {
      key: "comment-on-fixation",
      label: "Comment(s) on Fixation",
      tier: "non-core",
      type: "single-select",
      options: [
        { key: "standard-decalcified-not-validated", label: "Standard comment: assay not validated on decalcified tissue — interpret with caution", needsInHouseAuthoring: true },
        { key: "other", label: "Other", requiresText: true },
      ],
    },
    testType("ER"),
    {
      key: "er-primary-antibody",
      label: "ER Primary Antibody (required only if applicable)",
      tier: "conditional",
      type: "single-select",
      options: [
        { key: "not-applicable", label: "Not applicable" },
        { key: "sp1", label: "SP1" },
        { key: "6f11", label: "6F11" },
        { key: "1d5", label: "1D5" },
        { key: "other", label: "Other", requiresText: true },
      ],
    },
    testType("PgR"),
    {
      key: "pgr-primary-antibody",
      label: "PgR Primary Antibody (required only if applicable)",
      tier: "conditional",
      type: "single-select",
      options: [
        { key: "not-applicable", label: "Not applicable" },
        { key: "1e2", label: "1E2" },
        { key: "636", label: "636" },
        { key: "16", label: "16" },
        { key: "1a6", label: "1A6" },
        { key: "1294", label: "1294" },
        { key: "312", label: "312" },
        { key: "other", label: "Other", requiresText: true },
      ],
    },
    testType("HER2 IHC"),
    {
      key: "her2-ihc-primary-antibody",
      label: "HER2 IHC Primary Antibody (required only if applicable)",
      tier: "conditional",
      type: "single-select",
      options: [
        { key: "not-applicable", label: "Not applicable" },
        { key: "4b5", label: "4B5" },
        { key: "hercep-test", label: "HercepTest" },
        { key: "a0485", label: "A0485" },
        { key: "sp3", label: "SP3" },
        { key: "cb11", label: "CB11" },
        { key: "other", label: "Other", requiresText: true },
      ],
    },
    testType("HER2 ISH"),
    {
      key: "ki67-primary-antibody",
      label: "Ki-67 Primary Antibody (required only if applicable)",
      tier: "conditional",
      type: "single-select",
      options: [
        { key: "not-applicable", label: "Not applicable (not performed)" },
        { key: "mib1", label: "MIB1" },
        { key: "sp6", label: "SP6" },
        { key: "mm1", label: "MM1" },
        { key: "30-9", label: "30-9" },
        { key: "ir-is626", label: "IR / IS626" },
        { key: "other", label: "Other", requiresText: true },
      ],
    },
    {
      key: "image-analysis",
      label: "Image Analysis",
      tier: "non-core",
      type: "single-select",
      options: [
        { key: "not-performed", label: "Not performed" },
        { key: "performed", label: "Performed" },
      ],
    },
    { key: "image-analysis-method", label: "Specify Method", tier: "non-core", type: "text" },
    {
      key: "biomarkers-scored-by-image-analysis",
      label: "Biomarkers Scored by Image Analysis",
      tier: "non-core",
      type: "multi-select",
      options: [
        { key: "er", label: "ER" },
        { key: "pgr", label: "PgR" },
        { key: "her2-ihc", label: "HER2 by IHC" },
        { key: "her2-ish", label: "HER2 by ISH" },
        { key: "ki67", label: "Ki-67" },
        { key: "other", label: "Other", requiresText: true },
      ],
    },
  ],
};

const COMMENTS: TemplateSection = {
  key: "comments",
  title: "Comments",
  fields: [{ key: "comment", label: "Comment(s)", tier: "non-core", type: "text" }],
};

export const breastBiomarker: TemplateVersion = {
  templateId: "breast-biomarker",
  title: "Breast Biomarker Reporting Template",
  sourceVersion: "1.6.1.0",
  sourceProtocolName: "CAP Breast Biomarker Reporting Template (incl. ASCO/CAP HER2 Guidelines 2018 interpretive content)",
  sourcePostingDate: "2025-06",
  classificationBindings: [{ system: "ASCO/CAP HER2 Guideline", edition: "2018" }],
  sections: [TESTS_PERFORMED, METHODS, COMMENTS],
  approval: { status: "draft" },
};
