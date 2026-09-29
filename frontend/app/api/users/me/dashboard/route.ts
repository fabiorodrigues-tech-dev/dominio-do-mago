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

    // Retorna os dados do usuário autenticado ou default de Nível 1
    return NextResponse.json({
      arcanoLevel: user ? user.arcanoLevel : 1,
      globalXp: user ? user.globalXp : 0,
      auraRadius: user ? user.auraRadius : 15,
      fireElement: user ? user.fireElement : 25,
      waterElement: user ? user.waterElement : 25,
      earthElement: user ? user.earthElement : 25,
      airElement: user ? user.airElement : 25,
      avatarGlbUrl: user?.avatarGlbUrl || '/avatar_fabio.glb',
      hp: 100,
      energy: 100,
      pranaLevel: user ? user.pranaLevel : 100,
      level: user?.level || 1,
      currentXp: user?.currentXp || 0,
      targetXp: user?.targetXp || 100,
      activeElement: user?.activeElement || 'fire',
      nenCategory: user?.nenCategory || 'Transmuter',
      auraColor: user?.auraColor || '#F97316',
      ritualsCompleted: user?.ritualsCompleted || 0,
    });
  } catch (error: any) {
    console.error('[API Dashboard Error]:', error);
    return NextResponse.json(
      {
        arcanoLevel: 1,
        globalXp: 0,
        auraRadius: 15,
        fireElement: 25,
        waterElement: 25,
        earthElement: 25,
        airElement: 25,
        hp: 100,
        energy: 100,
        pranaLevel: 100,
        level: 1,
        currentXp: 0,
        targetXp: 100,
        activeElement: 'fire',
        nenCategory: 'Transmuter',
        auraColor: '#F97316',
        ritualsCompleted: 0,
      },
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
