import Booking from '../models/Booking.js';
import Property from '../models/Property.js';
import ApiError from '../utils/ApiError.js';
import { ACTIVE_BOOKING_STATUSES, BOOKING_STATUS, PAYMENT_STATUS } from '../constants/bookingStatus.js';
import { ROLES } from '../constants/roles.js';
import { calculateNights, isFutureDate } from '../utils/dateUtils.js';
import { processPayment, calculateTotalWithTax } from './paymentService.js';
import { createBookingNotification } from './notificationService.js';

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const checkAvailability = async (
  propertyId,
  checkInDate,
  checkOutDate,
  excludeBookingId = null
) => {
  const checkIn = normalizeDate(checkInDate);
  const checkOut = normalizeDate(checkOutDate);

  const query = {
    propertyId,
    bookingStatus: { $in: ACTIVE_BOOKING_STATUSES },
    checkInDate: { $lt: checkOut },
    checkOutDate: { $gt: checkIn },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const overlapping = await Booking.findOne(query);
  if (overlapping) return false;

  const property = await Property.findById(propertyId).select('blockedDates').lean();
  if (property && property.blockedDates && property.blockedDates.length > 0) {
    const hasOverlap = property.blockedDates.some((range) => {
      const blockedStart = normalizeDate(range.checkInDate);
      const blockedEnd = normalizeDate(range.checkOutDate);
      return checkIn < blockedEnd && checkOut > blockedStart;
    });
    if (hasOverlap) return false;
  }

  return true;
};

export const createBooking = async (userId, { propertyId, checkInDate, checkOutDate }) => {
  const checkIn = normalizeDate(checkInDate);
  const checkOut = normalizeDate(checkOutDate);

  if (checkOut <= checkIn) {
    throw new ApiError(400, 'Check-out date must be after check-in date');
  }

  if (!isFutureDate(checkIn)) {
    throw new ApiError(400, 'Check-in date must be today or in the future');
  }

  const property = await Property.findById(propertyId);

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  const nights = calculateNights(checkIn, checkOut);

  if (nights < 1) {
    throw new ApiError(400, 'Booking must be at least one night');
  }

  const isAvailable = await checkAvailability(propertyId, checkIn, checkOut);

  if (!isAvailable) {
    throw new ApiError(409, 'Property is not available for the selected dates');
  }

  const totalPrice = property.pricePerNight * nights;

  const booking = await Booking.create({
    userId,
    propertyId,
    checkInDate: checkIn,
    checkOutDate: checkOut,
    totalPrice,
    bookingStatus: BOOKING_STATUS.PENDING,
  });

  await booking.populate('propertyId', 'title location state images pricePerNight');

  return { booking, nights };
};

// ── Payment-based booking flow ─────────────────────────────────────────────

export const initiateBookingPayment = async (
  userId,
  { propertyId, checkInDate, checkOutDate, paymentMethod }
) => {
  const checkIn = normalizeDate(checkInDate);
  const checkOut = normalizeDate(checkOutDate);

  // Validate dates
  if (checkOut <= checkIn) {
    throw new ApiError(400, 'Check-out date must be after check-in date');
  }

  if (!isFutureDate(checkIn)) {
    throw new ApiError(400, 'Check-in date must be today or in the future');
  }

  // Fetch property
  const property = await Property.findById(propertyId);
  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  const nights = calculateNights(checkIn, checkOut);
  if (nights < 1) {
    throw new ApiError(400, 'Booking must be at least one night');
  }

  // Check availability (prevents double booking)
  const isAvailable = await checkAvailability(propertyId, checkIn, checkOut);
  if (!isAvailable) {
    throw new ApiError(409, 'This property is unavailable for the selected dates.');
  }

  // Calculate price server-side (never trust frontend)
  const subtotal = property.pricePerNight * nights;
  const { taxAmount, total } = calculateTotalWithTax(subtotal);

  // Simulate payment
  const paymentResult = await processPayment(total, paymentMethod);

  if (!paymentResult.success) {
    // Payment failed — do NOT create booking, do NOT block dates
    return {
      success: false,
      paymentStatus: PAYMENT_STATUS.FAILED,
      message: 'Payment failed. Your payment could not be processed. Please try again.',
    };
  }

  // Payment succeeded — create booking with confirmed status
  const booking = await Booking.create({
    userId,
    propertyId,
    checkInDate: checkIn,
    checkOutDate: checkOut,
    totalPrice: total,
    bookingStatus: BOOKING_STATUS.CONFIRMED,
    transactionId: paymentResult.transactionId,
    paymentStatus: PAYMENT_STATUS.PAID,
    paymentMethod,
    amountPaid: total,
    taxAmount,
    paymentDate: new Date(),
  });

  // Block the dates on the property so other travellers can't book them
  await Property.findByIdAndUpdate(propertyId, {
    $push: {
      blockedDates: { checkInDate: checkIn, checkOutDate: checkOut },
    },
  });

  // Populate for response
  await booking.populate('propertyId', 'title location state images pricePerNight');

  // Fetch user for notification (userId is an ObjectId here)
  const User = (await import('../models/User.js')).default;
  const traveller = await User.findById(userId).select('fullName email').lean();

  // Notify the host
  try {
    await createBookingNotification(booking, property, traveller);
  } catch (notifErr) {
    // Notification failure should not break the booking flow
    console.error('Failed to create booking notification:', notifErr.message);
  }

  return {
    success: true,
    paymentStatus: PAYMENT_STATUS.PAID,
    booking: {
      _id: booking._id,
      propertyId: booking.propertyId,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      totalPrice: booking.totalPrice,
      taxAmount: booking.taxAmount,
      bookingStatus: booking.bookingStatus,
      transactionId: booking.transactionId,
      paymentStatus: booking.paymentStatus,
      paymentMethod: booking.paymentMethod,
      amountPaid: booking.amountPaid,
      paymentDate: booking.paymentDate,
    },
    nights,
    pricePerNight: property.pricePerNight,
  };
};

// ── Existing booking operations ────────────────────────────────────────────

export const getUserBookings = async (userId) => {
  const bookings = await Booking.find({ userId })
    .populate('propertyId', 'title location state images pricePerNight category')
    .sort({ createdAt: -1 })
    .lean();

  return bookings;
};

export const getAdminBookings = async (hostId) => {
  const hostProperties = await Property.find({ ownerId: hostId }).select('_id').lean();
  const hostPropertyIds = hostProperties.map((p) => p._id);

  const bookings = await Booking.find({ propertyId: { $in: hostPropertyIds } })
    .populate('userId', 'fullName email')
    .populate('propertyId', 'title location state pricePerNight')
    .sort({ createdAt: -1 })
    .lean();

  return bookings;
};

export const getBookingById = async (id) => {
  const booking = await Booking.findById(id)
    .populate('userId', 'fullName email')
    .populate('propertyId', 'title location state images pricePerNight');

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  return booking;
};

export const updateBookingStatus = async (id, status, requester) => {
  const booking = await getBookingById(id);
  const property = await Property.findById(booking.propertyId._id || booking.propertyId);
  const isPropertyOwner = property && property.ownerId.toString() === requester._id.toString();

  const isOwner =
    booking.userId._id?.toString() === requester._id.toString() ||
    booking.userId.toString() === requester._id.toString();

  if (!isPropertyOwner && !isOwner) {
    throw new ApiError(403, 'You do not have permission to update this booking');
  }

  if (requester.role === ROLES.USER) {
    if (status !== BOOKING_STATUS.CANCELLED) {
      throw new ApiError(403, 'You can only cancel your own bookings');
    }

    if ([BOOKING_STATUS.CANCELLED, BOOKING_STATUS.COMPLETED].includes(booking.bookingStatus)) {
      throw new ApiError(400, `Cannot cancel a ${booking.bookingStatus} booking`);
    }
  }

  if (isPropertyOwner && status === BOOKING_STATUS.CONFIRMED) {
    const isAvailable = await checkAvailability(
      booking.propertyId._id || booking.propertyId,
      booking.checkInDate,
      booking.checkOutDate,
      booking._id
    );

    if (!isAvailable) {
      throw new ApiError(
        409,
        'Cannot confirm — property has conflicting reservations for these dates'
      );
    }
  }

  booking.bookingStatus = status;
  await booking.save();

  return booking;
};

export const cancelBooking = async (id, requester) => {
  return updateBookingStatus(id, BOOKING_STATUS.CANCELLED, requester);
};

export const checkPropertyAvailability = async (propertyId, checkInDate, checkOutDate) => {
  const property = await Property.findById(propertyId);

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  const checkIn = normalizeDate(checkInDate);
  const checkOut = normalizeDate(checkOutDate);

  if (checkOut <= checkIn) {
    throw new ApiError(400, 'Check-out date must be after check-in date');
  }

  const available = await checkAvailability(propertyId, checkIn, checkOut);
  const nights = calculateNights(checkIn, checkOut);
  const subtotal = property.pricePerNight * nights;
  const { taxAmount, total } = calculateTotalWithTax(subtotal);

  return {
    available,
    nights,
    totalPrice: total,
    subtotal,
    taxAmount,
    pricePerNight: property.pricePerNight,
  };
};
