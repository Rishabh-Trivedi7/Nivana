import mongoose from 'mongoose';
import {
  BOOKING_STATUS,
  BOOKING_STATUS_VALUES,
  PAYMENT_STATUS,
  PAYMENT_STATUS_VALUES,
  PAYMENT_METHOD_VALUES,
} from '../constants/bookingStatus.js';

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    checkInDate: {
      type: Date,
      required: [true, 'Check-in date is required'],
    },
    checkOutDate: {
      type: Date,
      required: [true, 'Check-out date is required'],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    bookingStatus: {
      type: String,
      enum: BOOKING_STATUS_VALUES,
      default: BOOKING_STATUS.PENDING,
    },

    // ── Payment fields ───────────────────────────────────────────────────────
    transactionId: {
      type: String,
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS_VALUES,
      default: PAYMENT_STATUS.PENDING,
    },
    paymentMethod: {
      type: String,
      enum: [...PAYMENT_METHOD_VALUES, null],
      default: null,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ propertyId: 1, checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ userId: 1, createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
