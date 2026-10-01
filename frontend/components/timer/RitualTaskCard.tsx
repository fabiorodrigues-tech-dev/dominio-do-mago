"use client";

import { motion } from "framer-motion";
import { Play, Flame, Mountain, Droplets, Wind, Check } from "lucide-react";
import { ELEMENTS, ElementId, GLASS, normalizeElement } from "@/lib/design-tokens";

const ELEMENT_ICONS: Record<ElementId, typeof Flame> = {
  fire: Flame,
  earth: Mountain,
  water: Droplets,
  air: Wind,
};

export interface RitualTaskCardProps {
  title: string;
  /** Categoria/tags secundárias, ex: ["Trabalho", "Torre Arcana"] */
  tags?: string[];
  element?: ElementId | string;
  /** Duração estimada, formatada, ex: "00:42:21" */
  estimatedLabel: string;
  onStart?: () => void;
  /** Marca o card como concluído (aplica opacidade e substitui o botão) */
  completed?: boolean;
  onToggle?: () => void;
}

/**
 * Cartão de ritual/tarefa da lista "Hoje". Réplica do item de lista do
 * TimePad (ícone circular + título + tags + duração + play), com acabamento
 * de vidro e cor derivada do elemento.
 */
export function RitualTaskCard({
  title,
  tags = [],
  element,
  estimatedLabel,
  onStart,
  completed = false,
  onToggle,
}: RitualTaskCardProps) {
  const normalizedElement = normalizeElement(element);
  const theme = ELEMENTS[normalizedElement] || ELEMENTS.fire;
  const Icon = ELEMENT_ICONS[normalizedElement] || ELEMENT_ICONS.fire;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={[
        "flex items-center gap-3.5 rounded-2xl p-3.5 transition-all",
        "bg-white/60 dark:bg-[#0B0B10]/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none",
        completed ? "opacity-50" : "",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onToggle}
        className={[
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all cursor-pointer",
          completed ? "bg-emerald-500 text-white" : `${theme.gradientClass} ${theme.glowClass} text-white`
        ].join(" ")}
      >
        {completed ? <Check className="h-5 w-5" strokeWidth={3} /> : <Icon className="h-5 w-5" strokeWidth={2} />}
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800 dark:text-white">{title}</p>
        {tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[11px] text-slate-700 dark:text-white/70"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="font-mono text-[13px] tabular-nums text-slate-500 dark:text-white/50">
          {estimatedLabel}
        </span>
        {!completed && (
          <button
            type="button"
            onClick={onStart}
            aria-label={`Iniciar ${title}`}
            className="min-h-[44px] min-w-[44px] -m-2 p-2 flex items-center justify-center cursor-pointer"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full transition-colors bg-slate-150 hover:bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white">
              <Play className="h-4 w-4" fill="currentColor" />
            </span>
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default RitualTaskCard;
