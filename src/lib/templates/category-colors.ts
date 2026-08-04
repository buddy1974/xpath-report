/**
 * X-PATH — fixed per-category accent color (DL-051, design polish pass).
 * ------------------------------------------------------------------
 * Replaces the earlier cyclic accentFor() (Templates page, DL-043) —
 * that assigned colors by iteration order, so the same category could
 * get a different color depending on what else was registered, and
 * only 3 colors existed to cycle through. This is a fixed, stable
 * mapping instead: purely visual category identity, one color per
 * category, decoupled from the app's semantic tokens (see
 * tailwind.config.ts's comment on categoryRose/Amber/Indigo/Violet/Olive).
 *
 * Add a new template in a new category → add one line here. Falls back
 * to `petrol` for an unmapped category rather than crashing, so a
 * missed update here is a cosmetic gap, not a broken page.
 */
export const CATEGORY_ACCENT: Record<string, string> = {
  Breast: "categoryRose",
  Colorectal: "categoryAmber",
  Prostate: "categoryIndigo",
  "Lymphoma / Hematologic": "categoryViolet",
  "Carcinoma of Unknown Primary (CUP)": "categoryOlive",
};

export function accentForCategory(category: string): string {
  return CATEGORY_ACCENT[category] ?? "petrol";
}
