import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

export const createReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.userId;
    const { bookingId, rating, comment } = req.body;

    if (!customerId) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { review: true },
    });

    if (!booking) {
      sendError(res, 'Booking not found', 404);
      return;
    }

    if (booking.customerId !== customerId) {
      sendError(res, 'You can only review your own bookings', 403);
      return;
    }

    if (booking.status !== 'COMPLETED') {
      sendError(res, 'Reviews can only be submitted for completed services', 400);
      return;
    }

    if (booking.review) {
      sendError(res, 'A review has already been submitted for this booking', 409);
      return;
    }

    if (!booking.workerId) {
      sendError(res, 'No worker was assigned to this booking', 400);
      return;
    }

    const review = await prisma.review.create({
      data: {
        bookingId,
        customerId,
        workerId: booking.workerId,
        rating: Number(rating),
        comment,
      },
    });

    // Recompute worker's average rating
    const allWorkerReviews = await prisma.review.findMany({
      where: { workerId: booking.workerId },
    });

    const averageRating =
      allWorkerReviews.reduce((sum, r) => sum + r.rating, 0) / allWorkerReviews.length;

    await prisma.workerProfile.updateMany({
      where: { userId: booking.workerId },
      data: {
        rating: Number(averageRating.toFixed(1)),
        totalReviews: allWorkerReviews.length,
      },
    });

    sendSuccess(res, review, 'Review submitted successfully', 201);
  } catch (error: any) {
    console.error('Review Error:', error);
    sendError(res, error.message || 'Error submitting review', 500);
  }
};

export const getWorkerReviews = async (req: any, res: Response): Promise<void> => {
  try {
    const { workerId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { workerId },
      include: {
        customer: {
          select: { name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, reviews, 'Worker reviews retrieved');
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching reviews', 500);
  }
};
