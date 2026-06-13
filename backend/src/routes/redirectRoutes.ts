import { Router } from 'express';
import { redirectToOriginal } from '../controllers/urlController';
import { redirectLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * Public redirect route - mounted at root ("/") in server.ts, NOT
 * under /api, so that short links are as short as possible:
 *   https://shortlink.pro/aB3xY9z   (not /api/r/aB3xY9z)
 */
router.get('/:shortCode', redirectLimiter, redirectToOriginal);

export default router;
