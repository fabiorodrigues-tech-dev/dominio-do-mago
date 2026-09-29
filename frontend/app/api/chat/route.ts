import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = body.prompt || '';

    // Resposta arcana contextualizada
    const replies = [
      `Aura sintonizada com sucesso. Analisei sua intenção rúnica: "${prompt.slice(0, 50)}...". Suas tarefas temporais foram harmonizadas com as correntes de Prana.`,
      `O Sanctum ressoa com sua invocação. Concentre sua energia no Ritual Elemental de maior prioridade para maximizar seus pontos de maestria.`,
      `Orquestrador Arcano ativo. Seus rituais diários estão balanceados. Deseja iniciar um bloco de foco profundo (Chronos) agora?`,
    ];

    const message = replies[Math.floor(Math.random() * replies.length)];

    return NextResponse.json({
      message,
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'O Orquestrador Arcano absorveu sua vibração com sucesso.' },
      { status: 200 }
    );
  }
}
