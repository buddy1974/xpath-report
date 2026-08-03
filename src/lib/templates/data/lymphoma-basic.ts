/**
 * X-PATH — Lymphoma (Basic), derived template data
 * ------------------------------------------------------------------
 * Structural logic derived from CAP protocol "Protocol for the
 * Examination of Precursor and Mature Lymphoid Malignancies"
 * (Heme.Lymphoid.Bx.Res_1.0.0.1.REL_CAPCP.docx, version 1.0.0.1, posted
 * September 2025) — field names, tiers, controlled-vocabulary terms
 * only (Header G3). No paragraph text from the source document's
 * Explanatory Notes is reproduced here; `noteRef` values are
 * traceability pointers back to those notes, not their content. Source
 * file never committed to this repo.
 *
 * This protocol covers precursor + mature B-cell, T-cell, NK-cell, and
 * Hodgkin neoplasms in one case summary (blood/bone marrow/nodal/
 * extranodal). Diagnosis entries and molecular alteration/gene names
 * are standard WHO-classification and HGNC nomenclature — factual
 * controlled vocabulary, not CAP's own copyrighted narrative text.
 *
 * Simplification: CAP marks 3 specific pre-neoplastic-proliferation
 * options within "Final Integrated Diagnosis" as non-core ("+") while
 * the rest of that same field's ~100 other options are core. This
 * schema's `tier` is per-field, not per-option, so the whole field is
 * modeled as "core" (the overwhelming majority of its options are) —
 * logged, not silently smoothed over.
 *
 * `approval.status` is "draft" — a stub gate (Header §5). Nothing here
 * is clinically valid until Dr. Ivo reviews and approves it (Header G3).
 */
import type { FieldOption, TemplateField, TemplateSection, TemplateVersion } from "../types";

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 70);
}

function opt(label: string, extra?: Partial<FieldOption>): FieldOption {
  return { key: slug(label), label, ...extra };
}

function specifyOpt(label: string): FieldOption {
  return opt(label, { requiresText: true, textLabel: "Specify" });
}

const TUMOR_SITE: TemplateField = {
  key: "tumor-site-involvement",
  label: "Site(s) of Tumor Involvement in Sample",
  tier: "core",
  type: "multi-select",
  noteRef: "Note A",
  options: [
    opt("Bone marrow", { requiresText: true, textLabel: "Percent involvement of neoplastic cells", textUnit: "%" }),
    opt("Blood", { requiresText: true, textLabel: "Percent involvement of neoplastic cells", textUnit: "%" }),
    opt("Anterior mediastinum"),
    opt("Lymph node"),
    opt("Cutaneous"),
    opt("Extranodal / mucosal site"),
    specifyOpt("Other"),
  ],
};

