import express from 'express';
import { prisma } from '../index';
import { ApiResponse } from '../types';

const router = express.Router();

// Get menu item by ID
router.get('/items/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const menuItem = await prisma.menuItem.findUnique({
      where: {
        id,
        isAvailable: true,
      },
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
        restaurant: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            image: true,
            rating: true,
            deliveryTime: true,
            deliveryFee: true,
            minimumOrder: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            nameAr: true,
          },
        },
      },
    });

    if (!menuItem) {
      const response: ApiResponse = {
        success: false,
        message: 'Menu item not found',
        messageAr: 'عنصر القائمة غير موجود',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Menu item retrieved successfully',
      messageAr: 'تم استرداد عنصر القائمة بنجاح',
      data: menuItem,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Get popular menu items across all restaurants
router.get('/popular', async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    const popularItems = await prisma.menuItem.findMany({
      where: {
        isAvailable: true,
        isPopular: true,
        restaurant: {
          isActive: true,
          isOpen: true,
        },
      },
      take: Number(limit),
      select: {
        id: true,
        name: true,
        nameAr: true,
        description: true,
        descriptionAr: true,
        image: true,
        price: true,
        discountPrice: true,
        preparationTime: true,
        restaurant: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            image: true,
            rating: true,
            deliveryTime: true,
          },
        },
        category: {
          select: {
            name: true,
            nameAr: true,
          },
        },
      },
      orderBy: [
        { restaurant: { rating: 'desc' } },
        { name: 'asc' },
      ],
    });

    const response: ApiResponse = {
      success: true,
      message: 'Popular items retrieved successfully',
      messageAr: 'تم استرداد الأصناف الشائعة بنجاح',
      data: popularItems,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Search menu items
router.get('/search/:query', async (req, res, next) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 20, restaurantId, categoryId, minPrice, maxPrice } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    if (!query || query.trim().length < 2) {
      const response: ApiResponse = {
        success: false,
        message: 'Search query must be at least 2 characters long',
        messageAr: 'يجب أن يكون طلب البحث مكون من حرفين على الأقل',
      };
      return res.status(400).json(response);
    }

    const where: any = {
      isAvailable: true,
      restaurant: {
        isActive: true,
      },
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { nameAr: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { descriptionAr: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (restaurantId) {
      where.restaurantId = restaurantId;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    const [menuItems, total] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        skip,
        take: Number(limit),
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
          preparationTime: true,
          restaurant: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              image: true,
              rating: true,
              deliveryTime: true,
            },
          },
          category: {
            select: {
              name: true,
              nameAr: true,
            },
          },
        },
        orderBy: [
          { isPopular: 'desc' },
          { restaurant: { rating: 'desc' } },
          { name: 'asc' },
        ],
      }),
      prisma.menuItem.count({ where }),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    const response: ApiResponse = {
      success: true,
      message: 'Menu items search completed successfully',
      messageAr: 'تم البحث في عناصر القائمة بنجاح',
      data: {
        items: menuItems,
        searchQuery: query,
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

// Get menu categories
router.get('/categories', async (req, res, next) => {
  try {
    const { restaurantId } = req.query;

    const where: any = {
      isActive: true,
    };

    if (restaurantId) {
      where.restaurantId = restaurantId;
      // Also check if restaurant is active
      where.restaurant = {
        isActive: true,
      };
    } else {
      where.restaurant = {
        isActive: true,
      };
    }

    const categories = await prisma.category.findMany({
      where,
      select: {
        id: true,
        name: true,
        nameAr: true,
        description: true,
        image: true,
        restaurantId: true,
        restaurant: restaurantId ? undefined : {
          select: {
            id: true,
            name: true,
            nameAr: true,
          },
        },
        _count: {
          select: {
            menuItems: {
              where: {
                isAvailable: true,
              },
            },
          },
        },
      },
      orderBy: [
        { restaurant: { name: 'asc' } },
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    const response: ApiResponse = {
      success: true,
      message: 'Categories retrieved successfully',
      messageAr: 'تم استرداد الفئات بنجاح',
      data: categories,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;