'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, isJwtExpired } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  userId: string | null;
  login: (token: string, userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Verifica localStorage existente
    const storedToken = localStorage.getItem('mago_token') || localStorage.getItem('nexus_token');
    const storedUserId = localStorage.getItem('nexus_userId') || localStorage.getItem('mago_userId');
    
    if (storedToken && !isJwtExpired(storedToken)) {
      setToken(storedToken);
      setUserId(storedUserId || '64bc950d-d079-4e44-b006-edb64aa194bc');
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    if (storedToken && isJwtExpired(storedToken)) {
      console.warn("⚠️ [Auth] Token salvo no navegador expirou. Limpando sessão antiga...");
      localStorage.removeItem('mago_token');
      localStorage.removeItem('nexus_token');
    }

    // 2. Se não houver sessão válida ativa, realiza auto-login com o usuário padrão de desenvolvimento (Mestre Arcano)
    const performDevAutoLogin = async () => {
      try {
        console.log("⚡ [Auth] Realizando auto-login do Mestre Arcano em ambiente de desenvolvimento...");
        const authData = await loginUser('fabioandre777@gmail.com', 'Magoarquiteto');
        if (authData && authData.token) {
          localStorage.setItem('mago_token', authData.token);
          localStorage.setItem('nexus_token', authData.token);
          localStorage.setItem('nexus_userId', authData.userId || '64bc950d-d079-4e44-b006-edb64aa194bc');
          localStorage.setItem('mago_userId', authData.userId || '64bc950d-d079-4e44-b006-edb64aa194bc');
          setToken(authData.token);
          setUserId(authData.userId);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.warn("⚠️ Auto-login de desenvolvimento não completado (redirecionando para login):", err);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    performDevAutoLogin();
  }, [router]);

  const login = (newToken: string, newUserId: string) => {
    localStorage.setItem('mago_token', newToken);
    localStorage.setItem('nexus_token', newToken);
    localStorage.setItem('nexus_userId', newUserId);
    localStorage.setItem('mago_userId', newUserId);
    setToken(newToken);
    setUserId(newUserId);
    setIsAuthenticated(true);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('mago_token');
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_userId');
    localStorage.removeItem('mago_userId');
    setToken(null);
    setUserId(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-btn-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-mono text-fg-secondary">Sintonizando Essência Arcana...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
