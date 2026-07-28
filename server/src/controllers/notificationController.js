import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from '../services/notificationService.js';

export const getNotificationsHandler = asyncHandler(async (req, res) => {
  const notifications = await getNotifications(req.user._id);
  const unreadCount = await getUnreadCount(req.user._id);

  res.status(200).json(
    new ApiResponse(
      200,
      { notifications, unreadCount },
      'Notifications fetched successfully'
    )
  );
});

export const markAsReadHandler = asyncHandler(async (req, res) => {
  const notification = await markAsRead(req.params.id, req.user._id);

  res.status(200).json(
    new ApiResponse(200, { notification }, 'Notification marked as read')
  );
});

export const markAllAsReadHandler = asyncHandler(async (req, res) => {
  await markAllAsRead(req.user._id);

  res.status(200).json(
    new ApiResponse(200, null, 'All notifications marked as read')
  );
});