// "Final Integrated Diagnosis" — one long, flat, single-select
// controlled-vocabulary list. CAP's source groups these under
// sub-headers (Precursor B-cell, Mature B-cell > Follicular neoplasms >
// ..., Precursor T-cell, Mature T-/NK-cell > ..., Hodgkin, immune-
// deficiency-associated) — preserved here as comments for readability,
// not as a structural grouping this schema supports.
const DIAGNOSIS_OPTIONS: FieldOption[] = [
  // Precursor B-cell neoplasms
  opt("B-lymphoblastic leukemia / lymphoma, NOS"),
  opt("B-lymphoblastic leukemia / lymphoma with high hyperdiploidy"),
  opt("B-lymphoblastic leukemia / lymphoma with hypodiploidy"),
  opt("B-lymphoblastic leukemia / lymphoma with iAMP21"),
  opt("B-lymphoblastic leukemia / lymphoma with BCR::ABL1 fusion"),
  opt("B-lymphoblastic leukemia / lymphoma with BCR::ABL1-like features"),
  opt("B-lymphoblastic leukemia / lymphoma with KMT2A rearrangement"),
  opt("B-lymphoblastic leukemia / lymphoma with ETV6::RUNX1 fusion"),
  opt("B-lymphoblastic leukemia / lymphoma with ETV6::RUNX1-like features"),
  opt("B-lymphoblastic leukemia / lymphoma with TCF3::PBX1 fusion"),
  opt("B-lymphoblastic leukemia / lymphoma with IGH::IL3 fusion"),
  opt("B-lymphoblastic leukemia / lymphoma with TCF3::HLF fusion"),
  opt("B-lymphoblastic leukemia / lymphoma with other defined genetic alterations"),
  specifyOpt("B-lymphoblastic leukemia / lymphoma, pending additional studies"),
  // Mature B-cell neoplasms — pre-neoplastic (non-core in source, "+")
  opt("Monoclonal B-cell lymphocytosis, CLL-type, low-count", { requiresText: true, textLabel: "Absolute count of clonal cells (if possible)", textUnit: "x10^9/L" }),
  opt("Monoclonal B-cell lymphocytosis, CLL-type", { requiresText: true, textLabel: "Absolute count of clonal cells (if possible)", textUnit: "x10^9/L" }),
  opt("Monoclonal B-cell lymphocytosis, non-CLL type", { requiresText: true, textLabel: "Absolute count of clonal cells (if possible)", textUnit: "x10^9/L" }),
  // CLL/SLL
  opt("Chronic lymphocytic leukemia / small lymphocytic lymphoma"),
  // Follicular neoplasms
  opt("In situ follicular B-cell neoplasm"),
  opt("Follicular lymphoma, classic type (cFL)"),
  opt("Follicular lymphoma with unusual cytologic features (uFL)"),
  opt("Follicular lymphoma with predominantly diffuse growth pattern (dFL)"),
  opt("Follicular large B-cell lymphoma"),
  opt("Pediatric-type follicular lymphoma"),
  opt("Duodenal-type follicular lymphoma"),
  opt("Primary cutaneous follicle center lymphoma"),
  // Mantle cell neoplasms
  opt("In situ mantle cell neoplasm"),
  opt("Mantle cell lymphoma"),
  opt("Leukemic non-nodal mantle cell lymphoma"),
  // Lymphoplasmacytic lymphoma
  opt("Lymphoplasmacytic lymphoma"),
  // Marginal zone lymphomas
  opt("Extranodal marginal zone lymphoma of mucosa-associated lymphoid tissue"),
  opt("Primary cutaneous marginal zone lymphoma"),
  opt("Nodal marginal zone lymphoma"),
  opt("Pediatric nodal marginal zone lymphoma"),
  // Splenic B-cell lymphomas/leukemias
  opt("Hairy cell leukemia"),
  opt("Splenic marginal zone lymphoma"),
  opt("Splenic diffuse red pulp small B-cell lymphoma"),
  opt("Splenic B-cell lymphoma / leukemia with prominent nucleoli"),
  // Large B-cell lymphomas
  opt("Diffuse large B-cell lymphoma, NOS"),
  opt("T-cell / histiocyte-rich large B-cell lymphoma"),
  opt("Diffuse large B-cell lymphoma / high grade B-cell lymphoma with MYC and BCL2 rearrangements"),
  opt("ALK-positive large B-cell lymphoma"),
  opt("Large B-cell lymphoma with IRF4 rearrangement"),
  opt("High grade B-cell lymphoma with 11q aberrations"),
  opt("Lymphomatoid granulomatosis"),
  opt("EBV-positive diffuse large B-cell lymphoma"),
  opt("Diffuse large B-cell lymphoma associated with chronic inflammation"),
  opt("Fibrin-associated large B-cell lymphoma"),
  opt("Fluid overload-associated large B-cell lymphoma"),
  opt("Plasmablastic lymphoma"),
  opt("Primary large B-cell lymphoma of immune-privileged sites"),
  opt("Primary cutaneous diffuse large B-cell lymphoma, leg type"),
  opt("Intravascular large B-cell lymphoma"),
  opt("Primary mediastinal large B-cell lymphoma"),
  opt("Mediastinal grey zone lymphoma"),
  opt("High-grade B-cell lymphoma, NOS"),
  opt("Burkitt lymphoma"),
  // KSHV/HHV8-associated
  opt("Primary effusion lymphoma"),
  opt("KSHV / HHV8-positive diffuse large B-cell lymphoma"),
  opt("KSHV / HHV8-positive germinotropic lymphoproliferative disorder"),
  // Hodgkin lymphomas
  opt("Classic Hodgkin lymphoma"),
  opt("Nodular lymphocyte predominant Hodgkin lymphoma"),
  // Other mature B-cell
  specifyOpt("Other mature B-cell neoplasm"),
  // Precursor T-cell neoplasms
  opt("T-lymphoblastic leukemia / lymphoma, NOS"),
  opt("Early T-precursor lymphoblastic leukemia / lymphoma"),
  specifyOpt("Precursor T-cell neoplasm, pending additional studies"),
  // Mature T-cell and NK-cell leukemias
  opt("T-prolymphocytic leukemia"),
  opt("T-large granular lymphocytic leukemia"),
  opt("NK-large granular lymphocytic leukemia"),
  opt("Adult T-cell leukemia / lymphoma"),
  opt("Sezary syndrome"),
  opt("Aggressive NK-cell leukemia"),
  // Primary cutaneous T-cell lymphoid proliferations and lymphomas
  opt("Primary cutaneous CD4-positive small or medium T-cell lymphoproliferative disorder"),
  opt("Primary cutaneous acral CD8-positive T-cell lymphoproliferative disorder"),
  opt("Mycosis fungoides"),
  opt("Primary cutaneous CD30-positive T-cell lymphoproliferative disorder: Lymphomatoid papulosis"),
  opt("Primary cutaneous CD30-positive T-cell lymphoproliferative disorder: Primary cutaneous anaplastic large cell lymphoma"),
  opt("Subcutaneous panniculitis-like T-cell lymphoma"),
  opt("Primary cutaneous gamma / delta T-cell lymphoma"),
  opt("Primary cutaneous CD8-positive aggressive epidermotropic cytotoxic T-cell lymphoma"),
  opt("Primary cutaneous peripheral T-cell lymphoma, NOS"),
  // Intestinal T-cell and NK-cell lymphoid proliferations and lymphomas
  opt("Indolent T-cell lymphoma of the gastrointestinal tract"),
  opt("Indolent NK-cell lymphoproliferative disorder of the gastrointestinal tract"),
  opt("Enteropathy-associated T-cell lymphoma"),
  opt("Monomorphic epitheliotropic intestinal T-cell lymphoma"),
  opt("Intestinal T-cell lymphoma, NOS"),
  // Hepatosplenic T-cell lymphoma
  opt("Hepatosplenic T-cell lymphoma"),
  // Anaplastic large cell lymphomas
  opt("ALK-positive anaplastic large cell lymphoma"),
  opt("ALK-negative anaplastic large cell lymphoma"),
  opt("Breast implant-associated anaplastic large cell lymphoma"),
  // Nodal T-follicular helper (TFH) cell lymphomas
  opt("Nodal TFH cell lymphoma, angioimmunoblastic-type"),
  opt("Nodal TFH cell lymphoma, follicular-type"),
  opt("Nodal TFH cell lymphoma, NOS"),
  // Other peripheral T-cell lymphoma
  opt("Peripheral T-cell lymphoma, NOS"),
  // EBV-positive NK/T-cell lymphomas
  opt("EBV-positive NK-cell and T-cell lymphoma"),
  opt("EBV-positive nodal T- and NK-cell lymphoma"),
  opt("Extranodal NK / T-cell lymphoma"),
  // EBV-positive T-cell and NK-cell lymphoid proliferations/lymphomas of childhood
  opt("Severe mosquito bite allergy"),
  opt("Hydroa vacciniforme lymphoproliferative disorder"),
  opt("Systemic chronic active EBV disease"),
  opt("Systemic EBV-positive T-cell lymphoma of childhood"),
  // Other mature T-/NK-cell
  specifyOpt("Other mature T- or NK-cell neoplasm"),
  // Lymphoid proliferations and lymphomas associated with immune deficiency and dysregulation
  opt("Hyperplasias arising in immune deficiency / dysregulation"),
  opt("Polymorphic lymphoproliferative disorders arising in immune deficiency / dysregulation"),
  opt("EBV-positive mucocutaneous ulcer"),
  opt("Lymphomas arising in immune deficiency / dysregulation"),
  opt("Inborn error of immunity-associated lymphoid proliferations and lymphomas"),
];

