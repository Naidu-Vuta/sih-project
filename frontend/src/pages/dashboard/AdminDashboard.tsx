import React from 'react';

export type Role = 'CUSTOMER' | 'WORKER' | 'ADMIN';

export type BookingStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'ACCEPTED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'PAID'
  | 'REVIEWED'
  | 'REJECTED'
  | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  avatarUrl?: string;
  createdAt?: string;
  profile?: CustomerProfile | WorkerProfile;
  customerProfile?: CustomerProfile;
  workerProfile?: WorkerProfile;
  reviewsReceived?: Review[];
}

export interface CustomerProfile {
  id: string;
  userId: string;
  address?: string;
  city?: string;
  pincode?: string;
}

export interface WorkerProfile {
  id: string;
  userId: string;
  bio?: string;
  skills: string;
  hourlyRate: number;
  experienceYears: number;
  isAvailable: boolean;
  isVerified: boolean;
  rating: number;
  totalReviews: number;
  totalJobs: number;
  cooperativeShares: number;
  payoutTotal: number;
  coopDividendEarned: number;
  city?: string;
  certifications?: string;
  serviceArea?: string;
  workingDays?: string;
  workingHours?: string;
  unavailableDates?: string;
  languages?: string;
  distanceKm?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  _count?: {
    services: number;
  };
}

export interface Service {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  basePrice: number;
  priceType: 'FIXED' | 'HOURLY';
  durationEst: string;
  imageUrl?: string;
  category?: Category;
}

export interface Booking {
  id: string;
  bookingCode: string;
  customerId: string;
  workerId?: string | null;
  serviceId: string;
  scheduledDate: string;
  timeSlot: string;
  address: string;
  city: string;
  pincode?: string;
  notes?: string;
  jobDescription?: string;
  serviceImage?: string;
  status: BookingStatus;
  paymentStatus: 'PENDING' | 'PAID';
  paidAt?: string;
  paymentMethod?: string;
  totalPrice: number;
  platformFee: number;
  workerEarning: number;
  coopDividendShare: number;
  createdAt: string;
  updatedAt: string;
  service: Service;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  worker?: {
    id: string;
    name: string;
    phone?: string;
    avatarUrl?: string;
    workerProfile?: WorkerProfile;
  } | null;
  review?: Review;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  workerId: string;
  rating: number;
  comment: string;
  createdAt: string;
  customer?: {
    id?: string;
    name: string;
    avatarUrl?: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'BOOKING_UPDATE' | 'PAYMENT' | 'SYSTEM';
  bookingId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  bookingCode: string;
  serviceTitle: string;
  workerName?: string;
  customerName?: string;
  date: string;
  totalPaid: number;
  workerShare: number;
  platformFee: number;
  coopDividendShare?: number;
  paymentMethod: string;
  paidAt: string;
}

export interface WorkerEarningsAnalytics {
  dailyEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  totalEarnings: number;
  coopDividendEarned: number;
  cooperativeShares: number;
  paymentHistory: {
    id: string;
    bookingCode: string;
    serviceTitle: string;
    customerName: string;
    date: string;
    totalPrice: number;
    platformFee: number;
    workerEarning: number;
    coopDividendShare: number;
    paymentMethod: string;
    paidAt: string;
  }[];
}

export interface WorkerStats {
  profile: WorkerProfile;
  jobCounts: {
    today: number;
    upcoming: number;
    completed: number;
    total: number;
  };
  todayJobs: Booking[];
  upcomingJobs: Booking[];
  financials: {
    totalEarned: number;
    coopDividendEarned: number;
    totalWithDividends: number;
    pendingPayments: number;
    cooperativeShares: number;
    fairWagePercentage: string;
    corporateComparison: string;
  };
  availability: boolean;
  isVerified: boolean;
}

export interface AdminOverview {
  kpis: {
    verifiedWorkers: number;
    pendingVerifications: number;
    totalBookings: number;
    completedBookings: number;
    grossVolume: number;
    totalFairWages: number;
    platformFeeTotal: number;
  };

  coopMetric: {
    communityWelfarePool: number;
    totalDividendDistributed: number;
  };

  recentBookings: Booking[];
  recentUsers: User[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-4 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Admin Portal
        </div>
        <h1 className="text-3xl font-bold text-slate-900">CoopGig Dashboard</h1>
        <p className="mt-3 text-sm text-slate-600">
          The admin dashboard is ready to be connected to the backend analytics and management APIs.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;