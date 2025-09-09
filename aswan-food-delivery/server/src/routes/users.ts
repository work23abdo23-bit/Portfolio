import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index';
import { validate, updateProfileSchema, changePasswordSchema, addressSchema } from '../utils/validation';
import { ApiResponse, AuthenticatedRequest } from '../types';

const router = express.Router();

// Get user profile
router.get('/profile', async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
        addresses: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            governorate: true,
            latitude: true,
            longitude: true,
            isDefault: true,
            createdAt: true,
          },
          orderBy: [
            { isDefault: 'desc' },
            { createdAt: 'desc' },
          ],
        },
      },
    });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found',
        messageAr: 'المستخدم غير موجود',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Profile retrieved successfully',
      messageAr: 'تم استرداد الملف الشخصي بنجاح',
      data: user,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', async (req: AuthenticatedRequest, res, next) => {
  try {
    const validatedData = validate(updateProfileSchema, req.body);

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: validatedData,
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        isVerified: true,
        updatedAt: true,
      },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Profile updated successfully',
      messageAr: 'تم تحديث الملف الشخصي بنجاح',
      data: updatedUser,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Change password
router.put('/password', async (req: AuthenticatedRequest, res, next) => {
  try {
    const validatedData = validate(changePasswordSchema, req.body);

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { password: true },
    });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found',
        messageAr: 'المستخدم غير موجود',
      };
      return res.status(404).json(response);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      validatedData.currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      const response: ApiResponse = {
        success: false,
        message: 'Current password is incorrect',
        messageAr: 'كلمة المرور الحالية غير صحيحة',
      };
      return res.status(400).json(response);
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hashedNewPassword },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Password changed successfully',
      messageAr: 'تم تغيير كلمة المرور بنجاح',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Get user addresses
router.get('/addresses', async (req: AuthenticatedRequest, res, next) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    const response: ApiResponse = {
      success: true,
      message: 'Addresses retrieved successfully',
      messageAr: 'تم استرداد العناوين بنجاح',
      data: addresses,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Add new address
router.post('/addresses', async (req: AuthenticatedRequest, res, next) => {
  try {
    const validatedData = validate(addressSchema, req.body);

    // If this is set as default, unset other default addresses
    if (validatedData.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: req.user!.id,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        ...validatedData,
        userId: req.user!.id,
      },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Address added successfully',
      messageAr: 'تم إضافة العنوان بنجاح',
      data: address,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// Update address
router.put('/addresses/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = validate(addressSchema, req.body);

    // Check if address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!existingAddress) {
      const response: ApiResponse = {
        success: false,
        message: 'Address not found',
        messageAr: 'العنوان غير موجود',
      };
      return res.status(404).json(response);
    }

    // If this is set as default, unset other default addresses
    if (validatedData.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: req.user!.id,
          isDefault: true,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: validatedData,
    });

    const response: ApiResponse = {
      success: true,
      message: 'Address updated successfully',
      messageAr: 'تم تحديث العنوان بنجاح',
      data: updatedAddress,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Delete address
router.delete('/addresses/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    // Check if address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!existingAddress) {
      const response: ApiResponse = {
        success: false,
        message: 'Address not found',
        messageAr: 'العنوان غير موجود',
      };
      return res.status(404).json(response);
    }

    // Check if there are pending orders with this address
    const ordersWithAddress = await prisma.order.count({
      where: {
        addressId: id,
        status: {
          in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'],
        },
      },
    });

    if (ordersWithAddress > 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Cannot delete address with pending orders',
        messageAr: 'لا يمكن حذف العنوان مع وجود طلبات معلقة',
      };
      return res.status(400).json(response);
    }

    await prisma.address.delete({
      where: { id },
    });

    // If deleted address was default, set another address as default
    if (existingAddress.isDefault) {
      const firstAddress = await prisma.address.findFirst({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'asc' },
      });

      if (firstAddress) {
        await prisma.address.update({
          where: { id: firstAddress.id },
          data: { isDefault: true },
        });
      }
    }

    const response: ApiResponse = {
      success: true,
      message: 'Address deleted successfully',
      messageAr: 'تم حذف العنوان بنجاح',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Set default address
router.put('/addresses/:id/default', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    // Check if address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!existingAddress) {
      const response: ApiResponse = {
        success: false,
        message: 'Address not found',
        messageAr: 'العنوان غير موجود',
      };
      return res.status(404).json(response);
    }

    // Unset other default addresses and set this one as default
    await prisma.$transaction([
      prisma.address.updateMany({
        where: {
          userId: req.user!.id,
          isDefault: true,
        },
        data: { isDefault: false },
      }),
      prisma.address.update({
        where: { id },
        data: { isDefault: true },
      }),
    ]);

    const response: ApiResponse = {
      success: true,
      message: 'Default address updated successfully',
      messageAr: 'تم تحديث العنوان الافتراضي بنجاح',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Get user order history
router.get('/orders', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      customerId: req.user!.id,
    };

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          paymentMethod: true,
          paymentStatus: true,
          createdAt: true,
          estimatedDeliveryTime: true,
          deliveredAt: true,
          restaurant: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              image: true,
              phone: true,
            },
          },
          address: {
            select: {
              title: true,
              address: true,
            },
          },
          items: {
            select: {
              id: true,
              quantity: true,
              price: true,
              menuItem: {
                select: {
                  name: true,
                  nameAr: true,
                  image: true,
                },
              },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    const response: ApiResponse = {
      success: true,
      message: 'Order history retrieved successfully',
      messageAr: 'تم استرداد تاريخ الطلبات بنجاح',
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

export default router;