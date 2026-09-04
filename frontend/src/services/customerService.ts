import api from './api';
import { User, Notification, PaymentRecord, ApiResponse } from '../types';

export const customerService = {
  async getSavedWorkers(): Promise<User[]> {
    const res = await api.get<ApiResponse<User[]>>('/customer/saved-workers');
    return res.data.data || [];
  },

  async toggleSaveWorker(workerId: string): Promise<{ isSaved: boolean }> {
    const res = await api.post<ApiResponse<{ isSaved: boolean }>>('/customer/saved-workers', { workerId });
    return res.data.data!;
  },

  async getNotifications(): Promise<Notification[]> {
    const res = await api.get<ApiResponse<Notification[]>>('/customer/notifications');
    return res.data.data || [];
  },

  async markNotificationRead(id: string): Promise<void> {
    await api.patch(`/customer/notifications/${id}/read`);
  },

  async getPaymentHistory(): Promise<PaymentRecord[]> {
    const res = await api.get<ApiResponse<PaymentRecord[]>>('/customer/payment-history');
    return res.data.data || [];
  },
};
