import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../index';
import { AuthenticatedRequest, ApiResponse, AppError } from '../types';

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      const response: ApiResponse = {
        success: false,
        message: 'Access token is required',
        messageAr: 'رمز الوصول مطلوب',
      };
      res.status(401).json(response);
      return;
    }

    // Verify the token
    const decoded = verifyToken(token);

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isVerified: true,
      },
    });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found',
        messageAr: 'المستخدم غير موجود',
      };
      res.status(401).json(response);
      return;
    }

    if (!user.isActive) {
      const response: ApiResponse = {
        success: false,
        message: 'Account is deactivated',
        messageAr: 'الحساب معطل',
      };
      res.status(401).json(response);
      return;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Invalid token',
      messageAr: 'رمز وصول غير صالح',
    };
    res.status(401).json(response);
  }
};

export const requireRole = (roles: UserRole | UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        message: 'Authentication required',
        messageAr: 'المصادقة مطلوبة',
      };
      res.status(401).json(response);
      return;
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      const response: ApiResponse = {
        success: false,
        message: 'Insufficient permissions',
        messageAr: 'صلاحيات غير كافية',
      };
      res.status(403).json(response);
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole(UserRole.ADMIN);

export const requireRestaurantOwner = requireRole([
  UserRole.RESTAURANT_OWNER,
  UserRole.ADMIN,
]);

export const requireDeliveryDriver = requireRole([
  UserRole.DELIVERY_DRIVER,
  UserRole.ADMIN,
]);

export const requireCustomer = requireRole([
  UserRole.CUSTOMER,
  UserRole.ADMIN,
]);

// Middleware to check if user owns the resource
export const requireResourceOwnership = (resourceType: 'restaurant' | 'order') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          message: 'Authentication required',
          messageAr: 'المصادقة مطلوبة',
        };
        res.status(401).json(response);
        return;
      }

      // Admin can access everything
      if (req.user.role === UserRole.ADMIN) {
        next();
        return;
      }

      const resourceId = req.params.id || req.params.restaurantId || req.params.orderId;
      
      if (!resourceId) {
        const response: ApiResponse = {
          success: false,
          message: 'Resource ID is required',
          messageAr: 'معرف المورد مطلوب',
        };
        res.status(400).json(response);
        return;
      }

      let isOwner = false;

      switch (resourceType) {
        case 'restaurant':
          if (req.user.role === UserRole.RESTAURANT_OWNER) {
            const restaurant = await prisma.restaurant.findUnique({
              where: { id: resourceId },
              select: { ownerId: true },
            });
            isOwner = restaurant?.ownerId === req.user.id;
          }
          break;

        case 'order':
          const order = await prisma.order.findUnique({
            where: { id: resourceId },
            select: { customerId: true, driverId: true, restaurant: { select: { ownerId: true } } },
          });

          if (order) {
            isOwner = 
              order.customerId === req.user.id ||
              order.driverId === req.user.id ||
              order.restaurant.ownerId === req.user.id;
          }
          break;
      }

      if (!isOwner) {
        const response: ApiResponse = {
          success: false,
          message: 'Access denied. You do not own this resource.',
          messageAr: 'الوصول مرفوض. أنت لا تملك هذا المورد.',
        };
        res.status(403).json(response);
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Optional authentication middleware (for public endpoints that can benefit from user context)
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          isVerified: true,
        },
      });

      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};