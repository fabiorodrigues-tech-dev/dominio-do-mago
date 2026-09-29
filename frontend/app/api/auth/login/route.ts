import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, verifyPassword, generateToken, toPublicProfile, setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';

    if (!email || !password) {
      return NextResponse.json(
        { message: 'E-mail e chave rúnica são obrigatórios para transpor o portal.' },
        { status: 400 }
      );
    }

    const user = findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { message: 'Arquétipo não encontrado com este e-mail.' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { message: 'Chave rúnica incorreta. Acesso ao Sanctum negado.' },
        { status: 401 }
      );
    }

    const token = generateToken(user);
    const publicProfile = toPublicProfile(user);

    const response = NextResponse.json(
      {
        message: 'Acesso autorizado ao Sanctum.',
        token,
        userId: user.id,
        username: user.name,
        user: publicProfile,
      },
      { status: 200 }
    );

    // Salva cookie seguro HTTP-only de sessão
    setAuthCookie(response, token);

    return response;
  } catch (error: any) {
    console.error('[API Login Error]:', error);
    return NextResponse.json(
      { message: error.message || 'Falha na validação das credenciais.' },
      { status: 500 }
    );
  }
}
