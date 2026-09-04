import api from './api';
import { WorkerStats, WorkerProfile, User, WorkerEarningsAnalytics, ApiResponse } from '../types';

export interface WorkerFilterParams {
  service?: string;
  skill?: string;
  location?: string;
  maxDistance?: number;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
  available?: boolean | string;
}

export const workerService = {
  async getPublicWorkers(params?: WorkerFilterParams): Promise<User[]> {
    const res = await api.get<ApiResponse<User[]>>('/workers/public', { params });
    return res.data.data || [];
  },

  async getWorkerById(id: string): Promise<User> {
    const res = await api.get<ApiResponse<User>>(`/workers/profile/${id}`);
    return res.data.data!;
  },

  async getStats(): Promise<WorkerStats> {
    const res = await api.get<ApiResponse<WorkerStats>>('/workers/stats');
    return res.data.data!;
  },

  async getEarnings(): Promise<WorkerEarningsAnalytics> {
    const res = await api.get<ApiResponse<WorkerEarningsAnalytics>>('/workers/earnings');
    return res.data.data!;
  },

  async toggleAvailability(isAvailable: boolean): Promise<WorkerProfile> {
    const res = await api.patch<ApiResponse<WorkerProfile>>('/workers/availability', { isAvailable });
    return res.data.data!;
  },

  async updateProfile(data: Partial<WorkerProfile> & { name?: string; avatarUrl?: string }): Promise<WorkerProfile> {
    const res = await api.put<ApiResponse<WorkerProfile>>('/workers/profile', data);
    return res.data.data!;
  },

  async updateSchedule(data: { workingDays?: string; workingHours?: string; unavailableDates?: string }): Promise<WorkerProfile> {
    const res = await api.put<ApiResponse<WorkerProfile>>('/workers/schedule', data);
    return res.data.data!;
  },
};
