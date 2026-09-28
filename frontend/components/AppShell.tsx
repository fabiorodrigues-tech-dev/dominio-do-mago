'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';
import { GlobalTimer } from '@/components/timer/GlobalTimer';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return (
      <main className="min-h-screen w-full flex flex-col justify-center items-center">
        {children}
      </main>
    );
  }

  return (
    <div className="flex min-h-screen w-full relative">
      <GlobalTimer />

      <Sidebar />
      <main className="flex-1 min-w-0 md:pl-72 p-4 md:p-6 pb-36 sm:pb-24 md:pb-6">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
