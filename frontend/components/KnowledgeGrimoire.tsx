'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
 BookOpen, 
 Flame, 
 Droplet, 
 Mountain, 
 Wind, 
 Award, 
 Zap, 
 ShieldCheck, 
 History, 
 CheckCircle2, 
 Sparkles,
 Compass
} from 'lucide-react';
import { DashboardData, getTasks, TaskItem, TrophyItem, getMyTrophies } from '../services/api';

interface KnowledgeGrimoireProps {
 dashboardData: DashboardData | null;
}

export default function KnowledgeGrimoire({ dashboardData }: KnowledgeGrimoireProps) {
 const [completedRituals, setCompletedRituals] = useState<TaskItem[]>([]);
 const [trophies, setTrophies] = useState<TrophyItem[]>([]);
 const [loading, setLoading] = useState(true);

 const fetchTrophies = async () => {
 try {
 const data = await getMyTrophies();
 setTrophies(data || []);
 } catch (err) {
 console.error("Erro ao carregar troféus:", err);
 }
 };

 useEffect(() => {
 const fetchHistory = async () => {
 try {
 const tasks = await getTasks();
 setCompletedRituals(tasks.filter(t => t.completed));
 } catch (err) {
 console.error("Erro ao carregar histórico de rituais:", err);
 } finally {
 setLoading(false);
 }
 };
 fetchHistory();
 fetchTrophies();

 const handleRefresh = () => {
 fetchHistory();
 fetchTrophies();
 };
 window.addEventListener('nexus:refresh-dashboard', handleRefresh);
 return () => {
 window.removeEventListener('nexus:refresh-dashboard', handleRefresh);
 };
 }, []);

 const totalElementXp = (dashboardData?.fireElement || 0) +
 (dashboardData?.waterElement || 0) +
 (dashboardData?.earthElement || 0) +
 (dashboardData?.airElement || 0);

 const getPercentage = (val: number) => {
 if (!totalElementXp) return '25%';
 return `${Math.round((val / totalElementXp) * 100)}%`;
 };

 const getElementBadge = (elem: string) => {
 const lower = (elem || '').toLowerCase();
 if (lower.includes('fogo')) {
 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] font-bold tracking-wide">
 <Flame className="w-3 h-3 text-rose-400" />
 FOGO
 </span>
 );
 }
 if (lower.includes('agu') || lower.includes('água')) {
 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold tracking-wide">
 <Droplet className="w-3 h-3 text-cyan-400" />
 ÁGUA
 </span>
 );
 }
 if (lower.includes('terr')) {
 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold tracking-wide">
 <Mountain className="w-3 h-3 text-amber-400" />
 TERRA
 </span>
 );
 }
 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold tracking-wide">
 <Wind className="w-3 h-3 text-emerald-400" />
 AR
 </span>
 );
 };

 const getTierStyle = (tier: string) => {
 const t = (tier || '').toUpperCase();
 switch (t) {
 case 'PLATINUM':
 case 'PLATINA':
 return {
 badge: 'text-purple-200 bg-purple-950/60 border-purple-400/50',
 card: 'bg-gradient-to-br from-purple-950/40 via-purple-900/20 to-black/50 border-purple-500/40 hover:border-purple-300/70 shadow-[0_0_20px_rgba(168,85,247,0.25)]',
 glow: 'text-purple-300 drop-shadow-[0_0_8px_rgba(192,132,252,0.6)]',
 name: 'Platina'
 };
 case 'GOLD':
 case 'OURO':
 return {
 badge: 'text-amber-200 bg-amber-950/60 border-amber-400/50',
 card: 'bg-gradient-to-br from-amber-950/40 via-amber-900/20 to-black/50 border-amber-500/40 hover:border-amber-300/70 shadow-[0_0_20px_rgba(245,158,11,0.25)]',
 glow: 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]',
 name: 'Ouro'
 };
 case 'SILVER':
 case 'PRATA':
 return {
 badge: 'text-cyan-200 bg-slate-900/70 border-cyan-400/40',
 card: 'bg-gradient-to-br from-slate-900/60 via-cyan-950/20 to-black/50 border-cyan-500/30 hover:border-cyan-300/60 shadow-[0_0_20px_rgba(6,182,212,0.2)]',
 glow: 'text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]',
 name: 'Prata'
 };
 case 'BRONZE':
 default:
 return {
 badge: 'text-amber-500 bg-amber-950/40 border-amber-700/50',
 card: 'bg-gradient-to-br from-amber-950/30 via-orange-950/20 to-black/50 border-amber-700/40 hover:border-amber-600/60 shadow-[0_0_15px_rgba(180,83,9,0.2)]',
 glow: 'text-amber-500 drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]',
 name: 'Bronze'
 };
 }
 };

 const getTrophyIcon = (iconType?: string) => {
 const icon = (iconType || '').toLowerCase();
 if (icon.includes('flame') || icon.includes('fogo')) return <Flame className="w-4 h-4" />;
 if (icon.includes('droplet') || icon.includes('agua') || icon.includes('água')) return <Droplet className="w-4 h-4" />;
 if (icon.includes('mountain') || icon.includes('terra')) return <Mountain className="w-4 h-4" />;
 if (icon.includes('wind') || icon.includes('ar')) return <Wind className="w-4 h-4" />;
 if (icon.includes('zap') || icon.includes('centelha')) return <Zap className="w-4 h-4" />;
 if (icon.includes('sparkles')) return <Sparkles className="w-4 h-4" />;
 return <Award className="w-4 h-4" />;
 };

 return (
 <div className="space-y-6 pb-12">
 {/* Header do Grimório do Saber (DesignCode Banner) */}
 <motion.div 
 initial={{ opacity: 0, y: 6 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3 }}
 className="p-6 rounded-3xl glass-card border border-white/10 shadow-2xl bg-gradient-to-r from-purple-950/30 via-slate-900/40 to-black/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
 >
 <div className="flex items-center gap-3.5">
 <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600/30 to-indigo-600/20 border border-purple-400/30 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
 <BookOpen className="w-6 h-6 text-purple-300" />
 </div>
 <div>
 <h2 className="text-base sm:text-lg font-bold text-white tracking-tight drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">
 Grimório do Saber
 </h2>
 <p className="text-xs text-white/60 font-medium">
 Estatísticas arcanas, equilíbrio elemental e salão de troféus
 </p>
 </div>
 </div>

 <div className="sm:text-right bg-white/[0.03] sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-xl border sm:border-0 border-white/5">
 <span className="text-[10px] uppercase tracking-wider text-white/60 font-mono">Consistência</span>
 <p className="text-xs sm:text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300">
 Nível 5 Máximo (Transcendência)
 </p>
 </div>
 </motion.div>

 {/* Grid Responsivo DesignCode (grid-cols-1 md:grid-cols-2 gap-6) */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 
 {/* CARD 1: EQUILÍBRIO ELEMENTAL (RADAR DE ENERGIA) */}
 <motion.div 
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.35, delay: 0.05 }}
 className="p-6 rounded-3xl glass-card border border-white/10 shadow-2xl space-y-4 hover:border-white/20 transition-all"
 >
 <div className="flex justify-between items-center">
 <div>
 <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
 <Compass className="w-4 h-4 text-cyan-400" />
 Equilíbrio das 4 Dimensões
 </h3>
 <p className="text-[11px] text-white/60 mt-0.5">Distribuição do fluxo de energia</p>
 </div>
 <span className="text-xs font-mono font-semibold text-cyan-300 bg-cyan-950/40 px-2.5 py-1 rounded-full border border-cyan-500/20">
 {totalElementXp} XP
 </span>
 </div>

 {/* Barra Composta com Efeito Neon */}
 <div className="h-3.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/10 flex shadow-inner p-0.5">
 <div 
 style={{ width: getPercentage(dashboardData?.fireElement || 78) }} 
 className="h-full bg-rose-500 transition-all duration-1000 rounded-l-full shadow-[0_0_12px_rgba(244,63,94,0.7)]" 
 title="Fogo" 
 />
 <div 
 style={{ width: getPercentage(dashboardData?.waterElement || 45) }} 
 className="h-full bg-cyan-400 transition-all duration-1000 shadow-[0_0_12px_rgba(34,211,238,0.7)]" 
 title="Água" 
 />
 <div 
 style={{ width: getPercentage(dashboardData?.earthElement || 92) }} 
 className="h-full bg-amber-500 transition-all duration-1000 shadow-[0_0_12px_rgba(245,158,11,0.7)]" 
 title="Terra" 
 />
 <div 
 style={{ width: getPercentage(dashboardData?.airElement || 60) }} 
 className="h-full bg-emerald-400 transition-all duration-1000 rounded-r-full shadow-[0_0_12px_rgba(52,211,153,0.7)]" 
 title="Ar" 
 />
 </div>

 {/* Grid de Detalhes dos 4 Elementos */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
 <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-rose-500/30 transition-all">
 <span className="text-xs text-rose-300 flex items-center gap-1.5 font-medium">
 <Flame className="w-3.5 h-3.5 text-rose-400" /> Fogo
 </span>
 <span className="text-xs font-mono font-bold text-white">
 {dashboardData?.fireElement || 78} <span className="text-[10px] text-white/60 font-normal">({getPercentage(dashboardData?.fireElement || 78)})</span>
 </span>
 </div>

 <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-cyan-500/30 transition-all">
 <span className="text-xs text-cyan-300 flex items-center gap-1.5 font-medium">
 <Droplet className="w-3.5 h-3.5 text-cyan-400" /> Água
 </span>
 <span className="text-xs font-mono font-bold text-white">
 {dashboardData?.waterElement || 45} <span className="text-[10px] text-white/60 font-normal">({getPercentage(dashboardData?.waterElement || 45)})</span>
 </span>
 </div>

 <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-500/30 transition-all">
 <span className="text-xs text-amber-300 flex items-center gap-1.5 font-medium">
 <Mountain className="w-3.5 h-3.5 text-amber-400" /> Terra
 </span>
 <span className="text-xs font-mono font-bold text-white">
 {dashboardData?.earthElement || 92} <span className="text-[10px] text-white/60 font-normal">({getPercentage(dashboardData?.earthElement || 92)})</span>
 </span>
 </div>

 <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 transition-all">
 <span className="text-xs text-emerald-300 flex items-center gap-1.5 font-medium">
 <Wind className="w-3.5 h-3.5 text-emerald-400" /> Ar
 </span>
 <span className="text-xs font-mono font-bold text-white">
 {dashboardData?.airElement || 60} <span className="text-[10px] text-white/60 font-normal">({getPercentage(dashboardData?.airElement || 60)})</span>
 </span>
 </div>
 </div>
 </motion.div>

 {/* CARD 2: CONSISTÊNCIA ARCANA & ESCUDOS TDAH */}
 <motion.div 
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.35, delay: 0.1 }}
 className="p-6 rounded-3xl glass-card border border-white/10 shadow-2xl flex flex-col justify-between gap-4 hover:border-white/20 transition-all"
 >
 <div>
 <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
 <Sparkles className="w-4 h-4 text-purple-400" />
 Sistemas de Proteção & Foco
 </h3>
 <p className="text-[11px] text-white/60 mt-0.5">Garantias contra quebra de rotina</p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
 <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/30 to-black/40 border border-purple-500/20 flex flex-col justify-between hover:border-purple-500/40 transition-all">
 <div className="flex items-center justify-between mb-2">
 <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">Multiplicador</span>
 <Zap className="w-4 h-4 text-purple-400 animate-pulse" />
 </div>
 <div>
 <p className="text-2xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
 1.5x XP
 </p>
 <p className="text-[11px] text-white/60 mt-1">Bônus de Foco Supremo ativo</p>
 </div>
 </div>

 <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/30 to-black/40 border border-cyan-500/20 flex flex-col justify-between hover:border-cyan-500/40 transition-all">
 <div className="flex items-center justify-between mb-2">
 <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">Escudos TDAH</span>
 <ShieldCheck className="w-4 h-4 text-cyan-400" />
 </div>
 <div>
 <p className="text-2xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">
 2 Protegidos
 </p>
 <p className="text-[11px] text-white/60 mt-1">Perdão de quebra de hábito</p>
 </div>
 </div>
 </div>

 <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-[11px] text-white/60">
 <span>Status da Barreira:</span>
 <span className="font-semibold text-emerald-300 flex items-center gap-1">
 <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
 Ativa e Impenetrável
 </span>
 </div>
 </motion.div>

 {/* CARD 3: HISTÓRICO RECENTE DE RITUAIS */}
 <motion.div 
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.35, delay: 0.15 }}
 className="p-6 rounded-3xl glass-card border border-white/10 shadow-2xl space-y-4 hover:border-white/20 transition-all"
 >
 <div className="flex justify-between items-center">
 <div>
 <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
 <History className="w-4 h-4 text-purple-400" />
 Histórico Recente de Rituais
 </h3>
 <p className="text-[11px] text-white/60 mt-0.5">Atos forjados na linha do tempo</p>
 </div>
 <span className="text-xs font-mono font-semibold text-purple-300 bg-purple-950/40 px-2.5 py-1 rounded-full border border-purple-500/20">
 {completedRituals.length} Concluídos
 </span>
 </div>

 {loading ? (
 <div className="py-10 text-center text-xs text-white/60 animate-pulse">
 Consultando os anais astrais...
 </div>
 ) : completedRituals.length === 0 ? (
 <div className="py-10 text-center text-xs text-white/60 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
 Nenhum ritual recente registrado ainda. Peça ao Chat IA ou conclua uma tarefa!
 </div>
 ) : (
 <div className="space-y-2.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
 {completedRituals.map((ritual) => (
 <motion.div
 key={ritual.id}
 initial={{ opacity: 0, x: -6 }}
 animate={{ opacity: 1, x: 0 }}
 className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-purple-500/30 transition-all flex items-center justify-between gap-3 shadow-sm"
 >
 <div className="flex items-center gap-2.5 overflow-hidden">
 <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
 <span className="text-xs font-semibold text-slate-100 truncate">{ritual.title}</span>
 </div>

 <div className="flex items-center gap-2 shrink-0">
 {getElementBadge(ritual.element)}
 <span className="text-[11px] font-mono font-bold text-purple-300 bg-purple-950/50 px-2 py-0.5 rounded-lg border border-purple-500/20">
 +{ritual.xpReward || 50} XP
 </span>
 </div>
 </motion.div>
 ))}
 </div>
 )}
 </motion.div>

 {/* CARD 4: SALÃO DE TROFÉUS DO MAGO (ESTILO PSN/RPG) */}
 <motion.div 
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.35, delay: 0.2 }}
 className="p-6 rounded-3xl glass-card border border-amber-500/20 shadow-2xl space-y-4 hover:border-amber-500/30 transition-all"
 >
 <div className="flex items-center justify-between">
 <div>
 <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">
 <Award className="w-4 h-4 text-amber-400" />
 Galeria de Troféus Arcanos
 </h3>
 <p className="text-[11px] text-white/60 mt-0.5">Conquistas imortais do Mago</p>
 </div>
 <span className="text-xs font-mono font-semibold text-amber-300 bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-500/30">
 {trophies.length} {trophies.length === 1 ? 'Conquistado' : 'Conquistados'}
 </span>
 </div>

 {trophies.length === 0 ? (
 <div className="p-8 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] flex flex-col items-center justify-center text-center space-y-3 group hover:border-amber-500/30 transition-all">
 <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/30 group-hover:text-amber-400/60 group-hover:scale-105 transition-all">
 <Award className="w-6 h-6 animate-pulse" />
 </div>
 <div>
 <p className="text-xs font-bold text-white/80">Silhuetas Arcanas Adormecidas</p>
 <p className="text-[11px] text-white/40 max-w-xs mt-1">
 Nenhum troféu foi forjado ainda. Complete rituais diários e acumule poder elemental (500+ XP) para despertar as suas conquistas imortais.
 </p>
 </div>
 </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {trophies.map((trophy) => {
                const style = getTierStyle(trophy.tier);
                return (
                  <motion.div 
                    key={trophy.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-3.5 rounded-2xl border backdrop-blur-md transition-all ${style.card}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`flex items-center gap-1.5 text-xs font-bold ${style.glow}`}>
                        {getTrophyIcon(trophy.iconType)}
                        <span>{style.name}</span>
                      </div>
                      <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border ${style.badge}`}>
                        Desbloqueado
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white tracking-wide">{trophy.title}</p>
                    <p className="text-[10px] text-white/70 mt-0.5 leading-relaxed">{trophy.description}</p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
