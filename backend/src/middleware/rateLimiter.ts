import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 *
 * Applied globally to /api/* to mitigate brute-force and scraping
 * attacks. Limits are read from env vars so they can be tuned per
 * environment (looser in dev, stricter in production) without code
 * changes.
 */
export const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});

/**
 * Stricter limiter for authentication routes (login/register).
 *
 * Why separate from the general limiter:
 * - Login/register endpoints are the prime target for credential
 *   stuffing and brute-force attacks, so they get a much tighter
 *   threshold (e.g., 10 attempts per 15 min) than general API browsing.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

/**
 * Limiter for the public redirect endpoint (GET /:shortCode).
 *
 * This endpoint is hit by real end-users clicking links, so the limit
 * is per-IP and generous, mainly to prevent automated abuse/scraping
 * of the redirect endpoint to inflate click counts.
 */
export const redirectLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
});
