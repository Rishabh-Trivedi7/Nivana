import { Router } from 'express';
import {
  listProperties,
  getProperty,
  createPropertyHandler,
  updatePropertyHandler,
  deletePropertyHandler,
  uploadPropertyImages,
  getRegionCountsHandler,
} from '../controllers/propertyController.js';
import authenticate from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';
import validate from '../middleware/validateMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { ROLES } from '../constants/roles.js';
import {
  createPropertyValidation,
  updatePropertyValidation,
  propertyIdValidation,
  listPropertiesValidation,
} from '../validators/propertyValidators.js';

const router = Router();

router.get('/', listPropertiesValidation, validate, listProperties);
router.get('/region-counts', getRegionCountsHandler);
router.get('/:id', propertyIdValidation, validate, getProperty);

router.post(
  '/upload-images',
  authenticate,
  authorize(ROLES.ADMIN),
  upload.array('images', 10),
  uploadPropertyImages
);

router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  createPropertyValidation,
  validate,
  createPropertyHandler
);

router.put(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  updatePropertyValidation,
  validate,
  updatePropertyHandler
);

router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  propertyIdValidation,
  validate,
  deletePropertyHandler
);

export default router;
