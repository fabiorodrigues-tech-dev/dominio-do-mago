import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Sessão encerrada com sucesso." });
  
  // Limpar os cookies HTTP-only de autenticação
  response.cookies.set('mago_token', '', { maxAge: 0, path: '/' });
  response.cookies.set('nexus_token', '', { maxAge: 0, path: '/' });
  
  return response;
}
