'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Circle, 
  CheckCircle2, 
  Flame, 
  Droplet, 
  Mountain, 
  Wind, 
  Clock, 
  Plus, 
  Sparkles, 
  Zap, 
  Calendar,
  AlertTriangle,
  RotateCcw,
  Skull,
  Check
} from 'lucide-react';
import { useRitualTimer } from '@/hooks/useRitualTimer';
import RitualTaskCard from '@/components/timer/RitualTaskCard';
import { ElementId } from '@/lib/design-tokens';
import { 
  getActions, 
  createAction, 
  toggleAction, 
  getPranaStatus,
  rechargePrana,
  IActionLike, 
  getTodayTimeBlocks, 
  completeTimeBlock, 
  TimeBlockItem 
} from '../services/api';

type ElementFilter = 'todos' | 'fogo' | 'agua' | 'terra' | 'ar' | 'restauradoras';

export default function TemporalBoard() {
  const [actions, setActions] = useState<IActionLike[]>([]);
  const { startTimer } = useRitualTimer();
  const [loading, setLoading] = useState(true);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlockItem[]>([]);
  const [loadingTimeBlocks, setLoadingTimeBlocks] = useState(true);
  const [completingBlockId, setCompletingBlockId] = useState<string | null>(null);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ElementFilter>('todos');
  
  // Estado de Prana local para feedback do Dispatcher
  const [pranaLevel, setPranaLevel] = useState<number>(100);
  const [isExhausted, setIsExhausted] = useState<boolean>(false);
  const [dispatchNotification, setDispatchNotification] = useState<string | null>(null);

  // Formulário de Forja / Dispatcher
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newEnergyType, setNewEnergyType] = useState<'NEUTRAL' | 'RESTORATIVE' | 'POISON'>('NEUTRAL');
  const [newElement, setNewElement] = useState<'fogo' | 'agua' | 'terra' | 'ar'>('fogo');
  const [newBaseValue, setNewBaseValue] = useState<number>(20);
  const [isRecurrent, setIsRecurrent] = useState<boolean>(true);

  const fetchPrana = async () => {
    try {
      const data = await getPranaStatus();
      setPranaLevel(data.pranaLevel);
      setIsExhausted(data.exhausted);
    } catch (err) {
      // Silencioso
    }
  };

  const fetchActions = async () => {
    try {
      const data = await getActions();
      setActions(data || []);
    } catch (err) {
      console.error("Erro ao carregar ações:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeBlocks = async () => {
    try {
      const data = await getTodayTimeBlocks();
      setTimeBlocks(data || []);
    } catch (err) {
      console.error("Erro ao carregar blocos temporais:", err);
    } finally {
      setLoadingTimeBlocks(false);
    }
  };

  useEffect(() => {
    fetchActions();
    fetchTimeBlocks();
    fetchPrana();

    const handleRefresh = () => {
      fetchActions();
      fetchTimeBlocks();
      fetchPrana();
    };

    window.addEventListener('nexus:refresh-dashboard', handleRefresh);
    return () => window.removeEventListener('nexus:refresh-dashboard', handleRefresh);
  }, []);

  // --- DISPATCHER: Toggle e Conclusão de Ações / Rituais ---
  const handleToggleAction = async (action: IActionLike) => {
    if (dispatchingId === action.id) return;

    const currentCompleted = Boolean(action.isCompleted || action.completed);
    const willComplete = !currentCompleted;

    // Se o Mago estiver em Exaustão Arcana e tentar executar ação NEUTRAL, bloqueia com feedback
    if (willComplete && isExhausted && (action.taskEnergyType === 'NEUTRAL' || !action.taskEnergyType)) {
      setDispatchNotification("⛔ Ação Bloqueada! O Mago está em EXAUSTÃO ARCANA (Prana 0). Realize rituais restauradores para recuperar Prana.");
      return;
    }

    setDispatchingId(action.id);

    // 1. Atualização Otimista Imediata
    setActions(prev => prev.map(a => 
      a.id === action.id 
        ? { ...a, isCompleted: willComplete, completed: willComplete } 
        : a
    ));

    try {
      const res = await toggleAction(action.id);
      
      // Atualiza Prana e exaustão retornados pelo Dispatcher
      setPranaLevel(res.currentPrana);
      setIsExhausted(res.exhausted);

      if (res.action) {
        setActions(prev => prev.map(a => a.id === action.id ? { ...a, ...res.action } : a));
      }

      setDispatchNotification(res.message || (willComplete ? `⚡ Ritual concluído! +${res.finalScore || 20} XP.` : "Ação reaberta."));
    } catch (err: any) {
      console.error("Erro no Dispatcher de ação:", err);
      // Reverte em caso de erro
      setActions(prev => prev.map(a => 
        a.id === action.id 
          ? { ...a, isCompleted: currentCompleted, completed: currentCompleted } 
          : a
      ));
      const errMsg = err?.response?.data?.message || "Falha ao despachar ação. Tente novamente.";
      setDispatchNotification(errMsg);
    } finally {
      setDispatchingId(null);
      setTimeout(() => setDispatchNotification(null), 5000);
    }
  };

  const handleCompleteTimeBlock = async (block: TimeBlockItem) => {
    if (block.isCompleted || completingBlockId === block.id) return;

    setCompletingBlockId(block.id);
    setTimeBlocks(prev => prev.map(b => b.id === block.id ? { ...b, isCompleted: true } : b));

    try {
      await completeTimeBlock(block.id);
    } catch (err) {
      console.error("Erro ao concluir bloco de tempo:", err);
      setTimeBlocks(prev => prev.map(b => b.id === block.id ? { ...b, isCompleted: false } : b));
    } finally {
      setCompletingBlockId(null);
    }
  };

  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const created = await createAction({
        title: newTitle.trim(),
        areaId: `area-${newElement}`,
        taskEnergyType: newEnergyType,
        baseValue: newBaseValue,
        recurrenceEnabled: isRecurrent,
        recurrenceType: isRecurrent ? 'DAILY' : undefined
      });

      setActions(prev => [created, ...prev]);
      setNewTitle('');
      setIsAdding(false);
      setDispatchNotification(`✨ Novo ritual '${created.title}' forjado no Conselho Elemental!`);
      setTimeout(() => setDispatchNotification(null), 4000);
    } catch (err) {
      console.error("Erro ao criar ação:", err);
    }
  };

  const handleQuickRecharge = async () => {
    try {
      const res = await rechargePrana();
      setPranaLevel(res.pranaLevel);
      setIsExhausted(res.exhausted);
      setDispatchNotification("🔮 Prana totalmente revitalizado (100/100) pelo Conselho Arcano!");
      setTimeout(() => setDispatchNotification(null), 4000);
    } catch (err) {
      console.error("Erro ao recarregar Prana:", err);
    }
  };

  const getElementStyle = (areaId?: string, elem?: string) => {
    const raw = (areaId || elem || '').toLowerCase();
    if (raw.includes('fogo') || raw.includes('fire')) {
      return {
        icon: <Flame className="w-3 h-3 text-rose-400" />,
        badge: 'bg-rose-950/60 text-rose-300 border-rose-500/30',
        name: 'FOGO',
        element: 'fire' as ElementId,
      };
    }
    if (raw.includes('agu') || raw.includes('água') || raw.includes('water')) {
      return {
        icon: <Droplet className="w-3 h-3 text-cyan-400" />,
        badge: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30',
        name: 'ÁGUA',
        element: 'water' as ElementId,
      };
    }
    if (raw.includes('terr') || raw.includes('earth')) {
      return {
        icon: <Mountain className="w-3 h-3 text-amber-400" />,
        badge: 'bg-amber-950/60 text-amber-300 border-amber-500/30',
        name: 'TERRA',
        element: 'earth' as ElementId,
      };
    }
    return {
      icon: <Wind className="w-3 h-3 text-emerald-400" />,
      badge: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30',
      name: 'AR',
      element: 'air' as ElementId,
    };
  };

  const getEnergyBadge = (energyType?: string) => {
    const type = (energyType || 'NEUTRAL').toUpperCase();
    if (type === 'RESTORATIVE') {
      return (
        <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full border font-bold bg-emerald-950/60 text-emerald-300 border-emerald-500/40">
          🌿 +Prana
        </span>
      );
    }
    if (type === 'POISON') {
      return (
        <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full border font-bold bg-rose-950/60 text-rose-300 border-rose-500/40">
          ☠️ Veneno
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full border font-bold bg-container-bg text-fg-secondary border-container-border/60">
        ⚡ Neutra
      </span>
    );
  };

  const filteredActions = actions.filter(a => {
    if (filter === 'todos') return true;
    if (filter === 'restauradoras') {
      return a.taskEnergyType?.toUpperCase() === 'RESTORATIVE';
    }
    const combined = `${a.areaId || ''} ${a.element || ''}`.toLowerCase();
    if (filter === 'agua') return combined.includes('agu') || combined.includes('água') || combined.includes('water');
    if (filter === 'fogo') return combined.includes('fogo') || combined.includes('fire');
    if (filter === 'terra') return combined.includes('terr') || combined.includes('earth');
    if (filter === 'ar') return combined.includes('ar') || combined.includes('air');
    return true;
  });

  const formatTimeRange = (startIso: string, endIso: string) => {
    const getHourMin = (iso: string) => {
      if (!iso) return '--:--';
      const match = iso.match(/(\d{2}):(\d{2})/);
      return match ? `${match[1]}:${match[2]}` : iso;
    };
    return `${getHourMin(startIso)} - ${getHourMin(endIso)}`;
  };

  return (
    <div className="space-y-4 pb-32">

      {/* Banner de Feedback / Notificação do Dispatcher */}
      <AnimatePresence>
        {dispatchNotification && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 shadow-lg ${
              dispatchNotification.includes('⛔') || dispatchNotification.includes('Falha')
                ? 'bg-rose-950/50 border-rose-500/40 text-rose-200'
                : 'bg-container-bg border-btn-primary/40 text-fg-primary'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-btn-primary shrink-0" />
              <span>{dispatchNotification}</span>
            </div>
            <button
              onClick={() => setDispatchNotification(null)}
              aria-label="Fechar notificação"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-fg-tertiary hover:text-fg-primary text-sm transition-colors cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alerta de Exaustão Arcana com Ação de Recuperação */}
      {isExhausted && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-3xl bg-rose-950/40 border border-rose-500/40 space-y-2 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
              <Skull className="w-4 h-4 text-rose-400 animate-bounce" />
              <span>Estado de Exaustão Arcana (Prana 0/100)</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-500/40">
              AÇÕES BLOQUEADAS
            </span>
          </div>
          <p className="text-xs text-rose-200 leading-relaxed">
            O Mago exauriu suas reservas vitais. Rituais neutros não podem ser despachados. Execute rituais com a etiqueta <strong>🌿 +Prana (Restauradora)</strong> para recuperar a sua energia, ou utilize o canal de revitalização emergencial:
          </p>
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <button
              onClick={() => setFilter('restauradoras')}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
            >
              Filtrar Restauradoras
            </button>
            <button
              onClick={handleQuickRecharge}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-btn-primary/20 hover:bg-btn-primary/30 border border-btn-primary/40 text-fg-primary text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-btn-primary" />
              Revitalizar Prana (Conselho)
            </button>
          </div>
        </motion.div>
      )}

      {/* SEÇÃO 1: QUADRO TEMPORAL (Time Blocking) */}
      <motion.div 
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-3xl bg-white/60 dark:bg-[#0B0B10]/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none space-y-4 hover:border-white/60 dark:hover:border-white/20 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                Quadro Temporal de Hoje
                <span className="text-[11px] text-cyan-400 font-mono font-semibold">
                  ({timeBlocks.length})
                </span>
              </h3>
              <p className="text-[11px] text-fg-secondary">Linha temporal sincronizada ao Conselho Arcano</p>
            </div>
          </div>
          <span className="text-[10px] px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono font-bold tracking-wide">
            Time Blocking
          </span>
        </div>

        {loadingTimeBlocks ? (
          <div className="py-6 text-center text-xs text-fg-tertiary animate-pulse">
            Sintonizando o Quadro Temporal...
          </div>
        ) : timeBlocks.length === 0 ? (
          <div className="p-4 rounded-2xl bg-container-bg border border-dashed border-container-border text-center">
            <p className="text-xs text-fg-secondary">
              O seu Quadro Temporal está livre hoje. Solicite agendamentos ao Orquestrador IA.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {timeBlocks.map((block) => (
              <motion.div
                key={block.id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 shadow-md ${
                  block.isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/30 opacity-75'
                    : 'bg-container-bg border-container-border hover:border-cyan-400/40'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    block.isCompleted ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                  }`} />
                  <div className="overflow-hidden">
                    <p className={`text-xs font-semibold truncate ${
                      block.isCompleted ? 'text-slate-400 dark:text-fg-tertiary line-through' : 'text-slate-800 dark:text-white'
                    }`}>
                      {block.title}
                    </p>
                    <p className="text-[10px] font-mono text-cyan-300/90 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
                      {formatTimeRange(block.startTime, block.endTime)}
                    </p>
                  </div>
                </div>

                {block.isCompleted ? (
                  <span className="min-h-[44px] text-[10px] px-3.5 py-2 rounded-xl font-mono font-bold shrink-0 border bg-emerald-950/60 text-emerald-300 border-emerald-500/40 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Concluído
                  </span>
                ) : (
                  <button
                    onClick={() => handleCompleteTimeBlock(block)}
                    disabled={completingBlockId === block.id}
                    className="min-h-[44px] text-[10px] px-3.5 py-2 rounded-xl font-mono font-bold shrink-0 border bg-cyan-950/60 text-cyan-300 border-cyan-500/40 hover:bg-cyan-900/50 hover:border-cyan-400 hover:text-cyan-100 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <Circle className="w-3.5 h-3.5 text-cyan-400" />
                    {completingBlockId === block.id ? 'A concluir...' : 'Agendado'}
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* SEÇÃO 2: LISTA DIÁRIA / DISPATCHER (CONTRATO IActionLike UNIFICADO) */}
      <div className="p-4 rounded-3xl bg-white/60 dark:bg-[#0B0B10]/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-btn-primary/20 text-btn-primary border border-btn-primary/30">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Dispatcher de Rituais & Hábitos Diários
            </h2>
            <p className="text-[10px] text-fg-secondary">
              Contrato unificado IActionLike integrado a Prana & ADR-000
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="min-h-[44px] px-4 py-2 rounded-full bg-btn-primary/20 hover:bg-btn-primary/30 border border-btn-primary/40 text-fg-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-btn-primary" />
          <span>Novo Item</span>
        </button>
      </div>

      {/* FORMULÁRIO DE DISPATCHER DE NOVO ITEM */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreateAction}
            className="p-4 rounded-3xl bg-white/60 dark:bg-[#0B0B10]/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none space-y-3.5 overflow-hidden border-btn-primary/30"
          >
            <div className="flex items-center justify-between border-b border-white/40 dark:border-white/10 pb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-btn-primary" />
                Forjar Novo Ritual / Hábito no Grimório
              </span>
              <span className="text-[10px] text-btn-primary font-mono font-bold">
                Base: {newBaseValue} XP
              </span>
            </div>

            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ex: Treino de Foco no Fogo / Meditação Restauradora..."
              className="w-full bg-black/40 text-fg-primary placeholder:text-fg-tertiary rounded-2xl px-3.5 py-3 text-xs border border-container-border focus:outline-none focus:border-btn-primary/60 min-h-[44px]"
            />

            {/* Configuração de Energia (Prana) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-fg-secondary uppercase tracking-wider">
                Tipagem de Energia (Impacto no Prana):
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setNewEnergyType('NEUTRAL')}
                  className={`min-h-[44px] py-2 px-2.5 rounded-xl text-[10px] font-bold uppercase transition-all border flex items-center justify-center ${
                    newEnergyType === 'NEUTRAL'
                      ? 'bg-container-bg text-fg-primary border-btn-primary/50 shadow-sm'
                      : 'bg-black/20 text-fg-tertiary border-container-border/50 hover:text-fg-secondary'
                  }`}
                >
                  ⚡ Neutra (-10)
                </button>
                <button
                  type="button"
                  onClick={() => setNewEnergyType('RESTORATIVE')}
                  className={`min-h-[44px] py-2 px-2.5 rounded-xl text-[10px] font-bold uppercase transition-all border flex items-center justify-center ${
                    newEnergyType === 'RESTORATIVE'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500 shadow-sm'
                      : 'bg-black/20 text-fg-tertiary border-container-border/50 hover:text-fg-secondary'
                  }`}
                >
                  🌿 Restauradora (+25)
                </button>
                <button
                  type="button"
                  onClick={() => setNewEnergyType('POISON')}
                  className={`min-h-[44px] py-2 px-2.5 rounded-xl text-[10px] font-bold uppercase transition-all border flex items-center justify-center ${
                    newEnergyType === 'POISON'
                      ? 'bg-rose-950/60 text-rose-300 border-rose-500 shadow-sm'
                      : 'bg-black/20 text-fg-tertiary border-container-border/50 hover:text-fg-secondary'
                  }`}
                >
                  ☠️ Veneno (-35)
                </button>
              </div>
            </div>

            {/* Seleção do Elemento e Recorrência */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-fg-secondary uppercase tracking-wider">
                  Elemento Primário:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['fogo', 'agua', 'terra', 'ar'] as const).map((elem) => (
                    <button
                      type="button"
                      key={elem}
                      onClick={() => setNewElement(elem)}
                      className={`min-h-[44px] py-2 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center justify-center border ${
                        newElement === elem
                          ? 'bg-btn-primary/30 text-fg-primary border-btn-primary/60'
                          : 'bg-black/20 text-fg-tertiary border-container-border/40 hover:text-fg-secondary'
                      }`}
                    >
                      {elem}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-fg-secondary uppercase tracking-wider">
                  Natureza do Item:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsRecurrent(true)}
                    className={`min-h-[44px] py-2 rounded-xl text-[10px] font-bold uppercase transition-all border flex items-center justify-center ${
                      isRecurrent
                        ? 'bg-btn-primary/20 text-fg-primary border-btn-primary/40'
                        : 'bg-black/20 text-fg-tertiary border-container-border/40'
                    }`}
                  >
                    🔄 Hábito Diário
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRecurrent(false)}
                    className={`min-h-[44px] py-2 rounded-xl text-[10px] font-bold uppercase transition-all border flex items-center justify-center ${
                      !isRecurrent
                        ? 'bg-btn-primary/20 text-fg-primary border-btn-primary/40'
                        : 'bg-black/20 text-fg-tertiary border-container-border/40'
                    }`}
                  >
                    🎯 Ação Única
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t designcode-divider">
              <button
                type="submit"
                className="min-h-[44px] flex-1 py-2.5 rounded-xl designcode-btn-primary text-xs font-bold transition-all shadow-md flex items-center justify-center cursor-pointer"
              >
                Forjar & Salvar Item
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-container-bg text-fg-secondary hover:text-fg-primary text-xs font-semibold flex items-center justify-center cursor-pointer border border-container-border"
              >
                Cancelar
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* FILTRO POR CATEGORIA & ENERGIA COM TOQUE CONFORTÁVEL */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
        <button
          onClick={() => setFilter('todos')}
          className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center justify-center border cursor-pointer ${
            filter === 'todos'
              ? 'bg-btn-primary/20 text-fg-primary border-btn-primary/40 shadow-sm'
              : 'bg-container-bg text-fg-secondary border-container-border hover:text-fg-primary'
          }`}
        >
          Todos ({actions.length})
        </button>

        <button
          onClick={() => setFilter('restauradoras')}
          className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center justify-center gap-1.5 border cursor-pointer ${
            filter === 'restauradoras'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
              : 'bg-container-bg text-fg-secondary border-container-border hover:text-fg-primary'
          }`}
        >
          🌿 Restauradoras (+Prana)
        </button>

        <button
          onClick={() => setFilter('fogo')}
          className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center justify-center gap-1.5 border cursor-pointer ${
            filter === 'fogo'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm'
              : 'bg-container-bg text-fg-secondary border-container-border hover:text-fg-primary'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-rose-400" /> Fogo
        </button>

        <button
          onClick={() => setFilter('agua')}
          className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center justify-center gap-1.5 border cursor-pointer ${
            filter === 'agua'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
              : 'bg-container-bg text-fg-secondary border-container-border hover:text-fg-primary'
          }`}
        >
          <Droplet className="w-3.5 h-3.5 text-cyan-400" /> Água
        </button>

        <button
          onClick={() => setFilter('terra')}
          className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center justify-center gap-1.5 border cursor-pointer ${
            filter === 'terra'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
              : 'bg-container-bg text-fg-secondary border-container-border hover:text-fg-primary'
          }`}
        >
          <Mountain className="w-3.5 h-3.5 text-amber-400" /> Terra
        </button>

        <button
          onClick={() => setFilter('ar')}
          className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center justify-center gap-1.5 border cursor-pointer ${
            filter === 'ar'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
              : 'bg-container-bg text-fg-secondary border-container-border hover:text-fg-primary'
          }`}
        >
          <Wind className="w-3.5 h-3.5 text-emerald-400" /> Ar
        </button>
      </div>

      {/* GRID DE ITENS (DISPATCHER COM CONTRATO IActionLike) */}
      <div className="grid grid-cols-1 gap-2.5 sm:px-1">
        {loading ? (
          <div className="py-12 text-center text-xs text-fg-tertiary animate-pulse col-span-2">
            Sintonizando o catálogo de rituais do Mago...
          </div>
        ) : filteredActions.length === 0 ? (
          <div className="p-8 text-center designcode-card col-span-2 text-fg-secondary text-xs">
            Nenhum item localizado nesta categoria. Use &ldquo;Novo Item&rdquo; para despachar uma ação.
          </div>
        ) : (
          filteredActions.map((action) => {
            const isCompleted = Boolean(action.isCompleted || action.completed);
            const style = getElementStyle(action.areaId, action.element);
            const energyBadge = getEnergyBadge(action.taskEnergyType);
            const isItemRecurrent = Boolean(action.recurrenceEnabled || action.type === 'habit');
            const isDispatchingThis = dispatchingId === action.id;

            return (
              <RitualTaskCard
                key={action.id}
                title={action.title}
                tags={[
                  isItemRecurrent ? 'Diário' : 'Ação',
                  action.taskEnergyType === 'RESTORATIVE' ? '+Prana' : action.taskEnergyType === 'POISON' ? 'Veneno' : 'Neutra'
                ]}
                element={style.element || action.element || 'fire'}
                estimatedLabel={(action as any).estimated_minutes ? `${(action as any).estimated_minutes}:00` : "25:00"}
                onStart={() => startTimer(action)}
                completed={isCompleted}
              />
            );
          })
        )}
      </div>

    </div>
  );
}
