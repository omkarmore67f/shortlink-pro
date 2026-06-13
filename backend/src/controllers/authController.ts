import { Response, NextFunction } from 'express';
import authService from '../services/authService';
import asyncHandler from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, password } = req.body;

  const result = await authService.register({ name, email, password });

  res.status(201).json({
    success: true,
    message: 'Registration successful.',
    data: result,
  });
});

/**
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  const result = await authService.login({ email, password });

  res.status(200).json({
    success: true,
    message: 'Login successful.',
    data: result,
  });
});

/**
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const profile = await authService.getProfile(req.user!._id.toString());

  res.status(200).json({
    success: true,
    data: profile,
  });
});

/**
 * @route   PATCH /api/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email } = req.body;

  const profile = await authService.updateProfile(req.user!._id.toString(), { name, email });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    data: profile,
  });
});

/**
 * @route   PATCH /api/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  await authService.changePassword(req.user!._id.toString(), currentPassword, newPassword);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully.',
  });
});
