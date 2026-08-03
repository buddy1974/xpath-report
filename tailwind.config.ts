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
      },
    },
  },
  plugins: [],
} satisfies Config;
