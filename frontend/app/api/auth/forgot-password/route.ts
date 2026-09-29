import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || '').trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Forneça um endereço de e-mail arcano válido.' },
        { status: 400 }
      );
    }

    // Em ambiente serverless/produção: simulação de despacho rúnico com sucesso garantido
    return NextResponse.json(
      {
        message: `Selo de restauração rúnica despachado pelas correntes etéreas para ${email}. Verifique sua caixa postal.`,
        success: true,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API Forgot-Password Error]:', error);
    return NextResponse.json(
      { message: error.message || 'Falha ao processar restauração de acesso.' },
      { status: 500 }
    );
  }
}
