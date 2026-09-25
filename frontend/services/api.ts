import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function isJwtExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp) return false;
    // Buffer de 30 segundos
    return Date.now() >= (payload.exp * 1000) - 30000;
  } catch {
    return true;
  }
}

// Interceptor de Requisição: Injeta o JWT e previne envio de token expirado com fallback seguro de dev
api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    // 1. Tenta recuperar do localStorage ou de cookies
    let token = localStorage.getItem('mago_token') || localStorage.getItem('nexus_token');
    if (!token && typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|; )(?:mago_token|nexus_token)=([^;]*)/);
      if (match) token = decodeURIComponent(match[1]);
    }
    
    // 2. Se o token estiver expirado no localStorage, limpa imediatamente
    if (token && isJwtExpired(token)) {
      console.warn('⚠️ [API] Token expirado detectado no client. Limpando credenciais antigas...');
      localStorage.removeItem('mago_token');
      localStorage.removeItem('nexus_token');
      token = null;
    }

    // 3. Fallback seguro de desenvolvimento: se não houver token no storage, injeta o token do usuário padrão de dev/seed (Fábio Rodrigues)
    if (!token && !config.url?.includes('/auth/')) {
      try {
        console.log('⚡ [API] Sem token no storage. Autenticando usuário padrão de dev (Fábio Rodrigues)...');
        const devLoginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: 'fabioandre777@gmail.com',
          password: 'Magoarquiteto'
        });
        if (devLoginRes.data?.token) {
          const freshDevToken = String(devLoginRes.data.token);
          token = freshDevToken;
          localStorage.setItem('mago_token', freshDevToken);
          localStorage.setItem('nexus_token', freshDevToken);
          if (devLoginRes.data.userId) {
            localStorage.setItem('nexus_userId', String(devLoginRes.data.userId));
            localStorage.setItem('mago_userId', String(devLoginRes.data.userId));
          }
        }
      } catch (devLoginErr) {
        console.warn('⚠️ Não foi possível obter token de dev no request interceptor:', devLoginErr);
      }
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      if (typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
    }
  }

  // Se o corpo for FormData, remove o Content-Type fixo para o navegador gerar o boundary multipart
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
}, (error) => Promise.reject(error));

// Interceptor de Resposta: Trata 401 e 403 com auto-login do usuário mestre em desenvolvimento
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Apenas tenta recuperação automática uma vez por requisição
    if ((status === 401 || status === 403) && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      console.warn(`⚡ [API] Status ${status} em ${originalRequest.url}. Iniciando renovação de sessão do Mago...`);

      if (typeof window !== 'undefined') {
        localStorage.removeItem('mago_token');
        localStorage.removeItem('nexus_token');

        try {
          const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'fabioandre777@gmail.com',
            password: 'Magoarquiteto'
          });

          if (loginRes.data?.token) {
            const freshToken = loginRes.data.token;
            localStorage.setItem('mago_token', freshToken);
            localStorage.setItem('nexus_token', freshToken);
            if (loginRes.data.userId) {
              localStorage.setItem('nexus_userId', loginRes.data.userId);
              localStorage.setItem('mago_userId', loginRes.data.userId);
            }

            originalRequest.headers['Authorization'] = `Bearer ${freshToken}`;
            if (typeof originalRequest.headers.set === 'function') {
              originalRequest.headers.set('Authorization', `Bearer ${freshToken}`);
            }

            return api(originalRequest);
          }
        } catch (loginErr) {
          console.error('❌ [API] Falha na auto-recuperação de login:', loginErr);
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

export interface DashboardData {
  arcanoLevel: number;
  globalXp: number;
  auraRadius: number;
  fireElement: number;
  waterElement: number;
  earthElement: number;
  airElement: number;
  avatarGlbUrl?: string;
  hp?: number;
  energy?: number;
  pranaLevel?: number;
}

export const getUserDashboardData = async (): Promise<DashboardData> => {
  try {
    const response = await api.get('/users/me/dashboard');
    return response.data;
  } catch (err: any) {
    // Suporte a fallback de método caso necessário
    if (err.response?.status === 405) {
      console.warn('Tentando fallback POST para /users/me/dashboard...', err.response?.status);
      const postRes = await api.post('/users/me/dashboard');
      return postRes.data;
    }
    throw err;
  }
};

export const sendMessageToOrchestrator = async (prompt: string): Promise<string> => {
  const response = await api.post('/chat', { prompt });
  return response.data.message;
};

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data; // { token, userId, username }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao fazer login.');
  }
};

export const registerUser = async (username: string, email: string, password: string) => {
  try {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  } catch (error: any) {
    console.error("Erro no registro:", error.response?.data);
    throw new Error(error.response?.data?.message || 'Erro ao registrar usuário.');
  }
};

export const uploadAvatarImages = async (files: File[]): Promise<{ message: string; avatarUrl: string }> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });

  // Não definimos Content-Type manualmente para que o browser gere o boundary multipart
  const response = await api.post('/users/me/avatar', formData);
  return response.data;
};

export interface TaskItem {
  id: string;
  userId: string;
  title: string;
  type: string;
  priorityWeight: number;
  element: string;
  xpReward: number;
  createdAt: string;
  completed: boolean;
}

