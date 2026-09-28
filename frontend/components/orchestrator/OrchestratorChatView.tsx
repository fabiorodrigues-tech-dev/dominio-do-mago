"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Sparkles,
  Bot,
  Flame,
  Droplets,
  Mountain,
  Wind,
  Loader2,
  User,
  Trash2,
  Paperclip,
  ChevronDown,
  Play,
  BookOpen,
  Zap,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ELEMENTS, GLASS, GLASS_ADAPTIVE as G, ElementId } from "@/lib/design-tokens";
import { sendMessageToOrchestrator, triggerDashboardRefresh } from "@/services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActionCard {
  type: "ritual" | "xp" | "event" | "knowledge";
  label: string;
  description?: string;
  elementId?: ElementId;
  onPress?: () => void;
}

interface Message {
  id: string;
  role: "user" | "orchestrator";
  content: string;
  timestamp: Date;
  element?: ElementId;
  actionCards?: ActionCard[];
}

interface Channel {
  id: ElementId;
  name: string;
  subtitle: string;
  Icon: typeof Flame;
  quickPrompts: { label: string; prompt: string }[];
}

// ─── Action Card Icons ────────────────────────────────────────────────────────

const ACTION_ICONS: Record<ActionCard["type"], typeof Play> = {
  ritual: Play,
  xp: Zap,
  event: Calendar,
  knowledge: BookOpen,
};

// ─── Channels ─────────────────────────────────────────────────────────────────

const CHANNELS: Channel[] = [
  {
    id: "fire",
    name: "Fogo",
    subtitle: "Produtividade & Foco",
    Icon: Flame,
    quickPrompts: [
      { label: "Treino Concluído", prompt: "adicione um ritual de treino concluído e me dê 50 XP de Fogo" },
      { label: "Sessão de Foco", prompt: "registre uma sessão de foco de 90 minutos e conceda Prana de Fogo" },
      { label: "Status Fogo", prompt: "qual é o status das minhas metas de Fogo hoje?" },
    ],
  },
  {
    id: "water",
    name: "Água",
    subtitle: "Meditação & Equilíbrio",
    Icon: Droplets,
    quickPrompts: [
      { label: "Meditação", prompt: "adicione um ritual de meditação arcana concluído e me dê 40 XP de Água" },
      { label: "Journaling", prompt: "registre uma sessão de journaling terapêutico completa" },
      { label: "Respiração", prompt: "adicione uma prática de respiração profunda e regenere Prana" },
    ],
  },
  {
    id: "earth",
    name: "Terra",
    subtitle: "Finanças & Organização",
    Icon: Mountain,
    quickPrompts: [
      { label: "Rotina Financeira", prompt: "adicione um ritual de organização financeira concluído e me dê 40 XP de Terra" },
      { label: "Planejamento", prompt: "crie um plano de rituais para amanhã baseado nos meus elementos" },
      { label: "Check Diário", prompt: "faça um resumo das atividades de Terra completadas hoje" },
    ],
  },
  {
    id: "air",
    name: "Ar",
    subtitle: "Conhecimento & Estudo",
    Icon: Wind,
    quickPrompts: [
      { label: "Estudo Técnico", prompt: "adicione um ritual de estudo de Spring AI concluído e me dê 50 XP de Ar" },
      { label: "Leitura Arcana", prompt: "registre uma sessão de leitura arcana completada com XP de Ar" },
      { label: "Ver Agenda", prompt: "quais são meus compromissos de hoje no calendário?" },
    ],
  },
];

// ─── Initial Messages (Mock) ──────────────────────────────────────────────────

