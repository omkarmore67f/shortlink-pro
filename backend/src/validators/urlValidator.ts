import { body, param, query } from 'express-validator';

export const createUrlValidator = [
  body('originalUrl')
    .trim()
    .notEmpty()
    .withMessage('Original URL is required')
    .isURL({ require_protocol: true })
    .withMessage('Please provide a valid URL including http:// or https://'),

  body('customAlias')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Custom alias must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9-_]+$/)
    .withMessage('Custom alias can only contain letters, numbers, hyphens and underscores'),

  body('title')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),

  body('expiresAt')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Expiration date must be a valid date'),
];

export const updateUrlValidator = [
  param('id').isMongoId().withMessage('Invalid URL id'),

  body('originalUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ require_protocol: true })
    .withMessage('Please provide a valid URL including http:// or https://'),

  body('title')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),

  body('isActive').optional().isBoolean().withMessage('isActive must be true or false'),

  body('expiresAt')
    .optional({ checkFalsy: true, nullable: true })
    .isISO8601()
    .withMessage('Expiration date must be a valid date'),
];

export const mongoIdValidator = [param('id').isMongoId().withMessage('Invalid id')];

export const listUrlsQueryValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'totalClicks', 'title'])
    .withMessage('sortBy must be one of: createdAt, totalClicks, title'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('order must be asc or desc'),
];
