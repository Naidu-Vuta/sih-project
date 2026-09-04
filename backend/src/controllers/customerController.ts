import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

export const getSavedWorkers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.userId;
    if (!customerId) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const saved = await prisma.savedWorker.findMany({
      where: { customerId },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            workerProfile: true,
            reviewsReceived: {
              take: 2,
              include: { customer: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(
      res,
      saved.map((s) => s.worker),
      'Saved workers retrieved'
    );
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching saved workers', 500);
  }
};

export const toggleSaveWorker = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.userId;
    const { workerId } = req.body;

    if (!customerId) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const existing = await prisma.savedWorker.findUnique({
      where: {
        customerId_workerId: {
          customerId,
          workerId,
        },
      },
    });

    if (existing) {
      await prisma.savedWorker.delete({
        where: { id: existing.id },
      });
      sendSuccess(res, { isSaved: false }, 'Worker removed from saved list');
    } else {
      await prisma.savedWorker.create({
        data: { customerId, workerId },
      });
      sendSuccess(res, { isSaved: true }, 'Worker saved to bookmarks');
    }
  } catch (error: any) {
    sendError(res, error.message || 'Error toggling saved worker', 500);
  }
};

export const getNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    sendSuccess(res, notifications, 'Notifications retrieved');
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching notifications', 500);
  }
};

export const markNotificationRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (id === 'all') {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    } else {
      await prisma.notification.updateMany({
        where: { id, userId },
        data: { isRead: true },
      });
    }

    sendSuccess(res, null, 'Notification(s) marked as read');
  } catch (error: any) {
    sendError(res, error.message || 'Error updating notification', 500);
  }
};

export const getPaymentHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.userId;
    if (!customerId) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const paidBookings = await prisma.booking.findMany({
      where: {
        customerId,
        paymentStatus: 'PAID',
      },
      include: {
        service: true,
        worker: { select: { name: true, phone: true } },
      },
      orderBy: { paidAt: 'desc' },
    });

    sendSuccess(
      res,
      paidBookings.map((b) => ({
        id: b.id,
        bookingCode: b.bookingCode,
        serviceTitle: b.service.title,
        workerName: b.worker?.name || 'Assigned Artisan',
        date: b.scheduledDate,
        totalPaid: b.totalPrice,
        workerShare: b.workerEarning,
        platformFee: b.platformFee,
        paymentMethod: b.paymentMethod || 'UPI',
        paidAt: b.paidAt || b.updatedAt,
      })),
      'Customer payment history retrieved'
    );
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching payment history', 500);
  }
};
