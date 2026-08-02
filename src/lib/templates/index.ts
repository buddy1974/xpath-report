/**
 * X-PATH — Template registry (M3, extended M5)
 * Phase-1 templates only (Header G4) — do not add organ systems beyond
 * what the roadmap names for these milestones. This is the full
 * Phase-1 set from the roadmap's M3/M5 template schedule: Breast
 * (Invasive Resection + Biomarker), Colon & Rectum, Prostate Needle
 * Biopsy, Lymphoma (Basic), and CUP (no CAP source — generic fallback
 * pattern, Header §5).
 */
import { breastInvasiveResection } from "./data/breast-invasive-resection";
import { breastBiomarker } from "./data/breast-biomarker";
import { colorectalResection } from "./data/colorectal-resection";
import { prostateNeedleBiopsy } from "./data/prostate-needle-biopsy";
import { lymphomaBasic } from "./data/lymphoma-basic";
import { cup } from "./data/cup";
import type { TemplateVersion } from "./types";

export const templates: TemplateVersion[] = [
  breastInvasiveResection,
  breastBiomarker,
  colorectalResection,
  prostateNeedleBiopsy,
  lymphomaBasic,
  cup,
];

export function getTemplate(templateId: string): TemplateVersion | undefined {
  return templates.find((t) => t.templateId === templateId);
}

export type { TemplateVersion, TemplateSection, TemplateField, FieldOption, FieldTier } from "./types";
