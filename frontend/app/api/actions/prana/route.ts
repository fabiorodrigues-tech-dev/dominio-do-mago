import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      pranaLevel: 100,
      exhausted: false,
      message: "Prana est\u00e1vel"
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
