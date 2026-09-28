'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  X, 
  Clock, 
  Zap, 
  Sparkles, 
  Flame, 
  Droplet, 
  Mountain, 
  Wind,
  ShieldAlert
} from 'lucide-react';
import { IActionLike, completeAction, CompleteActionResponse } from '../services/api';

interface TimerModalProps {
  action: IActionLike;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (res: CompleteActionResponse) => void;
}

export default function TimerModal({ action, isOpen, onClose, onSuccess }: TimerModalProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [effortLevel, setEffortLevel] = useState<number>(2); // Padrão: Moderado
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CompleteActionResponse | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  if (!isOpen) return null;

  // Formata MM:SS
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Cálculo canônico do Bônus de Presença ADR-000
  const getPresenceBonus = (sec: number) => {
    if (sec < 30) return { bonus: 0.0, label: '+0%', stage: 'Aquecimento (<30s)', color: 'text-fg-tertiary', active: 0 };
    if (sec < 60) return { bonus: 0.1, label: '+10%', stage: 'Presença Sintonizada (30-59s)', color: 'text-cyan-400', active: 1 };
    if (sec < 120) return { bonus: 0.3, label: '+30%', stage: 'Foco Profundo (60-119s)', color: 'text-emerald-400', active: 2 };
    return { bonus: 0.5, label: '+50% (MÁXIMO)', stage: 'Imersão Transcendental (>=120s)', color: 'text-amber-400', active: 3 };
  };

  const presence = getPresenceBonus(seconds);

  // Multiplicador de Esforço
  const getEffortMultiplier = (lvl: number) => {
    switch (lvl) {
      case 2: return 1.2;
      case 3: return 1.5;
      case 4: return 2.0;
      case 5: return 2.8;
      default: return 1.0;
    }
  };

  // Estimativa do Prana
  const getPranaImpact = () => {
    const energy = (action.taskEnergyType || 'NEUTRAL').toUpperCase();
    if (energy === 'RESTORATIVE') {
      const gain = effortLevel * 10;
      return { text: `+${gain} Prana`, color: 'text-emerald-400', icon: '🌿' };
    }
    if (energy === 'POISON') {
      return { text: '-35 Prana', color: 'text-rose-400', icon: '☠️' };
    }
    const costMap: Record<number, number> = { 1: 5, 2: 12, 3: 20, 4: 27, 5: 35 };
    const cost = costMap[effortLevel] || 12;
    return { text: `-${cost} Prana`, color: 'text-cyan-300', icon: '⚡' };
  };

  const pranaImpact = getPranaImpact();

  const handleToggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  const handleConclude = async () => {
    setIsRunning(false);
    setIsSubmitting(true);

    try {
      const durationMinutes = Math.max(1, Math.ceil(seconds / 60));
      const res = await completeAction(action.id, {
        durationMinutes,
        presenceSeconds: seconds,
        effortLevel
      });

      setResult(res);
      if (onSuccess) {
        onSuccess(res);
      }

      // Fecha o modal após 2 segundos de celebração
      setTimeout(() => {
        onClose();
        setResult(null);
        setSeconds(0);
      }, 2200);
    } catch (err: any) {
      console.error("Erro ao concluir ação com cronômetro:", err);
      alert(err.response?.data?.message || "Falha ao registrar conclusão da ação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getElementIcon = () => {
    const area = (action.areaId || action.element || '').toLowerCase();
    if (area.includes('fogo') || area.includes('fire')) return <Flame className="w-4 h-4 text-rose-400" />;
    if (area.includes('agu') || area.includes('water')) return <Droplet className="w-4 h-4 text-cyan-400" />;
    if (area.includes('terr') || area.includes('earth')) return <Mountain className="w-4 h-4 text-amber-400" />;
    return <Wind className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop com Vidro Translúcido */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => !isRunning && onClose()}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-all"
      />

      {/* Cartão Modal DesignCode */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        className="relative z-10 w-full max-w-md designcode-card rounded-3xl p-6 shadow-2xl border border-container-border/90 overflow-hidden"
      >
        {/* Glow de fundo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-btn-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-3 border-b designcode-divider">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-btn-primary/20 text-btn-primary border border-btn-primary/30">
              <Clock className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-fg-secondary uppercase tracking-widest">
                Cronômetro de Foco ADR-000
              </p>
              <h3 className="text-sm font-bold text-fg-primary truncate max-w-[240px]">
                {action.title}
              </h3>
            </div>
          </div>
          
          <button
            onClick={onClose}
            aria-label="Fechar Cronômetro"
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-container-bg border border-container-border text-fg-tertiary hover:text-fg-primary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SEÇÃO PRINCIPAL DO CRONÔMETRO */}
        <div className="py-6 flex flex-col items-center justify-center">
          {/* Mostrador Circular com Efeito de Pulso */}
          <div className="relative flex items-center justify-center">
            <div className={`w-44 h-44 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-500 ${
              isRunning
                ? 'border-btn-primary shadow-[0_0_30px_rgba(59,130,246,0.3)] bg-btn-primary/5'
                : 'border-container-border/80 bg-container-bg/40'
            }`}>
              <span className="text-4xl font-mono font-extrabold tracking-wider text-fg-primary">
                {formatTime(seconds)}
              </span>
              <span className="text-[11px] font-mono text-fg-secondary mt-1">
                {seconds}s decorridos
              </span>
            </div>

            {/* Indicador pulsante quando em execução */}
            {isRunning && (
              <span className="absolute top-2 right-2 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-btn-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-btn-primary"></span>
              </span>
            )}
          </div>

          {/* ESCALA DE BÔNUS DE PRESENÇA EM TEMPO REAL (ADR-000) */}
          <div className="w-full mt-5 p-3 rounded-2xl bg-black/40 border border-container-border/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-fg-secondary font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-btn-primary" />
                Bônus de Presença:
              </span>
              <span className={`font-mono font-bold text-xs ${presence.color}`}>
                {presence.label}
              </span>
            </div>

            {/* Barra de Progresso das Faixas ADR-000 */}
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: '<30s', bonus: '0.0' },
                { label: '30s+', bonus: '+0.1' },
                { label: '60s+', bonus: '+0.3' },
                { label: '120s+', bonus: '+0.5' },
              ].map((tier, idx) => (
                <div 
                  key={tier.label}
                  className={`py-1 text-center rounded-lg border text-[9px] font-mono transition-all ${
                    presence.active >= idx 
                      ? 'bg-btn-primary/20 border-btn-primary text-fg-primary font-bold shadow-sm'
                      : 'bg-black/20 border-container-border/40 text-fg-tertiary'
                  }`}
                >
                  <p>{tier.label}</p>
                  <p className="text-[8px] opacity-75">{tier.bonus}</p>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-center text-fg-secondary font-mono">
              Fase Atual: <strong className={presence.color}>{presence.stage}</strong>
            </p>
          </div>

          {/* CONTROLE DE NÍVEL DE ESFORÇO (1 a 5) */}
          <div className="w-full mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="text-fg-secondary font-mono font-semibold uppercase tracking-wider text-[10px]">
                Nível de Esforço Arcano:
              </label>
              <span className="font-mono text-xs font-bold text-btn-primary">
                Nível {effortLevel} ({getEffortMultiplier(effortLevel)}x)
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setEffortLevel(lvl)}
                  className={`py-1.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                    effortLevel === lvl
                      ? 'bg-btn-primary text-white border-btn-primary shadow-md'
                      : 'bg-container-bg text-fg-secondary border-container-border hover:border-btn-primary/50'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-[10px] text-fg-secondary px-1 pt-0.5">
              <span>Impacto Prana: <strong className={pranaImpact.color}>{pranaImpact.icon} {pranaImpact.text}</strong></span>
              <span className="flex items-center gap-1">Elemento: {getElementIcon()}</span>
            </div>
          </div>
        </div>

        {/* FEEDBACK DE CELEBRAÇÃO / CONCLUSÃO */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-3 mb-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-center space-y-1 shadow-lg"
            >
              <div className="flex items-center justify-center gap-2 text-emerald-300 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Ritual Concluído com Sucesso!</span>
              </div>
              <p className="text-[11px] text-emerald-200 font-mono">
                +{result.finalScore} XP Concedido • Prana Atual: {result.currentPrana}/100
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOTÕES DE CONTROLE */}
        <div className="flex items-center gap-2.5 pt-2 border-t designcode-divider">
          <button
            type="button"
            onClick={handleToggleTimer}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              isRunning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'designcode-btn-primary'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                Pausar
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                {seconds > 0 ? 'Continuar' : 'Iniciar'}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleResetTimer}
            disabled={seconds === 0}
            className="p-2.5 rounded-2xl bg-container-bg border border-container-border text-fg-tertiary hover:text-fg-primary disabled:opacity-40 transition-colors cursor-pointer"
            title="Reiniciar cronômetro"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleConclude}
            disabled={isSubmitting || seconds === 0}
            className="flex-1 py-2.5 rounded-2xl bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/50 text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-40 cursor-pointer shadow-md active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSubmitting ? 'Gravando...' : 'Concluir'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
