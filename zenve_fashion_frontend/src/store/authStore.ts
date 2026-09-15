import axios from 'axios';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/user';
import { authService, LoginCredentials, RegisterData } from '../services/authService';

const extractErrorMessage = (err: unknown, defaultMessage: string): string => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (typeof data === 'string') return data;
    if (data && typeof data === 'object') {
      if ('message' in data && data.message) return String(data.message);
      if ('detail' in data && data.detail) return String(data.detail);
      if ('error' in data && data.error) return String(data.error);

      // Check if it's a dictionary of field errors: { [field]: ['error message'] }
      const firstKey = Object.keys(data)[0];
      if (firstKey) {
        const val = (data as Record<string, unknown>)[firstKey];
        if (Array.isArray(val) && val.length > 0) return `${val[0]}`;
        if (typeof val === 'string') return val;
      }
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return defaultMessage;
};

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  updateProfile: (updated: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.login(credentials);
          set({
            user: res.user,
            token: res.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (err: unknown) {
          const message = extractErrorMessage(err, 'Invalid credentials. Please verify your details.');
          set({ error: message, isLoading: false });
          return false;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.register(data);
          set({
            user: res.user,
            token: res.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (err: unknown) {
          const message = extractErrorMessage(err, 'Registration failed. Please try again.');
          set({ error: message, isLoading: false });
          return false;
        }
      },

      logout: () => {
        authService.logout();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),

      updateProfile: (updated) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, ...updated } });
        }
      },
    }),
    {
      name: 'zenve-auth-storage',
    }
  )
);
