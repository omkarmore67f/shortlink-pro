import api from './axiosClient';
import {
  AnalyticsSummary,
  ApiResponse,
  ClickEvent,
  DailyClick,
  DeviceBreakdown,
  ShortUrl,
} from '../types';

export const analyticsApi = {
  getSummary: () => api.get<ApiResponse<AnalyticsSummary>>('/analytics/summary'),

  getDailyClicks: (days = 30) =>
    api.get<ApiResponse<DailyClick[]>>('/analytics/daily-clicks', { params: { days } }),

  getTopLinks: (limit = 5) =>
    api.get<ApiResponse<ShortUrl[]>>('/analytics/top-links', { params: { limit } }),

  getRecentActivity: (limit = 10) =>
    api.get<ApiResponse<ClickEvent[]>>('/analytics/recent-activity', { params: { limit } }),

  getDeviceBreakdown: () => api.get<ApiResponse<DeviceBreakdown>>('/analytics/devices'),

  getLinkAnalytics: (id: string, days = 30) =>
    api.get<ApiResponse<DailyClick[]>>(`/analytics/links/${id}`, { params: { days } }),
};
