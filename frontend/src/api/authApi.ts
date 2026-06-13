import api from './axiosClient';
import { ApiResponse, AuthResponse, User } from '../types';

/**
 * Auth API layer - thin wrappers around Axios calls to /api/auth/*.
 * Keeping these in one place means components/hooks never construct
 * raw URLs or handle response unwrapping themselves.
 */
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data),

  getMe: () => api.get<ApiResponse<User>>('/auth/me'),

  updateProfile: (data: { name?: string; email?: string }) =>
    api.patch<ApiResponse<User>>('/auth/profile', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch<ApiResponse<null>>('/auth/change-password', data),
};
