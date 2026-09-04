import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

export const getPublicWorkers = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      service,
      skill,
      location,
      maxDistance,
      minRating,
      minPrice,
      maxPrice,
      available,
    } = req.query;

    const profileWhere: any = {
      isVerified: true,
    };

    const targetSkill = (service as string) || (skill as string);
    if (targetSkill && targetSkill !== 'all') {
      profileWhere.skills = { contains: targetSkill };
    }

    if (location && typeof location === 'string') {
      profileWhere.OR = [
        { city: { contains: location } },
        { serviceArea: { contains: location } },
      ];
    }

    if (maxDistance) {
      profileWhere.distanceKm = { lte: Number(maxDistance) };
    }

    if (minRating) {
      profileWhere.rating = { gte: Number(minRating) };
    }

    if (minPrice || maxPrice) {
      profileWhere.hourlyRate = {};
      if (minPrice) profileWhere.hourlyRate.gte = Number(minPrice);
      if (maxPrice) profileWhere.hourlyRate.lte = Number(maxPrice);
    }

    if (available === 'true') {
      profileWhere.isAvailable = true;
    }

    const workers = await prisma.user.findMany({
      where: {
        role: 'WORKER',
        workerProfile: profileWhere,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        workerProfile: true,
        reviewsReceived: {
          take: 3,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: { select: { name: true, avatarUrl: true } },
          },
        },
      },
      orderBy: {
        workerProfile: {
          rating: 'desc',
        },
      },
    });

    sendSuccess(res, workers, 'Workers retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching workers:', error);
    sendError(res, error.message || 'Error retrieving workers', 500);
  }
};