export type EnergyType = 'NEUTRAL' | 'RESTORATIVE' | 'POISON';

export interface IActionLike {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  areaId?: string;
  taskEnergyType?: EnergyType | string;
  baseValue?: number;
  recurrenceEnabled?: boolean;
  recurrenceType?: string;
  isCompleted?: boolean;
  lastCompletedAt?: string;
  createdAt?: string;
  element?: string;
  xpReward?: number;
  completed?: boolean;
  type?: string;
}

export interface CompleteActionResponse {
  success: boolean;
  action: IActionLike;
  finalScore: number;
  currentPrana: number;
  exhausted: boolean;
  pranaMessage: string;
  message: string;
}

export interface PranaStatus {
  pranaLevel: number;
  exhausted: boolean;
  message: string;
}

export const getActions = async (): Promise<IActionLike[]> => {
  try {
    const response = await api.get('/actions');
    return response.data;
  } catch (err) {
    console.warn('Fallback to legacy /tasks endpoint:', err);
    const tasks = await getTasks();
    return tasks.map(t => ({
      id: t.id,
      userId: t.userId,
      title: t.title,
      areaId: t.element ? `area-${t.element.toLowerCase()}` : 'area-fogo',
      element: t.element,
      taskEnergyType: 'NEUTRAL',
      baseValue: t.xpReward || 20,
      recurrenceEnabled: t.type === 'habit',
      recurrenceType: t.type === 'habit' ? 'DAILY' : undefined,
      isCompleted: t.completed,
      completed: t.completed,
      xpReward: t.xpReward,
      type: t.type,
      createdAt: t.createdAt
    }));
  }
};

export const createAction = async (data: {
  title: string;
  description?: string;
  areaId?: string;
  taskEnergyType?: string;
  baseValue?: number;
  recurrenceEnabled?: boolean;
  recurrenceType?: string;
}): Promise<IActionLike> => {
  try {
    const response = await api.post('/actions', data);
    triggerDashboardRefresh();
    return response.data;
  } catch (err) {
    console.warn('Falha em /actions, usando fallback local/tasks:', err);
    const elem = data.areaId?.replace('area-', '') || 'fogo';
    const legacy = await createTask({
      title: data.title,
      type: data.recurrenceEnabled ? 'habit' : 'daily',
      element: elem,
      xpReward: data.baseValue ? Math.round(data.baseValue) : 50
    });
    return {
      id: legacy.id,
      title: legacy.title,
      taskEnergyType: data.taskEnergyType || 'NEUTRAL',
      baseValue: legacy.xpReward,
      recurrenceEnabled: data.recurrenceEnabled,
      isCompleted: legacy.completed,
      completed: legacy.completed,
      element: legacy.element
    };
  }
};

export const completeAction = async (
  id: string,
  options?: {
    durationMinutes?: number;
    presenceSeconds?: number;
    effortLevel?: number;
    secondaryAreaIds?: string[];
  }
): Promise<CompleteActionResponse> => {
  const response = await api.post(`/actions/${id}/complete`, options || {});
  triggerDashboardRefresh();
  return response.data;
};

export const toggleAction = async (id: string): Promise<CompleteActionResponse> => {
  const response = await api.patch(`/actions/${id}/toggle`);
  triggerDashboardRefresh();
  return response.data;
};

export const getPranaStatus = async (): Promise<PranaStatus> => {
  const response = await api.get('/actions/prana');
  return response.data;
};

export const rechargePrana = async (): Promise<PranaStatus> => {
  const response = await api.post('/actions/prana/recharge');
  triggerDashboardRefresh();
  return response.data;
};

export const getTasks = async (): Promise<TaskItem[]> => {
  const response = await api.get('/tasks');
  return response.data;
};

export const createTask = async (data: {
  title: string;
  type?: string;
  element: string;
  priorityWeight?: number;
  xpReward?: number;
}): Promise<TaskItem> => {
  const response = await api.post('/tasks', data);
  triggerDashboardRefresh();
  return response.data;
};

export const toggleTask = async (id: string): Promise<{ task: TaskItem; message?: string }> => {
  const response = await api.patch(`/tasks/${id}/toggle`);
  triggerDashboardRefresh();
  return response.data;
};

export const completeRitualDirectly = async (title: string, element: string, xpAmount: number): Promise<{ message: string }> => {
  const response = await api.post('/tasks/complete-ritual', { title, element, xpAmount });
  triggerDashboardRefresh();
  return response.data;
};

export const triggerDashboardRefresh = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nexus:refresh-dashboard'));
  }
};

export interface TimeBlockItem {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  isCompleted: boolean;
}

export const getTodayTimeBlocks = async (): Promise<TimeBlockItem[]> => {
  const response = await api.get('/time-blocks/today');
  return response.data;
};

export const completeTimeBlock = async (id: string): Promise<{ message: string }> => {
  const response = await api.put(`/time-blocks/${id}/complete`);
  triggerDashboardRefresh();
  return response.data;
};

export interface TrophyItem {
  id: string;
  title: string;
  description: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | string;
  iconType?: string;
  unlockedAt: string;
}

export const getMyTrophies = async (): Promise<TrophyItem[]> => {
  const response = await api.get('/trophies/my-trophies');
  return response.data;
};

export default api;
