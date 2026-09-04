import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { config } from '../config';

// Helper to generate a human-readable unique booking code e.g. BK-2026-8492
const generateBookingCode = (): string => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `BK-${year}-${randomNum}`;
};

// Helper to insert notifications
const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type = 'BOOKING_UPDATE',
  bookingId?: string
) => {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        bookingId,
      },
    });
  } catch (err) {
    console.error('Failed to create notification', err);
  }
};

export const createBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.userId;
    if (!customerId) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const {
      serviceId,
      scheduledDate,
      timeSlot,
      address,
      city = 'Bengaluru',
      pincode,
      notes,
      jobDescription,
      serviceImage,
      workerId,
    } = req.body;

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      sendError(res, 'Service not found', 404);
      return;
    }

    let assignedWorkerId = workerId;

    if (assignedWorkerId) {
      const targetWorker = await prisma.user.findFirst({
        where: { id: assignedWorkerId, role: 'WORKER' },
        include: { workerProfile: true },
      });
      if (!targetWorker) {
        sendError(res, 'Selected worker is not valid', 400);
        return;
      }
    } else {
      // Auto-assign first available verified worker
      const candidate = await prisma.user.findFirst({
        where: {
          role: 'WORKER',
          workerProfile: {
            isVerified: true,
            isAvailable: true,
          },
        },
      });
      if (candidate) {
        assignedWorkerId = candidate.id;
      }
    }

    const totalPrice = service.basePrice;
    const platformFee = Number((totalPrice * config.platformFeeRate).toFixed(2));
    const workerEarning = Number((totalPrice * config.workerEarningRate).toFixed(2));
    const coopDividendShare = Number((totalPrice * config.coopDividendRate).toFixed(2));

    // Ensure unique booking code
    let bookingCode = generateBookingCode();
    let exists = await prisma.booking.findUnique({ where: { bookingCode } });
    while (exists) {
      bookingCode = generateBookingCode();
      exists = await prisma.booking.findUnique({ where: { bookingCode } });
    }

    const booking = await prisma.booking.create({
      data: {
        bookingCode,
        customerId,
        workerId: assignedWorkerId || null,
        serviceId,
        scheduledDate,
        timeSlot,
        address,
        city,
        pincode,
        notes,
        jobDescription: jobDescription || notes,
        serviceImage,
        status: 'REQUESTED',
        paymentStatus: 'PENDING',
        totalPrice,
        platformFee,
        workerEarning,
        coopDividendShare,
      },
      include: {
        service: {
          include: { category: true },
        },
        worker: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatarUrl: true,
            workerProfile: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Notify assigned worker
    if (assignedWorkerId) {
      await createNotification(
        assignedWorkerId,
        'New Job Request Received',
        `New ${service.title} booking #${bookingCode} scheduled for ${scheduledDate} (${timeSlot}).`,
        'BOOKING_UPDATE',
        bookingCode
      );
    }

    sendSuccess(res, booking, 'Booking created successfully with status REQUESTED', 201);
  } catch (error: any) {
    console.error('Create Booking Error:', error);
    sendError(res, error.message || 'Error creating booking', 500);
  }
};

export const getCustomerBookings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.userId;
    if (!customerId) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const bookings = await prisma.booking.findMany({
      where: { customerId },
      include: {
        service: {
          include: { category: true },
        },
        worker: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatarUrl: true,
            workerProfile: true,
          },
        },
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, bookings, 'Customer bookings retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching bookings', 500);
  }
};

export const getWorkerBookings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const workerId = req.user?.userId;
    if (!workerId) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { workerId },
          { workerId: null, status: 'REQUESTED' },
        ],
      },
      include: {
        service: {
          include: { category: true },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, bookings, 'Worker bookings retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching worker bookings', 500);
  }
};

