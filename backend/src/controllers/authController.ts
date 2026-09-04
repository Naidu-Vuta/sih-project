import { Response } from 'express';
import { prisma } from '../config/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { sendError, sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const register = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      email,
      password,
      name,
      phone,
      role = 'CUSTOMER',
      skills,
      bio,
      hourlyRate,
      experienceYears,
      city,
      address,
      pincode,
    } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      sendError(res, 'An account with this email already exists', 409);
      return;
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        phone,
        role,
        ...(role === 'CUSTOMER' && {
          customerProfile: {
            create: {
              address,
              city: city || 'Bengaluru',
              pincode,
            },
          },
        }),
        ...(role === 'WORKER' && {
          workerProfile: {
            create: {
              skills: skills || 'General Household Services',
              bio: bio || 'Verified cooperative service professional dedicated to quality work.',
              hourlyRate: hourlyRate ? Number(hourlyRate) : 350.0,
              experienceYears: experienceYears ? Number(experienceYears) : 2,
              city: city || 'Bengaluru',
              isVerified: false, // Requires admin verification to ensure quality
              isAvailable: true,
              cooperativeShares: 1,
            },
          },
        }),
      },
      include: {
        customerProfile: true,
        workerProfile: true,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    sendSuccess(
      res,
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          profile: user.role === 'WORKER' ? user.workerProfile : user.customerProfile,
        },
      },
      'Account created successfully',
      201
    );
  } catch (error: any) {
    console.error('Registration Error:', error);
    sendError(res, error.message || 'Error creating account', 500);
  }
};

export const login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        customerProfile: true,
        workerProfile: true,
      },
    });

    if (!user) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    sendSuccess(
      res,
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          profile: user.role === 'WORKER' ? user.workerProfile : user.customerProfile,
        },
      },
      'Logged in successfully'
    );
  } catch (error: any) {
    console.error('Login Error:', error);
    sendError(res, error.message || 'Error logging in', 500);
  }
};

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        customerProfile: true,
        workerProfile: true,
      },
    });

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        profile: user.role === 'WORKER' ? user.workerProfile : user.customerProfile,
      },
    });
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching user profile', 500);
  }
};
