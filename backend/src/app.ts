import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
// @ts-ignore
import xss from 'xss-clean';

import authRoutes from './routes/authRoutes';
import urlRoutes from './routes/urlRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import redirectRoutes from './routes/redirectRoutes';
import notFound from './middleware/notFound';
import globalErrorHandler from './middleware/errorMiddleware';
import { apiLimiter } from './middleware/rateLimiter';
import logger from './utils/logger';

const app: Application = express();

/**
 * Security middleware
 * --------------------
 * - helmet: sets various secure HTTP headers (X-Frame-Options,
 *   X-Content-Type-Options, etc.) to mitigate common attacks.
 * - cors: restricts which origins can call this API. Configured via
 *   CLIENT_URL env var so it can differ per environment.
 * - mongoSanitize: strips any keys starting with '$' or containing '.'
 *   from req.body/query/params to prevent MongoDB operator injection
 *   (NoSQL injection).
 * - xss-clean: sanitizes user input to strip out malicious HTML/JS,
 *   mitigating stored/reflected XSS.
 * - hpp: protects against HTTP Parameter Pollution attacks
 *   (e.g., ?sortBy=a&sortBy=b).
 */
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// HTTP request logging via morgan, piped into winston
app.use(
  morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  })
);

// Global rate limiting on all API routes
app.use('/api', apiLimiter);
app.use('/', redirectRoutes);
// Health check endpoint (useful for Docker/Render/Railway health probes)
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'ShortLink Pro API is healthy.' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/analytics', analyticsRoutes);

// Public redirect route - mounted LAST at root level so it doesn't
// shadow /api or /health routes. Express matches routes in order.
app.use('/', redirectRoutes);

// 404 handler for unmatched routes
app.use(notFound);

// Centralized error handler (must be registered last)
app.use(globalErrorHandler);

export default app;
