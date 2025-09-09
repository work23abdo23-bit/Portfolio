import { Request } from 'express';
import { UserRole } from '@prisma/client';

// Extended Request interface with user information
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
  };
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
  user: {
    id: string;
    email: string;
    phone?: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    avatar?: string;
    isVerified: boolean;
  };
}

// Restaurant types
export interface RestaurantFilters {
  search?: string;
  category?: string;
  minRating?: number;
  maxDeliveryTime?: number;
  sortBy?: 'rating' | 'deliveryTime' | 'deliveryFee' | 'name';
  sortOrder?: 'asc' | 'desc';
}

// Order types
export interface CreateOrderRequest {
  restaurantId: string;
  addressId: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    notes?: string;
  }>;
  paymentMethod: 'CASH' | 'CARD' | 'WALLET';
  notes?: string;
  couponCode?: string;
}

export interface OrderCalculation {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
}

// Socket.IO types
export interface SocketUser {
  id: string;
  role: UserRole;
  socketId: string;
}

export interface OrderUpdate {
  orderId: string;
  status: string;
  message: string;
  messageAr: string;
  estimatedDeliveryTime?: Date;
  driverLocation?: {
    latitude: number;
    longitude: number;
  };
}

// File upload types
export interface UploadedFile {
  url: string;
  publicId: string;
  originalName: string;
  size: number;
  mimeType: string;
}

// Error types
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  messageAr?: string;

  constructor(message: string, statusCode: number, messageAr?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.messageAr = messageAr;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
  messageAr?: string;
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