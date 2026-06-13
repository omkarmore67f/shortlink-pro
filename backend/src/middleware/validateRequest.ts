import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import AppError from '../utils/AppError';

/**
 * Runs after express-validator's chain of `check()`/`body()` validators
 * have executed on a route. Collects all validation errors and, if any
 * exist, forwards a single formatted AppError to the global error
 * handler instead of letting the request proceed to the controller.
 *
 * This keeps controllers free of validation logic entirely - by the
 * time a controller runs, req.body is guaranteed to be valid.
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const messages = errors.array().map((err) => err.msg);
    return next(new AppError(messages.join(', '), 400));
  }

  next();
};
