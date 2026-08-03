/**
 * X-PATH — Template engine types (Header §5, M3)
 * ------------------------------------------------------------------
 * Templates are versioned DATA, not code (Header: "Build the engine, not
 * forms"). This file defines the shape; `data/*.ts` holds the derived
 * structural logic of specific CAP protocols — never their copyrighted
 * prose (Header G3). Field labels and controlled-vocabulary terms are
 * fair to encode directly; explanatory/narrative text is not and must be
 * authored in-house or omitted.
 *
 * Tiering follows CAP's own convention, carried over as our tiers:
 *   - core: required, no marker in the CAP source.
 *   - conditional: required only when applicable ("(required only if...)").
 *   - non-core: optional, marked with "+" in the CAP source.
 */

export type FieldTier = "core" | "conditional" | "non-core";

export type FieldInputType =
  | "single-select"
  | "multi-select"
  | "text"
  | "number"
  | "group"; // a labelled container of nested fields, no value of its own

export interface FieldOption {
  key: string;
  label: string;
  /** Free text this option unlocks, e.g. "(specify): ___" or "(explain): ___". */
  requiresText?: boolean;
  textLabel?: string;
  textUnit?: string;
  /** Fields shown only when this option is selected (e.g. a sub-scale under "Positive"). */
  children?: TemplateField[];
  /**
   * Some CAP protocols include "standardized comment" checklist options
   * that are full authored paragraphs, not just a label or
   * controlled-vocabulary term — out of bounds to copy verbatim under
   * Header G3. Options tagged here carry a short, in-house-written label
   * standing in for text that must be authored in-house or licensed
   * before clinical use, as part of the director-approval step.
   */
  needsInHouseAuthoring?: boolean;
}

export interface TemplateField {
  key: string;
  label: string;
  tier: FieldTier;
  type: FieldInputType;
  /** CAP explanatory-note reference this field maps to (e.g. "Note E") — a
   * traceability pointer only, never the note's prose (Header G3). */
  noteRef?: string;
  options?: FieldOption[];
  children?: TemplateField[]; // for type: "group"
  repeatable?: { max: number; unitLabel: string };
  /** Whether a "Cannot be determined (explain)" escape applies to this field. */
  cannotBeDetermined?: boolean;
  unit?: string;
}

export interface TemplateSection {
  key: string;
  title: string;
  fields: TemplateField[];
}

export interface ClassificationBinding {
  system: string; // "AJCC" | "WHO" | "ASCO/CAP Guideline" | ...
  edition: string; // "8th Edition" | "6th Edition" | "2018" | ...
}

export interface TemplateVersion {
  templateId: string;
  title: string;
  /** Clinical topic / organ-system grouping for the templates library
   * (e.g. "Breast", "Colorectal") — presentation/navigation only, not a
   * CAP concept. Add a new category string as new organ systems are
   * added; no fixed enum, so this scales without a type change. */
  category: string;
  /** The CAP protocol's own version string (their versioning, not ours). */
  sourceVersion: string;
  sourceProtocolName: string;
  /** CAP's posting date for this version — traceability only. */
  sourcePostingDate: string;
  classificationBindings: ClassificationBinding[];
  sections: TemplateSection[];
  approval: {
    status: "draft" | "pending_review" | "approved";
    approvedBy?: string;
    approvedAt?: string;
  };
}
