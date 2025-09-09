import express from 'express';
import { prisma } from '../index';
import { requireAdmin } from '../middleware/auth';
import { ApiResponse, AuthenticatedRequest, AdminAnalytics } from '../types';
import { UserRole, OrderStatus } from '@prisma/client';

const router = express.Router();

// Apply admin middleware to all routes
router.use(requireAdmin);

// Get dashboard analytics
router.get('/analytics', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { period = '30' } = req.query; // days
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalUsers,
      totalRestaurants,
      totalOrders,
      totalRevenue,
      usersByRole,
      ordersByStatus,
      revenueByDay,
      topRestaurants,
      recentOrders,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Total restaurants
      prisma.restaurant.count({ where: { isActive: true } }),
      
      // Total orders
      prisma.order.count(),
      
      // Total revenue
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: OrderStatus.DELIVERED },
      }),
      
      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
      }),
      
      // Orders by status
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
        where: {
          createdAt: { gte: startDate },
        },
      }),
      
      // Revenue by day (last 30 days)
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          SUM(total) as revenue,
          COUNT(*) as orders
        FROM orders 
        WHERE created_at >= ${startDate} 
          AND status = 'DELIVERED'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `,
      
      // Top restaurants by revenue
      prisma.restaurant.findMany({
        select: {
          id: true,
          name: true,
          nameAr: true,
          rating: true,
          orders: {
            where: {
              status: OrderStatus.DELIVERED,
              createdAt: { gte: startDate },
            },
            select: {
              total: true,
            },
          },
        },
        orderBy: {
          orders: {
            _count: 'desc',
          },
        },
        take: 10,
      }),
      
      // Recent orders
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          createdAt: true,
          customer: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          restaurant: {
            select: {
              name: true,
              nameAr: true,
            },
          },
        },
      }),
    ]);

    // Format data
    const userRoleStats = usersByRole.reduce((acc, item) => {
      acc[item.role] = item._count.role;
      return acc;
    }, {} as Record<UserRole, number>);

    const orderStatusStats = ordersByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    const topRestaurantsWithStats = topRestaurants.map(restaurant => ({
      id: restaurant.id,
      name: restaurant.name,
      nameAr: restaurant.nameAr,
      rating: restaurant.rating,
      totalOrders: restaurant.orders.length,
      totalRevenue: restaurant.orders.reduce((sum, order) => sum + order.total, 0),
    }));

    const analytics: AdminAnalytics = {
      totalUsers,
      totalRestaurants,
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      usersByRole: userRoleStats,
      ordersByStatus: orderStatusStats,
      revenueByMonth: [], // You might want to implement monthly data
      topRestaurants: topRestaurantsWithStats,
    };

    const response: ApiResponse = {
      success: true,
      message: 'Analytics retrieved successfully',
      messageAr: 'تم استرداد التحليلات بنجاح',
      data: {
        analytics,
        revenueByDay,
        recentOrders,
        period: days,
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Get all users with filtering
router.get('/users', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      role, 
      search, 
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc' 
    } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const orderBy = { [sortBy as string]: sortOrder };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy,
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          role: true,
          avatar: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
              restaurants: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    const response: ApiResponse = {
      success: true,
      message: 'Users retrieved successfully',
      messageAr: 'تم استرداد المستخدمين بنجاح',
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1,
        },
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Update user status
router.put('/users/:id/status', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      const response: ApiResponse = {
        success: false,
        message: 'isActive must be a boolean value',
        messageAr: 'isActive يجب أن يكون قيمة منطقية',
      };
      return res.status(400).json(response);
    }

    // Prevent admin from deactivating themselves
    if (id === req.user!.id && !isActive) {
      const response: ApiResponse = {
        success: false,
        message: 'You cannot deactivate your own account',
        messageAr: 'لا يمكنك إلغاء تفعيل حسابك الخاص',
      };
      return res.status(400).json(response);
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    const response: ApiResponse = {
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      messageAr: `تم ${isActive ? 'تفعيل' : 'إلغاء تفعيل'} المستخدم بنجاح`,
      data: user,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Get all restaurants with filtering
router.get('/restaurants', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc' 
    } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { nameAr: { contains: search as string, mode: 'insensitive' } },
        { address: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const orderBy = { [sortBy as string]: sortOrder };

    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy,
        select: {
          id: true,
          name: true,
          nameAr: true,
          address: true,
          phone: true,
          email: true,
          isActive: true,
          isOpen: true,
          rating: true,
          totalReviews: true,
          deliveryFee: true,
          minimumOrder: true,
          createdAt: true,
          owner: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          _count: {
            select: {
              orders: true,
              menuItems: true,
            },
          },
        },
      }),
      prisma.restaurant.count({ where }),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    const response: ApiResponse = {
      success: true,
      message: 'Restaurants retrieved successfully',
      messageAr: 'تم استرداد المطاعم بنجاح',
      data: {
        restaurants,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1,
        },
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Update restaurant status
router.put('/restaurants/:id/status', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      const response: ApiResponse = {
        success: false,
        message: 'isActive must be a boolean value',
        messageAr: 'isActive يجب أن يكون قيمة منطقية',
      };
      return res.status(400).json(response);
    }

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        name: true,
        nameAr: true,
        isActive: true,
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      message: `Restaurant ${isActive ? 'activated' : 'deactivated'} successfully`,
      messageAr: `تم ${isActive ? 'تفعيل' : 'إلغاء تفعيل'} المطعم بنجاح`,
      data: restaurant,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Get all orders with filtering
router.get('/orders', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      restaurantId,
      customerId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc' 
    } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (status) where.status = status;
    if (restaurantId) where.restaurantId = restaurantId;
    if (customerId) where.customerId = customerId;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const orderBy = { [sortBy as string]: sortOrder };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          paymentMethod: true,
          paymentStatus: true,
          createdAt: true,
          deliveredAt: true,
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          restaurant: {
            select: {
              name: true,
              nameAr: true,
              phone: true,
            },
          },
          driver: {
            select: {
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          address: {
            select: {
              address: true,
              city: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    const response: ApiResponse = {
      success: true,
      message: 'Orders retrieved successfully',
      messageAr: 'تم استرداد الطلبات بنجاح',
      data: {
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1,
        },
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Get system settings
router.get('/settings', async (req: AuthenticatedRequest, res, next) => {
  try {
    const settings = await prisma.setting.findMany({
      orderBy: { category: 'asc' },
    });

    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {} as Record<string, typeof settings>);

    const response: ApiResponse = {
      success: true,
      message: 'Settings retrieved successfully',
      messageAr: 'تم استرداد الإعدادات بنجاح',
      data: groupedSettings,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Update system setting
router.put('/settings/:key', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      const response: ApiResponse = {
        success: false,
        message: 'Value is required',
        messageAr: 'القيمة مطلوبة',
      };
      return res.status(400).json(response);
    }

    const setting = await prisma.setting.update({
      where: { key },
      data: { value: String(value) },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Setting updated successfully',
      messageAr: 'تم تحديث الإعداد بنجاح',
      data: setting,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;