export const updateBookingStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, paymentMethod } = req.body;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { worker: true, customer: true, service: true },
    });

    if (!booking) {
      sendError(res, 'Booking not found', 404);
      return;
    }

    // Role checks
    if (userRole === 'WORKER') {
      if (booking.workerId && booking.workerId !== userId) {
        sendError(res, 'You are not assigned to this booking', 403);
        return;
      }
    } else if (userRole === 'CUSTOMER') {
      if (booking.customerId !== userId) {
        sendError(res, 'You cannot modify another customer\'s booking', 403);
        return;
      }
      if (status !== 'CANCELLED' && status !== 'PAID') {
        sendError(res, 'Customers can only cancel or mark paid', 403);
        return;
      }
    }

    const isMarkingPaid = (status === 'PAID' || req.body.markPaid) && booking.paymentStatus !== 'PAID';

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status,
        ...(userRole === 'WORKER' && !booking.workerId ? { workerId: userId } : {}),
        ...(isMarkingPaid && {
          paymentStatus: 'PAID',
          paidAt: new Date(),
          paymentMethod: paymentMethod || 'UPI',
        }),
      },
      include: {
        service: true,
        worker: {
          include: { workerProfile: true },
        },
        customer: true,
        review: true,
      },
    });

    // If marked PAID or COMPLETED, credit worker financials
    if (isMarkingPaid && updatedBooking.workerId) {
      await prisma.workerProfile.updateMany({
        where: { userId: updatedBooking.workerId },
        data: {
          totalJobs: { increment: 1 },
          payoutTotal: { increment: updatedBooking.workerEarning },
          coopDividendEarned: { increment: updatedBooking.coopDividendShare },
        },
      });

      await prisma.cooperativeMetric.upsert({
        where: { id: 'singleton' },
        create: {
          id: 'singleton',
          totalFairWagesPaid: updatedBooking.workerEarning,
          communityWelfarePool: updatedBooking.platformFee,
          totalDividendDistributed: updatedBooking.coopDividendShare,
        },
        update: {
          totalFairWagesPaid: { increment: updatedBooking.workerEarning },
          communityWelfarePool: { increment: updatedBooking.platformFee },
          totalDividendDistributed: { increment: updatedBooking.coopDividendShare },
        },
      });
    }

    // Trigger in-app notifications according to status transition
    const workerName = updatedBooking.worker?.name || 'Craftsperson';
    const customerName = updatedBooking.customer.name;
    const bookingCode = updatedBooking.bookingCode;

    switch (status) {
      case 'ACCEPTED':
        await createNotification(
          updatedBooking.customerId,
          'Booking Accepted',
          `${workerName} has accepted your booking #${bookingCode} for ${updatedBooking.service.title}.`,
          'BOOKING_UPDATE',
          bookingCode
        );
        break;
      case 'REJECTED':
        await createNotification(
          updatedBooking.customerId,
          'Booking Request Declined',
          `Your request #${bookingCode} was declined. You can select another verified artisan.`,
          'BOOKING_UPDATE',
          bookingCode
        );
        break;
      case 'ON_THE_WAY':
        await createNotification(
          updatedBooking.customerId,
          'Artisan On The Way',
          `${workerName} has departed and is on the way to your address for #${bookingCode}.`,
          'BOOKING_UPDATE',
          bookingCode
        );
        break;
      case 'ARRIVED':
        await createNotification(
          updatedBooking.customerId,
          'Artisan Arrived',
          `${workerName} has arrived at your location for #${bookingCode}.`,
          'BOOKING_UPDATE',
          bookingCode
        );
        break;
      case 'IN_PROGRESS':
        await createNotification(
          updatedBooking.customerId,
          'Service Started',
          `${workerName} has begun work on ${updatedBooking.service.title}.`,
          'BOOKING_UPDATE',
          bookingCode
        );
        break;
      case 'COMPLETED':
        await createNotification(
          updatedBooking.customerId,
          'Service Completed',
          `Work completed for #${bookingCode}! Total amount: ₹${updatedBooking.totalPrice}. Please settle payment.`,
          'PAYMENT',
          bookingCode
        );
        break;
      case 'PAID':
        if (updatedBooking.workerId) {
          await createNotification(
            updatedBooking.workerId,
            'Payment Received',
            `Direct wage ₹${updatedBooking.workerEarning.toFixed(2)} credited for booking #${bookingCode}. (+₹${updatedBooking.coopDividendShare.toFixed(2)} dividend)`,
            'PAYMENT',
            bookingCode
          );
        }
        await createNotification(
          updatedBooking.customerId,
          'Payment Confirmed',
          `Payment of ₹${updatedBooking.totalPrice.toFixed(2)} confirmed. Please leave a review for ${workerName}!`,
          'BOOKING_UPDATE',
          bookingCode
        );
        break;
      case 'CANCELLED':
        if (updatedBooking.workerId) {
          await createNotification(
            updatedBooking.workerId,
            'Booking Cancelled',
            `Customer ${customerName} cancelled booking #${bookingCode}.`,
            'BOOKING_UPDATE',
            bookingCode
          );
        }
        break;
    }

    sendSuccess(res, updatedBooking, `Booking status updated to ${status}`);
  } catch (error: any) {
    console.error('Update Booking Error:', error);
    sendError(res, error.message || 'Error updating booking', 500);
  }
};
