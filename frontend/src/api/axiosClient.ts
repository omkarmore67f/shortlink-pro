import axios, { AxiosError } from 'axios';

/**
 * Centralized Axios instance.
 *
 * - baseURL is read from env so the same build can point to different
 *   backends across environments (dev/staging/prod) without code changes.
 * - Request interceptor attaches the JWT from localStorage to every
 *   outgoing request, so individual API calls never need to handle auth
 *   headers manually.
 * - Response interceptor catches 401s globally: if the token is invalid
 *   or expired, we clear stored auth state and redirect to /login. This
 *   centralizes session-expiry handling instead of repeating it in every
 *   component that makes API calls.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Avoid redirect loop if already on auth pages
      if (
        !window.location.pathname.startsWith('/login') &&
        !window.location.pathname.startsWith('/register')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Extracts a user-friendly error message from an Axios error.
 * The backend always returns { success: false, message: string }
 * on errors via the global error handler.
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      'Something went wrong. Please try again.'
    );
  }
  return 'Something went wrong. Please try again.';
};

export default api;
