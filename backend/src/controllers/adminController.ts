import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

export const getAdminOverview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [
      totalWorkers,
      verifiedWorkers,
      pendingWorkers,
      totalCustomers,
      bookingsCount,
      completedBookings,
      coopMetric,
      recentBookings,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'WORKER' } }),
      prisma.workerProfile.count({ where: { isVerified: true } }),
      prisma.workerProfile.count({ where: { isVerified: false } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.booking.count(),
      prisma.booking.findMany({ where: { status: 'COMPLETED' } }),
      prisma.cooperativeMetric.findUnique({ where: { id: 'singleton' } }),
      prisma.booking.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          service: true,
          customer: { select: { name: true, email: true } },
          worker: { select: { name: true, email: true } },
        },
      }),
    ]);

    const grossVolume = completedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const platformFeeTotal = completedBookings.reduce((sum, b) => sum + b.platformFee, 0);
    const totalFairWages = completedBookings.reduce((sum, b) => sum + b.workerEarning, 0);
    const totalDividends = completedBookings.reduce((sum, b) => sum + b.coopDividendShare, 0);

    sendSuccess(res, {
      kpis: {
        totalWorkers,
        verifiedWorkers,
        pendingVerifications: pendingWorkers,
        totalCustomers,
        totalBookings: bookingsCount,
        completedBookings: completedBookings.length,
        grossVolume,
        platformFeeTotal,
        totalFairWages,
        totalDividends,
      },
      coopMetric: coopMetric || {
        totalDividendDistributed: 45200.0,
        communityWelfarePool: 82000.0,
        totalFairWagesPaid: 384000.0,
        workerMembersCount: verifiedWorkers,
      },
      recentBookings,
    });
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching admin overview', 500);
  }
};

export const getPendingWorkers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const workers = await prisma.user.findMany({
      where: {
        role: 'WORKER',
      },
      include: {
        workerProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, workers, 'Worker verification list retrieved');
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching worker verifications', 500);
  }
};

export const verifyWorker = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { workerId } = req.params;
    const { isVerified, cooperativeShares } = req.body;

    const worker = await prisma.user.findFirst({
      where: { id: workerId, role: 'WORKER' },
      include: { workerProfile: true },
    });

    if (!worker || !worker.workerProfile) {
      sendError(res, 'Worker not found', 404);
      return;
    }

    const updatedProfile = await prisma.workerProfile.update({
      where: { userId: workerId },
      data: {
        isVerified,
        ...(cooperativeShares ? { cooperativeShares: Number(cooperativeShares) } : {}),
      },
    });

    sendSuccess(
      res,
      updatedProfile,
      `Worker ${isVerified ? 'verified & inducted as Cooperative Member' : 'verification revoked'}`
    );
  } catch (error: any) {
    sendError(res, error.message || 'Error verifying worker', 500);
  }
};

export const getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.query;

    const where: any = {};
    if (role && typeof role === 'string') {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
        workerProfile: true,
        customerProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, users, 'Users retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching users', 500);
  }
};
