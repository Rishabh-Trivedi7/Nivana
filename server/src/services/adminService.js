import Property from '../models/Property.js';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../constants/bookingStatus.js';

const REVENUE_STATUSES = [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETED];

export const getDashboardStats = async (hostId) => {
  // Get all property IDs owned by this host
  const hostProperties = await Property.find({ ownerId: hostId }).select('_id').lean();
  const hostPropertyIds = hostProperties.map((p) => p._id);
  const now = new Date();

  const [
    totalProperties,
    totalBookings,
    revenueResult,
    recentBookings,
    topRatedProperties,
    recentPayments,
    upcomingGuests,
    unreadNotifications,
  ] = await Promise.all([
    Property.countDocuments({ ownerId: hostId }),
    Booking.countDocuments({ propertyId: { $in: hostPropertyIds } }),
    Booking.aggregate([
      {
        $match: {
          propertyId: { $in: hostPropertyIds },
          bookingStatus: { $in: REVENUE_STATUSES },
        },
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Booking.find({ propertyId: { $in: hostPropertyIds } })
      .populate('userId', 'fullName email')
      .populate('propertyId', 'title location')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Property.find({ ownerId: hostId, totalReviews: { $gt: 0 } })
      .sort({ averageRating: -1, totalReviews: -1 })
      .limit(5)
      .select('title location state averageRating totalReviews images pricePerNight')
      .lean(),
    Booking.find({
      propertyId: { $in: hostPropertyIds },
      paymentStatus: PAYMENT_STATUS.PAID,
    })
      .populate('userId', 'fullName email')
      .populate('propertyId', 'title')
      .sort({ paymentDate: -1, createdAt: -1 })
      .limit(5)
      .lean(),
    Booking.find({
      propertyId: { $in: hostPropertyIds },
      bookingStatus: BOOKING_STATUS.CONFIRMED,
      checkInDate: { $gte: now },
    })
      .populate('userId', 'fullName email')
      .populate('propertyId', 'title location')
      .sort({ checkInDate: 1 })
      .limit(5)
      .lean(),
    Notification.countDocuments({ recipientId: hostId, isRead: false }),
  ]);

  return {
    totalProperties,
    totalBookings,
    totalRevenue: revenueResult[0]?.total || 0,
    recentBookings,
    topRatedProperties,
    recentPayments,
    upcomingGuests,
    unreadNotifications,
  };
};
