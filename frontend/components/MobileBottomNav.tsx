'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, Bot, CheckSquare, Shield, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigation, NavigationTab } from '../contexts/NavigationContext';

interface NavButton {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
}

const navButtons: NavButton[] = [
  { id: 'grimorio', label: 'Grimório', icon: Sparkles },
  { id: 'chat', label: 'IA', icon: Bot },
  { id: 'missoes', label: 'Missões', icon: CheckSquare },
  { id: 'relatorios', label: 'Ranking', icon: Trophy },
  { id: 'perfil', label: 'Perfil', icon: Shield },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { activeTab, setActiveTab } = useNavigation();

  // Não exibe a barra na tela de autenticação
  if (pathname === '/login') {
    return null;
  }

  return (
    <nav 
      aria-label="Navegação Mobile"
      className="grid grid-cols-5 md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-[#0B0B10]/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 pb-[env(safe-area-inset-bottom)] px-2 pt-2 items-center"
    >
      {navButtons.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id || (id === 'relatorios' && activeTab === 'conhecimento');

        return (
          <motion.button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            whileTap={{ scale: 0.9 }}
            className={`relative flex flex-col items-center justify-center gap-1 transition-all duration-300 min-h-[44px] min-w-[48px] py-1 px-1 cursor-pointer w-full ${
              isActive
                ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {/* Indicador sutil de fundo ativo */}
            {isActive && (
              <motion.div
                layoutId="mobileActiveGlow"
                className="absolute -inset-1 bg-cyan-400/10 rounded-2xl -z-10"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}

            <Icon 
              className={`w-6 h-6 transition-all duration-300 ${
                isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : ''
              }`} 
            />
            <span className={`text-[10px] font-bold tracking-tight uppercase ${isActive ? 'text-cyan-400 font-extrabold' : ''}`}>
              {label}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
}
