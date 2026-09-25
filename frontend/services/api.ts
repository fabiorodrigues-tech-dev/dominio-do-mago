import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para injetar o JWT
api.interceptors.request.use((config) => {
  // Garanta que estamos no lado do cliente antes de acessar o localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('mago_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // Se o corpo for FormData, remova o Content-Type fixo para o navegador gerar o boundary multipart
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
}, (error) => Promise.reject(error));

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
  const response = await api.get('/users/me/dashboard');
  return response.data;
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
