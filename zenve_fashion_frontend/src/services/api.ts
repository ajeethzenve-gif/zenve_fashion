import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor to inject JWT token if user is logged in
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const authStorage = localStorage.getItem('zenve-auth-storage') || localStorage.getItem('zenve-auth');
      if (authStorage) {
        const { state } = JSON.parse(authStorage);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      }
    } catch {
      // Ignore JSON parse errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors gracefully
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const url = String(error.config?.url || '');
      const isAuthAttempt =
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/send-otp');

      if (!isAuthAttempt && typeof window !== 'undefined') {
        localStorage.removeItem('zenve-auth-storage');
        localStorage.removeItem('zenve-auth');
        window.dispatchEvent(new Event('zenve-unauthorized'));
        if (
          window.location.pathname.startsWith('/account') ||
          window.location.pathname.startsWith('/checkout')
        ) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
