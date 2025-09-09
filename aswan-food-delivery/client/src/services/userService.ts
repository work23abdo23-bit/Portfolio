import { apiClient } from './api';
import { Address, ApiResponse } from '@/types';

export const getAddresses = (): Promise<ApiResponse<Address[]>> => {
  return apiClient.get<Address[]>('/users/addresses');
};

export const addAddress = (addressData: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Address>> => {
  return apiClient.post<Address>('/users/addresses', addressData);
};

export const updateAddress = (addressId: string, addressData: Partial<Address>): Promise<ApiResponse<Address>> => {
  return apiClient.put<Address>(`/users/addresses/${addressId}`, addressData);
};

export const deleteAddress = (addressId: string): Promise<ApiResponse<void>> => {
  return apiClient.delete<void>(`/users/addresses/${addressId}`);
};

export const setDefaultAddress = (addressId: string): Promise<ApiResponse<Address>> => {
  return apiClient.put<Address>(`/users/addresses/${addressId}/default`);
};