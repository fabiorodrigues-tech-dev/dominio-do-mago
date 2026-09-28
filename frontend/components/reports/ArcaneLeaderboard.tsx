"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, ChevronLeft, ChevronRight } from "lucide-react";
import { ELEMENTS, ElementId, GLASS_ADAPTIVE as G } from "@/lib/design-tokens";

export type LeaderboardPeriod = "day" | "week" | "all";

export interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  avatarUrl?: string;
  /** elemento usado para colorir a aura do avatar */
  element: ElementId;
  /** bandeira/emoji de região, opcional */
  flag?: string;
  isCurrentUser?: boolean;
}

export interface ArcaneLeaderboardProps {
  period: LeaderboardPeriod;
  onPeriodChange: (period: LeaderboardPeriod) => void;
  /** os 3 primeiros colocados, já ordenados [1º, 2º, 3º] */
  podium: [LeaderboardEntry, LeaderboardEntry, LeaderboardEntry];
  /** demais colocados, a partir do 4º lugar */
  rest: LeaderboardEntry[];
  /** ex: "Você está à frente de 60% dos outros magos" */
  standingMessage?: string;
  currentUserRank?: number;
}

const PERIOD_LABEL: Record<LeaderboardPeriod, string> = {
  day: "Dia",
  week: "Semana",
  all: "Todos os Tempos",
};

/**
 * Réplica arcana do leaderboard do Queezy: pódio top-3 com auras elementais
 * no lugar de coroas planas, e lista rolável de pílulas de vidro para o
 * restante do ranking. Totalmente mobile-first, com toque mínimo de 44px e pb-32.
 */
export function ArcaneLeaderboard({
  period,
  onPeriodChange,
  podium,
  rest,
  standingMessage,
  currentUserRank,
}: ArcaneLeaderboardProps) {
  const [first, second, third] = podium;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(rest.length / itemsPerPage));
  const paginatedRest = rest.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className={["min-h-screen w-full pb-32", G.page].join(" ")}>
      <div className="mx-auto flex max-w-sm flex-col px-4 pb-32 pt-8">
        <h1 className={["mb-5 text-center text-2xl font-bold", G.textPrimary].join(" ")}>
          Ranking dos Magos
        </h1>

        {/* Toggle de período com touch target confortável (min-h-[44px]) */}
        <div className={["mb-5 flex rounded-full p-1", G.pill].join(" ")}>
          {(["day", "week", "all"] as LeaderboardPeriod[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPeriodChange(p)}
              className={[
                "min-h-[44px] min-w-[44px] flex-1 rounded-full px-2 text-[13px] font-semibold transition-colors flex items-center justify-center cursor-pointer",
                period === p ? G.pillActive : `${G.textMuted} hover:text-slate-700 dark:hover:text-white/70`,
              ].join(" ")}
            >
              {PERIOD_LABEL[p]}
            </button>
          ))}
        </div>

        {/* Faixa de posição atual */}
        {standingMessage && currentUserRank && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-4 text-white shadow-[0_10px_30px_-10px_rgba(249,115,22,0.6)]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/25 text-lg font-extrabold">
              #{currentUserRank}
            </span>
            <p className="text-sm font-medium leading-snug">{standingMessage}</p>
          </motion.div>
        )}

        {/* Pódio */}
        <div className="mb-8 flex items-end justify-center gap-3">
          <PodiumSlot entry={second} place={2} heightClass="h-24" />
          <PodiumSlot entry={first} place={1} heightClass="h-32" crown />
          <PodiumSlot entry={third} place={3} heightClass="h-20" />
        </div>

        {/* Lista dos demais */}
        <div className="flex flex-col gap-3">
          {paginatedRest.map((entry, i) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className={[
                "flex min-h-[48px] items-center gap-3 rounded-2xl p-3",
                G.panel,
                G.panelHover,
                entry.isCurrentUser ? "ring-2 ring-indigo-400/60" : "",
              ].join(" ")}
            >
              <span className={["w-6 text-center text-sm font-semibold", G.textMuted].join(" ")}>
                {entry.rank}
              </span>
              <Avatar entry={entry} size={44} />
              <div className="min-w-0 flex-1">
                <p className={["truncate text-[15px] font-semibold", G.textPrimary].join(" ")}>
                  {entry.name}
                  {entry.isCurrentUser && (
                    <span className="ml-1.5 text-[11px] font-normal text-indigo-500 dark:text-indigo-300">
                      (você)
                    </span>
                  )}
                </p>
                <p className={["text-[12px]", G.textMuted].join(" ")}>
                  {entry.points.toLocaleString("pt-BR")} Prana
                </p>
              </div>
              {entry.flag && <span className="text-lg leading-none">{entry.flag}</span>}
            </motion.div>
          ))}
        </div>

        {/* Controles de Paginação (Touch Target >= 44px) */}
        {totalPages > 1 && (
          <div className="mt-5 flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className={[
                "min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer",
                G.panel,
                G.panelHover,
                G.textPrimary,
              ].join(" ")}
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" /> Anterior
            </button>
            <span className={["text-xs font-mono font-medium", G.textMuted].join(" ")}>
              Página {currentPage} de {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className={[
                "min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer",
                G.panel,
                G.panelHover,
                G.textPrimary,
              ].join(" ")}
              aria-label="Próxima página"
            >
              Próximo <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PodiumSlot({
  entry,
  place,
  heightClass,
  crown = false,
}: {
  entry: LeaderboardEntry;
  place: 1 | 2 | 3;
  heightClass: string;
  crown?: boolean;
}) {
  const theme = ELEMENTS[entry.element];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: place === 1 ? 0 : place === 2 ? 0.08 : 0.16 }}
      className="flex flex-1 flex-col items-center"
    >
      <div className="relative mb-2">
        {crown && (
          <Crown className="absolute -top-5 left-1/2 h-5 w-5 -translate-x-1/2 text-amber-400 drop-shadow-[0_2px_4px_rgba(245,158,11,0.6)]" />
        )}
        <Avatar entry={entry} size={place === 1 ? 68 : 56} ringed />
      </div>
      <p className={["max-w-[80px] truncate text-center text-[12px] font-semibold", G.textPrimary].join(" ")}>
        {entry.name}
      </p>
      <p className="mb-2 text-[11px] font-medium" style={{ color: theme.to }}>
        {entry.points.toLocaleString("pt-BR")} PP
      </p>
      <div
        className={[
          "flex w-full items-start justify-center rounded-t-xl pt-2",
          heightClass,
          theme.gradientClass,
          theme.glowClass,
        ].join(" ")}
      >
        <span className="text-xl font-extrabold text-white/90">{place}</span>
      </div>
    </motion.div>
  );
}

function Avatar({
  entry,
  size,
  ringed = false,
}: {
  entry: LeaderboardEntry;
  size: number;
  ringed?: boolean;
}) {
  const theme = ELEMENTS[entry.element];
  return (
    <div
      className={[
        "shrink-0 overflow-hidden rounded-full",
        ringed ? `${theme.gradientClass} p-[3px] ${theme.glowClass}` : "",
      ].join(" ")}
      style={{ width: size, height: size }}
    >
      <div className="h-full w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        {entry.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={entry.avatarUrl} alt={entry.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-500 dark:text-white/40">
            {entry.name.charAt(0)}
          </div>
        )}
      </div>
    </div>
  );
}

export default ArcaneLeaderboard;
