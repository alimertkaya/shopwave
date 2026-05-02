import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/authApi';
import type { User } from '../types/auth.types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  updateUser: (partial: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isAdmin: false,
      isInitializing: true,

      login: async (email, password) => {
        const data = await authApi.login({ email, password });
        set({
          user: data.user,
          accessToken: data.accessToken,
          isAuthenticated: true,
          isAdmin: data.user.role === 'ADMIN',
        });
      },

      logout: async () => {
        try { await authApi.logout(); } catch { /* sessizce devam */ }
        set({ user: null, accessToken: null, isAuthenticated: false, isAdmin: false });
      },

      updateUser: (partial) => {
        set((s) => ({ user: s.user ? { ...s.user, ...partial } : null }));
      },

      initializeAuth: async () => {
        set({ isInitializing: true });
        const { accessToken } = get();
        if (!accessToken) {
          set({ isInitializing: false });
          return;
        }
        try {
          const user = await authApi.getMe();
          set({ user, isAuthenticated: true, isAdmin: user.role === 'ADMIN' });
        } catch {
          set({ user: null, accessToken: null, isAuthenticated: false, isAdmin: false });
        } finally {
          set({ isInitializing: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ accessToken: state.accessToken }),
    }
  )
);
