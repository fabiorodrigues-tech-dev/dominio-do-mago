"use client";

import { useMemo, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, X, Check, Sparkles } from "lucide-react";
import { ELEMENTS, ElementId, GLASS, normalizeElement } from "@/lib/design-tokens";

export interface TimerFocusModalProps {
  open: boolean;
  onClose: () => void;
  /** Nome do ritual pai, ex: "Domínio da Chama" */
  ritualName: string;
  /** Sub-tarefa em foco, ex: "Meditação da Aurora" */
  taskName: string;
  element?: ElementId | string;
  /** Segundos totais planejados para o ritual */
  totalSeconds: number;
  /** Segundos restantes (controla o preenchimento do anel) */
  remainingSeconds: number;
  isRunning: boolean;
  onTogglePlay: () => void;
  onFinish: () => void;
  onQuit: () => void;
}

function formatClock(totalSecondsAbs: number) {
  const h = Math.floor(totalSecondsAbs / 3600);
  const m = Math.floor((totalSecondsAbs % 3600) / 60);
  const s = Math.floor(totalSecondsAbs % 60);
  const pad = (v: number) => v.toString().padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

const RADIUS = 92;
const CIRCUMFERENCE = 2 * Math.PI * 92;

/**
 * Modal de foco em tela cheia (bottom-sheet em mobile). Réplica funcional
 * do padrão "Rasion Project / UI Design" do TimePad, com o vocabulário
 * visual do Domínio do Mago: anel arcano em vez de barra de progresso simples.
 */
export function TimerFocusModal({
  open,
  onClose,
  ritualName,
  taskName,
  element,
  totalSeconds,
  remainingSeconds,
  isRunning,
  onTogglePlay,
  onFinish,
  onQuit,
}: TimerFocusModalProps) {
  const normalizedElement = normalizeElement(element);
  const theme = ELEMENTS[normalizedElement] || ELEMENTS.fire;

  const progress = useMemo(() => {
    if (totalSeconds <= 0) return 0;
    return Math.min(1, Math.max(0, 1 - remainingSeconds / totalSeconds));
  }, [remainingSeconds, totalSeconds]);

  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 48, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={[
              "relative flex w-full max-w-sm flex-col items-center rounded-t-3xl p-6 pb-12 sm:pb-8 sm:rounded-3xl",
              "bg-[#0B0B14]/95 backdrop-blur-2xl border border-white/10",
              "shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)]",
            ].join(" ")}
          >
            <span className="mb-5 h-1 w-10 rounded-full bg-white/15 sm:hidden" />

            {/* Cabeçalho */}
            <div className="mb-6 flex w-full items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-white/40">
                  {taskName}
                </p>
                <h2 className="text-xl font-bold text-white">{ritualName}</h2>
              </div>
              <span
                className={[
                  "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                  theme.ringClass,
                ].join(" ")}
                style={{ color: theme.to }}
              >
                {theme.label}
              </span>
            </div>

            {/* Anel de progresso arcano */}
            <div className="relative mb-8 flex h-56 w-56 items-center justify-center">
              <svg
                viewBox="0 0 200 200"
                className="h-full w-full -rotate-90"
                style={{ filter: `drop-shadow(0 0 18px ${theme.to}55)` }}
              >
                <circle
                  cx="100"
                  cy="100"
                  r={RADIUS}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="10"
                />
                <defs>
                  <linearGradient id={`ring-${normalizedElement}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={theme.from} />
                    <stop offset="100%" stopColor={theme.to} />
                  </linearGradient>
                </defs>
                <motion.circle
                  cx="100"
                  cy="100"
                  r={RADIUS}
                  fill="none"
                  stroke={`url(#ring-${normalizedElement})`}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  initial={{ strokeDashoffset: CIRCUMFERENCE }}
                  animate={{ strokeDashoffset: dashOffset }}
                  transition={{ ease: "linear", duration: 0.9 }}
                />
              </svg>

              <div className="absolute flex flex-col items-center">
                <Sparkles className="mb-1 h-4 w-4 text-white/30" />
                <span className="font-mono text-4xl font-bold tabular-nums text-white">
                  {formatClock(remainingSeconds)}
                </span>
              </div>
            </div>

            {/* Controles */}
            {isRunning ? (
              <div className="flex items-center gap-6">
                <ControlButton
                  icon={<Pause className="h-5 w-5" />}
                  label="Pausar"
                  onClick={onTogglePlay}
                />
                <ControlButton
                  icon={<Check className="h-5 w-5 text-emerald-400" />}
                  label="Concluir"
                  onClick={onFinish}
                  emerald
                />
                <ControlButton
                  icon={<X className="h-5 w-5" />}
                  label="Abandonar"
                  onClick={onQuit}
                  muted
                />
              </div>
            ) : (
              <div className="flex w-full flex-col items-center gap-4">
                <button
                  type="button"
                  onClick={progress >= 1 ? onFinish : onTogglePlay}
                  className={[
                    "flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-white",
                    theme.gradientClass,
                    theme.glowClass,
                    "transition-transform active:scale-[0.98]",
                  ].join(" ")}
                >
                  {progress >= 1 ? (
                    <>
                      <Check className="h-4 w-4" /> Concluir Ritual
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" /> Retomar
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onQuit}
                  className="text-sm text-white/40 transition-colors hover:text-white/70"
                >
                  Abandonar
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="absolute right-3 top-3 flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ControlButton({
  icon,
  label,
  onClick,
  muted = false,
  emerald = false,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  muted?: boolean;
  emerald?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        className={[
          "flex h-14 w-14 items-center justify-center rounded-full transition-colors",
          muted
            ? "bg-white/5 text-white/60 hover:bg-white/10"
            : emerald 
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
              : "bg-white/10 text-white hover:bg-white/20",
          !emerald && GLASS.pill,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {icon}
      </button>
      <span className="text-xs text-white/50">{label}</span>
    </div>
  );
}

export default TimerFocusModal;
