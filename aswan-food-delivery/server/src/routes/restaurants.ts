import express from 'express';
import { prisma } from '../index';
import { validate, restaurantFilterSchema, paginationSchema } from '../utils/validation';
import { ApiResponse, PaginatedResponse, RestaurantFilters } from '../types';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Get all restaurants with filtering and pagination
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const validatedQuery = validate(restaurantFilterSchema, req.query) as RestaurantFilters & {
      page: number;
      limit: number;
    };

    const { page, limit, search, category, minRating, maxDeliveryTime, sortBy, sortOrder } = validatedQuery;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true,
      isOpen: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameAr: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { descriptionAr: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minRating) {
      where.rating = { gte: minRating };
    }

    if (maxDeliveryTime) {
      where.deliveryTime = { lte: maxDeliveryTime };
    }

    // Build orderBy clause
    const orderBy: any = {};
    switch (sortBy) {
      case 'rating':
        orderBy.rating = sortOrder;
        break;
      case 'deliveryTime':
        orderBy.deliveryTime = sortOrder;
        break;
      case 'deliveryFee':
        orderBy.deliveryFee = sortOrder;
        break;
      case 'name':
        orderBy.name = sortOrder;
        break;
      default:
        orderBy.rating = 'desc';
    }

    // Get restaurants with pagination
    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          nameAr: true,
          description: true,
          descriptionAr: true,
          image: true,
          coverImage: true,
          address: true,
          latitude: true,
          longitude: true,
          phone: true,
          deliveryTime: true,
          deliveryFee: true,
          minimumOrder: true,
          rating: true,
          totalReviews: true,
          openingTime: true,
          closingTime: true,
          categories: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              nameAr: true,
              image: true,
            },
            orderBy: { sortOrder: 'asc' },
          },
        },
      }),
      prisma.restaurant.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<typeof restaurants[0]> = {
      success: true,
      message: 'Restaurants retrieved successfully',
      messageAr: 'تم استرداد المطاعم بنجاح',
      data: restaurants,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Get restaurant by ID
router.get('/:id', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id, isActive: true },
      select: {
        id: true,
        name: true,
        nameAr: true,
        description: true,
        descriptionAr: true,
        image: true,
        coverImage: true,
        address: true,
        latitude: true,
        longitude: true,
        phone: true,
        email: true,
        deliveryTime: true,
        deliveryFee: true,
        minimumOrder: true,
        rating: true,
        totalReviews: true,
        openingTime: true,
        closingTime: true,
        isOpen: true,
        categories: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            nameAr: true,
            description: true,
            image: true,
            sortOrder: true,
            menuItems: {
              where: { isAvailable: true },
              select: {
                id: true,
                name: true,
                nameAr: true,
                description: true,
                descriptionAr: true,
                image: true,
                price: true,
                discountPrice: true,
                isPopular: true,
                ingredients: true,
                allergens: true,
                calories: true,
                preparationTime: true,
              },
              orderBy: [
                { isPopular: 'desc' },
                { sortOrder: 'asc' },
                { name: 'asc' },
              ],
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            rating: true,
            comment: true,
            images: true,
            isAnonymous: true,
            createdAt: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!restaurant) {
      const response: ApiResponse = {
        success: false,
        message: 'Restaurant not found',
        messageAr: 'المطعم غير موجود',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Restaurant retrieved successfully',
      messageAr: 'تم استرداد المطعم بنجاح',
      data: restaurant,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Get restaurant menu
router.get('/:id/menu', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    // Check if restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id, isActive: true },
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

    // Get menu categories with items
    const categories = await prisma.category.findMany({
      where: {
        restaurantId: id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        nameAr: true,
        description: true,
        image: true,
        sortOrder: true,
        menuItems: {
          where: { isAvailable: true },
          select: {
            id: true,
            name: true,
            nameAr: true,
            description: true,
            descriptionAr: true,
            image: true,
            price: true,
            discountPrice: true,
            isPopular: true,
            ingredients: true,
            allergens: true,
            calories: true,
            preparationTime: true,
            sortOrder: true,
          },
          orderBy: [
            { isPopular: 'desc' },
            { sortOrder: 'asc' },
            { name: 'asc' },
          ],
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Menu retrieved successfully',
      messageAr: 'تم استرداد القائمة بنجاح',
      data: {
        restaurant,
        categories,
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Get restaurant reviews
router.get('/:id/reviews', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const validatedQuery = validate(paginationSchema, req.query);
    const { page, limit } = validatedQuery;
    const skip = (page - 1) * limit;

    // Check if restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id, isActive: true },
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

    // Get reviews with pagination
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { restaurantId: id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          rating: true,
          comment: true,
          images: true,
          isAnonymous: true,
          createdAt: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
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
      prisma.review.count({ where: { restaurantId: id } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Calculate rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { restaurantId: id },
      _count: { rating: true },
    });

    const response: PaginatedResponse<typeof reviews[0]> = {
      success: true,
      message: 'Reviews retrieved successfully',
      messageAr: 'تم استرداد التقييمات بنجاح',
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    // Add rating distribution to response
    (response as any).ratingDistribution = ratingDistribution.reduce((acc, item) => {
      acc[item.rating] = item._count.rating;
      return acc;
    }, {} as Record<number, number>);

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Search restaurants and menu items
router.get('/search/:query', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { query } = req.params;
    const validatedQuery = validate(paginationSchema, req.query);
    const { page, limit } = validatedQuery;
    const skip = (page - 1) * limit;

    if (!query || query.trim().length < 2) {
      const response: ApiResponse = {
        success: false,
        message: 'Search query must be at least 2 characters long',
        messageAr: 'يجب أن يكون طلب البحث مكون من حرفين على الأقل',
      };
      return res.status(400).json(response);
    }

    // Search restaurants
    const [restaurants, restaurantsTotal] = await Promise.all([
      prisma.restaurant.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { nameAr: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { descriptionAr: { contains: query, mode: 'insensitive' } },
          ],
        },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          nameAr: true,
          description: true,
          descriptionAr: true,
          image: true,
          rating: true,
          totalReviews: true,
          deliveryTime: true,
          deliveryFee: true,
          minimumOrder: true,
        },
        orderBy: { rating: 'desc' },
      }),
      prisma.restaurant.count({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { nameAr: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { descriptionAr: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    // Search menu items
    const menuItems = await prisma.menuItem.findMany({
      where: {
        isAvailable: true,
        restaurant: { isActive: true },
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { nameAr: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { descriptionAr: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20, // Limit menu items results
      select: {
        id: true,
        name: true,
        nameAr: true,
        description: true,
        descriptionAr: true,
        image: true,
        price: true,
        discountPrice: true,
        isPopular: true,
        restaurant: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            rating: true,
            deliveryTime: true,
          },
        },
      },
      orderBy: [
        { isPopular: 'desc' },
        { name: 'asc' },
      ],
    });

    const totalPages = Math.ceil(restaurantsTotal / limit);

    const response: ApiResponse = {
      success: true,
      message: 'Search completed successfully',
      messageAr: 'تم البحث بنجاح',
      data: {
        restaurants: {
          items: restaurants,
          pagination: {
            page,
            limit,
            total: restaurantsTotal,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
        menuItems,
        searchQuery: query,
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;