const INITIAL_MESSAGES: Message[] = [
  {
    id: "0",
    role: "orchestrator",
    content:
      "🧙‍♂️ Saudações, Mago Supremo! O Orquestrador Arcano está ativo e conectado à Matriz Elemental.\n\nPosso organizar a sua agenda, registrar rituais concluídos, conceder XP e Prana aos 4 elementos, ou simplesmente dialogar com sabedoria arcana.\n\nEscolha um canal elemental e invoque o que deseja!",
    timestamp: new Date(),
    actionCards: [
      { type: "ritual", label: "Ritual de Boas-Vindas", description: "Inicie seu primeiro ritual do dia", elementId: "fire" },
      { type: "knowledge", label: "Guia dos 4 Elementos", description: "Conheça a fundo cada caminho arcano" },
    ],
  },
  {
    id: "1",
    role: "user",
    content: "Quais são meus rituais pendentes de hoje?",
    timestamp: new Date(Date.now() - 60000),
    element: "fire",
  },
  {
    id: "2",
    role: "orchestrator",
    content:
      "⚡ Consultando a Matriz Temporal...\n\nIdentifiquei 3 rituais pendentes para hoje:\n\n🔥 Fogo — Sessão de foco profundo (90 min)\n🌊 Água — Meditação matinal (20 min)\n🌪️ Ar — Leitura técnica (30 min)\n\nDeseja iniciar o cronômetro de algum deles agora?",
    timestamp: new Date(Date.now() - 55000),
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ChannelTab({
  channel,
  isActive,
  onClick,
}: {
  channel: Channel;
  isActive: boolean;
  onClick: () => void;
}) {
  const theme = ELEMENTS[channel.id];
  const Icon = channel.Icon;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.93 }}
      className={[
        "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold min-h-[36px] border transition-all",
        isActive
          ? `${theme.gradientClass} ${theme.glowClass} text-white border-transparent`
          : `${GLASS.pill} text-white/40 hover:text-white/70 hover:border-white/20 border-transparent`,
      ].join(" ")}
    >
      <Icon className="h-3.5 w-3.5" style={{ color: isActive ? "white" : theme.solid }} />
      {channel.name}
    </motion.button>
  );
}

function InlineActionCard({ card }: { card: ActionCard }) {
  const ActionIcon = ACTION_ICONS[card.type];
  const theme = card.elementId ? ELEMENTS[card.elementId] : null;

  return (
    <motion.button
      type="button"
      onClick={card.onPress}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={[
        "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all cursor-pointer",
        GLASS.panel,
        GLASS.panelHover,
      ].join(" ")}
    >
      <span
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          theme ? `${theme.gradientClass} ${theme.glowClass}` : "bg-indigo-500/20",
        ].join(" ")}
      >
        <ActionIcon className="h-4 w-4 text-white" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-white">{card.label}</p>
        {card.description && (
          <p className="text-[11px] text-white/40">{card.description}</p>
        )}
      </div>
      <span className="text-[11px] font-medium shrink-0 text-white/30">
        {card.type === "ritual" ? "Iniciar →" : "Ver →"}
      </span>
    </motion.button>
  );
}

