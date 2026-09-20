// frontend/src/components/MobileBottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Sparkles, ScrollText, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Painel", icon: LayoutDashboard },
  { href: "/feiticos", label: "Feitiços", icon: Sparkles },
  { href: "/grimorio", label: "Grimório", icon: ScrollText },
  { href: "/definicoes", label: "Definições", icon: Settings },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
      <div className="designcode-card flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl transition-colors duration-200 ${
                isActive
                  ? "text-btn-primary"
                  : "text-fg-secondary hover:text-fg-primary"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2 : 1.75} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}