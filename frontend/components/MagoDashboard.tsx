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
  LayoutDashboard,
  AlertTriangle,
  Skull
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getUserDashboardData, DashboardData } from '../services/api';
import { useNavigation, NavigationTab } from '../contexts/NavigationContext';

export default function MagoDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const { activeTab, setActiveTab } = useNavigation();
  const [isForgeOpen, setIsForgeOpen] = useState(false);

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
        className="p-4 rounded-2xl designcode-card transition-all hover:border-container-border/80"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-xl bg-container-bg border border-container-border/50 ${colorClass}`}>
              {icon}
            </span>
            <span className="text-xs font-semibold text-fg-secondary uppercase tracking-wider">{label}</span>
          </div>
          <span className="text-xs font-mono font-bold text-fg-primary">{value} XP</span>
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
      case 'conhecimento': return 'Grimório de Conhecimento & Histórico';
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

      {/* Topbar Superior Global */}
      <header className="px-4 md:px-6 py-3 shrink-0 flex items-center justify-between designcode-card z-20 shadow-lg">
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 md:hidden">
            <span className="w-2 h-2 rounded-full bg-btn-primary animate-ping" />
            <span className="text-xs font-extrabold tracking-wider text-fg-primary uppercase">Domínio do Mago</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-btn-primary" />
            <h2 className="text-xs font-bold text-fg-secondary uppercase tracking-wider">
              {getActiveTabTitle()}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* WIDGET INDICADOR DE PRANA (0 a 100) COM FEEDBACK DE EXAUSTÃO */}
          <div 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 shadow-sm ${
              isExhausted
                ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                : isFlow
                ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                : 'bg-container-bg border-container-border text-fg-primary'
            }`}
            title={
              isExhausted 
                ? 'EXAUSTÃO ARCANA: Prana esgotado (0/100)! Complete rituais restauradores para recuperar Prana.' 
                : `Nível de Prana: ${pranaLevel}/100${isFlow ? ' (Fluxo Pleno)' : ''}`
            }
          >
            {isExhausted ? (
              <Skull className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
            ) : (
              <Flame className="w-3.5 h-3.5 text-cyan-400" />
            )}
            
            <div className="flex items-center gap-1.5 text-xs font-bold font-mono">
              <span className="hidden sm:inline uppercase text-[10px] tracking-wider font-sans text-fg-secondary">
                {isExhausted ? 'Exaustão' : 'Prana'}
              </span>
              <span className={isExhausted ? 'text-rose-400 font-extrabold' : 'text-fg-primary'}>
                {pranaLevel}/100
              </span>
            </div>

            {/* Mini Barra Visual de Prana */}
            <div className="w-10 sm:w-16 h-1.5 bg-black/40 rounded-full overflow-hidden border border-container-border/40 hidden xs:block">
              <div 
                style={{ width: `${Math.min(100, Math.max(0, pranaLevel))}%` }}
                className={`h-full rounded-full transition-all duration-500 ${
                  isExhausted 
                    ? 'bg-rose-500' 
                    : isFlow 
                    ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' 
                    : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                }`}
              />
            </div>

            {isExhausted && (
              <span className="text-[9px] font-extrabold uppercase tracking-tight px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/40">
                CRÍTICO
              </span>
            )}
            {isFlow && !isExhausted && (
              <span className="hidden md:inline text-[9px] font-bold uppercase tracking-tight px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                FLOW
              </span>
            )}
          </div>

          {/* Badge de Vida (HP) */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold shadow-sm">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            <span>{dashboardData?.hp ?? 100} HP</span>
          </div>

          {/* Badge de Energia / Stamina */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-sm">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{dashboardData?.energy ?? 100} EN</span>
          </div>

          {/* Badge de Nível Arcano */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-btn-primary/15 border border-btn-primary/30 text-fg-primary text-xs font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-btn-primary" />
            <span className="hidden sm:inline text-fg-secondary">NÍVEL</span>
            <span>{dashboardData?.arcanoLevel || 5}</span>
          </div>

          {/* Theme Toggle no topo */}
          <ThemeToggle />
          
          {/* Botão Sair Mobile */}
          <button 
            onClick={handleLogout}
            title="Sair do Domínio do Mago"
            className="md:hidden p-2 rounded-xl bg-container-bg hover:bg-rose-500/20 text-fg-secondary hover:text-rose-400 transition-colors border border-container-border"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

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
            className="px-3 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 text-[11px] font-bold shrink-0 transition-all cursor-pointer"
          >
            Ver Rituais Restauradores
          </button>
        </motion.div>
      )}

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
                    <div className="relative h-[360px] sm:h-[400px] w-full rounded-3xl overflow-hidden designcode-card shadow-2xl group">
                      
                      {/* Overlay gradiente suave */}
                      <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-transparent z-10 pointer-events-none" />

                      {/* Botão de Ação Rápida no Canvas 3D */}
                      <div className="absolute top-3 right-3 z-20">
                        <button 
                          onClick={() => setIsForgeOpen(true)}
                          className="px-3.5 py-1.5 rounded-full bg-btn-primary/20 hover:bg-btn-primary/30 border border-btn-primary/40 text-fg-primary text-xs font-bold transition-all backdrop-blur-xl flex items-center gap-1.5 shadow-md active:scale-95"
                        >
                          <Wand2 className="w-3.5 h-3.5 text-btn-primary" />
                          <span>Forja IA</span>
                        </button>
                      </div>

                      {/* Componente 3D com Aura no Nível Máximo (5.0) */}
                      <AuraAvatar3D auraRadius={dashboardData?.auraRadius || 5.0} />
                      
                      {/* Legenda inferior do Avatar */}
                      <div className="absolute bottom-3.5 left-4 right-4 z-20 flex justify-between items-end pointer-events-none">
                        <div>
                          <h1 className="text-base font-bold text-fg-primary drop-shadow-md">Fábio Rodrigues</h1>
                          <p className="text-xs text-fg-secondary font-medium drop-shadow-sm">Mago Supremo da Produtividade</p>
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
                      className="p-5 rounded-3xl designcode-card space-y-4 hover:border-container-border/80 transition-all"
                    >
                      {/* Seção Prana Arcano */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className={`uppercase tracking-widest font-bold flex items-center gap-2 ${isExhausted ? 'text-rose-400 animate-pulse' : 'text-fg-primary'}`}>
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
                          <span className="text-fg-primary uppercase tracking-widest font-bold flex items-center gap-2">
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
                          <span className="text-fg-primary uppercase tracking-widest font-bold flex items-center gap-2">
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
                      className="p-5 rounded-3xl designcode-card space-y-3 hover:border-container-border/80 transition-all"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-fg-primary uppercase tracking-widest font-bold flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-btn-primary" />
                          XP Global da Aura
                        </span>
                        <span className="font-mono font-bold text-btn-primary text-sm">
                          {dashboardData?.globalXp || 2500} XP
                        </span>
                      </div>

                      <div className="h-3 w-full bg-black/60 rounded-full overflow-hidden border border-container-border/40 shadow-inner p-0.5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, Math.max(10, ((dashboardData?.globalXp || 2500) % 500) / 5))}%` }}
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
                        <h3 className="text-xs font-bold text-fg-primary uppercase tracking-wider flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-btn-primary" />
                          Progresso dos Quatro Elementos
                        </h3>
                        <span className="text-[11px] font-mono text-btn-primary font-semibold">
                          Gamificação Ativa
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3.5">
                        <ProgressBar 
                          label="Fogo (Foco & Ação)" 
                          value={dashboardData?.fireElement || 78} 
                          icon={<Flame className="w-4 h-4" />} 
                          colorClass="text-rose-400" 
                        />
                        <ProgressBar 
                          label="Água (Fluidez & Sono)" 
                          value={dashboardData?.waterElement || 45} 
                          icon={<Droplet className="w-4 h-4" />} 
                          colorClass="text-cyan-400" 
                        />
                        <ProgressBar 
                          label="Terra (Rotina & Finanças)" 
                          value={dashboardData?.earthElement || 92} 
                          icon={<Mountain className="w-4 h-4" />} 
                          colorClass="text-amber-400" 
                        />
                        <ProgressBar 
                          label="Ar (Estudos & Sabedoria)" 
                          value={dashboardData?.airElement || 60} 
                          icon={<Wind className="w-4 h-4" />} 
                          colorClass="text-emerald-400" 
                        />
                      </div>
                    </div>

                    {/* ATALHOS RÁPIDOS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <button 
                        onClick={() => setActiveTab('chat')}
                        className="p-4 rounded-2xl designcode-card text-left transition-all group shadow-md hover:border-container-border/90"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <Bot className="w-5 h-5 text-btn-primary group-hover:scale-110 transition-transform" />
                          <ChevronRight className="w-4 h-4 text-fg-tertiary group-hover:text-fg-primary transition-colors" />
                        </div>
                        <p className="text-xs font-bold text-fg-primary">Terminal do Orquestrador</p>
                        <p className="text-[11px] text-fg-secondary">Agende rituais e execute comandos pela IA</p>
                      </button>

                      <button 
                        onClick={() => setActiveTab('missoes')}
                        className="p-4 rounded-2xl designcode-card text-left transition-all group shadow-md hover:border-container-border/90"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <CheckSquare className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                          <ChevronRight className="w-4 h-4 text-fg-tertiary group-hover:text-fg-primary transition-colors" />
                        </div>
                        <p className="text-xs font-bold text-fg-primary">Quadro Temporal & Rituais</p>
                        <p className="text-[11px] text-fg-secondary">Dispatcher de rituais, hábitos e Prana</p>
                      </button>
                    </div>

                    {/* Resumo de Dica Arcana */}
                    <div className="p-4 rounded-3xl designcode-card space-y-2 border border-container-border/80">
                      <div className="flex items-center gap-2 text-xs font-bold text-fg-primary">
                        <Sparkles className="w-4 h-4 text-btn-primary" />
                        <span>Dica da Sabedoria Elemental</span>
                      </div>
                      <p className="text-xs text-fg-secondary leading-relaxed">
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
                className="h-[calc(100vh-8.5rem)] flex flex-col"
              >
                <OrchestratorChat />
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
                <div className="p-6 md:p-8 rounded-3xl designcode-card text-center space-y-4 shadow-xl">
                  <div className="w-24 h-24 mx-auto rounded-full bg-container-bg border border-container-border flex items-center justify-center shadow-lg">
                    <Shield className="w-10 h-10 text-btn-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-fg-primary">Fábio Rodrigues</h2>
                    <p className="text-xs text-fg-secondary font-mono">fabioandre777@gmail.com</p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-btn-primary/15 border border-btn-primary/30 text-fg-primary text-xs font-semibold">
                    <Award className="w-4 h-4 text-btn-primary" />
                    <span>Mago Supremo • Nível {dashboardData?.arcanoLevel || 5}</span>
                  </div>
                </div>

                {/* Estado das Chaves Arcanas */}
                <div className="p-5 rounded-3xl designcode-card space-y-3">
                  <h3 className="text-xs font-bold text-fg-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-btn-primary" />
                    Conexões & Chaves de API
                  </h3>

                  <div className="space-y-2.5">
                    <div className="p-3.5 rounded-2xl bg-container-bg border border-container-border/60 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-fg-primary">Tripo3D API</p>
                        <p className="text-[10px] text-fg-secondary">Forja de Avatares 3D em tempo real</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold">
                        <Check className="w-3 h-3" /> Conectada
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-container-bg border border-container-border/60 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-fg-primary">Spring AI (Conselho Elemental v4.0)</p>
                        <p className="text-[10px] text-fg-secondary">Agente Orquestrador & Tools Canônicas de Prana</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-btn-primary/15 border border-btn-primary/30 text-fg-primary font-semibold">
                        <Sparkles className="w-3 h-3 text-btn-primary" /> Autônomo
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-container-bg border border-container-border/60 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-fg-primary">Google Calendar</p>
                        <p className="text-[10px] text-fg-secondary">Conselheiro Temporal de Agenda</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold">
                        <Check className="w-3 h-3" /> Sincronizado
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ações do Mago */}
                <div className="p-5 rounded-3xl designcode-card space-y-3">
                  <h3 className="text-xs font-bold text-fg-primary uppercase tracking-wider">Ações Arcanas</h3>
                  
                  <button 
                    onClick={() => setIsForgeOpen(true)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-btn-primary/15 hover:bg-btn-primary/25 border border-btn-primary/40 text-fg-primary text-xs font-bold flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-btn-primary" />
                      Forjar Novo Avatar 3D (Tripo3D)
                    </span>
                    <ChevronRight className="w-4 h-4 text-fg-tertiary" />
                  </button>

                  <button 
                    onClick={handleLogout}
                    className="w-full py-3.5 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <LogOut className="w-4 h-4 text-rose-400" />
                      Encerrar Sessão Arcana
                    </span>
                    <ChevronRight className="w-4 h-4 text-rose-400/60" />
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
