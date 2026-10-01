import { NextResponse } from 'next/server';

export async function POST() {
  try {
    return NextResponse.json({
      pranaLevel: 100,
      exhausted: false,
      message: "Prana revitalizado com sucesso"
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
