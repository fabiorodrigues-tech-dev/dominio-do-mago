import { NextRequest, NextResponse } from 'next/server';
import { updateUserPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || '').trim().toLowerCase();
    const newPassword = body.newPassword;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Forneça um endereço de e-mail arcano válido.' },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { message: 'A nova chave rúnica deve ter no mínimo 6 caracteres.' },
        { status: 400 }
      );
    }

    await updateUserPassword(email, newPassword);

    return NextResponse.json(
      {
        message: 'Chave rúnica redefinida com sucesso! Você já pode entrar com sua nova senha.',
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
