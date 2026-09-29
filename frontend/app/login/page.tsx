"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Sparkles, KeyRound, Mail, ArrowRight, ShieldCheck, 
  Flame, Droplets, Mountain, Wind, User, CheckCircle2, 
  AlertCircle, ArrowLeft 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type AuthMode = "LOGIN" | "REGISTER" | "FORGOT";

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("LOGIN");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  // Se já estiver autenticado, redireciona ao Sanctum
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    try {
      if (mode === "REGISTER") {
        if (password !== confirmPassword) {
          throw new Error("As chaves rúnicas (senhas) não coincidem.");
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Falha na iniciação do Mago.");
        }

        setFeedback({
          message: data.message || "Iniciação concluída! Seu arquétipo foi forjado. Acesse agora.",
          type: "success",
        });

        // Alterna para o modo de login mantendo as credenciais
        setMode("LOGIN");
      } else if (mode === "FORGOT") {
        if (password !== confirmPassword) {
          throw new Error("As novas chaves rúnicas não coincidem.");
        }

        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, newPassword: password }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Falha ao solicitar restauração.");
        }

        setFeedback({
          message: data.message || "Chave rúnica redefinida com sucesso!",
          type: "success",
        });

        setTimeout(() => {
          setMode("LOGIN");
          setPassword("");
          setConfirmPassword("");
          setFeedback(null);
        }, 1500);
      } else {
        // LOGIN
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Credenciais não autorizadas.");
        }

        setFeedback({
          message: "Acesso autorizado ao Sanctum. Despertando auras...",
          type: "success",
        });

        // Salva token e atualiza estado global no AuthContext
        if (data.token) {
          if (data.user) {
            localStorage.setItem("mago_user", JSON.stringify(data.user));
          }
          login(data.token, data.userId || data.user?.id || "mago_default", data.username || data.user?.name || "Mago Aspirante");
        }

        // Redireciona para o Sanctum / Dashboard
        setTimeout(() => {
          router.push("/");
        }, 600);
      }
    } catch (err: any) {
      setFeedback({
        message: err.message || "Erro de conexão com o portal arcano.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-[100dvh] w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#05050A] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* 🌌 Atmosfera Arcana: Luzes Difusas de Fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-indigo-600/25 via-purple-600/15 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-cyan-600/20 via-blue-600/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      {/* 🛡️ Card Principal Liquid Glass */}
      <div className="relative w-full max-w-[430px] z-10">
        
        <div className="relative rounded-3xl p-6 sm:p-8 backdrop-blur-2xl bg-[#0d0e1a]/70 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_20px_rgba(99,102,241,0.15)] ring-1 ring-white/5 transition-all">
          
          {/* Header com Avatar Oficial e Identidade */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-3 group">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 opacity-60 blur-md group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/20 bg-slate-900 shadow-xl">
                <Image
                  src="/Mago_app.jpeg"
                  alt="Domínio do Mago Archetype"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              </div>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Domínio do Mago
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            </h1>
            <p className="text-xs uppercase tracking-widest font-semibold text-slate-400 mt-1">
              {mode === "LOGIN" && "Autenticação no Sanctum"}
              {mode === "REGISTER" && "Iniciação de Novo Mago"}
              {mode === "FORGOT" && "Restauração de Acesso"}
            </p>
          </div>

          {/* Micro-Barra Elemental de Ambientação */}
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5 mb-6">
            <div className="flex items-center justify-center gap-1 py-1 rounded-lg bg-orange-500/10 text-orange-400 text-[10px] font-medium border border-orange-500/20">
              <Flame className="w-3 h-3" /> Fogo
            </div>
            <div className="flex items-center justify-center gap-1 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-[10px] font-medium border border-cyan-500/20">
              <Droplets className="w-3 h-3" /> Água
            </div>
            <div className="flex items-center justify-center gap-1 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
              <Mountain className="w-3 h-3" /> Terra
            </div>
            <div className="flex items-center justify-center gap-1 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-[10px] font-medium border border-indigo-500/20">
              <Wind className="w-3 h-3" /> Ar
            </div>
          </div>

          {/* Feedback de Notificação / Sucesso / Erro */}
          {feedback && (
            <div
              className={`mb-4 p-3 rounded-xl border text-xs flex items-start gap-2 animate-in fade-in duration-200 ${
                feedback.type === "success"
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                  : "bg-red-950/40 border-red-500/40 text-red-200"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Formulário Dinâmico */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Campo Nome (Apenas em Cadastro) */}
            {mode === "REGISTER" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 ml-1">Nome do Mago</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Mago Fábio"
                    className="w-full bg-[#080914]/80 text-sm text-white placeholder-slate-500 pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Input E-mail (Comum a todos) */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 ml-1">E-mail</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mago@dominio.dev"
                  className="w-full bg-[#080914]/80 text-sm text-white placeholder-slate-500 pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Input Senha (Login, Registro e Forgot) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-medium text-slate-300">
                  {mode === "FORGOT" ? "Nova Chave Rúnica" : "Chave Rúnica (Senha)"}
                </label>
                {mode === "LOGIN" && (
                  <button
                    type="button"
                    onClick={() => { setFeedback(null); setMode("FORGOT"); }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Esqueceu a chave?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <KeyRound className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#080914]/80 text-sm text-white placeholder-slate-500 pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Confirmação de Senha */}
            {(mode === "REGISTER" || mode === "FORGOT") && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 ml-1">
                  {mode === "FORGOT" ? "Confirme a Nova Chave Rúnica" : "Confirme a Chave Rúnica"}
                </label>
                <div className="relative flex items-center">
                  <KeyRound className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#080914]/80 text-sm text-white placeholder-slate-500 pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Botão de Ação Primária */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full group overflow-hidden rounded-xl p-[1px] font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 mt-2 cursor-pointer"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 transition-all duration-300 group-hover:scale-105" />
              <div className="relative flex items-center justify-center gap-2 py-3 px-4 rounded-[11px] bg-slate-950/40 backdrop-blur-sm transition-colors group-hover:bg-transparent">
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {mode === "LOGIN" && "Entrar no Sanctum"}
                      {mode === "REGISTER" && "Despertar Arquétipo"}
                      {mode === "FORGOT" && "Redefinir Chave Rúnica →"}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Navegação entre Modos */}
          <div className="mt-5 text-center">
            {mode === "LOGIN" && (
              <p className="text-xs text-slate-400">
                Ainda não despertou seu arquétipo?{" "}
                <button
                  type="button"
                  onClick={() => { setFeedback(null); setMode("REGISTER"); }}
                  className="font-medium text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-400/30 cursor-pointer"
                >
                  Criar conta
                </button>
              </p>
            )}

            {(mode === "REGISTER" || mode === "FORGOT") && (
              <button
                type="button"
                onClick={() => { setFeedback(null); setMode("LOGIN"); }}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar ao login</span>
              </button>
            )}
          </div>

          {/* Rodapé com Telemetria */}
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Next.js 14 • Serverless JWT</span>
            </div>
            <span className="font-mono text-slate-500">v1.0-LTS</span>
          </div>

        </div>
      </div>
    </main>
  );
}
