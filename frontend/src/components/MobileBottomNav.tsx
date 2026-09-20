'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, Bot, CheckSquare, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigation, NavigationTab } from '../../contexts/NavigationContext';

interface NavButton {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
}

const navButtons: NavButton[] = [
  { id: 'grimorio', label: 'Grimório', icon: Sparkles },
  { id: 'chat', label: 'IA', icon: Bot },
  { id: 'missoes', label: 'Missões', icon: CheckSquare },
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
      className="flex md:hidden fixed bottom-4 left-4 right-4 z-50 glass-card bg-white/10 dark:bg-white/5 backdrop-blur-3xl border border-white/15 dark:border-white/10 rounded-3xl shadow-2xl shadow-purple-950/40 p-4 justify-around items-center"
    >
      {navButtons.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;

        return (
          <motion.button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            whileTap={{ scale: 0.9 }}
            className={`relative flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
              isActive
                ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {/* Indicador sutil de fundo ativo */}
            {isActive && (
              <motion.div
                layoutId="mobileActiveGlow"
                className="absolute -inset-2 bg-cyan-400/10 rounded-2xl -z-10"
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
