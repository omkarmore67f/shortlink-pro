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
 * Security Middleware
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

/**
 * Body Parsers
 */
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

/**
 * HTTP Request Logging
 */
app.use(
  morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  })
);

/**
 * Global API Rate Limiting
 */
app.use('/api', apiLimiter);

/**
 * Root Route
 * Useful when opening the Render URL directly.
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ShortLink Pro API is running.',
    health: '/health',
  });
});

/**
 * Health Check Route
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ShortLink Pro API is healthy.',
  });
});

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/analytics', analyticsRoutes);

/**
 * Public Redirect Routes
 * MUST come after API routes.
 */
app.use('/', redirectRoutes);

/**
 * 404 Handler
 */
app.use(notFound);

/**
 * Global Error Handler
 */
app.use(globalErrorHandler);

export default app;