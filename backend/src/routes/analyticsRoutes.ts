import { Router } from 'express';
import {
  getSummary,
  getDailyClicks,
  getTopLinks,
  getRecentActivity,
  getDeviceBreakdown,
  getLinkAnalytics,
} from '../controllers/analyticsController';
import { protect } from '../middleware/authMiddleware';
import { mongoIdValidator } from '../validators/urlValidator';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.use(protect);

router.get('/summary', getSummary);
router.get('/daily-clicks', getDailyClicks);
router.get('/top-links', getTopLinks);
router.get('/recent-activity', getRecentActivity);
router.get('/devices', getDeviceBreakdown);
router.get('/links/:id', mongoIdValidator, validateRequest, getLinkAnalytics);

export default router;
