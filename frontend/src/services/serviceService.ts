import api from './api';
import { Category, Service, ApiResponse, User } from '../types';

export const serviceService = {
  async getCategories(): Promise<Category[]> {
    const res = await api.get<ApiResponse<Category[]>>('/services/categories');
    return res.data.data || [];
  },

  async getServices(params?: { category?: string; search?: string; minPrice?: number; maxPrice?: number }): Promise<Service[]> {
    const res = await api.get<ApiResponse<Service[]>>('/services', { params });
    return res.data.data || [];
  },

  async getServiceById(id: string): Promise<{ service: Service; matchingWorkers: User[] }> {
    const res = await api.get<ApiResponse<{ service: Service; matchingWorkers: User[] }>>(`/services/${id}`);
    return res.data.data!;
  },

  async createService(data: Partial<Service>): Promise<Service> {
    const res = await api.post<ApiResponse<Service>>('/services', data);
    return res.data.data!;
  },
};
