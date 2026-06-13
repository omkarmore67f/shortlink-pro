import { Response } from 'express';
import analyticsService from '../services/analyticsService';
import asyncHandler from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * @route   GET /api/analytics/summary
 * @access  Private
 */
export const getSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const summary = await analyticsService.getSummary(req.user!._id.toString());

  res.status(200).json({ success: true, data: summary });
});

/**
 * @route   GET /api/analytics/daily-clicks?days=30
 * @access  Private
 */
export const getDailyClicks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const days = parseInt(req.query.days as string) || 30;

  const data = await analyticsService.getDailyClicks(req.user!._id.toString(), days);

  res.status(200).json({ success: true, data });
});

/**
 * @route   GET /api/analytics/top-links?limit=5
 * @access  Private
 */
export const getTopLinks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 5;

  const data = await analyticsService.getTopLinks(req.user!._id.toString(), limit);

  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

  const result = data.map((url) => ({
    ...url.toObject(),
    shortUrl: `${baseUrl}/${url.shortCode}`,
  }));

  res.status(200).json({ success: true, data: result });
});

/**
 * @route   GET /api/analytics/recent-activity?limit=10
 * @access  Private
 */
export const getRecentActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;

  const data = await analyticsService.getRecentActivity(req.user!._id.toString(), limit);

  res.status(200).json({ success: true, data });
});

/**
 * @route   GET /api/analytics/devices
 * @access  Private
 */
export const getDeviceBreakdown = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await analyticsService.getDeviceBreakdown(req.user!._id.toString());

  res.status(200).json({ success: true, data });
});

/**
 * @route   GET /api/analytics/links/:id?days=30
 * @access  Private
 */
export const getLinkAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const days = parseInt(req.query.days as string) || 30;

  const data = await analyticsService.getLinkAnalytics(
    req.params.id,
    req.user!._id.toString(),
    days
  );

  res.status(200).json({ success: true, data });
});
