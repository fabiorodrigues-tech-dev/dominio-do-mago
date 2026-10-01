'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isJwtExpired } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  userId: string | null;
  userName: string;
  user: any | null;
  login: (token: string, userId: string, userName?: string, userData?: any) => void;
  logout: () => Promise<void> | void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Mago Aspirante");
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Verifica token existente em localStorage ou cookies
    try {
      let storedToken = localStorage.getItem('mago_token') || localStorage.getItem('nexus_token');
      const storedUserId = localStorage.getItem('nexus_userId') || localStorage.getItem('mago_userId');

      if (!storedToken && typeof document !== 'undefined') {
        const match = document.cookie.match(/(?:^|; )(?:mago_token|nexus_token)=([^;]*)/);
        if (match) storedToken = decodeURIComponent(match[1]);
      }

      if (storedToken && !isJwtExpired(storedToken)) {
        setToken(storedToken);
        setUserId(storedUserId || '64bc950d-d079-4e44-b006-edb64aa194bc');
        
        const rawUserData = localStorage.getItem('mago_user');
        if (rawUserData) {
          try {
            const parsedUser = JSON.parse(rawUserData);
            setUser(parsedUser);
            setUserName(parsedUser.name || "Mago Aspirante");
          } catch (e) {
            setUserName(rawUserData || "Mago Aspirante");
          }
        }
        setIsAuthenticated(true);
      } else {
        if (storedToken) {
          localStorage.removeItem('mago_token');
          localStorage.removeItem('nexus_token');
          localStorage.removeItem('nexus_userId');
          localStorage.removeItem('mago_userId');
          localStorage.removeItem('mago_user');
        }
        setToken(null);
        setUserId(null);
        setUserName("Mago Aspirante");
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

    const login = (newToken: string, newUserId: string, newUserName?: string, userData?: any) => {
    try {
      localStorage.setItem('mago_token', newToken);
      localStorage.setItem('nexus_token', newToken);
      localStorage.setItem('nexus_userId', newUserId);
      localStorage.setItem('mago_userId', newUserId);
      if (userData) {
        localStorage.setItem('mago_user', JSON.stringify(userData));
        setUser(userData);
        if (userData.name) setUserName(userData.name);
      } else if (newUserName) {
        // Fallback legado
        setUserName(newUserName);
      }
      if (typeof document !== 'undefined') {
        document.cookie = `mago_token=${encodeURIComponent(newToken)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        document.cookie = `nexus_token=${encodeURIComponent(newToken)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      }
    } catch {
      // Ignora erro de storage se indisponível
    }
    setToken(newToken);
    setUserId(newUserId);
    setIsAuthenticated(true);
    router.push('/');
  };

  const logout = async () => {
    try {
      localStorage.removeItem('mago_token');
      localStorage.removeItem('nexus_token');
      localStorage.removeItem('nexus_userId');
      localStorage.removeItem('mago_userId');
      localStorage.removeItem('mago_user');
      if (typeof document !== 'undefined') {
        document.cookie = 'mago_token=; path=/; max-age=0; SameSite=Lax';
        document.cookie = 'nexus_token=; path=/; max-age=0; SameSite=Lax';
      }
      
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignora erro
    } finally {
      setToken(null);
      setUserId(null);
      setUserName("Mago Aspirante");
      setUser(null);
      setIsAuthenticated(false);
      router.push('/login');
    }
  };

  // Se estiver carregando na rota pública /login, NUNCA bloqueia com spinner global
  if (isLoading && pathname !== '/login') {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-mono text-fg-secondary">Sintonizando Essência Arcana...</p>
        </div>
      </div>
    );
  }

  // Reatividade Global: recarrega o estado de user sempre que uma ação é concluída
  useEffect(() => {
    const handleRefreshUser = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            if (data.user.name) setUserName(data.user.name);
            localStorage.setItem('mago_user', JSON.stringify(data.user));
          }
        }
      } catch (err) {
        console.warn('Erro ao atualizar usuário via refresh event', err);
      }
    };

    window.addEventListener('nexus:refresh-dashboard', handleRefreshUser);
    return () => window.removeEventListener('nexus:refresh-dashboard', handleRefreshUser);
  }, [token]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, token, userId, userName, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.warn('useAuth must be used within an AuthProvider');
    return {
      isAuthenticated: false,
      isLoading: false,
      token: null,
      userId: null,
      userName: "Mago Aspirante",
      user: null,
      login: () => {},
      logout: () => {},
    };
  }
  return context;
}
