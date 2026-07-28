import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  createBooking,
  getUserBookings,
  getAdminBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  checkPropertyAvailability,
  initiateBookingPayment,
} from '../services/bookingService.js';

export const createBookingHandler = asyncHandler(async (req, res) => {
  const { booking, nights } = await createBooking(req.user._id, req.body);

  res.status(201).json(
    new ApiResponse(
      201,
      {
        booking: {
          _id: booking._id,
          propertyId: booking.propertyId,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          totalPrice: booking.totalPrice,
          bookingStatus: booking.bookingStatus,
          nights,
        },
      },
      'Booking request submitted — awaiting admin confirmation'
    )
  );
});

export const getUserBookingsHandler = asyncHandler(async (req, res) => {
  const bookings = await getUserBookings(req.user._id);

  res
    .status(200)
    .json(new ApiResponse(200, { bookings }, 'Bookings fetched successfully'));
});

export const getAdminBookingsHandler = asyncHandler(async (req, res) => {
  const bookings = await getAdminBookings(req.user._id);

  res
    .status(200)
    .json(new ApiResponse(200, { bookings }, 'All bookings fetched successfully'));
});

export const getBookingHandler = asyncHandler(async (req, res) => {
  const booking = await getBookingById(req.params.id);

  res
    .status(200)
    .json(new ApiResponse(200, { booking }, 'Booking fetched successfully'));
});

export const updateBookingHandler = asyncHandler(async (req, res) => {
  const booking = await updateBookingStatus(
    req.params.id,
    req.body.bookingStatus,
    req.user
  );

  res
    .status(200)
    .json(new ApiResponse(200, { booking }, 'Booking updated successfully'));
});

export const cancelBookingHandler = asyncHandler(async (req, res) => {
  const booking = await cancelBooking(req.params.id, req.user);

  res
    .status(200)
    .json(new ApiResponse(200, { booking }, 'Booking cancelled successfully'));
});

export const checkAvailabilityHandler = asyncHandler(async (req, res) => {
  const { checkInDate, checkOutDate } = req.query;

  const result = await checkPropertyAvailability(
    req.params.propertyId,
    checkInDate,
    checkOutDate
  );

  res
    .status(200)
    .json(new ApiResponse(200, result, 'Availability checked'));
});

export const initiateBookingPaymentHandler = asyncHandler(async (req, res) => {
  const result = await initiateBookingPayment(req.user._id, req.body);

  if (!result.success) {
    return res.status(402).json(
      new ApiResponse(402, result, result.message)
    );
  }

  return res.status(201).json(
    new ApiResponse(201, result, 'Payment successful and booking confirmed')
  );
});

