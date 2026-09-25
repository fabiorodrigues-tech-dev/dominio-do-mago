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
  { label: 'Consultar Agenda', prompt: 'quais são meus compromissos de hoje no calendário?', icon: <Calendar className="w-3 h-3 text-cyan-400" /> },
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
    <div className="flex flex-col h-full designcode-card shadow-xl overflow-hidden">
      {/* Header do Chat */}
      <div className="px-4 py-3 border-b designcode-divider bg-container-bg flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-btn-primary/20 text-btn-primary border border-btn-primary/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-fg-primary tracking-wide">Terminal Arcano (Conselheiro)</h2>
            <p className="text-[10px] text-fg-secondary">Agente Autônomo com Tools de Prana, Rituais & Agenda</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          ONLINE
        </div>
      </div>

      {/* Chips de Atalhos Rápidos */}
      <div className="p-2.5 bg-black/30 border-b designcode-divider flex gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
        {QUICK_COMMANDS.map((cmd, idx) => (
          <button
            key={idx}
            onClick={() => sendPrompt(cmd.prompt)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-full bg-container-bg hover:bg-container-border/50 border border-container-border text-[11px] text-fg-secondary hover:text-fg-primary transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap active:scale-95 disabled:opacity-50 cursor-pointer"
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
                    : 'bg-btn-primary/20 border-btn-primary/40 text-btn-primary'
                }`}
              >
                {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Bolha de Mensagem */}
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-btn-primary/20 text-fg-primary rounded-tr-none border border-btn-primary/30 shadow-md'
                    : 'bg-container-bg text-fg-primary rounded-tl-none border border-container-border shadow-md backdrop-blur-md'
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
              <div className="w-7 h-7 rounded-xl bg-btn-primary/20 border border-btn-primary/40 text-btn-primary flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="p-3 rounded-2xl rounded-tl-none bg-container-bg border border-container-border text-xs text-fg-secondary flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-btn-primary" />
                <span>Consultando os planos astrais e executando ferramentas...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Área de Input */}
      <div className="p-3 bg-black/40 border-t designcode-divider shrink-0">
        <form onSubmit={handleFormSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ex: 'adicione um ritual de treino e me dê 50 XP de Fogo'..."
            className="w-full bg-container-bg text-fg-primary placeholder:text-fg-tertiary rounded-2xl py-2.5 pl-4 pr-12 text-xs border border-container-border focus:outline-none focus:border-btn-primary/60 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 p-2 rounded-xl designcode-btn-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
