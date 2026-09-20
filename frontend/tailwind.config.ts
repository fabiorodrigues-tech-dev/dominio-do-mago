import type { Config } from "tailwindcss";
import fs from 'fs';
import path from 'path';

let designTokens: any = { colors: {}, shadows: {} };
try {
  const tokensPath = path.resolve(process.cwd(), './styles/design-tokens.json');
  if (fs.existsSync(tokensPath)) {
    designTokens = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
  }
} catch (e) {
  console.warn("Could not load design-tokens.json, using fallback.");
}

const fallbackColors = {
  "mesh-dark": "radial-gradient(at 0% 0%, rgba(45,27,105,1) 0%, transparent 50%), radial-gradient(at 100% 100%, rgba(26,41,128,1) 0%, transparent 50%), radial-gradient(at 50% 50%, rgba(139,92,246,0.15) 0%, transparent 60%), #09090b",
  "mesh-light": "radial-gradient(at 0% 0%, rgba(240,249,255,1) 0%, transparent 50%), radial-gradient(at 100% 100%, rgba(224,231,255,1) 0%, transparent 50%), #ffffff",
  "glass-border-dark": "rgba(255, 255, 255, 0.1)",
  "glass-border-light": "rgba(255, 255, 255, 0.45)",
  "glass-bg-dark": "rgba(255, 255, 255, 0.03)",
  "glass-bg-light": "rgba(255, 255, 255, 0.4)"
};

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./providers/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'mesh-dark': designTokens?.colors?.['mesh-dark'] || fallbackColors['mesh-dark'],
        'mesh-light': designTokens?.colors?.['mesh-light'] || fallbackColors['mesh-light'],
        'glass-border-dark': designTokens?.colors?.['glass-border-dark'] || fallbackColors['glass-border-dark'],
        'glass-border-light': designTokens?.colors?.['glass-border-light'] || fallbackColors['glass-border-light'],
        'glass-bg-dark': designTokens?.colors?.['glass-bg-dark'] || fallbackColors['glass-bg-dark'],
        'glass-bg-light': designTokens?.colors?.['glass-bg-light'] || fallbackColors['glass-bg-light'],
        'mesh-purple': '#2D1B69',
        'mesh-blue': '#1A2980',
        'mesh-deep': '#09090C',
        'platinum': 'rgba(255, 255, 255, 0.60)',
      },
      boxShadow: {
        'glass-shadow': designTokens?.shadows?.['glass-dark'] || '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-inset': 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
        'neon-purple': designTokens?.shadows?.['neon-purple'] || '0 0 25px -5px rgba(168, 85, 247, 0.5)',
        'neon-cyan': designTokens?.shadows?.['neon-cyan'] || '0 0 25px -5px rgba(6, 182, 212, 0.5)',
        'neon-rose': designTokens?.shadows?.['neon-rose'] || '0 0 25px -5px rgba(244, 63, 94, 0.5)',
      },
      borderColor: {
        'glass': 'rgba(255, 255, 255, 0.08)',
        'glass-active': 'rgba(168, 85, 247, 0.35)',
      },
      backgroundImage: {
        'aurora-mesh': 'radial-gradient(at 0% 0%, rgba(45, 27, 105, 0.5) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(26, 41, 128, 0.35) 0px, transparent 50%), radial-gradient(at 50% 50%, rgba(74, 14, 78, 0.25) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(15, 15, 19, 0.95) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(45, 27, 105, 0.4) 0px, transparent 50%)',
      },
      animation: {
        'aurora-pulse': 'aurora-pulse 8s ease-in-out infinite alternate',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite alternate',
      },
      keyframes: {
        'aurora-pulse': {
          '0%': { opacity: '0.4', transform: 'scale(1) translate(0, 0)' },
          '100%': { opacity: '0.7', transform: 'scale(1.05) translate(-10px, 10px)' },
        },
        'glow-pulse': {
          '0%': { opacity: '0.3' },
          '100%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
