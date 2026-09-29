'use client';

import React, { useEffect, useState, useRef } from 'react';
import AuraAvatar3D from './3d/AuraAvatar3D';
import OrchestratorChat from './OrchestratorChat'; // legacy – kept for fallback
import OrchestratorChatView from '@/components/orchestrator/OrchestratorChatView';
import TemporalBoard from './TemporalBoard';
import KnowledgeGrimoire from './KnowledgeGrimoire';
import AvatarForge from './AvatarForge';
import ThemeToggle from './ThemeToggle';
import ProductivityAnalytics from '@/components/analytics/ProductivityAnalytics';
import ArcaneProfileStats from '@/components/profile/ArcaneProfileStats';
import ArcaneLeaderboard, { LeaderboardPeriod } from '@/components/reports/ArcaneLeaderboard';
import { useRitualTimer } from '@/hooks/useRitualTimer';
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
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getUserDashboardData, DashboardData } from '../services/api';
import { useNavigation, NavigationTab } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';

export default function MagoDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const { activeTab, setActiveTab } = useNavigation();
  const { userName, user } = useAuth();
  const currentName = user?.name || userName || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('mago_user') || '{}')?.name : null) || 'Mago Aspirante';
  const [isForgeOpen, setIsForgeOpen] = useState(false);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<LeaderboardPeriod>('week');
  const ritualTimer = useRitualTimer();
  const mainRef = useRef<HTMLElement>(null);

  const loadDashboard = async () => {
    try {
      const response = await api.get<DashboardData>('/users/me/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard via GET /users/me/dashboard:", error);
      try {
        const fallbackData = await getUserDashboardData();
        setDashboardData(fallbackData);
      } catch (fallbackError) {
        console.error("Erro no fallback do dashboard:", fallbackError);
      }
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

  // Global Scroll Reset: volta ao topo quando a aba muda
  useEffect(() => {
    // Tenta rolar a window e o main container
    window.scrollTo({ top: 0, behavior: 'instant' });
    mainRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('mago_token');
    window.location.href = '/login';
  };

  const pranaLevel = dashboardData?.pranaLevel ?? 100;
  const isExhausted = pranaLevel <= 0;
  const isFlow = pranaLevel >= 80;

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
        className="p-4 rounded-2xl bg-white/60 dark:bg-[#0B0B10]/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none transition-all hover:border-white/60 dark:hover:border-white/20"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-xl bg-container-bg border border-container-border/50 ${colorClass}`}>
              {icon}
            </span>
            <span className="text-xs font-semibold text-slate-600 dark:text-fg-secondary uppercase tracking-wider">{label}</span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-800 dark:text-white">{value} XP</span>
        </div>
        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-container-border/40 p-0.5 shadow-inner">
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
      case 'conhecimento':
      case 'relatorios': return 'Grimório de Conhecimento & Histórico';
      case 'perfil': return 'Santuário do Mago • Configurações';
      default: return 'Domínio do Mago';
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 bg-transparent relative selection:bg-btn-primary/30">
      
      {/* Modal de Forja do Avatar 3D */}
      <AvatarForge 
        isOpen={isForgeOpen} 
        onClose={() => setIsForgeOpen(false)} 
        onAvatarForged={(newAvatarUrl) => {
          setDashboardData(prev => prev ? { ...prev, avatarGlbUrl: newAvatarUrl } : null);
        }}
      />

      {/* ── RPG Dynamic HUD — sticky, micro-números, anel de XP ──────────────── */}
      <header className="mx-4 mt-2 shrink-0 sticky top-2 z-50 md:hidden">
        <div className="flex items-center gap-2.5 rounded-2xl px-3 py-2 bg-white/70 backdrop-blur-2xl border border-white/50 shadow-sm dark:bg-white/[0.04] dark:backdrop-blur-xl dark:border-white/10 dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.7)]">

          {/* ── Esquerda: Badge de Nível com Anel SVG de XP ─────────────────── */}
          <div className="relative shrink-0 flex items-center justify-center w-11 h-11">
            {/* Anel SVG de XP (progresso circular subtil) */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 44 44"
              fill="none"
              aria-hidden="true"
            >
              {/* Track */}
              <circle cx="22" cy="22" r="19" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
              {/* Progresso de XP: calcula circunferência = 2π×19 ≈ 119.38 */}
              <circle
                cx="22" cy="22" r="19"
                stroke="url(#xpGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="119.38"
                strokeDashoffset={119.38 - (119.38 * ((dashboardData?.globalXp ?? 0) % 1000) / 1000)}
                className="transition-all duration-700"
              />
              <defs>
                <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </svg>
            {/* Badge central */}
            <div className="relative flex flex-col items-center justify-center w-8 h-8 rounded-xl bg-btn-primary/20 border border-btn-primary/30">
              <span className="text-[8px] font-bold uppercase tracking-widest text-slate-700 dark:text-white/40 leading-none">LV</span>
              <span className="text-[12px] font-extrabold text-slate-700 dark:text-white leading-none">
                {dashboardData?.level ?? dashboardData?.arcanoLevel ?? 1}
              </span>
              {/* Online dot */}
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border-2 border-[#0B0B10]" />
            </div>
          </div>

          {/* ── Centro: Prana + HP com micro-números ─────────────────────────── */}
          <div className="flex-1 flex flex-col gap-1.5 min-w-0">

            {/* Prana */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Flame className={`w-2.5 h-2.5 shrink-0 ${isExhausted ? 'text-rose-500' : 'text-cyan-600 dark:text-cyan-400'}`} />
                  <span className={`text-[9px] font-bold uppercase tracking-wider leading-none ${isExhausted ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-cyan-400/70'}`}>
                    {isExhausted ? 'EXAUSTÃO' : isFlow ? 'FLOW' : 'Prana'}
                  </span>
                </div>
                <span className="text-[10px] font-mono tabular-nums leading-none text-slate-700 dark:text-white/60">
                  {pranaLevel}/100
                </span>
              </div>
              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/[0.08]">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isExhausted
                      ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.7)]'
                      : isFlow
                      ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.5)]'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, pranaLevel))}%` }}
                />
              </div>
            </div>

            {/* HP */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Heart className="w-2.5 h-2.5 shrink-0 text-rose-500 dark:text-rose-400 fill-rose-500 dark:fill-rose-400" />
                  <span className="text-[9px] font-bold uppercase tracking-wider leading-none text-slate-700 dark:text-rose-400/70">HP</span>
                </div>
                <span className="text-[10px] font-mono tabular-nums leading-none text-slate-700 dark:text-white/60">
                  {dashboardData?.hp ?? 100}/100
                </span>
              </div>
              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/[0.08]">
                <div
                  className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-rose-600 to-pink-400 shadow-[0_0_6px_rgba(244,63,94,0.4)]"
                  style={{ width: `${Math.min(100, Math.max(0, dashboardData?.hp ?? 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* ── Direita: Theme Toggle ─────────────────────────────────────────── */}
          <div className="shrink-0 text-slate-700 dark:text-cyan-300">
            <ThemeToggle />
          </div>
        </div>
      </header>



      {/* Wrapper principal do conteúdo (evita sobreposição com o HUD sticky) */}
      <main ref={mainRef} className="flex-1 w-full pt-4 md:pt-6 pb-24 relative">
        
        {/* Banner de Feedback de Exaustão Arcana (Se pranaLevel <= 0) */}
        {isExhausted && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between gap-3 text-rose-200 text-xs shadow-[0_0_20px_rgba(244,63,94,0.2)]"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
            <span>
              <strong>ALERTA DE EXAUSTÃO ARCANA:</strong> Suas reservas de Prana esgotaram-se completamente (0/100). Ações e hábitos neutros estão temporariamente bloqueados. Execute <em>rituais restauradores</em> para recuperar o fôlego arcano!
            </span>
          </div>
          <button
            onClick={() => setActiveTab('missoes')}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 text-xs font-bold shrink-0 transition-all flex items-center justify-center cursor-pointer"
          >
            Ver Rituais Restauradores
          </button>
        </motion.div>
      )}



      {/* Área Central de Conteúdo com Scroll Suave e Espaçamento Seguro (pb-36 sm:pb-24) */}
      <div 
        className="w-full space-y-6 pb-36 sm:pb-24"
        style={{ paddingBottom: 'calc(9rem + env(safe-area-inset-bottom, 0px))' }}
      >
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
                className="space-y-6 pb-32"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* COLUNA ESQUERDA: AVATAR 3D, HP & XP GLOBAL */}
                  <div className="lg:col-span-5 space-y-5">
                    
                    {/* 1. CONTAINER HERO: AVATAR 3D LOCAL */}
                    <div className="relative h-48 sm:h-64 md:h-80 w-full rounded-3xl overflow-hidden bg-white/60 dark:bg-[#0B0B10]/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none group">
                      
                      {/* Overlay gradiente suave */}
                      <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-transparent z-10 pointer-events-none" />

                      {/* Botão de Ação Rápida no Canvas 3D */}
                      <div className="absolute top-3 right-3 z-20">
                        <button 
                          onClick={() => setIsForgeOpen(true)}
                          className="min-h-[44px] px-4 py-2 rounded-full bg-btn-primary/20 hover:bg-btn-primary/30 border border-btn-primary/40 text-fg-primary text-xs font-bold transition-all backdrop-blur-xl flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                        >
                          <Wand2 className="w-3.5 h-3.5 text-btn-primary" />
                          <span>Forja IA</span>
                        </button>
                      </div>

                      {/* Componente 3D com Aura no Nível Máximo (5.0) */}
                      <div className="absolute inset-0 pointer-events-none sm:pointer-events-auto">
                        <AuraAvatar3D auraRadius={dashboardData?.auraRadius || 5.0} />
                      </div>
                      
                      {/* Legenda inferior do Avatar */}
                      <div className="absolute bottom-3.5 left-4 right-4 z-20 flex justify-between items-end pointer-events-none">
                        <div>
                          <h1 className="text-base font-bold text-slate-800 dark:text-white drop-shadow-md">{currentName}</h1>
                          <p className="text-xs text-slate-600 dark:text-fg-secondary font-medium drop-shadow-sm">Mago Supremo da Produtividade</p>
                        </div>
                        <span className="text-[10px] text-fg-tertiary font-mono bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-container-border">
                          Gire para inspecionar
                        </span>
                      </div>
                    </div>

                    {/* 2. CARD DE HP (SOPRO VITAL), PRANA & ENERGIA (STAMINA) */}
                    <motion.div 
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.2 }}
                      className="p-5 rounded-3xl bg-white/60 dark:bg-[#0B0B10]/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none space-y-4 hover:border-white/60 dark:hover:border-white/20 transition-all"
                    >
                      {/* Seção Prana Arcano */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className={`uppercase tracking-widest font-bold flex items-center gap-2 ${isExhausted ? 'text-rose-400 animate-pulse' : 'text-slate-800 dark:text-white'}`}>
                            {isExhausted ? <AlertTriangle className="w-4 h-4 text-rose-400" /> : <Flame className="w-4 h-4 text-cyan-400" />}
                            Prana Arcano
                          </span>
                          <span className={`font-mono font-bold text-sm ${isExhausted ? 'text-rose-400' : 'text-cyan-400'}`}>
                            {pranaLevel}/100
                          </span>
                        </div>

                        <div className="h-3 w-full bg-black/60 rounded-full overflow-hidden border border-container-border/40 shadow-inner p-0.5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, Math.max(0, pranaLevel))}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`h-full rounded-full ${
                              isExhausted 
                                ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]' 
                                : isFlow 
                                ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.7)]' 
                                : 'bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]'
                            }`}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[11px] pt-0.5">
                          <span className={isExhausted ? 'text-rose-400 font-bold' : 'text-fg-secondary'}>
                            {isExhausted 
                              ? '💀 Exaustão Arcana! Execute rituais restauradores.' 
                              : isFlow 
                              ? '✨ Fluxo Pleno (Flow State: bônus de foco ativado)' 
                              : 'Reserva de Prana Estável'}
                          </span>
                        </div>
                      </div>

                      {/* Seção HP */}
                      <div className="space-y-2 pt-2 border-t designcode-divider">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-800 dark:text-white uppercase tracking-widest font-bold flex items-center gap-2">
                            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
                            Sopro Vital (HP)
                          </span>
                          <span className="font-mono font-bold text-rose-400 drop-shadow-sm text-sm">
                            {dashboardData?.hp ?? 100}/100
                          </span>
                        </div>

                        <div className="h-3 w-full bg-black/60 rounded-full overflow-hidden border border-container-border/40 shadow-inner p-0.5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, Math.max(0, dashboardData?.hp ?? 100))}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-500 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.8)]"
                          />
                        </div>
                        <div className="flex justify-between items-center text-[11px] pt-0.5">
                          <span className={dashboardData?.hp !== undefined && dashboardData.hp < 50 ? 'text-rose-400 font-semibold' : 'text-fg-secondary'}>
                            {dashboardData?.hp !== undefined && dashboardData.hp <= 0 
                              ? '💀 Mago em Estado Crítico (0 HP)' 
                              : dashboardData?.hp !== undefined && dashboardData.hp < 50 
                              ? '⚠️ Sopro Vital Corrompido!' 
                              : 'Vitalidade Estável'}
                          </span>
                        </div>
                      </div>

                      {/* Seção Energia / Stamina */}
                      <div className="space-y-2 pt-2 border-t designcode-divider">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-800 dark:text-white uppercase tracking-widest font-bold flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                            Energia (Stamina)
                          </span>
                          <span className="font-mono font-bold text-amber-300 drop-shadow-sm text-sm">
                            {dashboardData?.energy ?? 100}/100
                          </span>
                        </div>

                        <div className="h-3 w-full bg-black/60 rounded-full overflow-hidden border border-container-border/40 shadow-inner p-0.5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, Math.max(0, dashboardData?.energy ?? 100))}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                          />
                        </div>
                        <div className="flex justify-between items-center text-[11px] pt-0.5">
                          <span className={dashboardData?.energy !== undefined && dashboardData.energy < 40 ? 'text-amber-400 font-semibold' : 'text-fg-secondary'}>
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
                      className="p-5 rounded-3xl bg-white/60 dark:bg-[#0B0B10]/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none space-y-3 hover:border-white/60 dark:hover:border-white/20 transition-all"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-800 dark:text-white uppercase tracking-widest font-bold flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-btn-primary" />
                          XP Global da Aura
                        </span>
                        <span className="font-mono font-bold text-btn-primary text-sm">
                          {dashboardData?.currentXp ?? dashboardData?.globalXp ?? 0} XP
                        </span>
                      </div>

                      <div className="h-3 w-full bg-black/60 rounded-full overflow-hidden border border-container-border/40 shadow-inner p-0.5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, Math.max(0, ((dashboardData?.currentXp ?? dashboardData?.globalXp ?? 0) / (dashboardData?.targetXp || 100)) * 100))}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                        />
                      </div>
                      <p className="text-[11px] text-fg-tertiary text-center pt-0.5">
                        Aura Transcendental no Nível Máximo (Raio 5.0m expandido).
                      </p>
                    </motion.div>
                  </div>

                  {/* COLUNA DIREITA: OS 4 ELEMENTOS & ATALHOS */}
                  <div className="lg:col-span-7 space-y-5">
                    
                    {/* OS QUATRO ELEMENTOS ARCANOS (GRID 2x2) */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-btn-primary" />
                          Progresso dos Quatro Elementos
                        </h3>
                        <span className="text-[11px] font-mono text-btn-primary font-semibold">
                          Gamificação Ativa
                        </span>
                      </div>
                      <ProductivityAnalytics 
                        tasksCompleted={dashboardData?.ritualsCompleted ?? (dashboardData?.fireElement ? Math.floor(dashboardData.fireElement / 10) : 0)}
                        totalDurationLabel="0h 0m"
                        series={{
                          fire: [
                            { label: "8h", minutes: Math.floor((dashboardData?.fireElement || 78) * 0.3) },
                            { label: "12h", minutes: Math.floor((dashboardData?.fireElement || 78) * 0.6) },
                            { label: "Agora", minutes: dashboardData?.fireElement || 78 }
                          ],
                          water: [
                            { label: "8h", minutes: Math.floor((dashboardData?.waterElement || 45) * 0.2) },
                            { label: "12h", minutes: Math.floor((dashboardData?.waterElement || 45) * 0.5) },
                            { label: "Agora", minutes: dashboardData?.waterElement || 45 }
                          ],
                          earth: [
                            { label: "8h", minutes: Math.floor((dashboardData?.earthElement || 92) * 0.4) },
                            { label: "12h", minutes: Math.floor((dashboardData?.earthElement || 92) * 0.7) },
                            { label: "Agora", minutes: dashboardData?.earthElement || 92 }
                          ],
                          air: [
                            { label: "8h", minutes: Math.floor((dashboardData?.airElement || 60) * 0.3) },
                            { label: "12h", minutes: Math.floor((dashboardData?.airElement || 60) * 0.6) },
                            { label: "Agora", minutes: dashboardData?.airElement || 60 }
                          ]
                        }}
                      />
                    </div>

                    {/* ATALHOS RÁPIDOS & FUNIL DO DISPATCHER */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <button 
                        type="button"
                        onClick={() => setActiveTab('chat')}
                        className="p-4 rounded-2xl bg-white/60 dark:bg-[#0B0B10]/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none text-left transition-all duration-200 group hover:border-btn-primary/60 active:scale-[0.98] cursor-pointer relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-2 rounded-xl bg-btn-primary/15 text-btn-primary group-hover:scale-110 transition-transform">
                            <Bot className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-btn-primary/15 text-btn-primary border border-btn-primary/30 flex items-center gap-1 group-hover:bg-btn-primary group-hover:text-white transition-colors">
                            Abrir Terminal <ChevronRight className="w-3 h-3 inline" />
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white">Terminal do Orquestrador</p>
                        <p className="text-[11px] text-slate-600 dark:text-fg-secondary mt-0.5">Agende rituais e execute comandos pela IA</p>
                      </button>

                      <button 
                        type="button"
                        onClick={() => setActiveTab('missoes')}
                        className="p-4 rounded-2xl bg-white/60 dark:bg-[#0B0B10]/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none text-left transition-all duration-200 group hover:border-cyan-400/60 active:scale-[0.98] cursor-pointer relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 group-hover:scale-110 transition-transform">
                            <CheckSquare className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                          </div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-400/30 flex items-center gap-1 group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                            Abrir Dispatcher <ChevronRight className="w-3 h-3 inline" />
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white">Quadro Temporal & Rituais</p>
                        <p className="text-[11px] text-slate-600 dark:text-fg-secondary mt-0.5">Dispatcher da Lista Diária, cronômetro ADR-000 e Prana</p>
                      </button>
                    </div>

                    {/* Resumo de Dica Arcana */}
                    <div className="p-4 rounded-3xl bg-white/60 dark:bg-[#0B0B10]/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white">
                        <Sparkles className="w-4 h-4 text-btn-primary" />
                        <span>Dica da Sabedoria Elemental</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-fg-secondary leading-relaxed">
                        Conclua rituais restauradores para regenerar o seu <strong>Prana Arcano</strong>. Evite hábitos tóxicos ou venenos para não esgotar suas energias e sofrer danos diretos ao seu Sopro Vital (HP)!
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
                className="w-full min-h-[calc(100vh-16rem)] flex flex-col"
              >
                <OrchestratorChatView />
              </motion.div>
            )}

            {/* ============================================================ */}
            {/* ABA 3: MISSÕES & QUADRO TEMPORAL (DISPATCHER) */}
            {/* ============================================================ */}
            {activeTab === 'missoes' && (
              <motion.div
                key="missoes"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.2 }}
                className="w-full pb-32"
              >
                <TemporalBoard />
              </motion.div>
            )}

            {/* ============================================================ */}
            {/* ABA 4: GRIMÓRIO DE CONHECIMENTO & RELATÓRIOS */}
            {/* ============================================================ */}
            {(activeTab === 'conhecimento' || activeTab === 'relatorios') && (
              <motion.div
                key="conhecimento"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full pb-32"
              >
                  <ArcaneLeaderboard 
                  period={leaderboardPeriod}
                  onPeriodChange={setLeaderboardPeriod}
                  podium={[
                    { rank: 1, name: currentName, points: dashboardData?.currentXp ?? dashboardData?.globalXp ?? 0, element: 'fire', flag: '🇵🇹', isCurrentUser: true },
                    { rank: 2, name: 'Merlin_99', points: 2100, element: 'air', flag: '🇬🇧' },
                    { rank: 3, name: 'Gandalf', points: 1850, element: 'earth', flag: '🇳🇿' },
                  ]}
                  rest={[
                    { rank: 4, name: 'Morgana', points: 1500, element: 'water', flag: '🇫🇷' },
                    { rank: 5, name: 'DrStrange', points: 1200, element: 'fire', flag: '🇺🇸' },
                    { rank: 6, name: 'Harry', points: 1000, element: 'air', flag: '🇬🇧' },
                    { rank: 7, name: 'Albus', points: 920, element: 'fire', flag: '🇬🇧' },
                    { rank: 8, name: 'Raistlin', points: 870, element: 'earth', flag: '🇨🇦' },
                    { rank: 9, name: 'Yennefer', points: 810, element: 'water', flag: '🇵🇱' },
                    { rank: 10, name: 'Geralt', points: 750, element: 'air', flag: '🇵🇱' },
                  ]}
                  standingMessage="Você está à frente de 99% dos magos na sua região!"
                  currentUserRank={1}
                />
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
                className="space-y-6 max-w-4xl mx-auto pb-32"
              >
                {/* Card de Identidade do Mago */}
                <div className="w-full mb-8">
                  <ArcaneProfileStats 
                    name={currentName}
                    avatarUrl={dashboardData?.avatarGlbUrl ? undefined : undefined} // Not using 3d model URL as 2D avatar for now
                    level={dashboardData?.level ?? dashboardData?.arcanoLevel ?? 1}
                    xpCurrent={dashboardData?.currentXp ?? dashboardData?.globalXp ?? 0}
                    xpNext={dashboardData?.targetXp ?? 100}
                    points={dashboardData?.pranaLevel ?? 100}
                    worldRank={0}
                    localRank={1}
                    badges={[
                      { id: '1', element: 'fire', locked: false },
                      { id: '2', element: 'water', locked: true },
                      { id: '3', element: 'earth', locked: true },
                      { id: '4', element: 'air', locked: true },
                      { id: '5', element: 'fire', locked: true },
                      { id: '6', locked: true },
                    ]}
                    ritualsThisMonth={dashboardData?.ritualsCompleted ?? 0}
                    ritualsGoal={50}
                    grimoiresCreated={0}
                    ritualsWon={0}
                    weeklyPerformance={[
                      { label: 'Seg', value: 40, element: 'fire' },
                      { label: 'Ter', value: 70, element: 'earth' },
                      { label: 'Qua', value: 30, element: 'water' },
                      { label: 'Qui', value: 90, element: 'fire' },
                      { label: 'Sex', value: 50, element: 'air' },
                      { label: 'Sáb', value: 20, element: 'water' },
                      { label: 'Dom', value: 80, element: 'earth' },
                    ]}
                  />
                </div>

                {/* Estado das Chaves Arcanas */}
                <div className="p-5 rounded-3xl bg-white/60 dark:bg-[#0B0B10]/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-btn-primary" />
                    Conexões & Chaves de API
                  </h3>

                  <div className="space-y-2.5">
                    <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-white/[0.04] border border-white/30 dark:border-white/10 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-white">Tripo3D API</p>
                        <p className="text-[10px] text-slate-600 dark:text-fg-secondary">Forja de Avatares 3D em tempo real</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 font-semibold">
                        <Check className="w-3 h-3" /> Conectada
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-white/[0.04] border border-white/30 dark:border-white/10 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-white">Spring AI (Conselho Elemental v4.0)</p>
                        <p className="text-[10px] text-slate-600 dark:text-fg-secondary">Agente Orquestrador & Tools Canônicas de Prana</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-btn-primary/15 border border-btn-primary/30 text-slate-800 dark:text-white font-semibold">
                        <Sparkles className="w-3 h-3 text-btn-primary" /> Autônomo
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-white/[0.04] border border-white/30 dark:border-white/10 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-white">Google Calendar</p>
                        <p className="text-[10px] text-slate-600 dark:text-fg-secondary">Conselheiro Temporal de Agenda</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 font-semibold">
                        <Check className="w-3 h-3" /> Sincronizado
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ações do Mago */}
                <div className="p-5 rounded-3xl bg-white/60 dark:bg-[#0B0B10]/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Ações Arcanas</h3>
                  
                  <button 
                    onClick={() => setIsForgeOpen(true)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-btn-primary/15 hover:bg-btn-primary/25 border border-btn-primary/40 text-slate-800 dark:text-white text-xs font-bold flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-btn-primary" />
                      Forjar Novo Avatar 3D (Tripo3D)
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 dark:text-fg-tertiary" />
                  </button>

                  <button 
                    onClick={handleLogout}
                    className="w-full py-3.5 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-bold flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <LogOut className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                      Encerrar Sessão Arcana
                    </span>
                    <ChevronRight className="w-4 h-4 text-rose-500/60 dark:text-rose-400/60" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Espaçador invisível no final do fluxo da página */}
          <div className="h-28 w-full shrink-0 md:hidden" aria-hidden="true" />

        </div>
      </div>
      </main>

    </div>
  );
}