export const getWorkerProfileById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const worker = await prisma.user.findFirst({
      where: { id, role: 'WORKER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
        workerProfile: true,
        reviewsReceived: {
          orderBy: { createdAt: 'desc' },
          include: {
            customer: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!worker || !worker.workerProfile) {
      sendError(res, 'Worker profile not found', 404);
      return;
    }

    sendSuccess(res, worker, 'Worker profile details retrieved');
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching worker profile', 500);
  }
};

export const getWorkerStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const workerId = req.user?.userId;
    if (!workerId) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const worker = await prisma.user.findUnique({
      where: { id: workerId },
      include: { workerProfile: true },
    });

    if (!worker || !worker.workerProfile) {
      sendError(res, 'Worker profile not found', 404);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const allBookings = await prisma.booking.findMany({
      where: { workerId },
      include: { review: true, customer: true, service: true },
    });

    const todayJobs = allBookings.filter(
      (b) =>
        b.scheduledDate === todayStr &&
        (b.status === 'ACCEPTED' || b.status === 'ON_THE_WAY' || b.status === 'ARRIVED' || b.status === 'IN_PROGRESS')
    );

    const upcomingJobs = allBookings.filter(
      (b) =>
        b.status === 'ACCEPTED' ||
        b.status === 'ON_THE_WAY' ||
        b.status === 'ARRIVED' ||
        b.status === 'IN_PROGRESS' ||
        b.status === 'REQUESTED'
    );

    const completedJobs = allBookings.filter(
      (b) => b.status === 'COMPLETED' || b.status === 'PAID' || b.status === 'REVIEWED'
    );

    const pendingPaymentBookings = allBookings.filter(
      (b) => (b.status === 'COMPLETED' && b.paymentStatus === 'PENDING')
    );
    const pendingPaymentsTotal = pendingPaymentBookings.reduce((sum, b) => sum + b.workerEarning, 0);

    sendSuccess(res, {
      profile: worker.workerProfile,
      jobCounts: {
        today: todayJobs.length,
        upcoming: upcomingJobs.length,
        completed: completedJobs.length,
        total: allBookings.length,
      },
      todayJobs,
      upcomingJobs,
      financials: {
        totalEarned: worker.workerProfile.payoutTotal,
        coopDividendEarned: worker.workerProfile.coopDividendEarned,
        totalWithDividends: worker.workerProfile.payoutTotal + worker.workerProfile.coopDividendEarned,
        pendingPayments: pendingPaymentsTotal,
        cooperativeShares: worker.workerProfile.cooperativeShares,
        fairWagePercentage: '95%',
        corporateComparison:
          'Earned extra approx ₹' +
          Math.round(worker.workerProfile.payoutTotal * 0.25) +
          ' compared to 70% corporate middleman platforms',
      },
      availability: worker.workerProfile.isAvailable,
      isVerified: worker.workerProfile.isVerified,
    });
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching worker stats', 500);
  }
};

export const getWorkerEarningsAnalytics = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const workerId = req.user?.userId;
    if (!workerId) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const worker = await prisma.user.findUnique({
      where: { id: workerId },
      include: { workerProfile: true },
    });

    if (!worker || !worker.workerProfile) {
      sendError(res, 'Worker profile not found', 404);
      return;
    }

    const paidBookings = await prisma.booking.findMany({
      where: {
        workerId,
        paymentStatus: 'PAID',
      },
      include: {
        customer: { select: { name: true, phone: true } },
        service: { select: { title: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const dailyEarnings = paidBookings
      .filter((b) => new Date(b.updatedAt) >= oneDayAgo)
      .reduce((sum, b) => sum + b.workerEarning, 0);

    const weeklyEarnings = paidBookings
      .filter((b) => new Date(b.updatedAt) >= oneWeekAgo)
      .reduce((sum, b) => sum + b.workerEarning, 0);

    const monthlyEarnings = paidBookings
      .filter((b) => new Date(b.updatedAt) >= oneMonthAgo)
      .reduce((sum, b) => sum + b.workerEarning, 0);

    const totalEarnings = worker.workerProfile.payoutTotal;

    sendSuccess(res, {
      dailyEarnings: Number(dailyEarnings.toFixed(2)),
      weeklyEarnings: Number(weeklyEarnings.toFixed(2)),
      monthlyEarnings: Number(monthlyEarnings.toFixed(2)),
      totalEarnings: Number(totalEarnings.toFixed(2)),
      coopDividendEarned: Number(worker.workerProfile.coopDividendEarned.toFixed(2)),
      cooperativeShares: worker.workerProfile.cooperativeShares,
      paymentHistory: paidBookings.map((b) => ({
        id: b.id,
        bookingCode: b.bookingCode,
        serviceTitle: b.service.title,
        customerName: b.customer.name,
        date: b.scheduledDate,
        totalPrice: b.totalPrice,
        platformFee: b.platformFee,
        workerEarning: b.workerEarning,
        coopDividendShare: b.coopDividendShare,
        paymentMethod: b.paymentMethod || 'UPI',
        paidAt: b.paidAt || b.updatedAt,
      })),
    });
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching earnings analytics', 500);
  }
};

export const toggleAvailability = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const workerId = req.user?.userId;
    const { isAvailable } = req.body;

    const profile = await prisma.workerProfile.findUnique({
      where: { userId: workerId },
    });

    if (!profile) {
      sendError(res, 'Worker profile not found', 404);
      return;
    }

    const updated = await prisma.workerProfile.update({
      where: { userId: workerId },
      data: { isAvailable },
    });

    sendSuccess(res, updated, `Status updated to ${isAvailable ? 'Available' : 'Busy / Off Duty'}`);
  } catch (error: any) {
    sendError(res, error.message || 'Error updating availability', 500);
  }
};

export const updateWorkerProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const workerId = req.user?.userId;
    const {
      name,
      avatarUrl,
      bio,
      skills,
      hourlyRate,
      experienceYears,
      certifications,
      serviceArea,
      languages,
      city,
    } = req.body;

    if (name || avatarUrl) {
      await prisma.user.update({
        where: { id: workerId },
        data: {
          ...(name && { name }),
          ...(avatarUrl && { avatarUrl }),
        },
      });
    }

    const updated = await prisma.workerProfile.update({
      where: { userId: workerId },
      data: {
        ...(bio !== undefined && { bio }),
        ...(skills !== undefined && { skills }),
        ...(hourlyRate !== undefined && { hourlyRate: Number(hourlyRate) }),
        ...(experienceYears !== undefined && { experienceYears: Number(experienceYears) }),
        ...(certifications !== undefined && { certifications }),
        ...(serviceArea !== undefined && { serviceArea }),
        ...(languages !== undefined && { languages }),
        ...(city !== undefined && { city }),
      },
    });

    sendSuccess(res, updated, 'Worker profile updated successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Error updating worker profile', 500);
  }
};

export const updateWorkerSchedule = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const workerId = req.user?.userId;
    const { workingDays, workingHours, unavailableDates } = req.body;

    const updated = await prisma.workerProfile.update({
      where: { userId: workerId },
      data: {
        ...(workingDays !== undefined && { workingDays }),
        ...(workingHours !== undefined && { workingHours }),
        ...(unavailableDates !== undefined && { unavailableDates }),
      },
    });

    sendSuccess(res, updated, 'Working days and schedule updated successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Error updating schedule', 500);
  }
};