const FINAL_INTEGRATED_DIAGNOSIS: TemplateField = {
  key: "final-integrated-diagnosis",
  label: "Final Integrated Diagnosis",
  tier: "core",
  type: "single-select",
  noteRef: "Note B",
  options: DIAGNOSIS_OPTIONS,
};

// Non-core follow-up fields specific to the immune-deficiency-associated
// diagnosis category (source: "+Specify Name of Lesion" / "+Specify
// Virus Status" / "+Specify Type of Immunodeficiency").
const IMMUNE_DEFICIENCY_DETAILS: TemplateField[] = [
  { key: "immune-deficiency-lesion-name", label: "Specify Name of Lesion (if immune deficiency / dysregulation-associated)", tier: "non-core", type: "text" },
  { key: "immune-deficiency-virus-status", label: "Specify Virus Status (if immune deficiency / dysregulation-associated)", tier: "non-core", type: "text" },
  { key: "immune-deficiency-type", label: "Specify Type of Immunodeficiency", tier: "non-core", type: "text" },
];

const TRANSFORMATION: TemplateField = {
  key: "transformation-from-indolent-lymphoma",
  label: "Possible Transformation from Indolent Lymphoma",
  tier: "non-core",
  type: "single-select",
  noteRef: "Note C",
  options: [
    opt("Not applicable"),
    opt("No overt evidence of transformation from more indolent lymphoma / other lymphoma type"),
    opt("Lymphoma favored to represent transformation event from indolent lymphoma", { requiresText: true, textLabel: "Explain" }),
  ],
};

const TUMOR: TemplateSection = {
  key: "tumor",
  title: "Tumor",
  fields: [TUMOR_SITE, FINAL_INTEGRATED_DIAGNOSIS, ...IMMUNE_DEFICIENCY_DETAILS, TRANSFORMATION],
};

