import api from '@/lib/axios';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../types/auth.types';

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/api/auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/api/auth/register', data).then((r) => r.data),

  refresh: () =>
    api.post<{ accessToken: string }>('/api/auth/refresh').then((r) => r.data),

  logout: () =>
    api.post('/api/auth/logout'),

  getMe: () =>
    api.get<User>('/api/auth/me').then((r) => r.data),

  getUserById: (id: string) =>
    api.get<User>(`/api/auth/users/${id}`).then((r) => r.data),

  updateMe: (data: { firstName?: string; lastName?: string; email?: string; phone?: string }) =>
    api.patch<User>('/api/auth/me', data).then((r) => r.data),
};
