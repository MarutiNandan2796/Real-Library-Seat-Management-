import api from './api';
import { ApiResponse, User } from '@/types';

export const authService = {
  // Login
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    try {
      const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', {
        email,
        password,
      });
      
      console.log('Login response:', response.data);
      
      if (!response.data.data) {
        throw new Error('Invalid response structure from server');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Auth service login error:', error);
      throw error;
    }
  },

  // Verify token
  verifyToken: async (): Promise<User> => {
    try {
      const response = await api.get<ApiResponse<{ user: User }>>('/auth/verify');
      
      if (!response.data.data) {
        throw new Error('Invalid response structure from server');
      }
      
      return response.data.data.user;
    } catch (error: any) {
      console.error('Auth service verify token error:', error);
      throw error;
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};
