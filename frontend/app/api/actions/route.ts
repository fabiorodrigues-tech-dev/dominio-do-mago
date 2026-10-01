import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Local onde os dados de missões/ações serão salvos
const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'actions.json');
const FALLBACK_FILE = '/tmp/actions.json';

// Função para garantir que o diretório .data existe e carregar as ações
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
    console.warn("Erro ao carregar actions.json, inicializando array vazio:", error);
  }
  return [];
};

// Função para salvar ações no JSON
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

export async function GET() {
  try {
    const actions = getActionsData();
    return NextResponse.json(actions, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validar título que é o mínimo requerido
    if (!body.title) {
      return NextResponse.json({ success: false, message: 'Título é obrigatório.' }, { status: 400 });
    }
    
    const actions = getActionsData();
    
    const elementRaw = body.areaId ? body.areaId.replace('area-', '') : 'fogo';
    
    const newAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      title: body.title,
      description: body.description || '',
      areaId: body.areaId || 'area-fogo',
      taskEnergyType: body.taskEnergyType || 'NEUTRAL',
      baseValue: body.baseValue || 20,
      recurrenceEnabled: body.recurrenceEnabled || false,
      recurrenceType: body.recurrenceType || (body.recurrenceEnabled ? 'DAILY' : undefined),
      lifecycleType: body.lifecycleType || (body.recurrenceEnabled ? 'HABIT' : 'ACTION'),
      element: elementRaw,
      xpReward: body.baseValue || 20,
      type: body.recurrenceEnabled ? 'habit' : 'daily',
      isCompleted: false,
      completed: false,
      createdAt: new Date().toISOString(),
      scheduledDate: body.scheduledDate || new Date().toISOString().split('T')[0],
    };
    
    // Adiciona ao topo (ou fim) do array
    actions.unshift(newAction);
    
    // Salva o JSON no disco local
    saveActionsData(actions);
    
    return NextResponse.json(newAction, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
