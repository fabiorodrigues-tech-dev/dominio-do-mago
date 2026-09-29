import { NextRequest, NextResponse } from 'next/server';
import { createUser, generateToken, toPublicProfile, setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = (body.name || body.username || '').trim();
    const email = (body.email || '').trim();
    const password = (body.password || '');

    // Validação de entrada
    if (!name || name.length < 2) {
      return NextResponse.json(
        { message: 'O nome do mago deve conter ao menos 2 caracteres.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Forneça um e-mail arcano válido.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { message: 'A chave rúnica (senha) deve conter no mínimo 6 caracteres.' },
        { status: 400 }
      );
    }

    // Criação do usuário na persistência adaptativa
    const newUser = await createUser({ name, email, password });
    const token = generateToken(newUser);
    const publicProfile = toPublicProfile(newUser);

    const response = NextResponse.json(
      {
        message: 'Iniciação concluída com sucesso! Seu arquétipo foi forjado no Sanctum.',
        token,
        userId: newUser.id,
        user: publicProfile,
      },
      { status: 201 }
    );

    // Configura cookies de sessão segura HTTP-only
    setAuthCookie(response, token);

    return response;
  } catch (error: any) {
    console.error('[API Register Error]:', error);
    return NextResponse.json(
      { message: error.message || 'Falha ao registrar mago no Sanctum.' },
      { status: 400 }
    );
  }
}
