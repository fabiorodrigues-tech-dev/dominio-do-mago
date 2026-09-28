// frontend/tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./contexts/**/*.{js,ts,jsx,tsx,mdx}",
    "./analytics/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas-bg)",
        fg: {
          primary: "var(--fg-primary)",
          secondary: "var(--fg-secondary)",
          tertiary: "var(--fg-tertiary)",
        },
        container: {
          bg: "var(--container-bg)",
          border: "var(--container-border)",
          divider: "var(--container-divider)",
        },
        btn: {
          primary: "var(--btn-primary)",
          hover: "var(--btn-hover)",
          foreground: "var(--btn-foreground)",
        },
        fire: { 900: "#D14900", 500: "#FF6B35" },
        earth: { 900: "#3E5F44", 500: "#4CAF50" },
        water: { 900: "#1B4965", 500: "#48CAE4" },
        air: { 900: "#219EBC", 500: "#A8DADC" },
        arcane: {
          bg: "#0B0B14",
        },
      },
      backdropBlur: {
        xs: "2px",
        "40": "40px",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        premium: "0 8px 32px 0 rgba(0, 0, 0, 0.15)",
        glass: "0 8px 32px -8px rgba(0,0,0,0.6)",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;