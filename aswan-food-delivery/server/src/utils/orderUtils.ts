import crypto from 'crypto';

// Generate unique order number
export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `AF${timestamp.slice(-6)}${random}`;
};

// Calculate delivery time estimate
export const calculateDeliveryTime = (
  restaurantDeliveryTime: number,
  distance?: number
): number => {
  let estimatedTime = restaurantDeliveryTime;
  
  if (distance) {
    // Add 2 minutes per kilometer
    estimatedTime += Math.ceil(distance * 2);
  }
  
  // Add buffer time (5-10 minutes)
  estimatedTime += Math.floor(Math.random() * 6) + 5;
  
  return Math.min(estimatedTime, 120); // Cap at 2 hours
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

// Convert degrees to radians
const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// Validate order items
export const validateOrderItems = (items: any[]): boolean => {
  if (!Array.isArray(items) || items.length === 0) {
    return false;
  }
  
  return items.every(item => 
    item.menuItemId &&
    typeof item.quantity === 'number' &&
    item.quantity > 0 &&
    item.quantity <= 50 // Max quantity per item
  );
};

// Calculate order preparation time
export const calculatePreparationTime = (
  items: Array<{ preparationTime: number; quantity: number }>
): number => {
  if (items.length === 0) return 15; // Default 15 minutes
  
  // Find the longest preparation time among all items
  const maxPrepTime = Math.max(...items.map(item => item.preparationTime));
  
  // Add extra time based on total quantity
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const quantityBuffer = Math.ceil(totalQuantity / 5) * 2; // 2 minutes per 5 items
  
  return Math.min(maxPrepTime + quantityBuffer, 60); // Cap at 1 hour
};

// Format order status for display
export const formatOrderStatus = (status: string): { en: string; ar: string } => {
  const statusMap: Record<string, { en: string; ar: string }> = {
    PENDING: { en: 'Pending', ar: 'في الانتظار' },
    CONFIRMED: { en: 'Confirmed', ar: 'مؤكد' },
    PREPARING: { en: 'Preparing', ar: 'قيد التحضير' },
    READY_FOR_PICKUP: { en: 'Ready for Pickup', ar: 'جاهز للاستلام' },
    OUT_FOR_DELIVERY: { en: 'Out for Delivery', ar: 'في الطريق' },
    DELIVERED: { en: 'Delivered', ar: 'تم التوصيل' },
    CANCELLED: { en: 'Cancelled', ar: 'ملغي' },
  };
  
  return statusMap[status] || { en: status, ar: status };
};

// Check if order can be cancelled
export const canCancelOrder = (
  order: { status: string; createdAt: Date },
  userRole: string
): boolean => {
  const cancellableStatuses = ['PENDING', 'CONFIRMED'];
  
  if (!cancellableStatuses.includes(order.status)) {
    return false;
  }
  
  // Admin can always cancel
  if (userRole === 'ADMIN') {
    return true;
  }
  
  // Check time limit for customers (5 minutes)
  if (userRole === 'CUSTOMER') {
    const timeLimitMs = 5 * 60 * 1000; // 5 minutes
    const orderAge = Date.now() - order.createdAt.getTime();
    return orderAge <= timeLimitMs;
  }
  
  // Restaurant owners can cancel within 10 minutes
  if (userRole === 'RESTAURANT_OWNER') {
    const timeLimitMs = 10 * 60 * 1000; // 10 minutes
    const orderAge = Date.now() - order.createdAt.getTime();
    return orderAge <= timeLimitMs;
  }
  
  return false;
};

// Generate estimated delivery time
export const generateEstimatedDeliveryTime = (
  restaurantPreparationTime: number,
  deliveryDistance?: number
): Date => {
  const now = new Date();
  let totalMinutes = restaurantPreparationTime;
  
  if (deliveryDistance) {
    // Add delivery time based on distance (assuming 30 km/h average speed)
    const deliveryTimeMinutes = Math.ceil((deliveryDistance / 30) * 60);
    totalMinutes += deliveryTimeMinutes;
  } else {
    // Default delivery time if distance is unknown
    totalMinutes += 15;
  }
  
  // Add buffer time (5-10 minutes)
  totalMinutes += Math.floor(Math.random() * 6) + 5;
  
  const estimatedTime = new Date(now.getTime() + totalMinutes * 60 * 1000);
  return estimatedTime;
};

// Validate payment method
export const isValidPaymentMethod = (method: string): boolean => {
  const validMethods = ['CASH', 'CARD', 'WALLET'];
  return validMethods.includes(method);
};

// Calculate service fee based on order total
export const calculateServiceFee = (subtotal: number): number => {
  // Progressive service fee
  if (subtotal < 50) return 5;
  if (subtotal < 100) return 7;
  if (subtotal < 200) return 10;
  return 15;
};

// Check if restaurant is within delivery area
export const isWithinDeliveryArea = (
  restaurantLat: number,
  restaurantLng: number,
  deliveryLat: number,
  deliveryLng: number,
  maxDeliveryRadius: number = 10 // km
): boolean => {
  const distance = calculateDistance(
    restaurantLat,
    restaurantLng,
    deliveryLat,
    deliveryLng
  );
  
  return distance <= maxDeliveryRadius;
};