import { body, param } from 'express-validator';

export const addWishlistValidation = [
  body('propertyId').isMongoId().withMessage('Invalid property ID'),
];

export const wishlistPropertyIdValidation = [
  param('propertyId').isMongoId().withMessage('Invalid property ID'),
];
