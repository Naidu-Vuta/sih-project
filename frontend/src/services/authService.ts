import api from './api';
import { User, ApiResponse } from '../types';

export const authService = {
  async register(data: any): Promise<{ token: string; user: User }> {
    const res = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/register', data);
    return res.data.data!;
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', { email, password });
    return res.data.data!;
  },

  async getCurrentUser(): Promise<User> {
    const res = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return res.data.data!.user;
  },
};
