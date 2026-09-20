// frontend/src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Domínio do Mago",
  description: "Painel de controlo do Domínio do Mago",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans bg-canvas text-fg-primary antialiased min-h-screen selection:bg-btn-primary/30`}
      >
        {children}
      </body>
    </html>
  );
}