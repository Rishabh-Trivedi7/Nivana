import { body, param } from 'express-validator';
import { BOOKING_STATUS_VALUES, PAYMENT_METHOD_VALUES } from '../constants/bookingStatus.js';

export const createBookingValidation = [
  body('propertyId').isMongoId().withMessage('Invalid property ID'),
  body('checkInDate')
    .notEmpty()
    .withMessage('Check-in date is required')
    .isISO8601()
    .withMessage('Check-in date must be a valid date'),
  body('checkOutDate')
    .notEmpty()
    .withMessage('Check-out date is required')
    .isISO8601()
    .withMessage('Check-out date must be a valid date'),
];

export const initiatePaymentValidation = [
  body('propertyId').isMongoId().withMessage('Invalid property ID'),
  body('checkInDate')
    .notEmpty()
    .withMessage('Check-in date is required')
    .isISO8601()
    .withMessage('Check-in date must be a valid date'),
  body('checkOutDate')
    .notEmpty()
    .withMessage('Check-out date is required')
    .isISO8601()
    .withMessage('Check-out date must be a valid date'),
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(PAYMENT_METHOD_VALUES)
    .withMessage('Invalid payment method'),
];

export const bookingIdValidation = [
  param('id').isMongoId().withMessage('Invalid booking ID'),
];

export const updateBookingValidation = [
  param('id').isMongoId().withMessage('Invalid booking ID'),
  body('bookingStatus')
    .notEmpty()
    .withMessage('Booking status is required')
    .isIn(BOOKING_STATUS_VALUES)
    .withMessage('Invalid booking status'),
];

