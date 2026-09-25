// frontend/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../providers/ThemeProvider";
import { AuthProvider } from "../contexts/AuthContext";
import { NavigationProvider } from "../contexts/NavigationContext";
import AppShell from "../components/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Domínio do Mago",
  description: "Painel Arcano de Produtividade & Gamificação - Domínio do Mago",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans bg-canvas text-fg-primary antialiased min-h-screen overflow-x-hidden relative selection:bg-btn-primary/30`}
      >
        {/* Camadas Místicas de Iluminação Ambiente (DesignCode UI) */}
        <div className="fixed inset-0 bg-aurora-mesh opacity-70 pointer-events-none -z-10" />
        <div className="fixed -top-[20%] left-1/2 -translate-x-1/2 w-[850px] h-[650px] bg-gradient-to-br from-blue-600/15 via-indigo-600/10 to-transparent rounded-full blur-[160px] pointer-events-none -z-10" />
        <div className="fixed -bottom-[15%] -left-[10%] w-[700px] h-[600px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/10 to-transparent rounded-full blur-[150px] pointer-events-none -z-10" />
        <div className="fixed top-1/4 -right-[15%] w-[600px] h-[600px] bg-gradient-to-bl from-teal-600/15 via-emerald-600/10 to-transparent rounded-full blur-[160px] pointer-events-none -z-10" />

        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AuthProvider>
            <NavigationProvider>
              <AppShell>
                {children}
              </AppShell>
            </NavigationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}