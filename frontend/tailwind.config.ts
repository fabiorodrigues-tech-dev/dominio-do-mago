// frontend/tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./contexts/**/*.{js,ts,jsx,tsx,mdx}",
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
      },
    },
  },
  plugins: [],
};

export default config;