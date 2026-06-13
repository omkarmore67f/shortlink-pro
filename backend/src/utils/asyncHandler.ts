import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async Express route handler so that any rejected promise
 * (thrown error) is automatically forwarded to next(), which routes
 * it to our centralized error-handling middleware.
 *
 * Without this, every controller would need a try/catch block that
 * calls next(err) manually - this utility eliminates that repetition
 * across ~15 controller functions.
 */
const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
