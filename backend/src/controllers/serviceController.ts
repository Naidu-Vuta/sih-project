import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { services: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    sendSuccess(res, categories, 'Categories retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching categories', 500);
  }
};

export const getServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;

    const where: any = {};

    if (category && typeof category === 'string') {
      where.category = {
        slug: category,
      };
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (minPrice || maxPrice) {
      where.basePrice = {};
      if (minPrice) where.basePrice.gte = Number(minPrice);
      if (maxPrice) where.basePrice.lte = Number(maxPrice);
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { basePrice: 'asc' },
    });

    sendSuccess(res, services, 'Services retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching services', 500);
  }
};

export const getServiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!service) {
      sendError(res, 'Service not found', 404);
      return;
    }

    // Find verified workers capable of handling this service
    const matchingWorkers = await prisma.user.findMany({
      where: {
        role: 'WORKER',
        workerProfile: {
          isVerified: true,
          isAvailable: true,
        },
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        workerProfile: true,
      },
      take: 6,
    });

    sendSuccess(res, { service, matchingWorkers }, 'Service retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching service', 500);
  }
};

export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId, title, description, basePrice, priceType, durationEst, imageUrl } = req.body;

    const service = await prisma.service.create({
      data: {
        categoryId,
        title,
        description,
        basePrice: Number(basePrice),
        priceType: priceType || 'FIXED',
        durationEst,
        imageUrl,
      },
      include: { category: true },
    });

    sendSuccess(res, service, 'Service created successfully', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Error creating service', 500);
  }
};
