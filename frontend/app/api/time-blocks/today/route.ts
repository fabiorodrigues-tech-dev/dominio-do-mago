import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'time-blocks.json');

const getTimeBlocks = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn("Erro ao carregar time-blocks.json:", error);
  }
  return [];
};

export async function GET() {
  try {
    // Retorna array vazio ou blocos para evitar 404
    const blocks = getTimeBlocks();
    return NextResponse.json(blocks, { status: 200 });
  } catch (error: any) {
    return NextResponse.json([], { status: 500 });
  }
}
