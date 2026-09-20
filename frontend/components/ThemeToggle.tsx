'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
        <Sun className="w-4 h-4 opacity-40" />
      </div>
    );
  }

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      title={isDark ? "Alternar para Modo Claro (Luz Arcana)" : "Alternar para Modo Escuro (Vácuo Cósmico)"}
      aria-label="Alternar Tema Claro/Escuro"
      className="relative p-2 rounded-xl border transition-all duration-300 flex items-center justify-center bg-white/10 dark:bg-white/5 border-slate-300/40 dark:border-white/10 text-amber-500 dark:text-cyan-300 shadow-sm hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] backdrop-blur-xl"
    >
      <motion.div
        key={isDark ? 'dark' : 'light'}
        initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
        transition={{ duration: 0.25 }}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
        )}
      </motion.div>
    </motion.button>
  );
}
