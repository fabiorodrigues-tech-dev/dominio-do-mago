import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { extractTokenFromRequest, verifyJwtToken, findUserById, findUserByEmail, updateUserRpgStats } from '@/lib/auth';

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
    try {
      fs.writeFileSync(FALLBACK_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (fallbackError) {
      console.error("Falha ao salvar em fallback:", fallbackError);
    }
  }
};

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const actions = getActionsData();
    const actionIndex = actions.findIndex((a: any) => a.id === params.id);
    
    if (actionIndex === -1) {
      return NextResponse.json({ success: false, message: 'Action not found' }, { status: 404 });
    }

    const action = actions[actionIndex];
    action.isCompleted = true;
    action.completed = true;
    action.lastCompletedAt = new Date().toISOString();
    
    saveActionsData(actions);

    // Sistema de Gamificação (RPG)
    let currentPrana = 100;
    let finalScore = action.baseValue || 20;
    let pranaMessage = "Ritual finalizado com sucesso.";
    let userStats = null;

    const token = extractTokenFromRequest(req);
    if (token) {
      const payload = verifyJwtToken(token);
      if (payload) {
        const user = findUserById(payload.userId) || findUserByEmail(payload.email);
        if (user) {
          // 1. Ganho de XP
          let newXp = (user.currentXp || 0) + finalScore;
          let newGlobalXp = (user.globalXp || 0) + finalScore;
          let newLevel = user.level || 1;
          let targetXp = user.targetXp || 100;
          let newHp = user.hp ?? 100;
          let newMaxHp = user.maxHp ?? 100;
          let maxPrana = user.maxPrana ?? 100;
          let newPrana = user.pranaLevel ?? 100;

          let leveledUp = false;

          // Level Up logic
          while (newXp >= targetXp) {
            newXp -= targetXp;
            newLevel += 1;
            targetXp = Math.floor(targetXp * 1.5); // Escala de XP
            newMaxHp += 20;
            newHp = newMaxHp; // Restaura HP ao subir de nível
            maxPrana += 10;
            newPrana = maxPrana; // Restaura Prana
            leveledUp = true;
          }

          // 2. Lógica de Prana (Restauradora vs Desafiadora)
          const isRestorative = action.taskEnergyType === 'RESTORATIVE';
          const isPoison = action.taskEnergyType === 'POISON';
          
          if (isRestorative) {
            newPrana = Math.min(maxPrana, newPrana + 15);
            pranaMessage = "Ritual restaurador! +15 Prana.";
          } else if (isPoison) {
            newPrana = Math.max(0, newPrana - 35);
            pranaMessage = "Atividade tóxica. -35 Prana.";
          } else {
            newPrana = Math.max(0, newPrana - 10);
            pranaMessage = "Esforço arcano. -10 Prana.";
          }

          // Persiste no usuário
          const updatedUser = updateUserRpgStats(user.email, {
            currentXp: newXp,
            globalXp: newGlobalXp,
            level: newLevel,
            targetXp: targetXp,
            hp: newHp,
            maxHp: newMaxHp,
            pranaLevel: newPrana,
            maxPrana: maxPrana,
            ritualsCompleted: (user.ritualsCompleted || 0) + 1,
            arcanoLevel: Math.floor(newLevel / 5) + 1
          });

          if (updatedUser) {
            currentPrana = updatedUser.pranaLevel;
            userStats = {
              level: updatedUser.level,
              currentXp: updatedUser.currentXp,
              targetXp: updatedUser.targetXp,
              hp: updatedUser.hp,
              maxHp: updatedUser.maxHp,
              leveledUp
            };
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      action: action,
      finalScore: finalScore,
      currentPrana: currentPrana,
      exhausted: currentPrana <= 0,
      pranaMessage: pranaMessage,
      userStats,
      message: userStats?.leveledUp 
        ? `🔥 LEVEL UP! Nível ${userStats.level}! +${finalScore} XP.` 
        : `⚡ Ritual concluído! +${finalScore} XP.`
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
