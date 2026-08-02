import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        petrol: { DEFAULT: "#0E4B54", deep: "#08363D" },
        hema: "#6A3AA0",
        eosin: "#D5567E",
      },
    },
  },
  plugins: [],
} satisfies Config;
