import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  arcanoLevel: number;
  pranaLevel: number;
  globalXp: number;
  auraRadius: number;
  fireElement: number;
  waterElement: number;
  earthElement: number;
  airElement: number;
  avatarGlbUrl?: string;
  createdAt: string;
}

export interface UserPublicProfile {
  id: string;
  name: string;
  email: string;
  arcanoLevel: number;
  pranaLevel: number;
  globalXp: number;
  auraRadius: number;
  fireElement: number;
  waterElement: number;
  earthElement: number;
  airElement: number;
  avatarGlbUrl?: string;
  createdAt: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'dominio-do-mago-arcane-secret-key-2026-v1';
const TMP_STORAGE_PATH = path.join('/tmp', 'dominio_mago_users.json');

// Global in-memory storage to survive module reloads and container warm starts
declare global {
  // eslint-disable-next-line no-var
  var __DOMINIO_MAGO_USERS__: Map<string, UserRecord> | undefined;
}

function getInitialUsers(): Map<string, UserRecord> {
  const users = new Map<string, UserRecord>();

  // 1. Tenta restaurar do arquivo temporário se existir
  try {
    if (fs.existsSync(TMP_STORAGE_PATH)) {
      const data = fs.readFileSync(TMP_STORAGE_PATH, 'utf-8');
      const parsed: UserRecord[] = JSON.parse(data);
      for (const u of parsed) {
        users.set(u.email.toLowerCase(), u);
      }
    }
  } catch (err) {
    console.warn('[AuthStorage] Erro ao carregar backup temporário de usuários:', err);
  }

  // 2. Pre-seed Mestre Arcano e Mago Padrão caso não existam
  if (!users.has('fabioandre777@gmail.com')) {
    // Hash síncrono para "Magoarquiteto"
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('Magoarquiteto', salt);
    users.set('fabioandre777@gmail.com', {
      id: '64bc950d-d079-4e44-b006-edb64aa194bc',
      name: 'Fábio Rodrigues (Mestre Arcano)',
      email: 'fabioandre777@gmail.com',
      passwordHash: hash,
      arcanoLevel: 42,
      pranaLevel: 100,
      globalXp: 15420,
      auraRadius: 85,
      fireElement: 90,
      waterElement: 75,
      earthElement: 80,
      airElement: 95,
      avatarGlbUrl: '/avatar_fabio.glb',
      createdAt: new Date().toISOString(),
    });
  }

  if (!users.has('mago@dominio.dev')) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('Mago123456', salt);
    users.set('mago@dominio.dev', {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'Mago Aprendiz',
      email: 'mago@dominio.dev',
      passwordHash: hash,
      arcanoLevel: 1,
      pranaLevel: 100,
      globalXp: 120,
      auraRadius: 10,
      fireElement: 25,
      waterElement: 25,
      earthElement: 25,
      airElement: 25,
      createdAt: new Date().toISOString(),
    });
  }

  return users;
}

if (!globalThis.__DOMINIO_MAGO_USERS__) {
  globalThis.__DOMINIO_MAGO_USERS__ = getInitialUsers();
}

const usersMap = globalThis.__DOMINIO_MAGO_USERS__;

function persistUsersToFile() {
  try {
    const list = Array.from(usersMap.values());
    fs.writeFileSync(TMP_STORAGE_PATH, JSON.stringify(list, null, 2), 'utf-8');
  } catch {
    // Em alguns ambientes serverless somente /tmp é gravável; ignorar se falhar
  }
}

export function findUserByEmail(email: string): UserRecord | null {
  if (!email) return null;
  return usersMap.get(email.trim().toLowerCase()) || null;
}

export function findUserById(id: string): UserRecord | null {
  if (!id) return null;
  const list = Array.from(usersMap.values());
  for (const user of list) {
    if (user.id === id) return user;
  }
  return null;
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
}): Promise<UserRecord> {
  const normalizedEmail = data.email.trim().toLowerCase();
  if (usersMap.has(normalizedEmail)) {
    throw new Error('E-mail arcano já registrado no Sanctum.');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(data.password, salt);

  const newUser: UserRecord = {
    id: `mago_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: data.name.trim(),
    email: normalizedEmail,
    passwordHash,
    arcanoLevel: 1,
    pranaLevel: 100,
    globalXp: 0,
    auraRadius: 15,
    fireElement: 25,
    waterElement: 25,
    earthElement: 25,
    airElement: 25,
    createdAt: new Date().toISOString(),
  };

  usersMap.set(normalizedEmail, newUser);
  persistUsersToFile();
  return newUser;
}

export async function updateUserPassword(email: string, newPassword: string): Promise<UserRecord> {
  const normalizedEmail = email.trim().toLowerCase();
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  const user = usersMap.get(normalizedEmail);
  if (user) {
    user.passwordHash = passwordHash;
    usersMap.set(normalizedEmail, user);
    persistUsersToFile();
    return user;
  } else {
    // Cria um novo usuário se não existir para garantir acesso em dev/test
    const newUser: UserRecord = {
      id: `mago_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: 'Mago Recuperado',
      email: normalizedEmail,
      passwordHash,
      arcanoLevel: 1,
      pranaLevel: 100,
      globalXp: 0,
      auraRadius: 15,
      fireElement: 25,
      waterElement: 25,
      earthElement: 25,
      airElement: 25,
      createdAt: new Date().toISOString(),
    };
    usersMap.set(normalizedEmail, newUser);
    persistUsersToFile();
    return newUser;
  }
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: UserRecord): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      arcanoLevel: user.arcanoLevel,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyJwtToken(token: string): { userId: string; email: string; name: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      name: string;
    };
    return decoded;
  } catch {
    return null;
  }
}

export function toPublicProfile(user: UserRecord): UserPublicProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    arcanoLevel: user.arcanoLevel,
    pranaLevel: user.pranaLevel,
    globalXp: user.globalXp,
    auraRadius: user.auraRadius,
    fireElement: user.fireElement,
    waterElement: user.waterElement,
    earthElement: user.earthElement,
    airElement: user.airElement,
    avatarGlbUrl: user.avatarGlbUrl,
    createdAt: user.createdAt,
  };
}

export function extractTokenFromRequest(req: NextRequest): string | null {
  // 1. Authorization header: Bearer <token>
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // 2. Cookie mago_token ou nexus_token
  const cookieToken = req.cookies.get('mago_token')?.value || req.cookies.get('nexus_token')?.value;
  if (cookieToken) {
    return cookieToken.trim();
  }

  return null;
}

export function setAuthCookie(response: NextResponse, token: string): void {
  const maxAge = 7 * 24 * 60 * 60; // 7 dias
  const isProduction = process.env.NODE_ENV === 'production';

  response.cookies.set('mago_token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge,
  });

  // Também define nexus_token para retrocompatibilidade
  response.cookies.set('nexus_token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
}
