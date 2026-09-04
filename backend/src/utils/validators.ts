import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  role: z.enum(['CUSTOMER', 'WORKER']).default('CUSTOMER'),
  skills: z.string().optional(),
  bio: z.string().optional(),
  hourlyRate: z.number().positive().optional(),
  experienceYears: z.number().int().nonnegative().optional(),
  city: z.string().optional(),
  certifications: z.string().optional(),
  serviceArea: z.string().optional(),
  languages: z.string().optional(),
  address: z.string().optional(),
  pincode: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createBookingSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  workerId: z.string().optional(),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  timeSlot: z.string().min(1, 'Time slot is required'),
  address: z.string().min(5, 'Detailed address is required'),
  city: z.string().default('Bengaluru'),
  pincode: z.string().optional(),
  notes: z.string().optional(),
  jobDescription: z.string().optional(),
  serviceImage: z.string().optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum([
    'REQUESTED',
    'ACCEPTED',
    'ON_THE_WAY',
    'ARRIVED',
    'IN_PROGRESS',
    'COMPLETED',
    'PAID',
    'REVIEWED',
    'REJECTED',
    'CANCELLED',
  ]),
  paymentMethod: z.string().optional(),
});

export const createReviewSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3, 'Review comment must be at least 3 characters'),
});

export const workerAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
});

export const workerProfileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  avatarUrl: z.string().optional(),
  skills: z.string().optional(),
  experienceYears: z.number().int().nonnegative().optional(),
  certifications: z.string().optional(),
  serviceArea: z.string().optional(),
  hourlyRate: z.number().positive().optional(),
  languages: z.string().optional(),
  bio: z.string().optional(),
  city: z.string().optional(),
});

export const workerScheduleUpdateSchema = z.object({
  workingDays: z.string().optional(),
  workingHours: z.string().optional(),
  unavailableDates: z.string().optional(),
});

export const adminVerifyWorkerSchema = z.object({
  isVerified: z.boolean(),
  cooperativeShares: z.number().int().positive().optional(),
});

export const createServiceSchema = z.object({
  categoryId: z.string().min(1),
  title: z.string().min(3),
  description: z.string().min(10),
  basePrice: z.number().positive(),
  priceType: z.enum(['FIXED', 'HOURLY']).default('FIXED'),
  durationEst: z.string().min(1),
  imageUrl: z.string().optional(),
});
