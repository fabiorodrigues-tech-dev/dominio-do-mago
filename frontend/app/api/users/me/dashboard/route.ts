import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromRequest, verifyJwtToken, findUserById, findUserByEmail } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = extractTokenFromRequest(req);
    let user = null;

    if (token) {
      const payload = verifyJwtToken(token);
      if (payload) {
        user = findUserById(payload.userId) || findUserByEmail(payload.email);
      }
    }

    // Retorna os dados do usuário autenticado ou perfil do Mestre Arcano padrão
    return NextResponse.json({
      arcanoLevel: user ? user.arcanoLevel : 42,
      globalXp: user ? user.globalXp : 15420,
      auraRadius: user ? user.auraRadius : 85,
      fireElement: user ? user.fireElement : 90,
      waterElement: user ? user.waterElement : 75,
      earthElement: user ? user.earthElement : 80,
      airElement: user ? user.airElement : 95,
      avatarGlbUrl: user?.avatarGlbUrl || '/avatar_fabio.glb',
      hp: 100,
      energy: 100,
      pranaLevel: user ? user.pranaLevel : 100,
    });
  } catch (error: any) {
    console.error('[API Dashboard Error]:', error);
    return NextResponse.json(
      {
        arcanoLevel: 1,
        globalXp: 100,
        auraRadius: 20,
        fireElement: 25,
        waterElement: 25,
        earthElement: 25,
        airElement: 25,
        hp: 100,
        energy: 100,
        pranaLevel: 100,
      },
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
