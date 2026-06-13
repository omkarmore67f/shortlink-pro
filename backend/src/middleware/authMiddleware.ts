import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import AppError from '../utils/AppError';
import asyncHandler from '../utils/asyncHandler';

/**
 * Extends Express's Request type to attach the authenticated user.
 * This gives us type-safety in controllers when accessing req.user.
 */
export interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * `protect` middleware
 *
 * Verifies the JWT sent in the Authorization header (Bearer scheme).
 * On success, attaches the full user document (minus password) to
 * req.user so downstream controllers can access req.user._id, etc.
 *
 * Why fetch the user from DB on every request instead of trusting the
 * token payload?
 * - Allows immediate revocation: if a user is deleted or banned, their
 *   existing tokens stop working on the very next request (since the
 *   DB lookup will fail), rather than remaining valid until expiry.
 */
export const protect = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('Not authorized to access this route. Please log in.', 401)
      );
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
      };

      const user = await User.findById(decoded.id);

      if (!user) {
        return next(
          new AppError('The user belonging to this token no longer exists.', 401)
        );
      }

      req.user = user;
      next();
    } catch (error) {
      return next(new AppError('Invalid or expired token. Please log in again.', 401));
    }
  }
);

/**
 * `restrictTo` middleware factory
 *
 * Usage: router.delete('/:id', protect, restrictTo('admin'), handler)
 *
 * Provides simple role-based access control. Kept generic so it can
 * be extended for future roles (e.g., 'premium' tier users with
 * higher rate limits or extra features).
 */
export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};
