import { body, param, query } from 'express-validator';
import { PROPERTY_CATEGORIES } from '../constants/propertyCategories.js';

export const createPropertyValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(PROPERTY_CATEGORIES)
    .withMessage('Invalid category'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('pricePerNight')
    .isFloat({ min: 0 })
    .withMessage('Price per night must be a positive number'),
  body('amenities').optional().isArray().withMessage('Amenities must be an array'),
  body('images').optional().isArray().withMessage('Images must be an array of URLs'),
  body('featured').optional().isBoolean().withMessage('Featured must be a boolean'),
];

export const updatePropertyValidation = [
  param('id').isMongoId().withMessage('Invalid property ID'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('location').optional().trim().notEmpty().withMessage('Location cannot be empty'),
  body('state').optional().trim().notEmpty().withMessage('State cannot be empty'),
  body('category')
    .optional()
    .isIn(PROPERTY_CATEGORIES)
    .withMessage('Invalid category'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('pricePerNight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price per night must be a positive number'),
  body('amenities').optional().isArray().withMessage('Amenities must be an array'),
  body('images').optional().isArray().withMessage('Images must be an array of URLs'),
  body('featured').optional().isBoolean().withMessage('Featured must be a boolean'),
  body('blockedDates').optional().isArray().withMessage('Blocked dates must be an array'),
  body('blockedDates.*.checkInDate').optional().isISO8601().withMessage('Invalid check-in date'),
  body('blockedDates.*.checkOutDate').optional().isISO8601().withMessage('Invalid check-out date'),
];

export const propertyIdValidation = [
  param('id').isMongoId().withMessage('Invalid property ID'),
];

export const listPropertiesValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be at least 1'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1–50'),
  query('sort')
    .optional()
    .isIn(['price_asc', 'price_desc', 'rating_desc', 'newest'])
    .withMessage('Invalid sort option'),
  query('category')
    .optional()
    .isIn(PROPERTY_CATEGORIES)
    .withMessage('Invalid category'),
  query('featured').optional().isIn(['true', 'false']).withMessage('Featured must be true or false'),
  query('state').optional().isString().trim(),
  query('search').optional().isString().trim(),
  query('ownerId').optional().isMongoId().withMessage('Invalid ownerId'),
];