function UserBubble({ msg, activeElement }: { msg: Message; activeElement: ElementId }) {
  const theme = ELEMENTS[activeElement];
  return (
    <motion.div
      initial={{ opacity: 0, x: 14, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
      className="flex flex-row-reverse items-end gap-2 ml-auto max-w-[82%]"
    >
      {/* Avatar */}
      <div className={["flex h-7 w-7 shrink-0 items-center justify-center rounded-full", theme.gradientClass].join(" ")}>
        <User className="h-3.5 w-3.5 text-white" />
      </div>
      {/* Bubble — estética nativa: indigo/20 com borda indigo/30 */}
      <div className="flex flex-col items-end gap-0.5">
        <div
          className="px-4 py-2.5 text-[13px] leading-relaxed text-indigo-50 shadow-md rounded-2xl rounded-tr-sm bg-indigo-500/20 border border-indigo-500/30 backdrop-blur-sm"
        >
          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
        </div>
        <span className="text-[10px] pr-1 text-white/30">{formatTime(msg.timestamp)}</span>
      </div>
    </motion.div>
  );
}

function OrchestratorBubble({ msg }: { msg: Message }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -14, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
      className="flex items-end gap-2 max-w-[84%]"
    >
      {/* Avatar */}
      <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] border border-white/10">
        <Bot className="h-3.5 w-3.5 text-white/50" />
        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[#0B0B10]" />
      </div>

      {/* Bubble + action cards — frosted glass nativo */}
      <div className="flex flex-col gap-2 flex-1">
        {msg.content && (
          <div className="px-4 py-2.5 text-[13px] leading-relaxed text-white/90 shadow-md rounded-2xl rounded-tl-sm bg-white/5 border border-white/10 backdrop-blur-md">
            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
          </div>
        )}
        {msg.actionCards && msg.actionCards.length > 0 && (
          <div className="flex flex-col gap-2">
            {msg.actionCards.map((card, i) => (
              <InlineActionCard key={i} card={card} />
            ))}
          </div>
        )}
        <span className="text-[10px] pl-1 text-white/25">{formatTime(msg.timestamp)}</span>
      </div>
    </motion.div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  if (msg.role === "user") {
    return <UserBubble msg={msg} activeElement={msg.element || "fire"} />;
  }
  return <OrchestratorBubble msg={msg} />;
}

function TypingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex items-end gap-2 max-w-[80%]"
    >
      <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] border border-white/10">
        <Bot className="h-3.5 w-3.5 text-white/50" />
        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[#0B0B10] animate-pulse" />
      </div>
      <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm px-4 py-2.5 bg-white/[0.06] border border-white/10 backdrop-blur-md shadow-md">
        {[0, 0.15, 0.3].map((delay, i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-white/40"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{ duration: 0.9, delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OrchestratorChatView() {
  const [activeChannelId, setActiveChannelId] = useState<ElementId>("fire");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeChannel = CHANNELS.find((c) => c.id === activeChannelId) ?? CHANNELS[0];
  const activeTheme = ELEMENTS[activeChannelId];

  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
    return () => clearTimeout(timer);
  }, [messages]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 80);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  };

  const clearHistory = () => {
    setMessages([{ ...INITIAL_MESSAGES[0], id: Date.now().toString(), timestamp: new Date() }]);
  };

  const sendPrompt = useCallback(
    async (promptText: string) => {
      if (!promptText.trim() || isLoading) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: promptText.trim(),
        timestamp: new Date(),
        element: activeChannelId,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputValue("");
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }
      setIsLoading(true);

      try {
        const response = await sendMessageToOrchestrator(promptText);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "orchestrator",
            content: response,
            timestamp: new Date(),
          },
        ]);
        triggerDashboardRefresh();
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "orchestrator",
            content: "⚡ Falha na conexão com o Círculo Arcano. Verifique a sua ligação e tente novamente.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [activeChannelId, isLoading]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendPrompt(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendPrompt(inputValue);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      
      {/* Header: pílula glassmorphism - shrink-0 garante que não encolhe */}
      <div className="shrink-0 px-3 pt-3 pb-2 z-10">
        <div className="flex items-center justify-between p-3 rounded-3xl bg-white/5 dark:bg-[#0B0B10]/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-inner">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#12121E]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Orquestrador Arcano</span>
              <span className="text-[10px] font-medium text-emerald-500 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Conectado à Matriz • {activeTheme.label}
              </span>
            </div>
          </div>
          <button 
            onClick={clearHistory}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Message Stream: flex-1 estica até o fundo, overflow trata do scroll */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto w-full px-4 pt-2 pb-[140px] md:pb-24 space-y-4 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          {isLoading && <TypingBubble key="typing" />}
        </AnimatePresence>
        
        {/* Âncora fantasma para o scroll descer até aqui */}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Botão flutuante de Descer */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
            type="button"
            className="absolute bottom-20 right-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-indigo-500/90 text-white shadow-lg backdrop-blur-md cursor-pointer"
          >
            <ChevronDown className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input Bar: Estática na base (shrink-0), com Glassmorphism real */}
      <div className="shrink-0 w-full px-4 py-3 bg-white/80 dark:bg-[#0B0B10]/90 backdrop-blur-2xl border-t border-slate-200/50 dark:border-white/10 pb-[calc(env(safe-area-inset-bottom)+1rem)] z-40">
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2 rounded-3xl border border-slate-200 dark:border-white/10 px-3 py-2 bg-white/80 dark:bg-[#0D0D18]/95 backdrop-blur-xl shadow-sm"
        >
          <button
            type="button"
            className="p-2 shrink-0 text-slate-400 hover:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escreva ao Orquestrador..."
            className="max-h-[120px] min-h-[24px] w-full resize-none bg-transparent py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            rows={1}
            style={{ minHeight: '40px' }}
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
              inputValue.trim() && !isLoading
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/20'
            }`}
          >
            <Send className="h-4 w-4 ml-0.5" />
          </motion.button>
        </form>
      </div>

    </div>
  );
}