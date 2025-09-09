import { apiClient } from './api';
import { LoginRequest, RegisterRequest, AuthResponse, User, ApiResponse } from '@/types';

export const login = (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
  return apiClient.post<AuthResponse>('/auth/login', credentials);
};

export const register = (userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
  return apiClient.post<AuthResponse>('/auth/register', userData);
};

export const getCurrentUser = (): Promise<ApiResponse<User>> => {
  return apiClient.get<User>('/auth/me');
};

export const updateProfile = (userData: Partial<User>): Promise<ApiResponse<User>> => {
  return apiClient.put<User>('/users/profile', userData);
};

export const changePassword = (passwordData: {
  currentPassword: string;
  newPassword: string;
}): Promise<ApiResponse<void>> => {
  return apiClient.put<void>('/users/password', passwordData);
};

export const logout = (): Promise<ApiResponse<void>> => {
  return apiClient.post<void>('/auth/logout');
};

export const refreshToken = (refreshToken: string): Promise<ApiResponse<{ token: string }>> => {
  return apiClient.post<{ token: string }>('/auth/refresh', { refreshToken });
};

export const forgotPassword = (email: string): Promise<ApiResponse<void>> => {
  return apiClient.post<void>('/auth/forgot-password', { email });
};

export const resetPassword = (token: string, password: string): Promise<ApiResponse<void>> => {
  return apiClient.post<void>('/auth/reset-password', { token, password });
};

export const verifyEmail = (token: string): Promise<ApiResponse<void>> => {
  return apiClient.post<void>('/auth/verify-email', { token });
};