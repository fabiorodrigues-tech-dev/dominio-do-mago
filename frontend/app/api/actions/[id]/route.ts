import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'actions.json');
const FALLBACK_FILE = '/tmp/actions.json';

const getActionsData = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    } else if (fs.existsSync(FALLBACK_FILE)) {
      const data = fs.readFileSync(FALLBACK_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn("Erro ao carregar actions.json:", error);
  }
  return [];
};

const saveActionsData = (data: any[]) => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.warn("Falha ao salvar no diretório .data, tentando /tmp:", error);
    try {
      fs.writeFileSync(FALLBACK_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (fallbackError) {
      console.error("Falha ao salvar em fallback /tmp:", fallbackError);
    }
  }
};

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    let actions = getActionsData();
    const actionIndex = actions.findIndex((a: any) => a.id === params.id);
    
    if (actionIndex === -1) {
      return NextResponse.json({ success: false, message: 'Action not found' }, { status: 404 });
    }

    actions.splice(actionIndex, 1);
    saveActionsData(actions);

    return NextResponse.json({ success: true, id: params.id }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
