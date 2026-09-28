"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, ChevronRight } from "lucide-react";
import { ELEMENTS, ElementId, GLASS, normalizeElement } from "@/lib/design-tokens";

export interface FloatingTimerBarProps {
  /** Nome do ritual/tarefa em andamento, ex: "Ritual da Chama Interior" */
  ritualName: string;
  /** Elemento associado ao ritual */
  element?: ElementId | string;
  /** Tempo decorrido formatado, ex: "00:32:10" */
  elapsedLabel: string;
  isPaused?: boolean;
  onTogglePause?: () => void;
  onExpand?: () => void;
  visible?: boolean;
}

/**
 * Barra suspensa fixa (normalmente ancorada no topo ou rodapé da tela) que
 * mostra o ritual ativo sem ocupar o layout principal. Toque para expandir
 * o TimerFocusModal.
 */
export function FloatingTimerBar({
  ritualName,
  element,
  elapsedLabel,
  isPaused = false,
  onTogglePause,
  onExpand,
  visible = true,
}: FloatingTimerBarProps) {
  const normalizedElement = normalizeElement(element);
  const theme = ELEMENTS[normalizedElement] || ELEMENTS.fire;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onExpand?.();
          }}
          initial={{ y: -24, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -24, opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className={[
            "fixed bottom-[74px] left-1/2 -translate-x-1/2 z-30 group flex w-[calc(100%-24px)] max-w-sm items-center gap-3 rounded-2xl px-3 py-2 text-left cursor-pointer min-h-[44px]",
            GLASS.panel,
            GLASS.panelHover,
            "transition-colors shadow-lg border border-slate-200/50 dark:border-white/10",
          ].join(" ")}
        >
          {/* Núcleo elemental pulsante */}
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
            <span
              className={[
                "absolute inset-0 rounded-full opacity-70 blur-md",
                theme.gradientClass,
              ].join(" ")}
              style={{
                animation: isPaused ? "none" : "wizard-pulse 2.2s ease-in-out infinite",
              }}
            />
            <span
              className={[
                "relative h-3 w-3 rounded-full",
                theme.gradientClass,
              ].join(" ")}
            />
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-slate-800 dark:text-white">
              {ritualName}
            </p>
            <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-white/40">
              {theme.label}
            </p>
          </div>

          <span className="font-mono text-sm font-semibold tabular-nums text-slate-800 dark:text-white">
            {elapsedLabel}
          </span>

          <span
            role="button"
            aria-label={isPaused ? "Retomar ritual" : "Pausar ritual"}
            onClick={(e) => {
              e.stopPropagation();
              onTogglePause?.();
            }}
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] -my-2 shrink-0 items-center justify-center rounded-full text-slate-700 dark:text-white/80 transition-colors cursor-pointer"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20">
              {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            </span>
          </span>

          <span
            role="button"
            aria-label="Expandir cronômetro"
            onClick={(e) => {
              e.stopPropagation();
              onExpand?.();
            }}
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] -my-2 -mr-1 shrink-0 items-center justify-center rounded-full text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </span>

          <style jsx>{`
            @keyframes wizard-pulse {
              0%,
              100% {
                opacity: 0.45;
                transform: scale(1);
              }
              50% {
                opacity: 0.85;
                transform: scale(1.35);
              }
            }
          `}</style>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default FloatingTimerBar;
