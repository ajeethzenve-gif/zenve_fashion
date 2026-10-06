import axios from 'axios';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/user';
import { authService, LoginCredentials, RegisterData } from '../services/authService';
import { useCartStore } from './cartStore';
import { useWishlistStore } from './wishlistStore';
import { cartService } from '../services/cartService';
import { wishlistService } from '../services/wishlistService';

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

const purgeAllCustomerSessionData = () => {
  try {
    useCartStore.getState().clearCart();
  } catch {}
  try {
    useWishlistStore.getState().clearWishlist();
  } catch {}

  try {
    localStorage.removeItem('zenve_user_addresses');
    localStorage.removeItem('zenve_orders');
    localStorage.removeItem('zenve-cart-storage');
    localStorage.removeItem('zenve-wishlist-storage');

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('zenve_orders_') || key.startsWith('zenve_addr_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {}
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
          // Purge any lingering state from another customer on this browser
          purgeAllCustomerSessionData();

          const res = await authService.login(credentials);
          set({
            user: res.user,
            token: res.token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Fetch authenticated customer's server-stored cart and wishlist
          try {
            const serverCart = await cartService.getCart();
            if (serverCart && serverCart.length > 0) {
              useCartStore.setState({ items: serverCart });
            }
            const serverWishlist = await wishlistService.getWishlist();
            if (serverWishlist && serverWishlist.length > 0) {
              useWishlistStore.setState({ items: serverWishlist });
            }
          } catch {}

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
          // Purge any previous user session artifacts
          purgeAllCustomerSessionData();

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
        purgeAllCustomerSessionData();
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
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.error = null;
          state.isLoading = false;
        }
      },
    }
  )
);

if (typeof window !== 'undefined') {
  window.addEventListener('zenve-unauthorized', () => {
    try {
      useAuthStore.getState().logout();
    } catch {
      // ignore
    }
  });
}
