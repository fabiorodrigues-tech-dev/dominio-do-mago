'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Sparkles, 
  Bot, 
  CheckSquare, 
  Shield, 
  BookOpen, 
  LogOut, 
  Heart, 
  Zap, 
  Flame,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigation, NavigationTab } from '../contexts/NavigationContext';
import ThemeToggle from './ThemeToggle';
import { getUserDashboardData, DashboardData } from '../services/api';

export default function Sidebar() {
  const pathname = usePathname();
  const { activeTab, setActiveTab } = useNavigation();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (pathname === '/login') return;

    const loadData = async () => {
      try {
        const data = await getUserDashboardData();
        setDashboardData(data);
      } catch (err) {
        // Silently catch or fallback
      }
    };
    loadData();

    const handleRefresh = () => loadData();
    window.addEventListener('nexus:refresh-dashboard', handleRefresh);
    return () => window.removeEventListener('nexus:refresh-dashboard', handleRefresh);
  }, [pathname]);

  if (pathname === '/login') {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('mago_token');
    localStorage.removeItem('nexus_token');
    window.location.href = '/login';
  };

  const navItems = [
    { id: 'grimorio' as NavigationTab, label: 'Grimório Arcano', icon: Sparkles },
    { id: 'chat' as NavigationTab, label: 'Orquestrador IA', icon: Bot },
    { id: 'missoes' as NavigationTab, label: 'Missões & Rituais', icon: CheckSquare },
    { id: 'conhecimento' as NavigationTab, label: 'Relatórios & Lore', icon: BookOpen },
    { id: 'perfil' as NavigationTab, label: 'Perfil do Mago', icon: Shield },
  ];

  const prana = dashboardData?.pranaLevel ?? 100;
  const isExhausted = prana <= 0;

  return (
    <aside 
      aria-label="Menu Lateral Desktop"
      className="hidden md:flex fixed top-4 left-4 bottom-4 w-64 z-40 flex-col justify-between p-4 rounded-3xl designcode-card shadow-2xl overflow-y-auto custom-scrollbar"
    >
      {/* Topo da Sidebar: Logo & Identidade */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-1 pt-1">
          <div className="w-10 h-10 rounded-2xl bg-btn-primary/20 border border-btn-primary/40 flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5 text-btn-primary animate-pulse" />
          </div>
          <div>
            <h1 className="text-xs font-extrabold tracking-wider text-fg-primary uppercase">
              Domínio do Mago
            </h1>
            <p className="text-[9px] font-mono text-fg-tertiary tracking-wider uppercase">
              DesignCode UI • Sistema
            </p>
          </div>
        </div>

        {/* Mini Card de Status do Mago */}
        <div className="p-3 rounded-2xl designcode-card space-y-2 border border-container-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-xl bg-btn-primary/15 border border-btn-primary/30 flex items-center justify-center text-btn-primary font-bold text-[11px] shrink-0">
                FR
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate text-fg-primary">Fábio Rodrigues</p>
                <p className="text-[10px] text-fg-secondary font-medium truncate">Mago Arcano</p>
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-btn-primary/15 text-btn-primary border border-btn-primary/30">
              NV {dashboardData?.arcanoLevel || 5}
            </span>
          </div>

          {/* Barras de HP, Prana e Energia */}
          <div className="space-y-2 pt-1 border-t designcode-divider">
            {/* Prana Widget na Sidebar */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[9px] font-semibold">
                <span className={`flex items-center gap-1 ${isExhausted ? 'text-rose-400 font-bold animate-pulse' : 'text-cyan-400'}`}>
                  {isExhausted ? <AlertTriangle className="w-2.5 h-2.5" /> : <Flame className="w-2.5 h-2.5" />}
                  {isExhausted ? 'Prana (Exaustão!)' : 'Prana Arcano'}
                </span>
                <span className={`font-mono ${isExhausted ? 'text-rose-400 font-bold' : 'text-cyan-400'}`}>
                  {prana}/100
                </span>
              </div>
              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-container-border/40">
                <div 
                  style={{ width: `${Math.min(100, Math.max(0, prana))}%` }}
                  className={`h-full rounded-full transition-all duration-500 ${
                    isExhausted 
                      ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' 
                      : 'bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                  }`}
                />
              </div>
            </div>

            {/* HP */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[9px] font-semibold text-fg-secondary">
                <span className="flex items-center gap-1">
                  <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" /> HP
                </span>
                <span className="font-mono text-rose-400">{dashboardData?.hp ?? 100}/100</span>
              </div>
              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-container-border/40">
                <div 
                  style={{ width: `${Math.min(100, Math.max(0, dashboardData?.hp ?? 100))}%` }}
                  className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full"
                />
              </div>
            </div>

            {/* Stamina */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[9px] font-semibold text-fg-secondary">
                <span className="flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" /> Stamina
                </span>
                <span className="font-mono text-amber-300">{dashboardData?.energy ?? 100}/100</span>
              </div>
              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-container-border/40">
                <div 
                  style={{ width: `${Math.min(100, Math.max(0, dashboardData?.energy ?? 100))}%` }}
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Links de Navegação Vertical */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id || (item.id === 'conhecimento' && activeTab === 'relatorios');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl font-semibold text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-btn-primary/20 text-fg-primary border border-btn-primary/40 shadow-sm'
                    : 'text-fg-secondary hover:text-fg-primary hover:bg-container-bg border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 transition-transform ${isActive ? 'text-btn-primary scale-110' : 'text-fg-secondary'}`} />
                  <span className={isActive ? 'text-fg-primary font-bold' : ''}>{item.label}</span>
                </div>
                {isActive && (
                  <motion.div 
                    layoutId="sidebarActiveIndicator" 
                    className="w-1.5 h-1.5 rounded-full bg-btn-primary shadow-[0_0_8px_currentColor]" 
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Rodapé da Sidebar: Toggle Tema e Sair */}
      <div className="pt-3 border-t designcode-divider space-y-2">
        <div className="flex items-center justify-between p-2 rounded-2xl designcode-card border border-container-border/50">
          <span className="text-xs font-semibold text-fg-secondary pl-1">Aparência</span>
          <ThemeToggle />
        </div>

        <button 
          type="button"
          onClick={handleLogout}
          className="w-full py-2 px-3 rounded-xl text-fg-secondary hover:text-rose-400 text-xs font-medium flex items-center justify-center gap-2 transition-colors hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Encerrar Sessão</span>
        </button>
      </div>
    </aside>
  );
}
