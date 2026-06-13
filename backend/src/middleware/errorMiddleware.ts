import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import logger from '../utils/logger';

/**
 * Centralized error-handling middleware.
 *
 * This is registered LAST in the middleware chain (after all routes).
 * Express recognizes it as an error handler because it has 4 arguments.
 *
 * Handles several known Mongoose/JWT error types and converts them into
 * clean, user-friendly AppError instances before formatting the response.
 */

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { message: string }>;
}

const handleCastErrorDB = (err: any): AppError => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

const handleDuplicateFieldsDB = (err: MongoError): AppError => {
  const field = Object.keys(err.keyValue || {})[0];
  const value = (err.keyValue as any)?.[field];
  return new AppError(
    `Duplicate value: '${value}' for field '${field}'. Please use another value.`,
    400
  );
};

const handleValidationErrorDB = (err: MongoError): AppError => {
  const errors = Object.values(err.errors || {}).map((el) => el.message);
  return new AppError(`Invalid input data. ${errors.join('. ')}`, 400);
};

const handleJWTError = (): AppError =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = (): AppError =>
  new AppError('Your session has expired. Please log in again.', 401);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;

  // Convert known error types into operational AppErrors
  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  const statusCode = error.statusCode || 500;
  const status = error.status || 'error';
  const isOperational = error.isOperational || false;

  // Log every error; full stack trace for unexpected (non-operational) errors
  if (!isOperational) {
    logger.error(`Unhandled Error: ${error.message}`, { stack: error.stack });
  } else {
    logger.warn(`Operational Error: ${error.message}`);
  }

  res.status(statusCode).json({
    success: false,
    status,
    message: isOperational ? error.message : 'Something went wrong on our end. Please try again later.',
    ...(process.env.NODE_ENV === 'development' && !isOperational
      ? { stack: error.stack }
      : {}),
  });
};

export default globalErrorHandler;
