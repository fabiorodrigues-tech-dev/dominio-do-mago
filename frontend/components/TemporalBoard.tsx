'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Flame, Droplet, Mountain, Wind, Clock, Plus, Sparkles, Skull, RotateCcw
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
  IActionLike
} from '../services/api';

type ElementFilter = 'todos' | 'fogo' | 'agua' | 'terra' | 'ar' | 'restauradoras';
type TemporalTab = 'historico' | 'hoje' | 'futuro';

export default function TemporalBoard() {
  const [actions, setActions] = useState<IActionLike[]>([]);
  const { startTimer } = useRitualTimer();
  const [loading, setLoading] = useState(true);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  
  const [filter, setFilter] = useState<ElementFilter>('todos');
  const [activeTab, setActiveTab] = useState<TemporalTab>('hoje');
  
  const [pranaLevel, setPranaLevel] = useState<number>(100);
  const [isExhausted, setIsExhausted] = useState<boolean>(false);
  const [dispatchNotification, setDispatchNotification] = useState<string | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newEnergyType, setNewEnergyType] = useState<'NEUTRAL' | 'RESTORATIVE' | 'POISON'>('NEUTRAL');
  const [newElement, setNewElement] = useState<'fogo' | 'agua' | 'terra' | 'ar'>('fogo');
  const [newBaseValue, setNewBaseValue] = useState<number>(20);
  const [isRecurrent, setIsRecurrent] = useState<boolean>(true);
  const [newScheduledDate, setNewScheduledDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Timer Selection State
  const [actionForTimer, setActionForTimer] = useState<IActionLike | null>(null);

  const fetchPrana = async () => {
    try {
      const data = await getPranaStatus();
      setPranaLevel(data.pranaLevel);
      setIsExhausted(data.exhausted);
    } catch (err) {}
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

  useEffect(() => {
    fetchActions();
    fetchPrana();
    const handleRefresh = () => { fetchActions(); fetchPrana(); };
    window.addEventListener('nexus:refresh-dashboard', handleRefresh);
    return () => window.removeEventListener('nexus:refresh-dashboard', handleRefresh);
  }, []);

  const handleToggleAction = async (action: IActionLike) => {
    if (dispatchingId === action.id) return;
    const currentCompleted = Boolean(action.isCompleted || action.completed);
    const willComplete = !currentCompleted;

    if (willComplete && isExhausted && (action.taskEnergyType === 'NEUTRAL' || !action.taskEnergyType)) {
      setDispatchNotification("⛔ Ação Bloqueada! O Mago está em EXAUSTÃO ARCANA (Prana 0). Realize rituais restauradores para recuperar Prana.");
      return;
    }

    setDispatchingId(action.id);
    setActions(prev => prev.map(a => a.id === action.id ? { ...a, isCompleted: willComplete, completed: willComplete } : a));

    try {
      const res = await toggleAction(action.id);
      setPranaLevel(res.currentPrana);
      setIsExhausted(res.exhausted);
      if (res.action) setActions(prev => prev.map(a => a.id === action.id ? { ...a, ...res.action } : a));
      setDispatchNotification(res.message || (willComplete ? `⚡ Ritual concluído! +${res.finalScore || 20} XP.` : "Ação reaberta."));
    } catch (err: any) {
      setActions(prev => prev.map(a => a.id === action.id ? { ...a, isCompleted: currentCompleted, completed: currentCompleted } : a));
      setDispatchNotification(err?.response?.data?.message || "Falha ao despachar ação. Tente novamente.");
    } finally {
      setDispatchingId(null);
      setTimeout(() => setDispatchNotification(null), 5000);
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
        recurrenceType: isRecurrent ? 'DAILY' : undefined,
        scheduledDate: newScheduledDate
      } as any);

      setActions(prev => [created, ...prev]);
      setNewTitle('');
      setIsAdding(false);
      setDispatchNotification(`✨ Novo ritual '${created.title}' forjado no Conselho Elemental!`);
      setTimeout(() => setDispatchNotification(null), 4000);
    } catch (err) {}
  };

  const handleQuickRecharge = async () => {
    try {
      const res = await rechargePrana();
      setPranaLevel(res.pranaLevel);
      setIsExhausted(res.exhausted);
      setDispatchNotification("🔮 Prana totalmente revitalizado (100/100) pelo Conselho Arcano!");
      setTimeout(() => setDispatchNotification(null), 4000);
    } catch (err) {}
  };

  const handleStartTimerSelection = (mins: number) => {
    if (!actionForTimer) return;
    startTimer(actionForTimer, 2, mins);
    setActionForTimer(null);
  };

  const getElementStyle = (areaId?: string, elem?: string) => {
    const raw = (areaId || elem || '').toLowerCase();
    if (raw.includes('fogo') || raw.includes('fire')) return { element: 'fire' as ElementId };
    if (raw.includes('agu') || raw.includes('água') || raw.includes('water')) return { element: 'water' as ElementId };
    if (raw.includes('terr') || raw.includes('earth')) return { element: 'earth' as ElementId };
    return { element: 'air' as ElementId };
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredActions = actions.filter(a => {
    // Tab filtering
    const isCompleted = Boolean(a.isCompleted || a.completed);
    const scheduled = (a as any).scheduledDate || a.createdAt?.split('T')[0] || todayStr;
    
    if (activeTab === 'historico') {
      if (!isCompleted || scheduled >= todayStr) return false;
    } else if (activeTab === 'hoje') {
      if (isCompleted && scheduled !== todayStr) return false;
      if (scheduled > todayStr) return false;
    } else if (activeTab === 'futuro') {
      if (scheduled <= todayStr) return false;
    }

    // Element filtering
    if (filter === 'todos') return true;
    if (filter === 'restauradoras') return a.taskEnergyType?.toUpperCase() === 'RESTORATIVE';
    const combined = `${a.areaId || ''} ${a.element || ''}`.toLowerCase();
    if (filter === 'agua') return combined.includes('agu') || combined.includes('water');
    if (filter === 'fogo') return combined.includes('fogo') || combined.includes('fire');
    if (filter === 'terra') return combined.includes('terr') || combined.includes('earth');
    if (filter === 'ar') return combined.includes('ar') || combined.includes('air');
    return true;
  });

  return (
    <div className="space-y-4 pb-32">
      <AnimatePresence>
        {dispatchNotification && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
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
            <button onClick={() => setDispatchNotification(null)} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-fg-tertiary cursor-pointer">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {isExhausted && (
        <motion.div className="p-4 rounded-3xl bg-rose-950/40 border border-rose-500/40 space-y-2 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
              <Skull className="w-4 h-4 text-rose-400 animate-bounce" />
              <span>Estado de Exaustão Arcana (Prana 0/100)</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-500/40">AÇÕES BLOQUEADAS</span>
          </div>
          <p className="text-xs text-rose-200 leading-relaxed">O Mago exauriu suas reservas vitais.</p>
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <button onClick={() => setFilter('restauradoras')} className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-200 text-xs font-bold flex items-center justify-center border border-emerald-400/40 cursor-pointer">Filtrar Restauradoras</button>
            <button onClick={handleQuickRecharge} className="min-h-[44px] px-4 py-2 rounded-xl bg-btn-primary/20 text-fg-primary text-xs font-bold flex items-center justify-center gap-1.5 border border-btn-primary/40 cursor-pointer"><RotateCcw className="w-3.5 h-3.5 text-btn-primary" /> Revitalizar Prana</button>
          </div>
        </motion.div>
      )}

      {/* Navegação do Mapa Temporal */}
      <div className="p-2 bg-black/40 backdrop-blur-md rounded-2xl flex items-center gap-2">
        <button onClick={() => setActiveTab('historico')} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'historico' ? 'bg-btn-primary text-white shadow-md' : 'text-fg-secondary hover:bg-white/5'}`}>Histórico</button>
        <button onClick={() => setActiveTab('hoje')} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'hoje' ? 'bg-btn-primary text-white shadow-md' : 'text-fg-secondary hover:bg-white/5'}`}>Hoje</button>
        <button onClick={() => setActiveTab('futuro')} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'futuro' ? 'bg-btn-primary text-white shadow-md' : 'text-fg-secondary hover:bg-white/5'}`}>Futuro</button>
      </div>

      <div className="flex items-center justify-between p-4 rounded-3xl bg-white/60 dark:bg-[#0B0B10]/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-btn-primary/20 text-btn-primary border border-btn-primary/30">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Mapa Temporal</h2>
            <p className="text-[10px] text-fg-secondary">Navegue pelas suas atividades passadas, presentes e futuras.</p>
          </div>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="min-h-[44px] px-4 py-2 rounded-full bg-btn-primary/20 text-fg-primary text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm border border-btn-primary/40"><Plus className="w-3.5 h-3.5 text-btn-primary" /> Novo Item</button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={handleCreateAction} className="p-4 rounded-3xl bg-[#0B0B10]/40 border border-white/10 space-y-3.5 overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-btn-primary" /> Forjar Novo Ritual</span>
            </div>
            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Ex: Treino de Foco no Fogo..." className="w-full bg-black/40 text-fg-primary placeholder:text-fg-tertiary rounded-2xl px-3.5 py-3 text-xs border border-container-border focus:outline-none focus:border-btn-primary/60 min-h-[44px]" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-fg-secondary uppercase tracking-wider">Data Prevista:</label>
                <input type="date" value={newScheduledDate} onChange={e => setNewScheduledDate(e.target.value)} className="w-full bg-black/40 text-fg-primary rounded-2xl px-3.5 py-3 text-xs border border-container-border focus:outline-none min-h-[44px]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-fg-secondary uppercase tracking-wider">Elemento:</label>
                <select value={newElement} onChange={e => setNewElement(e.target.value as any)} className="w-full bg-black/40 text-fg-primary rounded-2xl px-3.5 py-3 text-xs border border-container-border focus:outline-none min-h-[44px]">
                  <option value="fogo">Fogo</option><option value="agua">Água</option><option value="terra">Terra</option><option value="ar">Ar</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t designcode-divider">
              <button type="submit" className="min-h-[44px] flex-1 py-2.5 rounded-xl designcode-btn-primary text-xs font-bold transition-all shadow-md flex items-center justify-center cursor-pointer">Forjar & Salvar</button>
              <button type="button" onClick={() => setIsAdding(false)} className="min-h-[44px] px-4 py-2.5 rounded-xl bg-container-bg text-fg-secondary text-xs font-semibold border border-container-border flex justify-center items-center cursor-pointer">Cancelar</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
        <button onClick={() => setFilter('todos')} className={`min-h-[44px] px-3.5 py-2 rounded-full text-xs font-semibold border ${filter === 'todos' ? 'bg-btn-primary/20 text-fg-primary border-btn-primary/40' : 'bg-container-bg text-fg-secondary border-container-border'}`}>Todos</button>
        <button onClick={() => setFilter('restauradoras')} className={`min-h-[44px] px-3.5 py-2 rounded-full text-xs font-semibold border ${filter === 'restauradoras' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-container-bg text-fg-secondary border-container-border'}`}>🌿 Restauradoras</button>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:px-1">
        {loading ? (
          <div className="py-12 text-center text-xs text-fg-tertiary animate-pulse col-span-2">Sintonizando o catálogo...</div>
        ) : filteredActions.length === 0 ? (
          <div className="p-8 text-center designcode-card col-span-2 text-fg-secondary text-xs">Nenhum item localizado nesta aba.</div>
        ) : (
          filteredActions.map((action) => {
            const isCompleted = Boolean(action.isCompleted || action.completed);
            const style = getElementStyle(action.areaId, action.element);
            const isItemRecurrent = Boolean(action.recurrenceEnabled || action.type === 'habit');
            
            return (
              <RitualTaskCard
                key={action.id}
                title={action.title}
                tags={[isItemRecurrent ? 'Diário' : 'Ação', action.taskEnergyType === 'RESTORATIVE' ? '+Prana' : 'Neutra']}
                element={style.element}
                estimatedLabel={(action as any).estimated_minutes ? `${(action as any).estimated_minutes}:00` : "25:00"}
                onStart={() => setActionForTimer(action)}
                onToggle={() => handleToggleAction(action)}
                completed={isCompleted}
              />
            );
          })
        )}
      </div>

      {/* Timer Selection Overlay */}
      <AnimatePresence>
        {actionForTimer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActionForTimer(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 w-full max-w-sm designcode-card rounded-3xl p-6 border border-white/10 shadow-2xl">
              <h3 className="text-center font-bold text-fg-primary mb-4 text-lg">Tempo de Foco?</h3>
              <p className="text-center text-xs text-fg-secondary mb-6">{actionForTimer.title}</p>
              <div className="grid grid-cols-2 gap-3">
                {[15, 25, 50, 90].map(mins => (
                  <button key={mins} onClick={() => handleStartTimerSelection(mins)} className="py-4 rounded-2xl bg-container-bg border border-container-border hover:bg-btn-primary/20 hover:border-btn-primary/50 text-fg-primary font-mono font-bold text-lg transition-all cursor-pointer">
                    {mins}m
                  </button>
                ))}
              </div>
              <button onClick={() => setActionForTimer(null)} className="w-full mt-4 py-3 rounded-xl bg-black/40 text-fg-secondary hover:text-white transition-colors cursor-pointer text-sm">Cancelar</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
