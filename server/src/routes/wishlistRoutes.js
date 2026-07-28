import { Router } from 'express';
import {
  addToWishlistHandler,
  removeFromWishlistHandler,
  getWishlistHandler,
} from '../controllers/wishlistController.js';
import authenticate from '../middleware/authMiddleware.js';
import validate from '../middleware/validateMiddleware.js';
import {
  addWishlistValidation,
  wishlistPropertyIdValidation,
} from '../validators/wishlistValidators.js';

const router = Router();

router.use(authenticate);

router.get('/', getWishlistHandler);
router.post('/', addWishlistValidation, validate, addToWishlistHandler);
router.delete(
  '/:propertyId',
  wishlistPropertyIdValidation,
  validate,
  removeFromWishlistHandler
);

export default router;
