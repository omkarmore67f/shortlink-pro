import api from './axiosClient';
import { ApiResponse, ShortUrl } from '../types';

export interface CreateUrlPayload {
  originalUrl: string;
  customAlias?: string;
  title?: string;
  expiresAt?: string;
}

export interface UpdateUrlPayload {
  originalUrl?: string;
  title?: string;
  isActive?: boolean;
  expiresAt?: string | null;
}

export interface ListUrlsParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'totalClicks' | 'title';
  order?: 'asc' | 'desc';
  search?: string;
}

export const urlApi = {
  create: (data: CreateUrlPayload) => api.post<ApiResponse<ShortUrl>>('/urls', data),

  list: (params: ListUrlsParams) => api.get<ApiResponse<ShortUrl[]>>('/urls', { params }),

  getById: (id: string) => api.get<ApiResponse<ShortUrl>>(`/urls/${id}`),

  update: (id: string, data: UpdateUrlPayload) =>
    api.patch<ApiResponse<ShortUrl>>(`/urls/${id}`, data),

  remove: (id: string) => api.delete<ApiResponse<null>>(`/urls/${id}`),

  getQrCode: (id: string) =>
    api.get<ApiResponse<{ qrCode: string; shortUrl: string }>>(`/urls/${id}/qrcode`),
};
