import api from './api';
import { Booking, ApiResponse } from '../types';

export const bookingService = {
  async createBooking(data: {
    serviceId: string;
    workerId?: string;
    scheduledDate: string;
    timeSlot: string;
    address: string;
    city?: string;
    pincode?: string;
    notes?: string;
    jobDescription?: string;
    serviceImage?: string;
  }): Promise<Booking> => {
    const res = await api.post<ApiResponse<Booking>>('/bookings', data);
    return res.data.data!;
  },

  async getCustomerBookings(): Promise<Booking[]> {
    const res = await api.get<ApiResponse<Booking[]>>('/bookings/my-bookings');
    return res.data.data || [];
  },

  async getWorkerBookings(): Promise<Booking[]> {
    const res = await api.get<ApiResponse<Booking[]>>('/bookings/worker-jobs');
    return res.data.data || [];
  },

  async updateBookingStatus(
    id: string,
    status: string,
    paymentMethod?: string
  ): Promise<Booking> {
    const res = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/status`, {
      status,
      paymentMethod,
    });
    return res.data.data!;
  },

  async submitReview(data: { bookingId: string; rating: number; comment: string }): Promise<any> {
    const res = await api.post<ApiResponse<any>>('/reviews', data);
    return res.data.data!;
  },
};