const MOLECULAR_ALTERATION_GENES = [
  "ALK translocation",
  "MALT1 translocation",
  "ATM mutation",
  "B2M mutation",
  "BCL10 translocation",
  "BIRC3 mutation",
  "BTK mutation",
  "CARD11 mutation",
  "CD79A / B mutation",
  "BCL2 mutation",
  "BCL2 translocation",
  "BCL6 mutation",
  "BCL6 translocation",
  "BRAF mutation",
  "CDKN2A / 2B mutation",
  "CCND1 (Cyclin D1) translocation",
  "CCND2 (Cyclin D2) translocation",
  "CCND3 (Cyclin D3) translocation",
  "CXCR4 mutation",
  "DUSP22 translocation",
  "DNMT3A mutation",
  "ETV6 mutation",
  "ETV6::RUNX1 fusion",
  "EZH2 mutation",
  "FBXW7 mutation",
  "GATA3 mutation",
  "iAMP21",
  "IDH1 / 2 mutation",
  "IGH::IL3 rearrangement",
  "IGHV mutated",
  "IGHV unmutated",
  "IRF4 mutation",
  "JAK1 mutation",
  "JAK2 mutation",
  "JAK3 mutation",
  "KLKF2 mutation",
  "KRAS mutation",
  "KMT2A rearrangement",
  "MYC rearrangement",
  "MYD88 mutation",
  "NOTCH1 mutation",
  "NOTCH2 mutation",
  "NRAS mutation",
  "PDGFRA translocation",
  "PLCG1 / 2 mutation",
  "PTEN mutation",
  "RB1 mutation",
  "RHOA mutation",
  "RPS15 mutation",
  "SF3B1 mutation",
  "STAT3 mutation",
  "STAT5B mutation",
  "STAT6 mutation",
  "TET2 mutation",
  "TCF3::PBX1 rearrangement",
  "TCF3::HLF fusion rearrangement",
  "TNFAIP3 mutation",
  "TNFRSF14 mutation",
  "TP53 mutation",
  "TP63 translocation",
  "TRAF3 mutation",
  "XPO1 mutation",
];

const SPECIAL_STUDIES: TemplateSection = {
  key: "special-studies",
  title: "Special Studies",
  fields: [
    {
      key: "immunohistochemistry",
      label: "Immunohistochemistry",
      tier: "core",
      type: "single-select",
      noteRef: "Note D",
      options: [opt("Not performed"), specifyOpt("Performed (specify results)"), opt("Pending")],
    },
    {
      key: "flow-cytometry",
      label: "Flow Cytometry",
      tier: "core",
      type: "single-select",
      options: [
        opt("Not performed"),
        opt("No aberrancy detected at level of sensitivity of assay"),
        opt("Positive for abnormal lymphoid population", { requiresText: true, textLabel: "Specify immunophenotype, if possible" }),
        opt("Pending"),
      ],
    },
    {
      key: "conventional-cytogenetics",
      label: "Conventional Cytogenetics",
      tier: "core",
      type: "single-select",
      options: [
        opt("Not performed"),
        opt("Normal diploid karyotype"),
        opt("Abnormal karyotype", { requiresText: true, textLabel: "Specify, if possible" }),
        opt("Pending"),
      ],
    },
    {
      key: "fish",
      label: "Fluorescence in situ Hybridization",
      tier: "core",
      type: "multi-select",
      options: [
        opt("Not performed"),
        opt("Normal probes", { requiresText: true, textLabel: "Specify loci tested" }),
        opt("Abnormal probes", { requiresText: true, textLabel: "Specify loci tested" }),
        opt("Pending"),
      ],
    },
    {
      key: "molecular-alterations-detected",
      label: "Molecular Alterations Detected",
      tier: "core",
      type: "multi-select",
      options: [
        ...MOLECULAR_ALTERATION_GENES.map((g) => specifyOpt(g)),
        specifyOpt("Other alterations detected"),
        opt("Pending", { requiresText: true }),
      ],
    },
    { key: "molecular-alterations-assayed", label: "Specify Molecular Alterations Assayed", tier: "non-core", type: "text" },
  ],
};

const COMMENTS: TemplateSection = {
  key: "comments",
  title: "Comments",
  fields: [{ key: "comment", label: "Comment(s)", tier: "non-core", type: "text" }],
};

export const lymphomaBasic: TemplateVersion = {
  templateId: "lymphoma-basic",
  title: "Lymphoma (Basic)",
  category: "Lymphoma / Hematologic",
  sourceVersion: "1.0.0.1",
  sourceProtocolName: "CAP Precursor and Mature Lymphoid Malignancies",
  sourcePostingDate: "2025-09",
  classificationBindings: [{ system: "WHO", edition: "Haematolymphoid Tumours (5th Edition)" }],
  sections: [TUMOR, SPECIAL_STUDIES, COMMENTS],
  approval: { status: "draft" },
};
