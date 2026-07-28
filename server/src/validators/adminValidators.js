import { body, param } from 'express-validator';
import { ROLE_VALUES } from '../constants/roles.js';

export const userIdValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
];

export const updateRoleValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(ROLE_VALUES)
    .withMessage('Invalid role'),
];
