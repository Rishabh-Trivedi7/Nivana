import { Router } from 'express';
import {
  getNotificationsHandler,
  markAsReadHandler,
  markAllAsReadHandler,
} from '../controllers/notificationController.js';
import authenticate from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getNotificationsHandler);
router.put('/:id/read', markAsReadHandler);
router.put('/read-all', markAllAsReadHandler);

export default router;
