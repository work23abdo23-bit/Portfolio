// User types
export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  addresses?: Address[];
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  RESTAURANT_OWNER = 'RESTAURANT_OWNER',
  DELIVERY_DRIVER = 'DELIVERY_DRIVER',
  ADMIN = 'ADMIN',
}

// Address types
export interface Address {
  id: string;
  userId: string;
  title: string;
  address: string;
  city: string;
  governorate: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Restaurant types
export interface Restaurant {
  id: string;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  image?: string;
  coverImage?: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email?: string;
  isActive: boolean;
  isOpen: boolean;
  deliveryTime: number;
  deliveryFee: number;
  minimumOrder: number;
  rating: number;
  totalReviews: number;
  openingTime: string;
  closingTime: string;
  categories?: Category[];
  reviews?: Review[];
}

// Category types
export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  nameAr: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  menuItems?: MenuItem[];
}

// Menu Item types
export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  image?: string;
  price: number;
  discountPrice?: number;
  isAvailable: boolean;
  isPopular: boolean;
  ingredients?: string;
  allergens?: string;
  calories?: number;
  preparationTime: number;
  sortOrder: number;
  restaurant?: Restaurant;
  category?: Category;
}

// Order types
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  WALLET = 'WALLET',
}

export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;
  driverId?: string;
  addressId: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  notes?: string;
  estimatedDeliveryTime?: string;
  confirmedAt?: string;
  preparedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  customer?: User;
  restaurant?: Restaurant;
  driver?: User;
  address?: Address;
  items?: OrderItem[];
  review?: Review;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  price: number;
  notes?: string;
  menuItem?: MenuItem;
}

// Cart types
export interface CartItem {
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface Cart {
  restaurantId?: string;
  restaurant?: Restaurant;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  couponCode?: string;
}

// Review types
export interface Review {
  id: string;
  userId: string;
  restaurantId?: string;
  menuItemId?: string;
  orderId?: string;
  rating: number;
  comment?: string;
  images?: string[];
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
  restaurant?: Restaurant;
  menuItem?: MenuItem;
  order?: Order;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  messageAr?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  phone?: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Filter types
export interface RestaurantFilters {
  search?: string;
  category?: string;
  minRating?: number;
  maxDeliveryTime?: number;
  sortBy?: 'rating' | 'deliveryTime' | 'deliveryFee' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Socket types
export interface SocketUser {
  id: string;
  role: UserRole;
  socketId: string;
}

export interface OrderUpdate {
  orderId: string;
  status: OrderStatus;
  message: string;
  messageAr: string;
  estimatedDeliveryTime?: string;
  driverLocation?: {
    latitude: number;
    longitude: number;
  };
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  titleAr?: string;
  message: string;
  messageAr?: string;
  type: string;
  data?: string;
  isRead: boolean;
  createdAt: string;
}

// Location types
export interface Location {
  latitude: number;
  longitude: number;
}

export interface LocationPermission {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

// Form types
export interface FormError {
  field: string;
  message: string;
}

export interface FormState {
  isLoading: boolean;
  errors: FormError[];
  success?: string;
}

// UI State types
export interface UIState {
  theme: 'light' | 'dark';
  language: 'ar' | 'en';
  sidebarOpen: boolean;
  modalOpen: boolean;
  loading: boolean;
}

// Search types
export interface SearchResult {
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  searchQuery: string;
}

// Coupon types
export interface Coupon {
  id: string;
  code: string;
  title: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minimumOrder: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  userUsageLimit: number;
  isActive: boolean;
  validFrom: string;
  validUntil: string;
  applicableToAll: boolean;
  restaurantIds: string[];
}

// Analytics types
export interface RestaurantAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  averageRating: number;
  totalReviews: number;
  popularItems: Array<{
    id: string;
    name: string;
    nameAr: string;
    orderCount: number;
  }>;
  revenueByDay: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export interface AdminAnalytics {
  totalUsers: number;
  totalRestaurants: number;
  totalOrders: number;
  totalRevenue: number;
  usersByRole: Record<UserRole, number>;
  ordersByStatus: Record<string, number>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  topRestaurants: Array<{
    id: string;
    name: string;
    nameAr: string;
    totalOrders: number;
    totalRevenue: number;
    rating: number;
  }>;
}

// Settings types
export interface Setting {
  id: string;
  key: string;
  value: string;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  category: string;
  updatedAt: string;
}