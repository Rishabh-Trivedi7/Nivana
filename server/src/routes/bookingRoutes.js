import { Router } from 'express';
import { query } from 'express-validator';
import {
  createBookingHandler,
  getUserBookingsHandler,
  getAdminBookingsHandler,
  updateBookingHandler,
  cancelBookingHandler,
  checkAvailabilityHandler,
  initiateBookingPaymentHandler,
} from '../controllers/bookingController.js';
import authenticate from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';
import validate from '../middleware/validateMiddleware.js';
import { ROLES } from '../constants/roles.js';
import {
  createBookingValidation,
  bookingIdValidation,
  updateBookingValidation,
  initiatePaymentValidation,
} from '../validators/bookingValidators.js';

const router = Router();

router.get(
  '/availability/:propertyId',
  query('checkInDate').notEmpty().isISO8601().withMessage('Valid check-in date required'),
  query('checkOutDate').notEmpty().isISO8601().withMessage('Valid check-out date required'),
  validate,
  checkAvailabilityHandler
);

router.post('/', authenticate, createBookingValidation, validate, createBookingHandler);
router.post(
  '/initiate-payment',
  authenticate,
  initiatePaymentValidation,
  validate,
  initiateBookingPaymentHandler
);
router.get('/user', authenticate, getUserBookingsHandler);
router.get('/admin', authenticate, authorize(ROLES.ADMIN), getAdminBookingsHandler);

router.put(
  '/:id',
  authenticate,
  updateBookingValidation,
  validate,
  updateBookingHandler
);

router.delete(
  '/:id',
  authenticate,
  bookingIdValidation,
  validate,
  cancelBookingHandler
);

export default router;
