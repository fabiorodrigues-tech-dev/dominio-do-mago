import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromRequest, verifyJwtToken, findUserById, findUserByEmail, toPublicProfile } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = extractTokenFromRequest(req);
    if (!token) {
      return NextResponse.json(
        { message: 'Token de autenticação não fornecido no Sanctum.' },
        { status: 401 }
      );
    }

    const payload = verifyJwtToken(token);
    if (!payload) {
      return NextResponse.json(
        { message: 'Selo arcano inválido ou expirado. Faça login novamente.' },
        { status: 401 }
      );
    }

    const user = findUserById(payload.userId) || findUserByEmail(payload.email);
    if (user) {
      return NextResponse.json(
        {
          authenticated: true,
          user: toPublicProfile(user),
        },
        { status: 200 }
      );
    }

    // Se o usuário não estiver em memória mas o JWT é válido (ex: token de warm-up)
    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: payload.userId,
          name: payload.name || 'Mago Alquimista',
          email: payload.email,
          arcanoLevel: 1,
          pranaLevel: 100,
          globalXp: 100,
          auraRadius: 20,
          fireElement: 30,
          waterElement: 30,
          earthElement: 30,
          airElement: 30,
          createdAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API Auth Me Error]:', error);
    return NextResponse.json(
      { message: error.message || 'Erro ao verificar sessão do Mago.' },
      { status: 500 }
    );
  }
}
