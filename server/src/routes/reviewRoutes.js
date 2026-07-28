import { Router } from 'express';
import {
  createReviewHandler,
  getPropertyReviewsHandler,
  updateReviewHandler,
  deleteReviewHandler,
  getHostReviewsHandler,
} from '../controllers/reviewController.js';
import authenticate from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';
import validate from '../middleware/validateMiddleware.js';
import { ROLES } from '../constants/roles.js';
import {
  createReviewValidation,
  updateReviewValidation,
  propertyIdParamValidation,
  reviewIdValidation,
} from '../validators/reviewValidators.js';

const router = Router();

router.get(
  '/host/all',
  authenticate,
  authorize(ROLES.ADMIN),
  getHostReviewsHandler
);

router.get(
  '/:propertyId',
  propertyIdParamValidation,
  validate,
  getPropertyReviewsHandler
);

router.post('/', authenticate, createReviewValidation, validate, createReviewHandler);

router.put(
  '/:id',
  authenticate,
  updateReviewValidation,
  validate,
  updateReviewHandler
);

router.delete(
  '/:id',
  authenticate,
  reviewIdValidation,
  validate,
  deleteReviewHandler
);

export default router;
