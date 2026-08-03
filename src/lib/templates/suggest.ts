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
  /** Which transcript words actually matched this template's title/section
   * titles — real, derived data for "why this was suggested" contextual
   * help (DL-044), never a fabricated explanation. */
  matchedWords: string[];
}

export function suggestTemplates(transcript: string): TemplateSuggestion[] {
  const transcriptWords = new Set(words(transcript));

  function scoreAndMatch(t: TemplateVersion): { score: number; matchedWords: string[] } {
    const candidateWords = words([t.title, ...t.sections.map((s) => s.title)].join(" "));
    const matched = new Set<string>();
    for (const w of candidateWords) {
      if (w.length > 3 && transcriptWords.has(w)) matched.add(w);
    }
    return { score: matched.size, matchedWords: [...matched] };
  }

  return templates
    .map((t) => {
      const { score, matchedWords } = scoreAndMatch(t);
      return { templateId: t.templateId, title: t.title, score, matchedWords };
    })
    .sort((a, b) => b.score - a.score);
}
