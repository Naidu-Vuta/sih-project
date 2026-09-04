import api from './api';
import { AdminOverview, User, ApiResponse } from '../types';

export const adminService = {
  async getOverview(): Promise<AdminOverview> {
    const res = await api.get<ApiResponse<AdminOverview>>('/admin/overview');
    return res.data.data!;
  },

  async getWorkers(): Promise<User[]> {
    const res = await api.get<ApiResponse<User[]>>('/admin/workers');
    return res.data.data || [];
  },

  async verifyWorker(workerId: string, isVerified: boolean, cooperativeShares?: number): Promise<any> {
    const res = await api.patch<ApiResponse<any>>(`/admin/workers/${workerId}/verify`, {
      isVerified,
      cooperativeShares,
    });
    return res.data.data!;
  },

  async getUsers(role?: string): Promise<User[]> {
    const res = await api.get<ApiResponse<User[]>>('/admin/users', { params: { role } });
    return res.data.data || [];
  },
};
