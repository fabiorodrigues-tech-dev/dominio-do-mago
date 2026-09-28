"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Flame, Mountain, Droplets, Wind, Lock, Sparkles, Pencil, Trophy } from "lucide-react";
import {
  ELEMENT_ORDER,
  ELEMENTS,
  ElementId,
  GLASS_ADAPTIVE as G,
} from "@/lib/design-tokens";

const ELEMENT_ICONS: Record<ElementId, typeof Flame> = {
  fire: Flame,
  earth: Mountain,
  water: Droplets,
  air: Wind,
};

export interface ArcaneBadge {
  id: string;
  element?: ElementId;
  /** true = ainda não desbloqueado */
  locked?: boolean;
}

export interface WeeklyBar {
  /** rótulo curto, ex: "Seg" */
  label: string;
  /** 0–100 */
  value: number;
  element: ElementId;
}

export interface ArcaneProfileStatsProps {
  name: string;
  avatarUrl?: string;
  level: number;
  xpCurrent: number;
  xpNext: number;
  points: number;
  worldRank: number;
  localRank: number;
  badges: ArcaneBadge[];
  ritualsThisMonth: number;
  ritualsGoal: number;
  grimoiresCreated: number;
  ritualsWon: number;
  weeklyPerformance: WeeklyBar[];
}

/**
 * Tela/cartão de perfil do Domínio do Mago — reinterpreta o header de perfil
 * e a aba "Stats" do Queezy: avatar central com aura de nível, conquistas
 * como badges elementais translúcidos com glow, cartão de progresso mensal
 * (anel SVG) e um mini-gráfico de barras semanal sem libs externas.
 */
