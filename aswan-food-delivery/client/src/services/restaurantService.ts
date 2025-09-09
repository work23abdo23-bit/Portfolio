import { apiClient } from './api';
import { 
  Restaurant, 
  MenuItem, 
  RestaurantFilters, 
  PaginatedResponse, 
  SearchResult, 
  ApiResponse 
} from '@/types';

export const getRestaurants = (filters: RestaurantFilters = {}): Promise<PaginatedResponse<Restaurant>> => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  return apiClient.get<Restaurant[]>(`/restaurants?${params.toString()}`);
};

export const getRestaurantById = (id: string): Promise<ApiResponse<Restaurant>> => {
  return apiClient.get<Restaurant>(`/restaurants/${id}`);
};

export const getRestaurantMenu = (id: string): Promise<ApiResponse<{
  restaurant: Restaurant;
  categories: any[];
}>> => {
  return apiClient.get<{
    restaurant: Restaurant;
    categories: any[];
  }>(`/restaurants/${id}/menu`);
};

export const getRestaurantReviews = (
  id: string, 
  page: number = 1, 
  limit: number = 10
): Promise<PaginatedResponse<any>> => {
  return apiClient.get<any[]>(`/restaurants/${id}/reviews?page=${page}&limit=${limit}`);
};

export const searchRestaurantsAndItems = (
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<SearchResult>> => {
  return apiClient.get<SearchResult>(`/restaurants/search/${encodeURIComponent(query)}?page=${page}&limit=${limit}`);
};

export const getPopularItems = (limit: number = 20): Promise<ApiResponse<MenuItem[]>> => {
  return apiClient.get<MenuItem[]>(`/menu/popular?limit=${limit}`);
};

export const getMenuItemById = (id: string): Promise<ApiResponse<MenuItem>> => {
  return apiClient.get<MenuItem>(`/menu/items/${id}`);
};

export const searchMenuItems = (
  query: string,
  filters: {
    page?: number;
    limit?: number;
    restaurantId?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
  } = {}
): Promise<ApiResponse<{
  items: MenuItem[];
  searchQuery: string;
  pagination: any;
}>> => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  return apiClient.get<{
    items: MenuItem[];
    searchQuery: string;
    pagination: any;
  }>(`/menu/search/${encodeURIComponent(query)}?${params.toString()}`);
};

export const getMenuCategories = (restaurantId?: string): Promise<ApiResponse<any[]>> => {
  const url = restaurantId 
    ? `/menu/categories?restaurantId=${restaurantId}`
    : '/menu/categories';
  
  return apiClient.get<any[]>(url);
};