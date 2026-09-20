'use client';

import React, { useEffect, useState } from 'react';
import AuraAvatar3D from './3d/AuraAvatar3D';
import OrchestratorChat from './OrchestratorChat';
import TemporalBoard from './TemporalBoard';
import KnowledgeGrimoire from './KnowledgeGrimoire';
import AvatarForge from './AvatarForge';
import ThemeToggle from './ThemeToggle';
import { 
 Sparkles, 
 Bot, 
 CheckSquare, 
 Shield, 
 Flame, 
 Droplet, 
 Mountain, 
 Wind, 
 Zap, 
 Wand2, 
 LogOut,
 ChevronRight,
 Award,
 BookOpen,
 Key,
 Check,
 Heart,
 LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserDashboardData, DashboardData } from '../services/api';
import { useNavigation, NavigationTab } from '../contexts/NavigationContext';

type ActiveTab = 'grimorio' | 'chat' | 'missoes' | 'conhecimento' | 'perfil';

export default function MagoDashboard() {
 const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
 const { activeTab, setActiveTab } = useNavigation();
 const [isForgeOpen, setIsForgeOpen] = useState(false);

 const loadDashboard = async () => {
 try {
 const data = await getUserDashboardData();
 setDashboardData(data);
 } catch (error) {
 console.error("Erro ao carregar dados do dashboard:", error);
 }
 };

 useEffect(() => {
 loadDashboard();

 // Listener para atualização dinâmica em tempo real
 const handleRefresh = () => {
 loadDashboard();
 };

 window.addEventListener('nexus:refresh-dashboard', handleRefresh);
 return () => window.removeEventListener('nexus:refresh-dashboard', handleRefresh);
 }, []);

 const handleLogout = () => {
 localStorage.removeItem('mago_token');
 window.location.href = '/login';
 };

 const navItems = [
 { id: 'grimorio' as ActiveTab, label: 'Grimório Arcano', icon: Sparkles, shortLabel: 'Grimório' },
 { id: 'chat' as ActiveTab, label: 'Orquestrador IA', icon: Bot, shortLabel: 'Chat IA' },
 { id: 'missoes' as ActiveTab, label: 'Missões & Rituais', icon: CheckSquare, shortLabel: 'Missões' },
 { id: 'conhecimento' as ActiveTab, label: 'Relatórios & Lore', icon: BookOpen, shortLabel: 'Relatórios' },
 { id: 'perfil' as ActiveTab, label: 'Perfil do Mago', icon: Shield, shortLabel: 'Perfil' },
 ];

 const ProgressBar = ({ 
 label, 
 value, 
 colorClass, 
 icon 
 }: { 
 label: string; 
 value: number; 
 colorClass: string; 
 icon: React.ReactNode 
 }) => {
 const displayWidth = Math.min(100, Math.max(15, value % 100 === 0 && value > 0 ? 100 : (value % 100)));
 return (
 <motion.div 
 whileHover={{ y: -2 }}
 transition={{ duration: 0.2 }}
 className="p-4 rounded-2xl glass-card backdrop-blur-3xl bg-white/40 dark:bg-white/5 transition-all hover:border-purple-400/40"
 >
 <div className="flex items-center justify-between mb-2">
 <div className="flex items-center gap-2">
 <span className={`p-1.5 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 ${colorClass}`}>
 {icon}
 </span>
 <span className="text-xs font-semibold text-slate-700 dark:text-white/80 uppercase tracking-wider">{label}</span>
 </div>
 <span className="text-xs font-mono font-bold text-slate-800 dark:text-white">{value} XP</span>
 </div>
 <div className="h-2 w-full bg-slate-200 dark:bg-black/60 rounded-full overflow-hidden border border-slate-300/60 dark:border-white/10 p-0.5 shadow-inner">
 <motion.div 
 initial={{ width: 0 }}
 animate={{ width: `${displayWidth}%` }}
 transition={{ duration: 1.2, ease: "easeOut" }}
 className={`h-full rounded-full ${colorClass.replace('text-', 'bg-').split(' ')[0]} shadow-[0_0_12px_currentColor]`}
 />
 </div>
 </motion.div>
 );
 };

 const getActiveTabTitle = () => {
 switch (activeTab) {
 case 'grimorio': return 'Grimório Arcano • Visão Geral';
 case 'chat': return 'Terminal do Orquestrador • IA Autônoma';
 case 'missoes': return 'Quadro Temporal & Rituais Diários';
 case 'conhecimento': return 'Grimório de Conhecimento & Histórico';
 case 'perfil': return 'Santuário do Mago • Configurações';
 default: return 'Domínio do Mago';
 }
 };

 return (
 <div className="w-full flex flex-col gap-6 bg-transparent relative selection:bg-purple-500/30">
 
 {/* Modal de Forja do Avatar 3D */}
 <AvatarForge 
 isOpen={isForgeOpen} 
 onClose={() => setIsForgeOpen(false)} 
 onAvatarForged={(newAvatarUrl) => {
 setDashboardData(prev => prev ? { ...prev, avatarGlbUrl: newAvatarUrl } : null);
 }}
 />

  {/* Topbar Superior Global */}
  <header className="px-4 md:px-6 py-3 shrink-0 flex items-center justify-between glass-card backdrop-blur-3xl bg-white/40 dark:bg-white/5 z-20 rounded-3xl shadow-lg border border-white/10">
 
 <div className="flex items-center gap-3">
 <div className="flex items-center gap-2 md:hidden">
 <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
 <span className="text-xs font-extrabold tracking-wider text-slate-800 dark:text-slate-200 uppercase">Domínio do Mago</span>
 </div>
 <div className="hidden md:flex items-center gap-2">
 <LayoutDashboard className="w-4 h-4 text-purple-500" />
 <h2 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
 {getActiveTabTitle()}
 </h2>
 </div>
 </div>

 <div className="flex items-center gap-2.5">
 {/* Badge de Vida (HP) */}
 <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-bold shadow-sm">
 <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
 <span>{dashboardData?.hp ?? 100} HP</span>
 </div>

 {/* Badge de Energia */}
 <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 text-xs font-bold shadow-sm">
 <Zap className="w-3.5 h-3.5 text-cyan-500 fill-cyan-500" />
 <span>{dashboardData?.energy ?? 100} EN</span>
 </div>

 {/* Badge de Nível Arcano */}
 <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-bold shadow-sm">
 <Zap className="w-3.5 h-3.5 text-purple-500" />
 <span className="hidden sm:inline">NÍVEL</span>
 <span>{dashboardData?.arcanoLevel || 5} (MAX)</span>
 </div>

 {/* Theme Toggle no topo */}
 <ThemeToggle />
 
 {/* Botão Sair Mobile */}
 <button 
 onClick={handleLogout}
 title="Sair do Domínio do Mago"
 className="md:hidden p-2 rounded-xl bg-slate-200/60 dark:bg-white/5 hover:bg-red-500/20 text-slate-600 dark:text-slate-400 hover:text-red-400 transition-colors border border-slate-300/60 dark:border-white/10"
 >
 <LogOut className="w-3.5 h-3.5" />
 </button>
 </div>
 </header>

      {/* Área Central de Conteúdo com Scroll Suave */}
      <div className="w-full space-y-6">
        <div className="w-full max-w-7xl mx-auto">
 
 <AnimatePresence mode="wait">
 
 {/* ============================================================ */}
 {/* ABA 1: GRIMÓRIO (MULTI-COLUNA NO DESKTOP) */}
 {/* ============================================================ */}
 {activeTab === 'grimorio' && (
 <motion.div
 key="grimorio"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.25 }}
 className="space-y-6"
 >
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 
 {/* COLUNA ESQUERDA: AVATAR 3D, HP & XP GLOBAL */}
 <div className="lg:col-span-5 space-y-5">
 
 {/* 1. CONTAINER HERO: AVATAR 3D LOCAL */}
 <div className="relative h-[360px] sm:h-[400px] w-full rounded-3xl overflow-hidden glass-card backdrop-blur-3xl bg-white/40 dark:bg-white/5 border border-purple-500/25 dark:border-purple-500/20 shadow-2xl bg-gradient-to-b from-purple-200/20 dark:from-purple-950/20 via-slate-100/40 dark:via-black/40 to-white/60 dark:to-slate-950/80 group">
 
 {/* Overlay gradiente suave */}
 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 dark:from-[#09090b] via-transparent to-transparent z-10 pointer-events-none" />

 {/* Botão de Ação Rápida no Canvas 3D */}
 <div className="absolute top-3 right-3 z-20">
 <button 
 onClick={() => setIsForgeOpen(true)}
 className="px-3.5 py-1.5 rounded-full bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-purple-800 dark:text-purple-200 text-xs font-bold transition-all backdrop-blur-xl flex items-center gap-1.5 shadow-md active:scale-95"
 >
 <Wand2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-300" />
 <span>Forja IA</span>
 </button>
 </div>

 {/* Componente 3D com Aura no Nível Máximo (5.0) */}
 <AuraAvatar3D auraRadius={dashboardData?.auraRadius || 5.0} />
 
 {/* Legenda inferior do Avatar */}
 <div className="absolute bottom-3.5 left-4 right-4 z-20 flex justify-between items-end pointer-events-none">
 <div>
 <h1 className="text-base font-bold text-white drop-shadow-md">Fábio Rodrigues</h1>
 <p className="text-xs text-purple-300 font-medium drop-shadow-sm">Mago Supremo da Produtividade</p>
 </div>
 <span className="text-[10px] text-slate-300 font-mono bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
 Gire para inspecionar
 </span>
 </div>
 </div>

 {/* 2. CARD DE HP (SOPRO VITAL) & ENERGIA (STAMINA) */}
 <motion.div 
 whileHover={{ y: -2 }}
 transition={{ duration: 0.2 }}
 className="p-5 rounded-3xl glass-card backdrop-blur-3xl bg-white/40 dark:bg-white/5 space-y-4 hover:border-rose-500/40 transition-all"
 >
 {/* Seção HP */}
 <div className="space-y-2">
 <div className="flex justify-between items-center text-xs">
 <span className="text-slate-800 dark:text-white uppercase tracking-widest font-bold flex items-center gap-2">
 <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
 Sopro Vital (HP)
 </span>
 <span className="font-mono font-bold text-rose-500 drop-shadow-sm text-sm">
 {dashboardData?.hp ?? 100}/100
 </span>
 </div>

 <div className="h-3 w-full bg-slate-200 dark:bg-black/60 rounded-full overflow-hidden border border-slate-300/60 dark:border-white/10 shadow-inner p-0.5">
 <motion.div 
 initial={{ width: 0 }}
 animate={{ width: `${Math.min(100, Math.max(0, dashboardData?.hp ?? 100))}%` }}
 transition={{ duration: 0.8, ease: "easeOut" }}
 className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-500 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.8)]"
 />
 </div>
 <div className="flex justify-between items-center text-[11px] pt-0.5">
 <span className={dashboardData?.hp !== undefined && dashboardData.hp < 50 ? 'text-rose-500 font-semibold' : 'text-slate-500 dark:text-white/60'}>
 {dashboardData?.hp !== undefined && dashboardData.hp <= 0 
 ? '💀 Mago em Estado Crítico (0 HP)' 
 : dashboardData?.hp !== undefined && dashboardData.hp < 50 
 ? '⚠️ Sopro Vital Corrompido!' 
 : 'Vitalidade Estável'}
 </span>
 </div>
 </div>

 {/* Seção Energia */}
 <div className="space-y-2 pt-2 border-t border-slate-200/50 dark:border-white/5">
 <div className="flex justify-between items-center text-xs">
 <span className="text-slate-800 dark:text-white uppercase tracking-widest font-bold flex items-center gap-2">
 <Zap className="w-4 h-4 text-cyan-500 fill-cyan-500" />
 Energia (Stamina)
 </span>
 <span className="font-mono font-bold text-cyan-500 drop-shadow-sm text-sm">
 {dashboardData?.energy ?? 100}/100
 </span>
 </div>

 <div className="h-3 w-full bg-slate-200 dark:bg-black/60 rounded-full overflow-hidden border border-slate-300/60 dark:border-white/10 shadow-inner p-0.5">
 <motion.div 
 initial={{ width: 0 }}
 animate={{ width: `${Math.min(100, Math.max(0, dashboardData?.energy ?? 100))}%` }}
 transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
 className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)]"
 />
 </div>
 <div className="flex justify-between items-center text-[11px] pt-0.5">
 <span className={dashboardData?.energy !== undefined && dashboardData.energy < 40 ? 'text-cyan-500 font-semibold' : 'text-slate-500 dark:text-white/60'}>
 {dashboardData?.energy !== undefined && dashboardData.energy <= 20 
 ? '⚡ Fadiga Extrema: Descanse Imediatamente!' 
 : dashboardData?.energy !== undefined && dashboardData.energy < 50 
 ? '⚠️ Energia baixa. Evite rituais pesados.' 
 : 'Stamina Arcana Plena'}
 </span>
 </div>
 </div>
 </motion.div>

 {/* 3. CARD DE XP GLOBAL */}
 <motion.div 
 whileHover={{ y: -2 }}
 transition={{ duration: 0.2 }}
 className="p-5 rounded-3xl glass-card backdrop-blur-3xl bg-white/40 dark:bg-white/5 space-y-3 hover:border-purple-500/40 transition-all"
 >
 <div className="flex justify-between items-center text-xs">
 <span className="text-slate-800 dark:text-white uppercase tracking-widest font-bold flex items-center gap-2">
 <Sparkles className="w-4 h-4 text-purple-500" />
 XP Global da Aura
 </span>
 <span className="font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 dark:from-purple-300 dark:via-pink-300 dark:to-cyan-300 text-sm">
 {dashboardData?.globalXp || 2500} XP
 </span>
 </div>

 <div className="h-3 w-full bg-slate-200 dark:bg-black/60 rounded-full overflow-hidden border border-slate-300/60 dark:border-white/10 shadow-inner p-0.5">
 <motion.div 
 initial={{ width: 0 }}
 animate={{ width: `${Math.min(100, Math.max(10, ((dashboardData?.globalXp || 2500) % 500) / 5))}%` }}
 transition={{ duration: 1.5, ease: "easeOut" }}
 className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 rounded-full shadow-[0_0_15px_rgba(217,70,239,0.7)]"
 />
 </div>
 <p className="text-[11px] text-slate-500 dark:text-white/60 text-center pt-0.5">
 Aura Transcendental no Nível Máximo (Raio 5.0m expandido).
 </p>
 </motion.div>
 </div>

 {/* COLUNA DIREITA: OS 4 ELEMENTOS & ATALHOS */}
 <div className="lg:col-span-7 space-y-5">
 
 {/* OS QUATRO ELEMENTOS ARCANOS (GRID 2x2) */}
 <div>
 <div className="flex items-center justify-between mb-3">
 <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
 <Zap className="w-4 h-4 text-purple-500" />
 Progresso dos Quatro Elementos
 </h3>
 <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-semibold">
 Gamificação Ativa
 </span>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3.5">
 <ProgressBar 
 label="Fogo (Foco & Ação)" 
 value={dashboardData?.fireElement || 78} 
 icon={<Flame className="w-4 h-4" />} 
 colorClass="text-rose-500 dark:text-rose-400" 
 />
 <ProgressBar 
 label="Água (Fluidez & Sono)" 
 value={dashboardData?.waterElement || 45} 
 icon={<Droplet className="w-4 h-4" />} 
 colorClass="text-cyan-500 dark:text-cyan-400" 
 />
 <ProgressBar 
 label="Terra (Rotina & Finanças)" 
 value={dashboardData?.earthElement || 92} 
 icon={<Mountain className="w-4 h-4" />} 
 colorClass="text-amber-500 dark:text-amber-400" 
 />
 <ProgressBar 
 label="Ar (Estudos & Sabedoria)" 
 value={dashboardData?.airElement || 60} 
 icon={<Wind className="w-4 h-4" />} 
 colorClass="text-emerald-500 dark:text-emerald-400" 
 />
 </div>
 </div>

 {/* ATALHOS RÁPIDOS CYBERPUNK */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
 <button 
 onClick={() => setActiveTab('chat')}
 className="p-4 rounded-2xl glass-card backdrop-blur-3xl bg-white/40 dark:bg-white/5 hover:glass-card backdrop-blur-3xl bg-white/40 dark:bg-white/5-active border border-purple-500/20 text-left transition-all group shadow-md"
 >
 <div className="flex items-center justify-between mb-1.5">
 <Bot className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
 <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition-colors" />
 </div>
 <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Terminal do Orquestrador</p>
 <p className="text-[11px] text-slate-500 dark:text-slate-400">Agende rituais e execute comandos pela IA</p>
 </button>

 <button 
 onClick={() => setActiveTab('missoes')}
 className="p-4 rounded-2xl glass-card backdrop-blur-3xl bg-white/40 dark:bg-white/5 hover:glass-card backdrop-blur-3xl bg-white/40 dark:bg-white/5-active border border-cyan-500/20 text-left transition-all group shadow-md"
 >
 <div className="flex items-center justify-between mb-1.5">
 <CheckSquare className="w-5 h-5 text-cyan-500 group-hover:scale-110 transition-transform" />
 <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 transition-colors" />
 </div>
 <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Quadro Temporal & Rituais</p>
 <p className="text-[11px] text-slate-500 dark:text-slate-400">Visualize a agenda do dia e ganhe XP</p>
 </button>
 </div>

 {/* Resumo de Dica Arcana */}
 <div className="p-4 rounded-3xl glass-card backdrop-blur-3xl bg-white/40 dark:bg-white/5 border border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-cyan-500/5 space-y-2">
 <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300">
 <Sparkles className="w-4 h-4 text-purple-500" />
 <span>Dica da Sabedoria Elemental</span>
 </div>
 <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
 Conclua os blocos de tempo agendados para nutrir o seu Sopro Vital. Deixar rituais acumulados pode acionar o Sistema de Penalidades e drenar seu HP!
 </p>
 </div>
 </div>

 </div>
 </motion.div>
 )}

 {/* ============================================================ */}
 {/* ABA 2: CHAT ARCANO COM IA */}
 {/* ============================================================ */}
 {activeTab === 'chat' && (
 <motion.div
 key="chat"
 initial={{ opacity: 0, scale: 0.99 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.99 }}
 transition={{ duration: 0.2 }}
 className="h-[calc(100vh-8.5rem)] flex flex-col"
 >
 <OrchestratorChat />
 </motion.div>
 )}

 {/* ============================================================ */}
 {/* ABA 3: MISSÕES & QUADRO TEMPORAL */}
 {/* ============================================================ */}
 {activeTab === 'missoes' && (
 <motion.div
 key="missoes"
 initial={{ opacity: 0, scale: 0.99 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.99 }}
 transition={{ duration: 0.2 }}
 className="w-full"
 >
 <TemporalBoard />
 </motion.div>
 )}

 {/* ============================================================ */}
 {/* ABA 4: GRIMÓRIO DE CONHECIMENTO & RELATÓRIOS */}
 {/* ============================================================ */}
 {activeTab === 'conhecimento' && (
 <motion.div
 key="conhecimento"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.2 }}
 className="w-full"
 >
 <KnowledgeGrimoire dashboardData={dashboardData} />
 </motion.div>
 )}

 {/* ============================================================ */}
 {/* ABA 5: PERFIL & CONFIGURAÇÕES */}
 {/* ============================================================ */}
 {activeTab === 'perfil' && (
 <motion.div
 key="perfil"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.2 }}
 className="space-y-6 max-w-4xl mx-auto"
 >
 {/* Card de Identidade do Mago */}
 <div className="p-6 md:p-8 rounded-3xl glass-card backdrop-blur-3xl bg-white/40 dark:bg-white/5 border border-purple-500/30 text-center space-y-4 shadow-xl">
 <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-purple-600 to-cyan-400 p-0.5 shadow-xl shadow-purple-950/40">
 <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
 <Shield className="w-10 h-10 text-purple-300" />
 </div>
 </div>
 <div>
 <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Fábio Rodrigues</h2>
 <p className="text-xs text-purple-600 dark:text-purple-400 font-mono">fabioandre777@gmail.com</p>
 </div>
 <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-semibold">
 <Award className="w-4 h-4 text-purple-500" />
 <span>Mago Supremo • Nível {dashboardData?.arcanoLevel || 5}</span>
 </div>
 </div>

 {/* Estado das Chaves Arcanas */}
 <div className="p-5 rounded-3xl glass-card backdrop-blur-3xl bg-white/40 dark:bg-white/5 space-y-3">
 <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
 <Key className="w-3.5 h-3.5 text-purple-500" />
 Conexões & Chaves de API
 </h3>

 <div className="space-y-2.5">
 <div className="p-3.5 rounded-2xl bg-white/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
 <div>
 <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Tripo3D API</p>
 <p className="text-[10px] text-slate-500 dark:text-slate-400">Forja de Avatares 3D em tempo real</p>
 </div>
 <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 font-semibold">
 <Check className="w-3 h-3" /> Conectada
 </span>
 </div>

 <div className="p-3.5 rounded-2xl bg-white/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
 <div>
 <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Spring AI / OpenAI</p>
 <p className="text-[10px] text-slate-500 dark:text-slate-400">Agente Orquestrador & Tools de Rituais</p>
 </div>
 <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300 font-semibold">
 <Sparkles className="w-3 h-3" /> Autônomo
 </span>
 </div>

 <div className="p-3.5 rounded-2xl bg-white/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
 <div>
 <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Google Calendar</p>
 <p className="text-[10px] text-slate-500 dark:text-slate-400">Conselheiro Temporal de Agenda</p>
 </div>
 <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 font-semibold">
 <Check className="w-3 h-3" /> Sincronizado
 </span>
 </div>
 </div>
 </div>

 {/* Ações do Mago */}
 <div className="p-5 rounded-3xl glass-card backdrop-blur-3xl bg-white/40 dark:bg-white/5 space-y-3">
 <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Ações Arcanas</h3>
 
 <button 
 onClick={() => setIsForgeOpen(true)}
 className="w-full py-3.5 px-4 rounded-2xl bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/40 text-purple-700 dark:text-purple-200 text-xs font-bold flex items-center justify-between transition-all"
 >
 <span className="flex items-center gap-2">
 <Wand2 className="w-4 h-4 text-purple-500" />
 Forjar Novo Avatar 3D (Tripo3D)
 </span>
 <ChevronRight className="w-4 h-4 text-slate-400" />
 </button>

 <button 
 onClick={handleLogout}
 className="w-full py-3.5 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center justify-between transition-all"
 >
 <span className="flex items-center gap-2">
 <LogOut className="w-4 h-4" />
 Encerrar Sessão Arcana
 </span>
 <ChevronRight className="w-4 h-4 text-red-400/60" />
 </button>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 </div>
 </div>

 </div>
 );
}
