import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        petrol: { DEFAULT: "#0E4B54", deep: "#08363D" },
        hema: "#6A3AA0",
        eosin: "#D5567E",
        // Semantic "normal/complete" (North-Star §2) — additive only.
        // Existing amber/red usages (CONDITIONAL badge, error states) stay
        // on Tailwind's default palette; not touched by this token.
        mint: "#1F9E82",
        // Per-CAP-category accent palette (design polish pass, DL-051) —
        // pure visual category identity for Templates/Workspace, kept
        // deliberately separate from the semantic tokens above so a
        // category color is never confused with a meaningful system state
        // (petrol=brand chrome, hema=AI-generated marker, mint=complete,
        // amber/red=attention/critical). One fixed color per category,
        // not cycled — see src/lib/templates/category-colors.ts.
        categoryRose: "#D5567E",
        categoryAmber: "#B4732E",
        categoryIndigo: "#3F5FA0",
        categoryViolet: "#7A4FB0",
        categoryOlive: "#8A7B3F",
      },
    },
  },
  plugins: [],
} satisfies Config;
