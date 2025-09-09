import express from 'express';
import { prisma } from '../index';
import { validate, reviewSchema, paginationSchema } from '../utils/validation';
import { ApiResponse, AuthenticatedRequest } from '../types';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Create a new review
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const validatedData = validate(reviewSchema, req.body);

    // Check if user has already reviewed this restaurant/menu item
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: req.user!.id,
        ...(validatedData.restaurantId && { restaurantId: validatedData.restaurantId }),
        ...(validatedData.menuItemId && { menuItemId: validatedData.menuItemId }),
        ...(validatedData.orderId && { orderId: validatedData.orderId }),
      },
    });

    if (existingReview) {
      const response: ApiResponse = {
        success: false,
        message: 'You have already reviewed this item',
        messageAr: 'لقد قمت بتقييم هذا العنصر مسبقاً',
      };
      return res.status(409).json(response);
    }

    // If orderId is provided, verify the order belongs to the user and is completed
    if (validatedData.orderId) {
      const order = await prisma.order.findFirst({
        where: {
          id: validatedData.orderId,
          customerId: req.user!.id,
          status: 'DELIVERED',
        },
        select: {
          restaurantId: true,
        },
      });

      if (!order) {
        const response: ApiResponse = {
          success: false,
          message: 'Order not found or not eligible for review',
          messageAr: 'الطلب غير موجود أو غير مؤهل للتقييم',
        };
        return res.status(404).json(response);
      }

      // Set restaurant ID from order if not provided
      if (!validatedData.restaurantId) {
        validatedData.restaurantId = order.restaurantId;
      }
    }

    // Verify restaurant exists if restaurantId is provided
    if (validatedData.restaurantId) {
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: validatedData.restaurantId, isActive: true },
        select: { id: true },
      });

      if (!restaurant) {
        const response: ApiResponse = {
          success: false,
          message: 'Restaurant not found',
          messageAr: 'المطعم غير موجود',
        };
        return res.status(404).json(response);
      }
    }

    // Verify menu item exists if menuItemId is provided
    if (validatedData.menuItemId) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: validatedData.menuItemId },
        select: { id: true, restaurantId: true },
      });

      if (!menuItem) {
        const response: ApiResponse = {
          success: false,
          message: 'Menu item not found',
          messageAr: 'عنصر القائمة غير موجود',
        };
        return res.status(404).json(response);
      }

      // Set restaurant ID from menu item if not provided
      if (!validatedData.restaurantId) {
        validatedData.restaurantId = menuItem.restaurantId;
      }
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        ...validatedData,
        userId: req.user!.id,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        restaurant: {
          select: {
            name: true,
            nameAr: true,
          },
        },
        menuItem: {
          select: {
            name: true,
            nameAr: true,
          },
        },
      },
    });

    // Update restaurant rating if this is a restaurant review
    if (validatedData.restaurantId) {
      const avgRating = await prisma.review.aggregate({
        where: { restaurantId: validatedData.restaurantId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await prisma.restaurant.update({
        where: { id: validatedData.restaurantId },
        data: {
          rating: avgRating._avg.rating || 0,
          totalReviews: avgRating._count.rating,
        },
      });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Review created successfully',
      messageAr: 'تم إنشاء التقييم بنجاح',
      data: review,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// Get reviews with filtering and pagination
router.get('/', async (req, res, next) => {
  try {
    const validatedQuery = validate(paginationSchema, req.query);
    const { page, limit } = validatedQuery;
    const { restaurantId, menuItemId, rating, userId } = req.query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (restaurantId) where.restaurantId = restaurantId as string;
    if (menuItemId) where.menuItemId = menuItemId as string;
    if (userId) where.userId = userId as string;
    if (rating) where.rating = parseInt(rating as string);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          restaurant: {
            select: {
              name: true,
              nameAr: true,
            },
          },
          menuItem: {
            select: {
              name: true,
              nameAr: true,
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      message: 'Reviews retrieved successfully',
      messageAr: 'تم استرداد التقييمات بنجاح',
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Get review by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        restaurant: {
          select: {
            name: true,
            nameAr: true,
          },
        },
        menuItem: {
          select: {
            name: true,
            nameAr: true,
          },
        },
      },
    });

    if (!review) {
      const response: ApiResponse = {
        success: false,
        message: 'Review not found',
        messageAr: 'التقييم غير موجود',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Review retrieved successfully',
      messageAr: 'تم استرداد التقييم بنجاح',
      data: review,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Update review (only by the review author)
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment, images } = req.body;

    // Validate input
    if (rating && (rating < 1 || rating > 5)) {
      const response: ApiResponse = {
        success: false,
        message: 'Rating must be between 1 and 5',
        messageAr: 'التقييم يجب أن يكون بين 1 و 5',
      };
      return res.status(400).json(response);
    }

    // Check if review exists and belongs to user
    const existingReview = await prisma.review.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!existingReview) {
      const response: ApiResponse = {
        success: false,
        message: 'Review not found or access denied',
        messageAr: 'التقييم غير موجود أو الوصول مرفوض',
      };
      return res.status(404).json(response);
    }

    // Update review
    const updateData: any = { updatedAt: new Date() };
    if (rating !== undefined) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment;
    if (images !== undefined) updateData.images = images;

    const updatedReview = await prisma.review.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        restaurant: {
          select: {
            name: true,
            nameAr: true,
          },
        },
        menuItem: {
          select: {
            name: true,
            nameAr: true,
          },
        },
      },
    });

    // Update restaurant rating if rating was changed and this is a restaurant review
    if (rating !== undefined && existingReview.restaurantId) {
      const avgRating = await prisma.review.aggregate({
        where: { restaurantId: existingReview.restaurantId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await prisma.restaurant.update({
        where: { id: existingReview.restaurantId },
        data: {
          rating: avgRating._avg.rating || 0,
          totalReviews: avgRating._count.rating,
        },
      });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Review updated successfully',
      messageAr: 'تم تحديث التقييم بنجاح',
      data: updatedReview,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Delete review (only by the review author or admin)
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    // Check if review exists
    const existingReview = await prisma.review.findUnique({
      where: { id },
      select: {
        userId: true,
        restaurantId: true,
      },
    });

    if (!existingReview) {
      const response: ApiResponse = {
        success: false,
        message: 'Review not found',
        messageAr: 'التقييم غير موجود',
      };
      return res.status(404).json(response);
    }

    // Check permissions (only review author or admin can delete)
    if (existingReview.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      const response: ApiResponse = {
        success: false,
        message: 'Access denied',
        messageAr: 'الوصول مرفوض',
      };
      return res.status(403).json(response);
    }

    // Delete review
    await prisma.review.delete({
      where: { id },
    });

    // Update restaurant rating if this was a restaurant review
    if (existingReview.restaurantId) {
      const avgRating = await prisma.review.aggregate({
        where: { restaurantId: existingReview.restaurantId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await prisma.restaurant.update({
        where: { id: existingReview.restaurantId },
        data: {
          rating: avgRating._avg.rating || 0,
          totalReviews: avgRating._count.rating,
        },
      });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Review deleted successfully',
      messageAr: 'تم حذف التقييم بنجاح',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Get review statistics for a restaurant
router.get('/stats/:restaurantId', async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    // Verify restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId, isActive: true },
      select: { id: true, name: true, nameAr: true },
    });

    if (!restaurant) {
      const response: ApiResponse = {
        success: false,
        message: 'Restaurant not found',
        messageAr: 'المطعم غير موجود',
      };
      return res.status(404).json(response);
    }

    // Get review statistics
    const [
      totalReviews,
      averageRating,
      ratingDistribution,
      recentReviews,
    ] = await Promise.all([
      prisma.review.count({
        where: { restaurantId },
      }),
      prisma.review.aggregate({
        where: { restaurantId },
        _avg: { rating: true },
      }),
      prisma.review.groupBy({
        by: ['rating'],
        where: { restaurantId },
        _count: { rating: true },
        orderBy: { rating: 'desc' },
      }),
      prisma.review.findMany({
        where: { restaurantId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      }),
    ]);

    // Format rating distribution
    const ratingStats = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
    };
    
    ratingDistribution.forEach(item => {
      ratingStats[item.rating as keyof typeof ratingStats] = item._count.rating;
    });

    const stats = {
      restaurant,
      totalReviews,
      averageRating: averageRating._avg.rating || 0,
      ratingDistribution: ratingStats,
      recentReviews,
    };

    const response: ApiResponse = {
      success: true,
      message: 'Review statistics retrieved successfully',
      messageAr: 'تم استرداد إحصائيات التقييمات بنجاح',
      data: stats,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;