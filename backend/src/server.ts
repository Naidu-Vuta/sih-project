import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config';
import authRoutes from './routes/authRoutes';
import serviceRoutes from './routes/serviceRoutes';
import bookingRoutes from './routes/bookingRoutes';
import workerRoutes from './routes/workerRoutes';
import adminRoutes from './routes/adminRoutes';
import reviewRoutes from './routes/reviewRoutes';
import customerRoutes from './routes/customerRoutes';
import { errorHandler } from './middleware/errorHandler';
import { prisma } from './config/prisma';

const app = express();

// Middleware
app.use(
  cors({
    origin: [config.frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan('dev'));

// Health Check & Cooperative Information
app.get('/api/health', async (req, res) => {
  try {
    const metric = await prisma.cooperativeMetric.findUnique({ where: { id: 'singleton' } });
    res.json({
      status: 'ok',
      platform: 'Cooperative Gig Services Platform',
      theme: 'Empowering Workers. Serving Communities.',
      timestamp: new Date().toISOString(),
      cooperativeMetrics: metric || null,
    });
  } catch (error: any) {
    res.json({
      status: 'ok',
      platform: 'Cooperative Gig Services Platform',
      theme: 'Empowering Workers. Serving Communities.',
      timestamp: new Date().toISOString(),
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Cooperative Gig Platform API Running on Port ${PORT}`);
  console.log(` Environment: ${config.nodeEnv}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

// Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});

export default app;
