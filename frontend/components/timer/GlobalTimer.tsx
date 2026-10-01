'use client';

import React from 'react';
import { useRitualTimer } from '@/hooks/useRitualTimer';
import TimerFocusModal from './TimerFocusModal';
import FloatingTimerBar from './FloatingTimerBar';
import { ElementId, normalizeElement } from '@/lib/design-tokens';

function formatClock(totalSecondsAbs: number) {
  const h = Math.floor(totalSecondsAbs / 3600);
  const m = Math.floor((totalSecondsAbs % 3600) / 60);
  const s = Math.floor(totalSecondsAbs % 60);
  const pad = (v: number) => v.toString().padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function GlobalTimer() {
  const timer = useRitualTimer();

  if (!timer.activeAction) {
    return null;
  }

  const element: ElementId = normalizeElement(timer.activeAction.element || timer.activeAction.areaId);

  // O TimerFocusModal espera 'totalSeconds' e 'remainingSeconds'. 
  // No caso de gamificação, queremos que o círculo se preencha até o fim do tempo selecionado.
  const estimatedSeconds = (timer.estimatedMinutes || 25) * 60;
  // O remainingSeconds é apenas para UI do círculo fechar. O tempo vai decrementar visualmente, ou incrementar?
  // O hook conta os segundos para cima (0 -> infinito).
  // A UI do TimerFocusModal faz: progress = 1 - (remainingSeconds / totalSeconds).
  // Para que progress vá de 0 a 1, remainingSeconds deve ir de totalSeconds até 0.
  const remainingSeconds = Math.max(0, estimatedSeconds - timer.seconds);

  return (
    <>
      {timer.isMinimized && timer.activeAction && (
        <FloatingTimerBar
          visible={true}
          ritualName={timer.activeAction.title}
          element={element}
          elapsedLabel={formatClock(timer.seconds)}
          isPaused={!timer.isRunning}
          onTogglePause={() => timer.isRunning ? timer.pauseTimer() : timer.resumeTimer()}
          onExpand={() => {
            timer.expandTimer();
            timer.openModal();
          }}
        />
      )}
      <TimerFocusModal
        open={timer.isOpen}
        onClose={timer.closeModal}
        ritualName={timer.activeAction.title}
        taskName={timer.activeAction.type || 'AÇÃO'}
        element={element}
        totalSeconds={estimatedSeconds}
        remainingSeconds={remainingSeconds}
        isRunning={timer.isRunning}
        onTogglePlay={() => timer.isRunning ? timer.pauseTimer() : timer.resumeTimer()}
        onFinish={timer.completeCurrentRitual}
        onQuit={timer.stopTimer}
      />
    </>
  );
}
