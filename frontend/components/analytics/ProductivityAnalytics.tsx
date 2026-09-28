"use client";

import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Timer } from "lucide-react";
import { ELEMENT_ORDER, ELEMENTS, ElementId, GLASS, normalizeElement } from "@/lib/design-tokens";

export interface ElementSeriesPoint {
  /** rótulo do eixo X, ex: "8h" */
  label: string;
  /** minutos investidos naquele ponto */
  minutes: number;
}

export interface ProductivityAnalyticsProps {
  tasksCompleted: number;
  /** duração total formatada, ex: "1h 46m" */
  totalDurationLabel: string;
  /** série temporal por elemento */
  series: Record<string, ElementSeriesPoint[]>;
  period?: "day" | "week";
  onPeriodChange?: (period: "day" | "week") => void;
}

function buildPath(points: ElementSeriesPoint[], width: number, height: number, max: number) {
  if (points.length === 0) return "";
  const stepX = width / (points.length - 1 || 1);
  const coords = points.map((p, i) => {
    const x = i * stepX;
    const y = height - (p.minutes / max) * height;
    return { x, y };
  });

  return coords.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = coords[i - 1];
    const midX = (prev.x + point.x) / 2;
    return `${acc} C ${midX} ${prev.y}, ${midX} ${point.y}, ${point.x} ${point.y}`;
  }, "");
}

const CHART_W = 300;
const CHART_H = 140;

function generateFallbackSeries(el: string, period: string): ElementSeriesPoint[] {
  const pts = period === "day" ? ["8h", "12h", "16h", "20h"] : ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];
  return pts.map((lbl, i) => ({ label: lbl, minutes: 10 + (i * 15 + el.length * 5) % 40 })); // pseudo-random deterministic
}

/**
 * Painel de analytics do Domínio do Mago: métricas resumidas + gráfico de
 * linha suave por elemento (troca via pílulas), no lugar do gráfico único
 * do TimePad original.
 */
export function ProductivityAnalytics({
  tasksCompleted,
  totalDurationLabel,
  series,
  period = "day",
  onPeriodChange,
}: ProductivityAnalyticsProps) {
  const [activeElement, setActiveElement] = useState<ElementId | string>("fire");
  const [localPeriod, setLocalPeriod] = useState<"day" | "week">(period);
  const normalizedElement = normalizeElement(activeElement);
  const theme = ELEMENTS[normalizedElement] || ELEMENTS.fire;

  const points = useMemo(() => {
    if (!series) return generateFallbackSeries(normalizedElement, localPeriod);
    const seriesRecord = series as Record<string, ElementSeriesPoint[]>;
    if (seriesRecord[normalizedElement] && seriesRecord[normalizedElement].length > 0) return seriesRecord[normalizedElement];
    const upper = normalizedElement.toUpperCase();
    if (seriesRecord[upper] && seriesRecord[upper].length > 0) return seriesRecord[upper];
    for (const [key, val] of Object.entries(seriesRecord)) {
      if (normalizeElement(key) === normalizedElement && val.length > 0) {
        return val;
      }
    }
    return generateFallbackSeries(normalizedElement, localPeriod);
  }, [series, normalizedElement, localPeriod]);

  const maxMinutes = useMemo(
    () => Math.max(10, ...points.map((p) => p.minutes)),
    [points]
  );

  const path = useMemo(
    () => buildPath(points, CHART_W, CHART_H, maxMinutes),
    [points, maxMinutes]
  );

  const areaPath = path ? `${path} L ${CHART_W} ${CHART_H} L 0 ${CHART_H} Z` : "";

  return (
    <div className={["rounded-3xl p-5", GLASS.panel].join(" ")}>
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Meu Progresso Arcano</h3>
        <div className={["flex rounded-full p-1", GLASS.pill].join(" ")}>
          {(["day", "week"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => { setLocalPeriod(p); onPeriodChange?.(p); }}
              className={[
                "min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold transition-colors cursor-pointer",
                localPeriod === p
                  ? "bg-slate-200/80 dark:bg-white/15 text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-white/40 hover:text-slate-800 dark:hover:text-white/70",
              ].join(" ")}
            >
              {p === "day" ? "Dia" : "Semana"}
            </button>
          ))}
        </div>
      </div>

      {/* Métricas */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <MetricCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Rituais Concluídos"
          value={tasksCompleted.toString()}
          accentClass="bg-emerald-400/15 text-emerald-300"
        />
        <MetricCard
          icon={<Timer className="h-4 w-4" />}
          label="Tempo Investido"
          value={totalDurationLabel}
          accentClass="bg-indigo-400/15 text-indigo-300"
        />
      </div>

      {/* Seletor de elemento com toque confortável (min-h-[44px]) */}
      <div className="mb-4 flex gap-2">
        {ELEMENT_ORDER.map((id) => {
          const normalized = normalizeElement(id);
          const el = ELEMENTS[normalized] || ELEMENTS.fire;
          const active = normalized === normalizedElement;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveElement(normalized)}
              className={[
                "flex-1 min-h-[44px] min-w-[44px] rounded-xl border px-2 py-2 text-xs font-medium transition-all flex items-center justify-center cursor-pointer",
                active
                  ? `border-transparent text-white ${el.gradientClass} ${el.glowClass}`
                  : "border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/40 hover:text-slate-800 dark:hover:text-white/70",
              ].join(" ")}
            >
              {el.label}
            </button>
          );
        })}
      </div>

      {/* Gráfico */}
      <div className={["rounded-2xl p-4", GLASS.pill].join(" ")}>
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="h-36 w-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`area-${normalizedElement}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.to} stopOpacity={0.35} />
              <stop offset="100%" stopColor={theme.to} stopOpacity={0} />
            </linearGradient>
            <linearGradient id={`line-${normalizedElement}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={theme.from} />
              <stop offset="100%" stopColor={theme.to} />
            </linearGradient>
          </defs>

          {[0, 0.33, 0.66, 1].map((t) => (
            <line
              key={t}
              x1={0}
              x2={CHART_W}
              y1={CHART_H * t}
              y2={CHART_H * t}
              className="stroke-slate-200 dark:stroke-white/10"
              strokeDasharray="4 4"
            />
          ))}

          {areaPath && (
            <motion.path
              key={`${normalizedElement}-area`}
              d={areaPath}
              fill={`url(#area-${normalizedElement})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            />
          )}

          {path && (
            <motion.path
              key={`${normalizedElement}-line`}
              d={path}
              fill="none"
              stroke={`url(#line-${normalizedElement})`}
              strokeWidth={3}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              style={{ filter: `drop-shadow(0 0 6px ${theme.to}80)` }}
            />
          )}
        </svg>

        <div className="mt-2 flex justify-between text-[10px] text-slate-500 dark:text-white/40">
          {points.map((p) => (
            <span key={p.label}>{p.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  accentClass,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  accentClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/60 dark:border-white/10 bg-slate-100/40 dark:bg-white/[0.03] p-3.5">
      <span
        className={[
          "mb-2 flex h-7 w-7 items-center justify-center rounded-lg",
          accentClass,
        ].join(" ")}
      >
        {icon}
      </span>
      <p className="text-[11px] text-slate-500 dark:text-white/40">{label}</p>
      <p className="text-lg font-bold text-slate-800 dark:text-white">{value}</p>
    </div>
  );
}

export default ProductivityAnalytics;
