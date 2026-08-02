/**
 * X-PATH — reflex/ancillary engine (M5)
 * ------------------------------------------------------------------
 * Advisory only (Header G1) — never auto-orders anything, only suggests.
 * The reflex engine may only ever suggest tests/stains/antibodies on
 * X.PATH's real 38-antibody register (XPATH_handover.md §12); anything
 * off-list routes to referral (not yet built — Phase 1 has one reflex
 * rule, HER2, per the roadmap's "build first" instruction).
 *
 * HER2 IHC -> Dual-ISH reflex (handover §13): IHC score 2+ (Equivocal)
 * reflexes to Ventana HER2 Dual ISH, fully in-house, no send-out.
 * Catalogue numbers are Roche's own public product references (not CAP
 * copyrighted text) — factual equipment data for X.PATH's actual
 * in-house Ventana BenchMark ULTRA setup.
 */
export interface ReflexSuggestion {
  title: string;
  detail: string;
  triggerPath: string;
}

type FieldValues = Record<string, string | string[]>;

function pathEndsWith(path: string, suffix: string): boolean {
  return path === suffix || path.endsWith(`.${suffix}`);
}

export function computeReflexSuggestions(templateId: string, values: FieldValues): ReflexSuggestion[] {
  const suggestions: ReflexSuggestion[] = [];

  if (templateId === "breast-biomarker") {
    for (const [path, value] of Object.entries(values)) {
      if (!pathEndsWith(path, "her2-ihc-status.result")) continue;
      if (value !== "equivocal-2-plus") continue;

      suggestions.push({
        title: "Reflex: HER2 Dual-ISH indicated",
        detail:
          "HER2 IHC scored Equivocal (2+). In-house reflex: Ventana HER2 Dual ISH " +
          "(DNA Probe Cocktail 08314373001; SISH DNP + Red ISH DIG detection " +
          "08318883001/08318832001; 3-in-1 xenograft controls 05640300001). " +
          "Report HER2/CEP17 ratio + copy number for an integrated final HER2 " +
          "status. No send-out. Advisory only — the pathologist orders.",
        triggerPath: path,
      });
    }
  }

  return suggestions;
}
