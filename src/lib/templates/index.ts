/**
 * X-PATH — Template registry (M3)
 * Phase-1 templates only (Header G4) — do not add organ systems beyond
 * what the roadmap names for this milestone.
 */
import { breastInvasiveResection } from "./data/breast-invasive-resection";
import { breastBiomarker } from "./data/breast-biomarker";
import type { TemplateVersion } from "./types";

export const templates: TemplateVersion[] = [breastInvasiveResection, breastBiomarker];

export function getTemplate(templateId: string): TemplateVersion | undefined {
  return templates.find((t) => t.templateId === templateId);
}

export type { TemplateVersion, TemplateSection, TemplateField, FieldOption, FieldTier } from "./types";
