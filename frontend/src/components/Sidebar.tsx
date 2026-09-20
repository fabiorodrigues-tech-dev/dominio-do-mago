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
  Wand2 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigation, NavigationTab } from '../../contexts/NavigationContext';
import ThemeToggle from '../../components/ThemeToggle';
import { getUserDashboardData, DashboardData } from '../../services/api';

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

  return (
    <aside 
      aria-label="Menu Lateral Desktop"
      className="hidden md:flex fixed top-4 left-4 bottom-4 w-64 z-40 flex-col justify-between p-5 rounded-3xl glass-card backdrop-blur-3xl bg-white/40 dark:bg-white/5 border border-white/10 shadow-2xl overflow-y-auto custom-scrollbar"
    >
      {/* Topo da Sidebar: Logo & Identidade */}
      <div className="space-y-5">
        <div className="flex items-center gap-3 px-1 pt-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-purple-500/25 flex items-center justify-center shrink-0">
            <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-950 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-xs font-extrabold tracking-wider bg-gradient-to-r from-purple-700 via-indigo-600 to-cyan-600 dark:from-purple-300 dark:via-pink-300 dark:to-cyan-300 bg-clip-text text-transparent uppercase">
              Domínio do Mago
            </h1>
            <p className="text-[9px] font-mono text-slate-500 dark:text-slate-400 tracking-wider uppercase">
              DesignCode UI • Sistema
            </p>
          </div>
        </div>

        {/* Mini Card de Status do Mago */}
        <div className="p-3 rounded-2xl glass-card backdrop-blur-3xl bg-white/40 dark:bg-white/5 space-y-2 border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-300 font-bold text-[11px] shrink-0">
                FR
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-100">Fábio Rodrigues</p>
                <p className="text-[10px] text-purple-600 dark:text-purple-300 font-medium truncate">Mago Arcano</p>
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
              NV {dashboardData?.arcanoLevel || 5}
            </span>
          </div>

          {/* Barras de HP e Energia */}
          <div className="space-y-2 pt-1">
            <div className="space-y-0.5">
              <div className="flex justify-between text-[9px] font-semibold text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" /> HP
                </span>
                <span className="font-mono text-rose-500">{dashboardData?.hp ?? 100}/100</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-black/60 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${Math.min(100, Math.max(0, dashboardData?.hp ?? 100))}%` }}
                  className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full"
                />
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="flex justify-between text-[9px] font-semibold text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-cyan-500 fill-cyan-500" /> Energia
                </span>
                <span className="font-mono text-cyan-500">{dashboardData?.energy ?? 100}/100</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-black/60 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${Math.min(100, Math.max(0, dashboardData?.energy ?? 100))}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Links de Navegação Vertical */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl font-semibold text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-600/15 dark:bg-purple-500/20 text-cyan-400 border border-cyan-400/40 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 transition-transform ${isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] scale-110' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className={isActive ? 'text-cyan-300 font-bold' : ''}>{item.label}</span>
                </div>
                {isActive && (
                  <motion.div 
                    layoutId="sidebarActiveIndicator" 
                    className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" 
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Rodapé da Sidebar: Toggle Tema e Sair */}
      <div className="pt-3 border-t border-slate-200/60 dark:border-white/10 space-y-2">
        <div className="flex items-center justify-between p-2 rounded-2xl glass-card backdrop-blur-3xl bg-white/40 dark:bg-white/5">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 pl-1">Aparência</span>
          <ThemeToggle />
        </div>

        <button 
          type="button"
          onClick={handleLogout}
          className="w-full py-2 px-3 rounded-xl text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 text-xs font-medium flex items-center justify-center gap-2 transition-colors hover:bg-red-500/10"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Encerrar Sessão</span>
        </button>
      </div>
    </aside>
  );
}
