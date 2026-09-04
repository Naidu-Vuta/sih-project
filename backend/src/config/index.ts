import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  jwtSecret: process.env.JWT_SECRET || 'cooperative_super_secret_jwt_key_sih_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Cooperative platform financial rules:
  platformFeeRate: 0.05, // 5% cooperative maintenance fee (transparent!)
  workerEarningRate: 0.95, // 95% goes directly to the worker
  coopDividendRate: 0.02, // 2% allocated into the worker's cooperative patronage dividend fund
};
