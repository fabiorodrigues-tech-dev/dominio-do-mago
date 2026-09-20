'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import MagoDashboard from "../components/MagoDashboard";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null; // The AuthContext already handles loading state, so we just return null during redirect
  }

  return <MagoDashboard />;
}
