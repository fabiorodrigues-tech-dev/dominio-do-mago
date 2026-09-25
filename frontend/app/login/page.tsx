'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Key, Mail, User, ShieldAlert } from 'lucide-react';
import { loginUser, registerUser } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mago_token');
      localStorage.removeItem('nexus_token');
      localStorage.removeItem('nexus_userId');
      localStorage.removeItem('mago_userId');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { token, userId } = await loginUser(email, password);
      login(token, userId);
    } catch (err: any) {
      setError(err.message || 'Falha ao acessar o Grimório.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await registerUser(username, email, password);
      setActiveTab('login');
      setError('Aliança forjada! Agora acesse seu Grimório.');
    } catch (err: any) {
      console.error("Erro capturado no UI:", err);
      const backendMessage = err.message || err.response?.data?.message;
      setError(backendMessage || 'Erro de conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md designcode-card shadow-2xl overflow-hidden relative z-10"
      >
        <div className="flex w-full border-b designcode-divider">
          <button
            onClick={() => { setActiveTab('login'); setError(''); }}
            className={`flex-1 py-4 text-sm font-semibold tracking-wider transition-colors ${
              activeTab === 'login' ? 'text-btn-primary border-b-2 border-btn-primary' : 'text-fg-secondary hover:text-fg-primary'
            }`}
          >
            ACESSAR GRIMÓRIO
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(''); }}
            className={`flex-1 py-4 text-sm font-semibold tracking-wider transition-colors ${
              activeTab === 'register' ? 'text-cyan-400 border-b-2 border-cyan-500' : 'text-fg-secondary hover:text-fg-primary'
            }`}
          >
            FORJAR ALIANÇA
          </button>
        </div>

        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-full bg-container-bg border border-container-border shadow-inner">
              <Sparkles className={`w-8 h-8 ${activeTab === 'login' ? 'text-btn-primary' : 'text-cyan-400'}`} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-fg-primary mb-2">
            {activeTab === 'login' ? 'Bem-vindo de volta' : 'Inicie sua jornada'}
          </h2>
          <p className="text-center text-fg-secondary text-sm mb-8">
            {activeTab === 'login' ? 'Aura estabilizada. O Orquestrador aguarda.' : 'Prepare sua mente para o domínio do foco.'}
          </p>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-6 p-3 rounded-xl border flex items-start gap-3 text-sm ${
                  error.includes('sucesso') || error.includes('forjada')
                    ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-200' 
                    : 'bg-red-900/30 border-red-500/30 text-red-200'
                }`}
              >
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={activeTab === 'login' ? handleLogin : handleRegister} className="space-y-4">
            
            {activeTab === 'register' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fg-tertiary" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nome de Mago (Username)"
                    className="w-full bg-container-bg border border-container-border text-fg-primary placeholder:text-fg-tertiary rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  />
                </div>
              </motion.div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fg-tertiary" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Arcano"
                className="w-full bg-container-bg border border-container-border text-fg-primary placeholder:text-fg-tertiary rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-btn-primary/50 focus:ring-1 focus:ring-btn-primary/50 transition-all"
              />
            </div>

            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fg-tertiary" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha (Selo)"
                className="w-full bg-container-bg border border-container-border text-fg-primary placeholder:text-fg-tertiary rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-btn-primary/50 focus:ring-1 focus:ring-btn-primary/50 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all disabled:opacity-50 mt-4 cursor-pointer ${
                activeTab === 'login'
                  ? 'designcode-btn-primary shadow-md'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-500/25'
              }`}
            >
              {isLoading ? 'Conjurando...' : activeTab === 'login' ? 'Entrar' : 'Registrar'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
