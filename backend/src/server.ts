import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import connectDB from './config/db';
import logger from './utils/logger';

const PORT = process.env.PORT || 5000;

/**
 * Bootstraps the application:
 * 1. Connects to MongoDB (exits process on failure - see config/db.ts)
 * 2. Starts the Express HTTP server
 * 3. Registers process-level handlers for unhandled rejections and
 *    uncaught exceptions so the process fails loudly and predictably
 *    instead of running in a corrupted state.
 */
const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info(`ShortLink Pro API running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

  process.on('unhandledRejection', (err: Error) => {
    logger.error(`Unhandled Rejection: ${err.message}`, { stack: err.stack });
    server.close(() => process.exit(1));
  });

  process.on('uncaughtException', (err: Error) => {
    logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
    process.exit(1);
  });
};

startServer();
