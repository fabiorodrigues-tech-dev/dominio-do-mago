'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

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
    // Check localStorage on load
    const storedToken = localStorage.getItem('mago_token');
    const storedUserId = localStorage.getItem('nexus_userId');
    
    if (storedToken && storedUserId) {
      setToken(storedToken);
      setUserId(storedUserId);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUserId: string) => {
    localStorage.setItem('mago_token', newToken);
    localStorage.setItem('nexus_userId', newUserId);
    setToken(newToken);
    setUserId(newUserId);
    setIsAuthenticated(true);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('mago_token');
    localStorage.removeItem('nexus_userId');
    setToken(null);
    setUserId(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>;
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
