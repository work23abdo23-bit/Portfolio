import express from 'express';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { prisma } from '../index';
import { validate, createOrderSchema } from '../utils/validation';
import { ApiResponse, AuthenticatedRequest, CreateOrderRequest, OrderCalculation } from '../types';
import { generateOrderNumber } from '../utils/orderUtils';
import { io } from '../index';

const router = express.Router();

// Calculate order total
router.post('/calculate', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { restaurantId, items, couponCode } = req.body;

    if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Restaurant ID and items are required',
        messageAr: 'معرف المطعم والعناصر مطلوبة',
      };
      return res.status(400).json(response);
    }

    // Get restaurant info
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId, isActive: true },
      select: {
        deliveryFee: true,
        minimumOrder: true,
        isOpen: true,
      },
    });

    if (!restaurant) {
      const response: ApiResponse = {
        success: false,
        message: 'Restaurant not found or inactive',
        messageAr: 'المطعم غير موجود أو غير نشط',
      };
      return res.status(404).json(response);
    }

    if (!restaurant.isOpen) {
      const response: ApiResponse = {
        success: false,
        message: 'Restaurant is currently closed',
        messageAr: 'المطعم مغلق حالياً',
      };
      return res.status(400).json(response);
    }

    // Get menu items
    const menuItemIds = items.map((item: any) => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        restaurantId,
        isAvailable: true,
      },
      select: {
        id: true,
        price: true,
        discountPrice: true,
      },
    });

    if (menuItems.length !== menuItemIds.length) {
      const response: ApiResponse = {
        success: false,
        message: 'Some menu items are not available',
        messageAr: 'بعض عناصر القائمة غير متاحة',
      };
      return res.status(400).json(response);
    }

    // Calculate subtotal
    let subtotal = 0;
    const orderItems = items.map((item: any) => {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      const price = menuItem!.discountPrice || menuItem!.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;
      
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price,
        total: itemTotal,
      };
    });

    // Check minimum order
    if (subtotal < restaurant.minimumOrder) {
      const response: ApiResponse = {
        success: false,
        message: `Minimum order amount is ${restaurant.minimumOrder} EGP`,
        messageAr: `الحد الأدنى للطلب هو ${restaurant.minimumOrder} جنيه`,
      };
      return res.status(400).json(response);
    }

    // Apply coupon discount
    let discount = 0;
    let appliedCoupon = null;
    
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { 
          code: couponCode,
          isActive: true,
          validFrom: { lte: new Date() },
          validUntil: { gte: new Date() },
        },
      });

      if (coupon && subtotal >= coupon.minimumOrder) {
        if (coupon.usageLimit === null || coupon.usageCount < coupon.usageLimit) {
          if (coupon.discountType === 'PERCENTAGE') {
            discount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
              discount = coupon.maxDiscount;
            }
          } else {
            discount = coupon.discountValue;
          }
          
          appliedCoupon = {
            code: coupon.code,
            title: coupon.title,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            appliedDiscount: discount,
          };
        }
      }
    }

    // Calculate tax (14% in Egypt)
    const taxRate = 0.14;
    const tax = (subtotal - discount) * taxRate;

    // Calculate total
    const total = subtotal + restaurant.deliveryFee + tax - discount;

    const calculation: OrderCalculation & {
      items: typeof orderItems;
      restaurant: { deliveryFee: number; minimumOrder: number };
      coupon?: typeof appliedCoupon;
    } = {
      subtotal,
      deliveryFee: restaurant.deliveryFee,
      tax,
      discount,
      total,
      items: orderItems,
      restaurant: {
        deliveryFee: restaurant.deliveryFee,
        minimumOrder: restaurant.minimumOrder,
      },
      ...(appliedCoupon && { coupon: appliedCoupon }),
    };

    const response: ApiResponse = {
      success: true,
      message: 'Order calculation completed successfully',
      messageAr: 'تم حساب الطلب بنجاح',
      data: calculation,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Create new order
router.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const validatedData = validate(createOrderSchema, req.body) as CreateOrderRequest;

    // Get restaurant info
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: validatedData.restaurantId, isActive: true },
      select: {
        id: true,
        name: true,
        nameAr: true,
        deliveryFee: true,
        minimumOrder: true,
        isOpen: true,
        ownerId: true,
      },
    });

    if (!restaurant) {
      const response: ApiResponse = {
        success: false,
        message: 'Restaurant not found or inactive',
        messageAr: 'المطعم غير موجود أو غير نشط',
      };
      return res.status(404).json(response);
    }

    if (!restaurant.isOpen) {
      const response: ApiResponse = {
        success: false,
        message: 'Restaurant is currently closed',
        messageAr: 'المطعم مغلق حالياً',
      };
      return res.status(400).json(response);
    }

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: validatedData.addressId,
        userId: req.user!.id,
      },
    });

    if (!address) {
      const response: ApiResponse = {
        success: false,
        message: 'Address not found',
        messageAr: 'العنوان غير موجود',
      };
      return res.status(404).json(response);
    }

    // Get menu items and calculate total
    const menuItemIds = validatedData.items.map(item => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        restaurantId: validatedData.restaurantId,
        isAvailable: true,
      },
      select: {
        id: true,
        name: true,
        nameAr: true,
        price: true,
        discountPrice: true,
      },
    });

    if (menuItems.length !== menuItemIds.length) {
      const response: ApiResponse = {
        success: false,
        message: 'Some menu items are not available',
        messageAr: 'بعض عناصر القائمة غير متاحة',
      };
      return res.status(400).json(response);
    }

    // Calculate totals
    let subtotal = 0;
    const orderItemsData = validatedData.items.map(item => {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId)!;
      const price = menuItem.discountPrice || menuItem.price;
      subtotal += price * item.quantity;
      
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price,
        notes: item.notes,
      };
    });

    // Check minimum order
    if (subtotal < restaurant.minimumOrder) {
      const response: ApiResponse = {
        success: false,
        message: `Minimum order amount is ${restaurant.minimumOrder} EGP`,
        messageAr: `الحد الأدنى للطلب هو ${restaurant.minimumOrder} جنيه`,
      };
      return res.status(400).json(response);
    }

    // Apply coupon discount if provided
    let discount = 0;
    if (validatedData.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { 
          code: validatedData.couponCode,
          isActive: true,
          validFrom: { lte: new Date() },
          validUntil: { gte: new Date() },
        },
      });

      if (coupon && subtotal >= coupon.minimumOrder) {
        if (coupon.usageLimit === null || coupon.usageCount < coupon.usageLimit) {
          if (coupon.discountType === 'PERCENTAGE') {
            discount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
              discount = coupon.maxDiscount;
            }
          } else {
            discount = coupon.discountValue;
          }
        }
      }
    }

    const tax = (subtotal - discount) * 0.14; // 14% tax
    const total = subtotal + restaurant.deliveryFee + tax - discount;

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order with items
    const order = await prisma.order.create({
      data: {
        customerId: req.user!.id,
        restaurantId: validatedData.restaurantId,
        addressId: validatedData.addressId,
        orderNumber,
        subtotal,
        deliveryFee: restaurant.deliveryFee,
        tax,
        discount,
        total,
        paymentMethod: validatedData.paymentMethod,
        notes: validatedData.notes,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            image: true,
            phone: true,
            ownerId: true,
          },
        },
        address: {
          select: {
            title: true,
            address: true,
            city: true,
            latitude: true,
            longitude: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
                nameAr: true,
                image: true,
              },
            },
          },
        },
        customer: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    // Update coupon usage if applied
    if (validatedData.couponCode && discount > 0) {
      await prisma.coupon.update({
        where: { code: validatedData.couponCode },
        data: { usageCount: { increment: 1 } },
      });
    }

    // Send real-time notification to restaurant owner
    io.to(`user_${restaurant.ownerId}`).emit('new_order', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customer: order.customer,
      total: order.total,
      items: order.items,
      message: 'New order received',
      messageAr: 'طلب جديد وارد',
    });

    const response: ApiResponse = {
      success: true,
      message: 'Order created successfully',
      messageAr: 'تم إنشاء الطلب بنجاح',
      data: order,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// Get order by ID
router.get('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        OR: [
          { customerId: req.user!.id },
          { driverId: req.user!.id },
          { restaurant: { ownerId: req.user!.id } },
          // Admin can see all orders
          ...(req.user!.role === 'ADMIN' ? [{}] : []),
        ],
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            image: true,
            phone: true,
            address: true,
            latitude: true,
            longitude: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        address: true,
        items: {
          include: {
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
    });

    if (!order) {
      const response: ApiResponse = {
        success: false,
        message: 'Order not found',
        messageAr: 'الطلب غير موجود',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Order retrieved successfully',
      messageAr: 'تم استرداد الطلب بنجاح',
      data: order,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Update order status (for restaurant owners and drivers)
router.put('/:id/status', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { status, estimatedDeliveryTime } = req.body;

    if (!status || !Object.values(OrderStatus).includes(status)) {
      const response: ApiResponse = {
        success: false,
        message: 'Valid status is required',
        messageAr: 'حالة صالحة مطلوبة',
      };
      return res.status(400).json(response);
    }

    // Get order with permissions check
    const order = await prisma.order.findFirst({
      where: {
        id,
        OR: [
          { restaurant: { ownerId: req.user!.id } },
          { driverId: req.user!.id },
          // Admin can update all orders
          ...(req.user!.role === 'ADMIN' ? [{}] : []),
        ],
      },
      include: {
        customer: { select: { id: true, firstName: true } },
        restaurant: { select: { name: true, nameAr: true } },
      },
    });

    if (!order) {
      const response: ApiResponse = {
        success: false,
        message: 'Order not found or access denied',
        messageAr: 'الطلب غير موجود أو الوصول مرفوض',
      };
      return res.status(404).json(response);
    }

    // Prepare update data
    const updateData: any = { status };
    
    // Set timestamps based on status
    const now = new Date();
    switch (status) {
      case OrderStatus.CONFIRMED:
        updateData.confirmedAt = now;
        break;
      case OrderStatus.PREPARING:
        updateData.confirmedAt = updateData.confirmedAt || now;
        break;
      case OrderStatus.READY_FOR_PICKUP:
        updateData.preparedAt = now;
        break;
      case OrderStatus.OUT_FOR_DELIVERY:
        updateData.pickedUpAt = now;
        break;
      case OrderStatus.DELIVERED:
        updateData.deliveredAt = now;
        updateData.paymentStatus = PaymentStatus.COMPLETED;
        break;
      case OrderStatus.CANCELLED:
        updateData.cancelledAt = now;
        break;
    }

    if (estimatedDeliveryTime) {
      updateData.estimatedDeliveryTime = new Date(estimatedDeliveryTime);
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    // Send real-time notification to customer
    const statusMessages: Record<OrderStatus, { en: string; ar: string }> = {
      [OrderStatus.PENDING]: { en: 'Order is pending', ar: 'الطلب في الانتظار' },
      [OrderStatus.CONFIRMED]: { en: 'Order confirmed', ar: 'تم تأكيد الطلب' },
      [OrderStatus.PREPARING]: { en: 'Order is being prepared', ar: 'جاري تحضير الطلب' },
      [OrderStatus.READY_FOR_PICKUP]: { en: 'Order is ready for pickup', ar: 'الطلب جاهز للاستلام' },
      [OrderStatus.OUT_FOR_DELIVERY]: { en: 'Order is out for delivery', ar: 'الطلب في الطريق للتوصيل' },
      [OrderStatus.DELIVERED]: { en: 'Order has been delivered', ar: 'تم توصيل الطلب' },
      [OrderStatus.CANCELLED]: { en: 'Order has been cancelled', ar: 'تم إلغاء الطلب' },
    };

    io.to(`user_${order.customer.id}`).emit('order_update', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status,
      message: statusMessages[status].en,
      messageAr: statusMessages[status].ar,
      estimatedDeliveryTime: updateData.estimatedDeliveryTime,
    });

    const response: ApiResponse = {
      success: true,
      message: 'Order status updated successfully',
      messageAr: 'تم تحديث حالة الطلب بنجاح',
      data: updatedOrder,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Cancel order (customers only, within time limit)
router.put('/:id/cancel', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await prisma.order.findFirst({
      where: {
        id,
        customerId: req.user!.id,
        status: { in: [OrderStatus.PENDING, OrderStatus.CONFIRMED] },
      },
    });

    if (!order) {
      const response: ApiResponse = {
        success: false,
        message: 'Order not found or cannot be cancelled',
        messageAr: 'الطلب غير موجود أو لا يمكن إلغاؤه',
      };
      return res.status(404).json(response);
    }

    // Check if order is within cancellation time (e.g., 5 minutes)
    const cancellationTimeLimit = 5 * 60 * 1000; // 5 minutes in milliseconds
    const orderAge = Date.now() - order.createdAt.getTime();
    
    if (orderAge > cancellationTimeLimit && order.status !== OrderStatus.PENDING) {
      const response: ApiResponse = {
        success: false,
        message: 'Order cannot be cancelled after 5 minutes',
        messageAr: 'لا يمكن إلغاء الطلب بعد 5 دقائق',
      };
      return res.status(400).json(response);
    }

    // Cancel order
    const cancelledOrder = await prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: reason || 'Cancelled by customer',
      },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Order cancelled successfully',
      messageAr: 'تم إلغاء الطلب بنجاح',
      data: cancelledOrder,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;