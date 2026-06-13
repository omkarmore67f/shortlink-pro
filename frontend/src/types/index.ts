/**
 * Shared TypeScript types/interfaces used across the frontend.
 * Mirrors the shapes returned by the backend API.
 */

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface ShortUrl {
  _id: string;
  user: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  customAlias: string | null;
  title?: string;
  totalClicks: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AnalyticsSummary {
  totalLinks: number;
  activeLinks: number;
  totalClicks: number;
  linksCreatedLast7Days: number;
}

export interface DailyClick {
  date: string;
  clicks: number;
}

export interface DeviceBreakdown {
  byDevice: { name: string; count: number }[];
  byBrowser: { name: string; count: number }[];
}

export interface ClickEvent {
  _id: string;
  url: {
    _id: string;
    shortCode: string;
    title?: string;
    originalUrl: string;
  };
  device: string;
  browser: string;
  os: string;
  referrer: string;
  createdAt: string;
}
