import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { extractTokenFromRequest, verifyJwtToken, findUserById, findUserByEmail, updateUserRpgStats } from '@/lib/auth';

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'actions.json');
const FALLBACK_FILE = '/tmp/actions.json';

const getActionsData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    if (fs.existsSync(FALLBACK_FILE)) return JSON.parse(fs.readFileSync(FALLBACK_FILE, 'utf-8'));
  } catch (error) {}
  return [];
};

const saveActionsData = (data: any[]) => {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    try { fs.writeFileSync(FALLBACK_FILE, JSON.stringify(data, null, 2), 'utf-8'); } catch (e) {}
  }
};

export async function POST(req: NextRequest) {
  try {
    const token = extractTokenFromRequest(req);
    if (!token) return NextResponse.json({ success: false }, { status: 401 });

    const payload = verifyJwtToken(token);
    if (!payload) return NextResponse.json({ success: false }, { status: 401 });

    const user = findUserById(payload.userId) || findUserByEmail(payload.email);
    if (!user) return NextResponse.json({ success: false }, { status: 404 });

    const actions = getActionsData();
    const todayStr = new Date().toISOString().split('T')[0];

    let overdueCount = 0;

    // Filter past due uncompleted actions
    actions.forEach((a: any) => {
      const scheduled = a.scheduledDate || a.createdAt?.split('T')[0] || todayStr;
      const isCompleted = Boolean(a.isCompleted || a.completed);
      
      // If action is in the past, not completed, and not already punished
      if (scheduled < todayStr && !isCompleted && !a.punished) {
        overdueCount++;
        a.punished = true; // Mark as punished so we don't double punish
      }
    });

    if (overdueCount > 0) {
      saveActionsData(actions); // Save the `punished = true` state

      let hp = user.hp ?? 100;
      let prana = user.pranaLevel ?? 100;
      const maxHp = user.maxHp ?? 100;

      // -10 HP per overdue task
      hp -= overdueCount * 10;
      let punishmentMessage = `O Mago negligenciou ${overdueCount} ritual(ais). -${overdueCount * 10} HP.`;

      if (hp <= 0) {
        hp = Math.floor(maxHp * 0.5); // Restaura metade do HP
        prana = 0; // Penalidade grave: zera o prana
        punishmentMessage = `EXAUSTÃO FATAL! O Mago colapsou. Vida restaurada parcialmente, mas todo o Prana foi perdido!`;
      }

      updateUserRpgStats(user.email, {
        hp,
        pranaLevel: prana
      });

      return NextResponse.json({
        success: true,
        punished: true,
        overdueCount,
        hp,
        prana,
        message: punishmentMessage
      });
    }

    return NextResponse.json({ success: true, punished: false });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
