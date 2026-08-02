/**
 * X-PATH — template suggestion (M5)
 * ------------------------------------------------------------------
 * "Auto-suggest, human confirms" (Header §5) — with only a handful of
 * Phase-1 templates, a deterministic keyword-overlap score against each
 * template's title/section titles is enough to produce a sensible
 * shortlist; the pathologist always picks explicitly, so ranking
 * quality here is a convenience, not a safety boundary. No extra paid
 * AI call for something this cheap to approximate.
 */
import { templates } from ".";
import type { TemplateVersion } from "./types";

function words(s: string): string[] {
  return s.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

export interface TemplateSuggestion {
  templateId: string;
  title: string;
  score: number;
}

export function suggestTemplates(transcript: string): TemplateSuggestion[] {
  const transcriptWords = new Set(words(transcript));

  function score(t: TemplateVersion): number {
    const candidateWords = words([t.title, ...t.sections.map((s) => s.title)].join(" "));
    let hits = 0;
    for (const w of candidateWords) {
      if (w.length > 3 && transcriptWords.has(w)) hits++;
    }
    return hits;
  }

  return templates
    .map((t) => ({ templateId: t.templateId, title: t.title, score: score(t) }))
    .sort((a, b) => b.score - a.score);
}
