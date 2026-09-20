'use client';

import React, { useState } from 'react';
import { Send, Sparkles, User, Bot, Flame, Droplet, Mountain, Wind, Calendar, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendMessageToOrchestrator, triggerDashboardRefresh } from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'orchestrator';
  content: string;
}

const QUICK_COMMANDS = [
  { label: 'Treino de Foco', prompt: 'adicione um ritual de treino concluído e me dê 50 XP de Fogo', icon: <Flame className="w-3 h-3 text-rose-400" /> },
  { label: 'Meditação Arcana', prompt: 'adicione um ritual de meditação concluído e me dê 40 XP de Água', icon: <Droplet className="w-3 h-3 text-cyan-400" /> },
  { label: 'Estudo Spring AI', prompt: 'adicione um ritual de estudo de Spring AI concluído e me dê 50 XP de Ar', icon: <Wind className="w-3 h-3 text-emerald-400" /> },
  { label: 'Rotina & Finanças', prompt: 'adicione um ritual de organização financeira concluído e me dê 40 XP de Terra', icon: <Mountain className="w-3 h-3 text-amber-400" /> },
  { label: 'Consultar Agenda', prompt: 'quais são meus compromissos de hoje no calendário?', icon: <Calendar className="w-3 h-3 text-purple-400" /> },
];

export default function OrchestratorChat() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'orchestrator',
      content: '🧙‍♂️ Saudações, Mago Supremo! O Orquestrador Arcano está ativo. Posso organizar a sua agenda, registrar rituais concluídos ou conceder XP aos 4 elementos. O que deseja conjurar agora?',
    },
  ]);

  const sendPrompt = async (promptText: string) => {
    if (!promptText.trim() || isLoading) return;

    // Add User Message
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: promptText };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessageToOrchestrator(promptText);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'orchestrator',
        content: response,
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Notifica o app para atualizar instantaneamente os contadores de XP
      triggerDashboardRefresh();
    } catch (error) {
      console.error("Erro ao comunicar com o Orquestrador", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'orchestrator',
        content: 'Falha na conexão com o Círculo Arcano. Tente novamente mais tarde.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendPrompt(input);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/60 backdrop-blur-md rounded-3xl border border-purple-500/20 shadow-xl overflow-hidden">
      {/* Header do Chat */}
      <div className="px-4 py-3 border-b border-purple-500/20 bg-gradient-to-r from-purple-950/40 to-slate-900/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-100 tracking-wide">Terminal Arcano (Conselheiro)</h2>
            <p className="text-[10px] text-purple-400">Agente Autônomo com Tools de Rituais & Agenda</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          ONLINE
        </div>
      </div>

      {/* Chips de Atalhos Rápidos */}
      <div className="p-2.5 bg-black/30 border-b border-white/5 flex gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
        {QUICK_COMMANDS.map((cmd, idx) => (
          <button
            key={idx}
            onClick={() => sendPrompt(cmd.prompt)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-purple-600/20 border border-white/10 hover:border-purple-500/40 text-[11px] text-slate-300 hover:text-purple-200 transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap active:scale-95 disabled:opacity-50"
          >
            {cmd.icon}
            <span>{cmd.label}</span>
          </button>
        ))}
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2.5 max-w-[88%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar do Chat */}
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
                  msg.role === 'user'
                    ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                    : 'bg-purple-950/80 border-purple-500/50 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                }`}
              >
                {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Bolha de Mensagem */}
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-purple-600/30 text-purple-100 rounded-tr-none border border-purple-400/20 shadow-md'
                    : 'bg-white/[0.04] text-slate-200 rounded-tl-none border border-white/10 shadow-md backdrop-blur-md'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2.5 max-w-[80%]"
            >
              <div className="w-7 h-7 rounded-xl bg-purple-950/80 border border-purple-500/50 text-purple-300 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="p-3 rounded-2xl rounded-tl-none bg-white/[0.04] border border-white/10 text-xs text-purple-300 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                <span>Consultando os planos astrais e executando ferramentas...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Área de Input */}
      <div className="p-3 bg-slate-950/80 border-t border-white/10 shrink-0">
        <form onSubmit={handleFormSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ex: 'adicione um ritual de treino e me dê 50 XP de Fogo'..."
            className="w-full bg-slate-900/60 text-slate-200 placeholder:text-slate-500 rounded-2xl py-2.5 pl-4 pr-12 text-xs border border-white/10 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_10px_rgba(168,85,247,0.4)] active:scale-95"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
