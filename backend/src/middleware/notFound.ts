import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';

/**
 * Catches any request that doesn't match a defined route and forwards
 * a 404 AppError to the global error handler. Must be registered
 * after all valid routes but before the global error handler.
 */
const notFound = (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

export default notFound;
