import { apiClient } from './api';
import { User, AuthResponse } from '../types/user';

export interface LoginCredentials {
  email: string;
  password?: string;
  phone?: string;
  otp?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password?: string;
}

export const authService = {
  /**
   * Log in user with credentials via backend API
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    if (response.data && response.data.token) {
      return response.data;
    }
    throw new Error('Authentication failed. Please check your credentials.');
  },

  /**
   * Register new customer account via backend API
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    if (response.data && response.data.token) {
      return response.data;
    }
    throw new Error('Registration failed. Please verify your details and try again.');
  },

  /**
   * Log out current user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    }
  },

  /**
   * Get authenticated user profile from database
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<User>('/auth/me');
      return response.data;
    } catch {
      return null;
    }
  },

  /**
   * Refresh expired JWT token
   */
  async refreshToken(token: string): Promise<string> {
    try {
      const response = await apiClient.post<{ token: string }>('/auth/refresh-token', { token });
      return response.data.token;
    } catch {
      return token;
    }
  },

  /**
   * Dispatch verification OTP to registered email
   */
  async sendPasswordResetOtp(email: string): Promise<{ success: boolean; otp?: string; message: string }> {
    const response = await apiClient.post<{ success: boolean; otp?: string; message: string }>('/auth/send-otp', {
      email: email.trim().toLowerCase(),
    });
    return response.data;
  },

  /**
   * Verify OTP and update password for client
   */
  async verifyOtpAndUpdatePassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>('/auth/reset-password', {
      email: email.trim().toLowerCase(),
      otp: otp.trim(),
      newPassword,
    });
    return response.data;
  },
};

