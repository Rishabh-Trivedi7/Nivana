import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';

/**
 * Create a notification for the host when a new booking is confirmed.
 */
export const createBookingNotification = async (booking, property, traveller) => {
  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  const notification = await Notification.create({
    recipientId: property.ownerId,
    type: 'NEW_BOOKING',
    title: 'New Booking Received',
    message: [
      `Traveller: ${traveller.fullName}`,
      `Property: ${property.title}`,
      `Check-in: ${formatDate(booking.checkInDate)}`,
      `Check-out: ${formatDate(booking.checkOutDate)}`,
      `Amount: ₹${booking.amountPaid.toLocaleString('en-IN')}`,
      `Status: Confirmed`,
    ].join('\n'),
    metadata: {
      bookingId: booking._id,
      propertyId: property._id,
      propertyTitle: property.title,
      travellerName: traveller.fullName,
      travellerEmail: traveller.email,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      amountPaid: booking.amountPaid,
      transactionId: booking.transactionId,
    },
  });

  return notification;
};

/**
 * Fetch all notifications for a user, sorted by newest first.
 */
export const getNotifications = async (userId) => {
  const notifications = await Notification.find({ recipientId: userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return notifications;
};

/**
 * Mark a single notification as read.
 */
export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipientId: userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  return notification;
};

/**
 * Mark all notifications as read for a user.
 */
export const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { recipientId: userId, isRead: false },
    { isRead: true }
  );
};

/**
 * Get count of unread notifications for a user.
 */
export const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ recipientId: userId, isRead: false });
};
