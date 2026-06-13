import { Router } from 'express';
import {
  createUrl,
  getUrls,
  getUrlById,
  updateUrl,
  deleteUrl,
  getQrCode,
} from '../controllers/urlController';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import {
  createUrlValidator,
  updateUrlValidator,
  mongoIdValidator,
  listUrlsQueryValidator,
} from '../validators/urlValidator';

const router = Router();

// All routes below require authentication
router.use(protect);

router.post('/', createUrlValidator, validateRequest, createUrl);
router.get('/', listUrlsQueryValidator, validateRequest, getUrls);
router.get('/:id', mongoIdValidator, validateRequest, getUrlById);
router.patch('/:id', updateUrlValidator, validateRequest, updateUrl);
router.delete('/:id', mongoIdValidator, validateRequest, deleteUrl);
router.get('/:id/qrcode', mongoIdValidator, validateRequest, getQrCode);

export default router;
