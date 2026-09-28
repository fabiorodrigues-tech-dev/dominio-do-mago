/**
 * Tokens do "Domínio do Mago"
 * Paleta dos 4 elementos + presets de vidro (glassmorphism) no estilo DesignCode.
 * Importe ELEMENTS para alimentar qualquer componente que precise variar por elemento.
 */

export type ElementId = "fire" | "earth" | "water" | "air";

export interface ElementTheme {
  id: ElementId;
  label: string;
  /** cor base (900/dark) -> cor de destaque (400/bright), usada em gradientes */
  from: string;
  to: string;
  /** cor sólida para textos/ícones sobre fundo escuro */
  solid: string;
  /** classe Tailwind pronta para bg-gradient-to-br */
  gradientClass: string;
  /** sombra de brilho (glow) correspondente ao elemento */
  glowClass: string;
  /** anel de foco / borda de destaque */
  ringClass: string;
}

export const ELEMENTS: Record<ElementId, ElementTheme> = {
  fire: {
    id: "fire",
    label: "Fogo",
    from: "#D14900",
    to: "#FF6B35",
    solid: "#FF6B35",
    gradientClass: "bg-gradient-to-br from-[#D14900] to-[#FF6B35]",
    glowClass: "shadow-[0_0_32px_-4px_rgba(255,107,53,0.55)]",
    ringClass: "ring-1 ring-[#FF6B35]/40",
  },
  earth: {
    id: "earth",
    label: "Terra",
    from: "#3E5F44",
    to: "#4CAF50",
    solid: "#4CAF50",
    gradientClass: "bg-gradient-to-br from-[#3E5F44] to-[#4CAF50]",
    glowClass: "shadow-[0_0_32px_-4px_rgba(76,175,80,0.5)]",
    ringClass: "ring-1 ring-[#4CAF50]/40",
  },
  water: {
    id: "water",
    label: "Água",
    from: "#1B4965",
    to: "#48CAE4",
    solid: "#48CAE4",
    gradientClass: "bg-gradient-to-br from-[#1B4965] to-[#48CAE4]",
    glowClass: "shadow-[0_0_32px_-4px_rgba(72,202,228,0.5)]",
    ringClass: "ring-1 ring-[#48CAE4]/40",
  },
  air: {
    id: "air",
    label: "Ar",
    from: "#219EBC",
    to: "#A8DADC",
    solid: "#A8DADC",
    gradientClass: "bg-gradient-to-br from-[#219EBC] to-[#A8DADC]",
    glowClass: "shadow-[0_0_32px_-4px_rgba(168,218,220,0.45)]",
    ringClass: "ring-1 ring-[#A8DADC]/40",
  },
};

export const ELEMENT_ORDER: ElementId[] = ["fire", "earth", "water", "air"];

export function normalizeElement(el?: string | ElementId): ElementId {
  if (!el) return 'fire';
  const normalized = el.toLowerCase() as ElementId;
  return ELEMENTS[normalized] ? normalized : 'fire';
}

/** Presets de superfície de vidro, reaproveitados por todos os componentes. */
export const GLASS = {
  panel:
    "bg-white/60 dark:bg-[#0B0B10]/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none",
  panelHover: "hover:bg-white/80 dark:hover:bg-[#0B0B10]/60 hover:border-white/60 dark:hover:border-white/20",
  pill: "bg-white/60 dark:bg-[#0B0B10]/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-sm dark:shadow-none",
  divider: "border-white/40 dark:border-white/10",
} as const;

/**
 * Variante adaptativa (suporta light + dark) dos presets de vidro.
 * Usada nos componentes que precisam funcionar em ambos os temas
 * (ex: ArcaneProfileStats, ArcaneLeaderboard). O fundo escuro puro
 * (bg-arcane-bg / bg-[#0B0B14]) continua reservado às telas full-bleed
 * como o TimerFocusModal.
 */
export const GLASS_ADAPTIVE = {
  page: "bg-slate-50 dark:bg-[#0B0B14]",
  panel:
    "bg-white/60 dark:bg-[#0B0B10]/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none",
  panelHover:
    "hover:bg-white/80 dark:hover:bg-[#0B0B10]/60 hover:border-white/60 dark:hover:border-white/20",
  pill:
    "bg-white/60 dark:bg-[#0B0B10]/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-sm dark:shadow-none",
  pillActive: "bg-slate-900 text-white dark:bg-white/15 dark:text-white",
  textPrimary: "text-slate-800 dark:text-white",
  textMuted: "text-slate-500 dark:text-white/40",
  textFaint: "text-slate-400 dark:text-white/30",
  divider: "border-white/40 dark:border-white/10",
} as const;