export function ArcaneProfileStats({
  name,
  avatarUrl,
  level,
  xpCurrent,
  xpNext,
  points,
  worldRank,
  localRank,
  badges,
  ritualsThisMonth,
  ritualsGoal,
  grimoiresCreated,
  ritualsWon,
  weeklyPerformance,
}: ArcaneProfileStatsProps) {
  const xpPct = Math.min(100, Math.round((xpCurrent / xpNext) * 100));
  const goalPct = Math.min(100, Math.round((ritualsThisMonth / ritualsGoal) * 100));
  const RADIUS = 54;
  const CIRC = 2 * Math.PI * RADIUS;

  return (
    <div className={["min-h-screen w-full pb-32", G.page].join(" ")}>
      <div className="mx-auto flex max-w-sm flex-col items-center px-4 pb-32 pt-10">
        {/* Avatar + nível */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative mb-4"
        >
          <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-indigo-400 to-fuchsia-500 p-[3px] shadow-[0_0_40px_-6px_rgba(129,90,255,0.6)]">
            <div className="h-full w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[#12121e]">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-400 dark:text-white/30">
                  {name.charAt(0)}
                </div>
              )}
            </div>
          </div>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-bold text-indigo-600 shadow-sm dark:border-white/10 dark:bg-[#0B0B14] dark:text-indigo-300">
            Nível {level}
          </span>
        </motion.div>

        <h2 className={["mb-1 text-xl font-bold", G.textPrimary].join(" ")}>{name}</h2>

        {/* Barra de XP */}
        <div className="mb-6 w-full max-w-[220px]">
          <div className="mb-1 flex justify-between text-[11px]">
            <span className={G.textMuted}>XP</span>
            <span className={G.textMuted}>
              {xpCurrent}/{xpNext}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-fuchsia-500"
              initial={{ width: 0 }}
              animate={{ width: `${xpPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Pontos / Ranks */}
        <div
          className={[
            "mb-6 grid w-full grid-cols-3 divide-x rounded-2xl p-4 text-center",
            G.panel,
            "divide-slate-200 dark:divide-white/10",
          ].join(" ")}
        >
          <StatCell label="Prana" value={points.toLocaleString("pt-BR")} icon={<Sparkles className="h-3.5 w-3.5" />} />
          <StatCell label="Rank Global" value={`#${worldRank.toLocaleString("pt-BR")}`} icon={<Trophy className="h-3.5 w-3.5" />} />
          <StatCell label="Rank Local" value={`#${localRank}`} icon={<Trophy className="h-3.5 w-3.5" />} />
        </div>

        {/* Conquistas elementais */}
        <div className="mb-6 w-full">
          <h3 className={["mb-3 text-sm font-semibold", G.textPrimary].join(" ")}>
            Conquistas
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {badges.map((badge, i) => (
              <BadgeCircle key={badge.id} badge={badge} index={i} />
            ))}
          </div>
        </div>

        {/* Progresso mensal + mini stats */}
        <div className="mb-6 w-full">
          <div className={["rounded-2xl p-5", G.panel].join(" ")}>
            <p className={["mb-4 text-sm", G.textPrimary].join(" ")}>
              Você concluiu{" "}
              <span className="font-bold text-indigo-500 dark:text-indigo-300">
                {ritualsThisMonth} rituais
              </span>{" "}
              este mês!
            </p>

            <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center">
              <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r={RADIUS}
                  fill="none"
                  strokeWidth="10"
                  className="stroke-slate-200 dark:stroke-white/10"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r={RADIUS}
                  fill="none"
                  stroke="url(#profile-ring)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  initial={{ strokeDashoffset: CIRC }}
                  animate={{ strokeDashoffset: CIRC * (1 - goalPct / 100) }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="profile-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7C6CF7" />
                    <stop offset="100%" stopColor="#D946EF" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className={["text-2xl font-bold", G.textPrimary].join(" ")}>
                  {ritualsThisMonth}
                  <span className="text-sm font-medium text-slate-400 dark:text-white/40">
                    /{ritualsGoal}
                  </span>
                </span>
                <span className={["text-[11px]", G.textMuted].join(" ")}>rituais/meta</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MiniStat
                value={grimoiresCreated}
                label="Grimórios Criados"
                icon={<Pencil className="h-3.5 w-3.5" />}
              />
              <MiniStat
                value={ritualsWon}
                label="Rituais Vencidos"
                icon={<Trophy className="h-3.5 w-3.5" />}
                highlighted
              />
            </div>
          </div>
        </div>

        {/* Gráfico de barras semanal */}
        <div className="w-full">
          <h3 className={["mb-3 text-sm font-semibold", G.textPrimary].join(" ")}>
            Desempenho da Semana
          </h3>
          <div className={["flex items-end justify-between gap-2 rounded-2xl p-4 pt-8", G.panel].join(" ")}>
            {weeklyPerformance.map((bar, i) => {
              const theme = ELEMENTS[bar.element];
              return (
                <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-28 w-full items-end justify-center rounded-lg bg-slate-100 dark:bg-white/[0.03]">
                    <motion.div
                      className={["w-3/5 rounded-t-md", theme.gradientClass].join(" ")}
                      initial={{ height: 0 }}
                      animate={{ height: `${bar.value}%` }}
                      transition={{ duration: 0.6, delay: i * 0.06, ease: "easeOut" }}
                    />
                  </div>
                  <span className={["text-[10px]", G.textMuted].join(" ")}>{bar.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCell({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1 px-1 first:pl-0 last:pr-0">
      <span className="text-indigo-500 dark:text-indigo-300">{icon}</span>
      <span className={["text-base font-bold", G.textPrimary].join(" ")}>{value}</span>
      <span className={["text-[10px] uppercase tracking-wide", G.textMuted].join(" ")}>
        {label}
      </span>
    </div>
  );
}

function BadgeCircle({ badge, index }: { badge: ArcaneBadge; index: number }) {
  const theme = badge.element ? ELEMENTS[badge.element] : null;
  const Icon = badge.element ? ELEMENT_ICONS[badge.element] : Lock;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="flex flex-col items-center gap-1.5"
    >
      <div
        className={[
          "flex h-16 w-16 items-center justify-center rounded-full",
          badge.locked
            ? "bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10"
            : `${theme?.gradientClass} ${theme?.glowClass}`,
        ].join(" ")}
      >
        <Icon
          className={["h-6 w-6", badge.locked ? "text-slate-400 dark:text-white/30" : "text-white"].join(" ")}
        />
      </div>
      <span className={["text-[10px]", G.textFaint].join(" ")}>
        {badge.locked ? "Bloqueado" : theme?.label}
      </span>
    </motion.div>
  );
}

function MiniStat({
  value,
  label,
  icon,
  highlighted = false,
}: {
  value: number;
  label: string;
  icon: ReactNode;
  highlighted?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-xl border p-3",
        highlighted
          ? "border-transparent bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white"
          : `${G.divider} bg-white/60 dark:bg-white/[0.02] ${G.textPrimary}`,
      ].join(" ")}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="text-lg font-bold">{value}</span>
        <span className={highlighted ? "text-white/80" : "text-slate-400 dark:text-white/30"}>
          {icon}
        </span>
      </div>
      <span className={["text-[11px]", highlighted ? "text-white/80" : G.textMuted].join(" ")}>
        {label}
      </span>
    </div>
  );
}

export default ArcaneProfileStats;
