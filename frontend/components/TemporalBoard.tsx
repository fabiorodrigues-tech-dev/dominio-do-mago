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
 Calendar
} from 'lucide-react';
import { getTasks, createTask, toggleTask, TaskItem, getTodayTimeBlocks, completeTimeBlock, TimeBlockItem } from '../services/api';

type ElementFilter = 'todos' | 'fogo' | 'agua' | 'terra' | 'ar';

export default function TemporalBoard() {
 const [tasks, setTasks] = useState<TaskItem[]>([]);
 const [loading, setLoading] = useState(true);
 const [timeBlocks, setTimeBlocks] = useState<TimeBlockItem[]>([]);
 const [loadingTimeBlocks, setLoadingTimeBlocks] = useState(true);
 const [completingBlockId, setCompletingBlockId] = useState<string | null>(null);
 const [filter, setFilter] = useState<ElementFilter>('todos');
 const [isAdding, setIsAdding] = useState(false);
 const [newTitle, setNewTitle] = useState('');
 const [newElement, setNewElement] = useState<'fogo' | 'agua' | 'terra' | 'ar'>('fogo');
 const [newXp, setNewXp] = useState<number>(50);

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

 const handleCompleteTimeBlock = async (block: TimeBlockItem) => {
 if (block.isCompleted || completingBlockId === block.id) return;

 setCompletingBlockId(block.id);
 // Atualização otimista imediata na UI
 setTimeBlocks(prev => prev.map(b => b.id === block.id ? { ...b, isCompleted: true } : b));

 try {
 await completeTimeBlock(block.id);
 } catch (err) {
 console.error("Erro ao concluir bloco de tempo:", err);
 // Reverte estado em caso de falha
 setTimeBlocks(prev => prev.map(b => b.id === block.id ? { ...b, isCompleted: false } : b));
 } finally {
 setCompletingBlockId(null);
 }
 };

 const fetchTasks = async () => {
 try {
 const data = await getTasks();
 if (data && data.length > 0) {
 setTasks(data);
 } else {
 // Fallback para tarefas iniciais se o banco estiver vazio
 setTasks([
 { id: '1', userId: 'fabio', title: 'Treino de Calistenia', type: 'habit', element: 'fogo', completed: false, priorityWeight: 2, xpReward: 50, createdAt: new Date().toISOString() },
 { id: '2', userId: 'fabio', title: 'Meditação e Mindfulness', type: 'daily', element: 'agua', completed: false, priorityWeight: 1, xpReward: 30, createdAt: new Date().toISOString() },
 { id: '3', userId: 'fabio', title: 'Revisão Financeira & Planeamento', type: 'todo', element: 'terra', completed: false, priorityWeight: 2, xpReward: 40, createdAt: new Date().toISOString() },
 { id: '4', userId: 'fabio', title: 'Estudo de Arquitetura Spring AI', type: 'daily', element: 'ar', completed: false, priorityWeight: 3, xpReward: 50, createdAt: new Date().toISOString() },
 ]);
 }
 } catch (err) {
 console.error("Erro ao carregar tarefas:", err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchTasks();
 fetchTimeBlocks();

 const handleRefresh = () => {
 fetchTasks();
 fetchTimeBlocks();
 };
 window.addEventListener('nexus:refresh-dashboard', handleRefresh);
 return () => window.removeEventListener('nexus:refresh-dashboard', handleRefresh);
 }, []);

 const handleToggle = async (task: TaskItem) => {
 // Atualização otimista imediata na UI
 setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
 try {
 if (task.id.length > 10) {
 await toggleTask(task.id);
 }
 } catch (error) {
 console.error("Erro ao alternar ritual:", error);
 }
 };

 const handleCreateTask = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!newTitle.trim()) return;

 try {
 const created = await createTask({
 title: newTitle.trim(),
 element: newElement,
 type: 'ritual',
 priorityWeight: 2,
 xpReward: newXp
 });
 setTasks(prev => [created, ...prev]);
 setNewTitle('');
 setIsAdding(false);
 } catch (error) {
 console.error("Erro ao criar ritual:", error);
 // Criação local
 const localTask: TaskItem = {
 id: Date.now().toString(),
 userId: 'fabio',
 title: newTitle.trim(),
 type: 'ritual',
 element: newElement,
 completed: false,
 priorityWeight: 2,
 xpReward: newXp,
 createdAt: new Date().toISOString()
 };
 setTasks(prev => [localTask, ...prev]);
 setNewTitle('');
 setIsAdding(false);
 }
 };

 const filteredTasks = tasks.filter(t => {
 if (filter === 'todos') return true;
 const elem = (t.element || '').toLowerCase();
 if (filter === 'agua') return elem.includes('agu') || elem.includes('água');
 return elem.includes(filter);
 });

 const getElementStyle = (elem: string) => {
 const lower = (elem || '').toLowerCase();
 if (lower.includes('fogo')) {
 return {
 icon: <Flame className="w-3 h-3 text-rose-400" />,
 badge: 'bg-rose-950/40 text-rose-300 border-rose-500/30',
 name: 'FOGO'
 };
 }
 if (lower.includes('agu') || lower.includes('água')) {
 return {
 icon: <Droplet className="w-3 h-3 text-cyan-400" />,
 badge: 'bg-cyan-950/40 text-cyan-300 border-cyan-500/30',
 name: 'ÁGUA'
 };
 }
 if (lower.includes('terr')) {
 return {
 icon: <Mountain className="w-3 h-3 text-amber-400" />,
 badge: 'bg-amber-950/40 text-amber-300 border-amber-500/30',
 name: 'TERRA'
 };
 }
 return {
 icon: <Wind className="w-3 h-3 text-emerald-400" />,
 badge: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30',
 name: 'AR'
 };
 };

 const formatTimeRange = (startIso: string, endIso: string) => {
 const getHourMin = (iso: string) => {
 if (!iso) return '--:--';
 const match = iso.match(/(\d{2}):(\d{2})/);
 return match ? `${match[1]}:${match[2]}` : iso;
 };
 return `${getHourMin(startIso)} - ${getHourMin(endIso)}`;
 };

 return (
 <div className="space-y-3 pb-8">
 {/* SEÇÃO: QUADRO TEMPORAL DE HOJE (Time Blocking) */}
 <motion.div 
 initial={{ opacity: 0, y: 6 }}
 animate={{ opacity: 1, y: 0 }}
 className="p-5 rounded-3xl glass-card backdrop-blur-3xl bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 space-y-4 hover:border-cyan-500/30 transition-all"
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
 <Calendar className="w-5 h-5" />
 </div>
 <div>
 <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2 drop-shadow-sm">
 Quadro Temporal de Hoje
 <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-mono font-semibold">
 ({timeBlocks.length})
 </span>
 </h3>
 <p className="text-[11px] text-slate-500 dark:text-white/60">Linha temporal de rituais e sessões agendadas</p>
 </div>
 </div>
 <span className="text-[10px] px-3 py-1 rounded-full bg-cyan-500/10 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-mono font-bold tracking-wide shadow-sm">
 Time Blocking
 </span>
 </div>

 {loadingTimeBlocks ? (
 <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
 Sintonizando o Quadro Temporal...
 </div>
 ) : timeBlocks.length === 0 ? (
 <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-black/30 border border-dashed border-cyan-500/20 text-center">
 <p className="text-xs text-slate-500 dark:text-slate-400">
 O seu Quadro Temporal está livre. Peça ao Orquestrador para agendar rituais.
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
 ? 'bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.12)]'
 : 'bg-white/60 dark:bg-white/[0.03] border-slate-200/60 dark:border-white/10 hover:border-cyan-400/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]'
 }`}
 >
 <div className="flex items-center gap-2.5 overflow-hidden">
 <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
 block.isCompleted
 ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]'
 : 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)]'
 }`} />
 <div className="overflow-hidden">
 <p className={`text-xs font-semibold truncate ${
 block.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-white'
 }`}>
 {block.title}
 </p>
 <p className="text-[10px] font-mono text-cyan-600 dark:text-cyan-300/90 flex items-center gap-1.5 mt-0.5">
 <Clock className="w-3 h-3 text-cyan-500 dark:text-cyan-400 shrink-0" />
 {formatTimeRange(block.startTime, block.endTime)}
 </p>
 </div>
 </div>

 {block.isCompleted ? (
 <span className="text-[10px] px-2.5 py-1 rounded-xl font-mono font-bold shrink-0 border bg-emerald-950/60 text-emerald-300 border-emerald-500/40 flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
 <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
 Concluído
 </span>
 ) : (
 <button
 onClick={() => handleCompleteTimeBlock(block)}
 disabled={completingBlockId === block.id}
 className="text-[10px] px-3 py-1 rounded-xl font-mono font-bold shrink-0 border bg-cyan-950/60 text-cyan-300 border-cyan-500/40 hover:bg-cyan-900/50 hover:border-cyan-400 hover:text-cyan-100 transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.25)] active:scale-95 cursor-pointer group"
 title="Clique para concluir este bloco de tempo"
 >
 <Circle className="w-3 h-3 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
 {completingBlockId === block.id ? 'A concluir...' : 'Agendado'}
 </button>
 )}
 </motion.div>
 ))}
 </div>
 )}
 </motion.div>

 {/* Header com botão de Adicionar */}
 <div className="p-3.5 rounded-3xl glass-card backdrop-blur-3xl bg-white/40 dark:bg-white/5 border border-purple-500/20 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <div className="p-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30">
 <Clock className="w-4 h-4" />
 </div>
 <div>
 <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Missões & Rituais</h2>
 <p className="text-[10px] text-slate-400">Gerencie a sua jornada diária</p>
 </div>
 </div>

 <button
 onClick={() => setIsAdding(!isAdding)}
 className="px-3 py-1.5 rounded-full bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/30 text-purple-200 text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
 >
 <Plus className="w-3.5 h-3.5 text-purple-300" />
 <span>Novo Ritual</span>
 </button>
 </div>

 {/* Formulário de Criação Rápida */}
 <AnimatePresence>
 {isAdding && (
 <motion.form
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 exit={{ opacity: 0, height: 0 }}
 onSubmit={handleCreateTask}
 className="p-4 rounded-3xl glass-card backdrop-blur-3xl bg-white/40 dark:bg-white/5 border border-purple-500/40 space-y-3 overflow-hidden shadow-lg shadow-purple-950/30"
 >
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
 <Sparkles className="w-3.5 h-3.5 text-purple-400" />
 Forjar Novo Ritual Diário
 </span>
 <span className="text-[10px] text-slate-400 font-mono">+{newXp} XP</span>
 </div>

 <input
 type="text"
 value={newTitle}
 onChange={(e) => setNewTitle(e.target.value)}
 placeholder="Ex: Treino de Calistenia / 30m Leitura..."
 className="w-full bg-black/40 text-slate-200 placeholder:text-slate-500 rounded-2xl px-3.5 py-2.5 text-xs border border-white/10 focus:outline-none focus:border-purple-500/60"
 />

 {/* Seleção do Elemento */}
 <div className="grid grid-cols-4 gap-1.5">
 {(['fogo', 'agua', 'terra', 'ar'] as const).map((elem) => (
 <button
 type="button"
 key={elem}
 onClick={() => setNewElement(elem)}
 className={`py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 border ${
 newElement === elem
 ? 'bg-purple-600/40 text-purple-200 border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.4)]'
 : 'bg-white/5 text-slate-400 border-white/5 hover:text-slate-200'
 }`}
 >
 {elem}
 </button>
 ))}
 </div>

 <div className="flex gap-2">
 <button
 type="submit"
 className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-[0_0_12px_rgba(168,85,247,0.4)]"
 >
 Salvar Ritual
 </button>
 <button
 type="button"
 onClick={() => setIsAdding(false)}
 className="px-3 py-2 rounded-xl bg-white/5 text-slate-400 hover:text-slate-200 text-xs font-semibold"
 >
 Cancelar
 </button>
 </div>
 </motion.form>
 )}
 </AnimatePresence>

 {/* FILTRO POR ELEMENTOS (Pills Cyberpunk) */}
 <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
 <button
 onClick={() => setFilter('todos')}
 className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 border ${
 filter === 'todos'
 ? 'bg-purple-600/30 text-purple-200 border-purple-400/50 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
 : 'bg-white/5 text-slate-400 border-white/5 hover:text-slate-200'
 }`}
 >
 Todos ({tasks.length})
 </button>

 <button
 onClick={() => setFilter('fogo')}
 className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center gap-1 border ${
 filter === 'fogo'
 ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
 : 'bg-white/5 text-slate-400 border-white/5 hover:text-slate-200'
 }`}
 >
 <Flame className="w-3 h-3 text-rose-400" /> Fogo
 </button>

 <button
 onClick={() => setFilter('agua')}
 className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center gap-1 border ${
 filter === 'agua'
 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
 : 'bg-white/5 text-slate-400 border-white/5 hover:text-slate-200'
 }`}
 >
 <Droplet className="w-3 h-3 text-cyan-400" /> Água
 </button>

 <button
 onClick={() => setFilter('terra')}
 className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center gap-1 border ${
 filter === 'terra'
 ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
 : 'bg-white/5 text-slate-400 border-white/5 hover:text-slate-200'
 }`}
 >
 <Mountain className="w-3 h-3 text-amber-400" /> Terra
 </button>

 <button
 onClick={() => setFilter('ar')}
 className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center gap-1 border ${
 filter === 'ar'
 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(52,211,153,0.3)]'
 : 'bg-white/5 text-slate-400 border-white/5 hover:text-slate-200'
 }`}
 >
 <Wind className="w-3 h-3 text-emerald-400" /> Ar
 </button>
 </div>

 {/* LISTA DE RITUAIS */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {loading ? (
 <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
 Carregando missões astrais...
 </div>
 ) : filteredTasks.length === 0 ? (
 <div className="p-8 text-center glass-card backdrop-blur-3xl bg-white/40 dark:bg-white/5 rounded-3xl border border-white/5 text-slate-400 text-xs">
 Nenhum ritual cadastrado nesta categoria.
 </div>
 ) : (
 filteredTasks.map((task) => {
 const style = getElementStyle(task.element);
 return (
 <motion.div
 key={task.id}
 layout
 initial={{ opacity: 0, y: 6 }}
 animate={{ opacity: 1, y: 0 }}
 className={`p-3.5 rounded-2xl border transition-all duration-300 backdrop-blur-md flex items-center justify-between gap-3 ${
 task.completed
 ? 'bg-emerald-950/20 border-emerald-500/30 opacity-75'
 : 'glass-card backdrop-blur-3xl bg-white/40 dark:bg-white/5 hover:glass-card backdrop-blur-3xl bg-white/40 dark:bg-white/5-active border-white/10 shadow-md'
 }`}
 >
 <div className="flex items-center gap-3 overflow-hidden">
 <button
 onClick={() => handleToggle(task)}
 className="shrink-0 focus:outline-none transition-transform active:scale-90"
 title={task.completed ? 'Marcar como pendente' : 'Concluir ritual'}
 >
 {task.completed ? (
 <CheckCircle2 className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
 ) : (
 <Circle className="w-5 h-5 text-slate-500 hover:text-purple-400 transition-colors" />
 )}
 </button>

 <div className="overflow-hidden">
 <p className={`text-xs font-semibold truncate transition-all ${
 task.completed ? 'line-through text-slate-400' : 'text-slate-100'
 }`}>
 {task.title}
 </p>
 <div className="flex items-center gap-2 mt-1">
 <span className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full border font-bold ${style.badge}`}>
 {style.icon}
 {style.name}
 </span>
 <span className="text-[10px] font-mono text-slate-400">
 {task.type === 'habit' ? 'Hábito' : task.type === 'daily' ? 'Diária' : 'Ritual'}
 </span>
 </div>
 </div>
 </div>

 <div className="shrink-0 text-right">
 <span className="text-xs font-mono font-bold text-purple-300 bg-purple-950/40 px-2 py-1 rounded-xl border border-purple-500/20 inline-flex items-center gap-1 shadow-inner">
 <Zap className="w-3 h-3 text-purple-400" />
 +{task.xpReward || 50}
 </span>
 </div>
 </motion.div>
 );
 })
 )}
 </div>
 </div>
 );
}
