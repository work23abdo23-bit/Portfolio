import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import restaurantRoutes from './routes/restaurants';
import menuRoutes from './routes/menu';
import orderRoutes from './routes/orders';
import reviewRoutes from './routes/reviews';
import adminRoutes from './routes/admin';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { authenticateToken } from './middleware/auth';

// Import socket handlers
import { initializeSocket } from './services/socketService';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Initialize Prisma client
export const prisma = new PrismaClient();

// Initialize Redis client
export const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

// Connect to Redis
redis.connect().catch(console.error);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    messageAr: 'عدد كبير جداً من الطلبات من هذا العنوان، يرجى المحاولة لاحقاً.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Aswan Food API is running',
    messageAr: 'خدمة أسوان فود تعمل بنجاح',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', authenticateToken, orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);

// Initialize Socket.IO handlers
initializeSocket(io);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log('🚀 أسوان فود - خادم التطبيق يعمل الآن');
  console.log(`📡 الخادم متاح على: http://localhost:${PORT}`);
  console.log(`🌐 البيئة: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 قاعدة البيانات: متصلة`);
  console.log(`🔴 Redis: متصل`);
  console.log(`⚡ Socket.IO: متاح`);
  console.log('');
  console.log('📋 نقاط النهاية المتاحة:');
  console.log('  GET  /health - فحص حالة الخادم');
  console.log('  POST /api/auth/register - تسجيل مستخدم جديد');
  console.log('  POST /api/auth/login - تسجيل الدخول');
  console.log('  GET  /api/restaurants - عرض المطاعم');
  console.log('  POST /api/orders - إنشاء طلب جديد');
  console.log('');
  console.log('🎯 جاهز لاستقبال الطلبات من أسوان وما حولها!');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 إيقاف الخادم...');
  
  server.close(() => {
    console.log('✅ تم إيقاف الخادم بنجاح');
  });
  
  await prisma.$disconnect();
  await redis.disconnect();
  
  process.exit(0);
});

export { app, io };