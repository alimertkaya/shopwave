import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// Token getter — authStore'u runtime'da import ederek circular dep'ten kaçınılır
let getAccessToken: (() => string | null) | null = null;
export const setTokenGetter = (fn: () => string | null) => { getAccessToken = fn; };

api.interceptors.request.use((config) => {
  const token = getAccessToken?.();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const { useAuthStore } = await import('@/features/auth/store/authStore');
      await useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
