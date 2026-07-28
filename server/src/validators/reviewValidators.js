import { body, param } from 'express-validator';

export const createReviewValidation = [
  body('propertyId').isMongoId().withMessage('Invalid property ID'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Comment is required')
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),
];

export const updateReviewValidation = [
  param('id').isMongoId().withMessage('Invalid review ID'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Comment cannot be empty')
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),
];

export const propertyIdParamValidation = [
  param('propertyId').isMongoId().withMessage('Invalid property ID'),
];

export const reviewIdValidation = [
  param('id').isMongoId().withMessage('Invalid review ID'),
];
