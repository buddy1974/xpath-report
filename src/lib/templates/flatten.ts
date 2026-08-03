/**
 * X-PATH — template flattening (M5)
 * ------------------------------------------------------------------
 * Walks a TemplateVersion's nested sections/fields/children into a flat
 * list of addressable leaf fields, each with a stable dotted "path"
 * (e.g. "specimen.procedure", "tumor.tumor-characteristics.histologic-type").
 * This is what the structuring engine (lib/structuring.ts) offers to the
 * LLM as the fillable surface, and what it validates the LLM's response
 * against — a path/option the LLM invents that isn't in this list is
 * rejected, not trusted (Header G8: never fabricate).
 *
 * Repeatable blocks (e.g. Tumor Characteristics, up to 5x) are flattened
 * as a single instance for M5 — auto-filling multiple repeats from one
 * dictation is a real UX design question (which repeat does a given
 * sentence belong to?) deferred past M5's minimum scope. Logged in
 * docs/known-risks.md, not silently assumed away.
 */
import type { TemplateField, TemplateVersion, FieldTier } from "./types";

export interface FlatField {
  path: string;
  label: string;
  tier: FieldTier;
  type: "single-select" | "multi-select" | "text" | "number";
  options?: { key: string; label: string }[];
  sectionTitle: string;
  /** Unit suffix for numeric values (e.g. "mm", "%") — presentation only. */
  unit?: string;
}

export function flattenTemplate(template: TemplateVersion): FlatField[] {
  const out: FlatField[] = [];

  function walk(field: TemplateField, pathPrefix: string, sectionTitle: string) {
    const path = `${pathPrefix}.${field.key}`;

    if (field.type !== "group") {
      const options = field.options?.map((o) => ({ key: o.key, label: o.label }));
      // "Cannot be determined (explain)" was dropped by flattening entirely
      // until this fix — meaning neither the structuring engine nor a
      // review/edit form built on this list could express it, even though
      // it's a real, meaningful answer (Header G8: missing information is
      // flagged, never filled — "I don't know" is a valid, honest value,
      // not something to just leave blank). Modeled as a synthetic option
      // + its own companion explain-text field, same mechanism as
      // `requiresText` below.
      const allOptions = field.cannotBeDetermined
        ? [...(options ?? []), { key: "__cannot_determined__", label: "Cannot be determined (explain)" }]
        : options;

      out.push({
        path,
        label: field.label,
        tier: field.tier,
        type: field.type,
        options: allOptions,
        sectionTitle,
        unit: field.unit,
      });

      if (field.cannotBeDetermined) {
        out.push({
          path: `${path}.__cannot_determined__.text`,
          label: `${field.label} — explain why it cannot be determined`,
          tier: field.tier,
          type: "text",
          sectionTitle,
        });
      }
    }

    // Fields directly on the field (e.g. group children, or option children)
    for (const child of field.children ?? []) {
      walk(child, path, sectionTitle);
    }
    for (const opt of field.options ?? []) {
      // Options like "Specify percentage: ___" carry an inline text/number
      // value alongside the choice itself. Without a distinct path for
      // that value, the structuring engine could only record THAT a
      // number was given, not WHAT it was — e.g. "90% ER positivity"
      // would collapse to just "the specify option was chosen". Give it
      // its own addressable field.
      if (opt.requiresText) {
        out.push({
          path: `${path}.${opt.key}.text`,
          label: `${field.label} — ${opt.textLabel ?? opt.label}`,
          tier: field.tier,
          type: opt.textUnit === "%" || opt.textUnit === "mm" ? "number" : "text",
          sectionTitle,
        });
      }
      for (const child of opt.children ?? []) {
        walk(child, `${path}.${opt.key}`, sectionTitle);
      }
    }
  }

  for (const section of template.sections) {
    for (const field of section.fields) {
      walk(field, section.key, section.title);
    }
  }

  return out;
}
