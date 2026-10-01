'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { IActionLike, completeAction, CompleteActionResponse, triggerDashboardRefresh } from '@/services/api';

const TIMER_STORAGE_KEY = 'mago_ritual_timer_session_v1';

export interface RitualTimerState {
  activeAction: IActionLike | null;
  seconds: number;
  isRunning: boolean;
  isMinimized: boolean;
  isOpen: boolean;
  effortLevel: number;
  estimatedMinutes: number;
}

export interface RitualTimerContextType extends RitualTimerState {
  startTimer: (action: IActionLike, initialEffort?: number, estimatedMinutes?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  minimizeTimer: () => void;
  expandTimer: () => void;
  openModal: () => void;
  closeModal: () => void;
  setEffortLevel: (level: number) => void;
  completeCurrentRitual: () => Promise<CompleteActionResponse>;
  presenceBonusInfo: {
    bonus: number;
    multiplier: number;
    label: string;
    stage: string;
    tier: number; // 0, 1, 2, 3
  };
}

const RitualTimerContext = createContext<RitualTimerContextType | null>(null);

export function getPresenceBonusForSeconds(totalSec: number) {
  if (totalSec < 30) {
    return {
      bonus: 0.0,
      multiplier: 1.0,
      label: '+0% XP',
      stage: 'Aquecimento (<30s)',
      tier: 0,
    };
  }
  if (totalSec < 60) {
    return {
      bonus: 0.1,
      multiplier: 1.1,
      label: '+10% XP',
      stage: 'Presença Sintonizada (30-59s)',
      tier: 1,
    };
  }
  if (totalSec < 120) {
    return {
      bonus: 0.3,
      multiplier: 1.3,
      label: '+30% XP',
      stage: 'Foco Profundo (60-119s)',
      tier: 2,
    };
  }
  return {
    bonus: 0.5,
    multiplier: 1.5,
    label: '+50% XP (MÁXIMO)',
    stage: 'Imersão Transcendental (>=120s)',
    tier: 3,
  };
}

export const RitualTimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeAction, setActiveAction] = useState<IActionLike | null>(null);
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [effortLevel, setEffortLevel] = useState<number>(2);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(25);

  const secondsRef = useRef<number>(0);
  secondsRef.current = seconds;
  const isRunningRef = useRef<boolean>(false);
  isRunningRef.current = isRunning;
  const activeActionRef = useRef<IActionLike | null>(null);
  activeActionRef.current = activeAction;
  const effortLevelRef = useRef<number>(2);
  effortLevelRef.current = effortLevel;
  const estimatedMinutesRef = useRef<number>(25);
  estimatedMinutesRef.current = estimatedMinutes;

  // 1. Restaurar sessão do localStorage ao inicializar
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = localStorage.getItem(TIMER_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.activeAction) {
          setActiveAction(parsed.activeAction);
          setEffortLevel(parsed.effortLevel || 2);
          setEstimatedMinutes(parsed.estimatedMinutes || 25);
          setIsMinimized(Boolean(parsed.isMinimized));
          setIsOpen(Boolean(parsed.isOpen));

          let restoredSec = Number(parsed.accumulatedSeconds) || 0;
          if (parsed.isRunning && parsed.lastSavedTimestamp) {
            const now = Date.now();
            const elapsed = Math.max(0, Math.floor((now - parsed.lastSavedTimestamp) / 1000));
            restoredSec += elapsed;
            setIsRunning(true);
          } else {
            setIsRunning(false);
          }
          setSeconds(restoredSec);
        }
      }
    } catch (e) {
      console.warn('Erro ao restaurar timer do localStorage:', e);
    }
  }, []);

  // 2. Persistir no localStorage
  const saveToStorage = useCallback(
    (
      action: IActionLike | null,
      sec: number,
      running: boolean,
      minimized: boolean,
      open: boolean,
      effort: number,
      estMinutes: number
    ) => {
      if (typeof window === 'undefined') return;
      if (!action) {
        localStorage.removeItem(TIMER_STORAGE_KEY);
        return;
      }
      try {
        const payload = {
          activeAction: action,
          accumulatedSeconds: sec,
          isRunning: running,
          lastSavedTimestamp: Date.now(),
          isMinimized: minimized,
          isOpen: open,
          effortLevel: effort,
          estimatedMinutes: estMinutes,
        };
        localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {
        console.error('Falha ao salvar sessão do cronômetro:', e);
      }
    },
    []
  );

  // 3. Heartbeat do cronômetro (1 segundo)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && activeAction) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          saveToStorage(
            activeActionRef.current,
            next,
            true,
            isMinimized,
            isOpen,
            effortLevelRef.current,
            estimatedMinutesRef.current
          );
          return next;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, activeAction, isMinimized, isOpen, saveToStorage]);

  // Controles
  const startTimer = useCallback(
    (action: IActionLike, initialEffort: number = 2, estMinutes: number = 25) => {
      setActiveAction(action);
      setSeconds(0);
      setIsRunning(true);
      setIsOpen(true);
      setIsMinimized(false);
      setEffortLevel(initialEffort);
      setEstimatedMinutes(estMinutes);
      saveToStorage(action, 0, true, false, true, initialEffort, estMinutes);
    },
    [saveToStorage]
  );

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    saveToStorage(activeAction, secondsRef.current, false, isMinimized, isOpen, effortLevel, estimatedMinutes);
  }, [activeAction, isMinimized, isOpen, effortLevel, estimatedMinutes, saveToStorage]);

  const resumeTimer = useCallback(() => {
    setIsRunning(true);
    saveToStorage(activeAction, secondsRef.current, true, isMinimized, isOpen, effortLevel, estimatedMinutes);
  }, [activeAction, isMinimized, isOpen, effortLevel, estimatedMinutes, saveToStorage]);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
    setActiveAction(null);
    setSeconds(0);
    setIsOpen(false);
    setIsMinimized(false);
    saveToStorage(null, 0, false, false, false, 2, 25);
  }, [saveToStorage]);

  const resetTimer = useCallback(() => {
    setSeconds(0);
    saveToStorage(activeAction, 0, isRunning, isMinimized, isOpen, effortLevel, estimatedMinutes);
  }, [activeAction, isRunning, isMinimized, isOpen, effortLevel, estimatedMinutes, saveToStorage]);

  const minimizeTimer = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(true);
    saveToStorage(activeAction, secondsRef.current, isRunning, true, false, effortLevel, estimatedMinutes);
  }, [activeAction, isRunning, effortLevel, estimatedMinutes, saveToStorage]);

  const expandTimer = useCallback(() => {
    setIsMinimized(false);
    setIsOpen(true);
    saveToStorage(activeAction, secondsRef.current, isRunning, false, true, effortLevel, estimatedMinutes);
  }, [activeAction, isRunning, effortLevel, estimatedMinutes, saveToStorage]);

  const openModal = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
  }, []);

  const closeModal = useCallback(() => {
    if (isRunning) {
      // Se estiver rodando, minimiza automaticamente em vez de cancelar
      minimizeTimer();
    } else {
      setIsOpen(false);
    }
  }, [isRunning, minimizeTimer]);

  const completeCurrentRitual = useCallback(async (): Promise<CompleteActionResponse> => {
    if (!activeAction) {
      throw new Error('Nenhum ritual ativo para concluir.');
    }

    const totalSeconds = secondsRef.current;
    const actualTimeMinutes = Math.max(1, Math.round(totalSeconds / 60));
    const actualTimeSeconds = totalSeconds;

    try {
      const response = await completeAction(activeAction.id, {
        durationMinutes: actualTimeMinutes,
        presenceSeconds: actualTimeSeconds,
        effortLevel: effortLevelRef.current,
      });

      // Emite evento global para que o HUD atualize
      triggerDashboardRefresh();

      // Limpa a sessão do timer
      setIsRunning(false);
      setActiveAction(null);
      setSeconds(0);
      setIsOpen(false);
      setIsMinimized(false);
      saveToStorage(null, 0, false, false, false, 2, 25);

      return response;
    } catch (err: any) {
      console.error('Erro ao concluir ritual pelo cronômetro:', err);
      throw err;
    }
  }, [activeAction, saveToStorage]);

  const presenceBonusInfo = getPresenceBonusForSeconds(seconds);

  return (
    <RitualTimerContext.Provider
      value={{
        activeAction,
        seconds,
        isRunning,
        isMinimized,
        isOpen,
        effortLevel,
        estimatedMinutes,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        resetTimer,
        minimizeTimer,
        expandTimer,
        openModal,
        closeModal,
        setEffortLevel,
        completeCurrentRitual,
        presenceBonusInfo,
      }}
    >
      {children}
    </RitualTimerContext.Provider>
  );
};

export function useRitualTimer(): RitualTimerContextType {
  const context = useContext(RitualTimerContext);
  if (!context) {
    throw new Error('useRitualTimer deve ser utilizado dentro de um RitualTimerProvider.');
  }
  return context;
}
