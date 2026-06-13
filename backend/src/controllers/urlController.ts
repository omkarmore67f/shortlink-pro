import { Request, Response } from 'express';
import urlService from '../services/urlService';
import asyncHandler from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/authMiddleware';
import AppError from '../utils/AppError';

/**
 * @route   POST /api/urls
 * @access  Private
 */
export const createUrl = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { originalUrl, customAlias, title, expiresAt } = req.body;

  const url = await urlService.createShortUrl({
    userId: req.user!._id.toString(),
    originalUrl,
    customAlias,
    title,
    expiresAt,
  });

  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

  res.status(201).json({
    success: true,
    message: 'Short URL created successfully.',
    data: {
      ...url.toObject(),
      shortUrl: `${baseUrl}/${url.shortCode}`,
    },
  });
});

/**
 * @route   GET /api/urls
 * @access  Private
 * Supports pagination, sorting, and search via query params.
 */
export const getUrls = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const order = (req.query.order as 'asc' | 'desc') || 'desc';
  const search = req.query.search as string | undefined;

  const result = await urlService.listUrls({
    userId: req.user!._id.toString(),
    page,
    limit,
    sortBy,
    order,
    search,
  });

  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

  const urls = result.urls.map((url) => ({
    ...url.toObject(),
    shortUrl: `${baseUrl}/${url.shortCode}`,
  }));

  res.status(200).json({
    success: true,
    data: urls,
    pagination: result.pagination,
  });
});

/**
 * @route   GET /api/urls/:id
 * @access  Private
 */
export const getUrlById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const url = await urlService.getUrlById(req.params.id, req.user!._id.toString());

  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

  res.status(200).json({
    success: true,
    data: {
      ...url.toObject(),
      shortUrl: `${baseUrl}/${url.shortCode}`,
    },
  });
});

/**
 * @route   PATCH /api/urls/:id
 * @access  Private
 */
export const updateUrl = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { originalUrl, title, isActive, expiresAt } = req.body;

  const url = await urlService.updateUrl(req.params.id, req.user!._id.toString(), {
    originalUrl,
    title,
    isActive,
    expiresAt,
  });

  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

  res.status(200).json({
    success: true,
    message: 'Short URL updated successfully.',
    data: {
      ...url.toObject(),
      shortUrl: `${baseUrl}/${url.shortCode}`,
    },
  });
});

/**
 * @route   DELETE /api/urls/:id
 * @access  Private
 */
export const deleteUrl = asyncHandler(async (req: AuthRequest, res: Response) => {
  await urlService.deleteUrl(req.params.id, req.user!._id.toString());

  res.status(200).json({
    success: true,
    message: 'Short URL deleted successfully.',
  });
});

/**
 * @route   GET /api/urls/:id/qrcode
 * @access  Private
 * Returns a base64 PNG data URL of the QR code for the short link.
 */
export const getQrCode = asyncHandler(async (req: AuthRequest, res: Response) => {
  const url = await urlService.getUrlById(req.params.id, req.user!._id.toString());

  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  const shortUrl = `${baseUrl}/${url.shortCode}`;

  const qrCode = await urlService.generateQrCode(shortUrl);

  res.status(200).json({
    success: true,
    data: { qrCode, shortUrl },
  });
});

/**
 * @route   GET /:shortCode
 * @access  Public
 * The actual redirect endpoint. Not under /api - lives at root so
 * shortened URLs are as short as possible (e.g., shortlink.pro/aB3xY9z).
 */
export const redirectToOriginal = asyncHandler(async (req: Request, res: Response) => {
  const { shortCode } = req.params;

  const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;

  const originalUrl = await urlService.resolveAndTrack(shortCode, {
    ipAddress,
    userAgent: req.headers['user-agent'],
    referrer: req.headers['referer'] || req.headers['referrer'],
  } as any);

  res.redirect(originalUrl);
});
