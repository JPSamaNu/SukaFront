// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ["class", '[class~="theme-pokedex-dark"]'], // usar clase para dark
  theme: {
    extend: {
      colors: {
        brand:   "var(--brand)",
        primary: "var(--primary)",
        accent:  "var(--accent)",
        text:    "var(--text)",
        muted:   "var(--muted)",
        surface: "var(--surface)",
        surface2:"var(--surface-2)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger:  "var(--danger)"
      },
      borderRadius: {
        xl: "var(--radius)"
      },
      boxShadow: {
        smsoft: "var(--shadow-sm)",
        soft:   "var(--shadow)"
      }
    }
  },
  plugins: []
} satisfies Config;