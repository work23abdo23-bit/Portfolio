import { apiClient } from './api';
import { Order, OrderCalculation, ApiResponse } from '@/types';

export const calculateOrder = (orderData: {
  restaurantId: string;
  items: Array<{ menuItemId: string; quantity: number }>;
  couponCode?: string;
}): Promise<ApiResponse<OrderCalculation>> => {
  return apiClient.post<OrderCalculation>('/orders/calculate', orderData);
};

export const createOrder = (orderData: {
  restaurantId: string;
  addressId: string;
  items: Array<{ menuItemId: string; quantity: number; notes?: string }>;
  paymentMethod: 'CASH' | 'CARD' | 'WALLET';
  notes?: string;
  couponCode?: string;
}): Promise<ApiResponse<Order>> => {
  return apiClient.post<Order>('/orders', orderData);
};

export const getOrders = (params: {
  page?: number;
  limit?: number;
  status?: string;
} = {}): Promise<ApiResponse<{
  orders: Order[];
  pagination: any;
}>> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });

  return apiClient.get<{
    orders: Order[];
    pagination: any;
  }>(`/users/orders?${queryParams.toString()}`);
};

export const getOrderById = (orderId: string): Promise<ApiResponse<Order>> => {
  return apiClient.get<Order>(`/orders/${orderId}`);
};

export const cancelOrder = (orderId: string, reason?: string): Promise<ApiResponse<Order>> => {
  return apiClient.put<Order>(`/orders/${orderId}/cancel`, { reason });
};

export const updateOrderStatus = (
  orderId: string, 
  status: string, 
  estimatedDeliveryTime?: string
): Promise<ApiResponse<Order>> => {
  return apiClient.put<Order>(`/orders/${orderId}/status`, {
    status,
    estimatedDeliveryTime,
  });
};