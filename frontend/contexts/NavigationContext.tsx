'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type NavigationTab = 'grimorio' | 'chat' | 'missoes' | 'conhecimento' | 'perfil';

interface NavigationContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
}

const NavigationContext = createContext<NavigationContextType>({
  activeTab: 'grimorio',
  setActiveTab: () => {},
});

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<NavigationTab>('grimorio');

  useEffect(() => {
    const handleSetTab = (e: Event) => {
      const customEvent = e as CustomEvent<NavigationTab>;
      if (customEvent.detail) {
        setActiveTab(customEvent.detail);
      }
    };
    window.addEventListener('nexus:set-tab', handleSetTab);
    return () => window.removeEventListener('nexus:set-tab', handleSetTab);
  }, []);

  return (
    <NavigationContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  return useContext(NavigationContext);
}
