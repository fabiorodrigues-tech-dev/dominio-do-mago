// frontend/src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  ScrollText,
  Settings,
  Wand2,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Painel", icon: LayoutDashboard },
  { href: "/feiticos", label: "Feitiços", icon: Sparkles },
  { href: "/grimorio", label: "Grimório", icon: ScrollText },
  { href: "/definicoes", label: "Definições", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 p-4">
      <div className="designcode-card flex flex-col h-full p-4">
        {/* Cabeçalho */}
        <div className="flex items-center gap-2 px-2 py-3 mb-4 border-b designcode-divider">
          <Wand2 className="h-6 w-6 text-btn-primary" strokeWidth={1.75} />
          <span className="text-lg font-semibold text-fg-primary tracking-tight">
            Domínio do Mago
          </span>
        </div>

        {/* Navegação */}
        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-colors duration-200 ${
                  isActive
                    ? "bg-btn-primary/15 text-btn-primary"
                    : "text-fg-secondary hover:bg-container-border/50 hover:text-fg-primary"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Rodapé */}
        <div className="pt-4 border-t designcode-divider">
          <p className="text-xs text-fg-tertiary px-2">
            Domínio do Mago © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </aside>
  );
}