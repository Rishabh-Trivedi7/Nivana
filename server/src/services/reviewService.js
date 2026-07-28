import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Property from '../models/Property.js';
import ApiError from '../utils/ApiError.js';
import { BOOKING_STATUS } from '../constants/bookingStatus.js';
import { ROLES } from '../constants/roles.js';

const recalculatePropertyRating = async (propertyId) => {
  const reviews = await Review.find({ propertyId });
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? Math.round(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10
        ) / 10
      : 0;

  await Property.findByIdAndUpdate(propertyId, { averageRating, totalReviews });
};

const assertCompletedBooking = async (userId, propertyId) => {
  const booking = await Booking.findOne({
    userId,
    propertyId,
    bookingStatus: BOOKING_STATUS.COMPLETED,
  });

  if (!booking) {
    throw new ApiError(
      403,
      'You can only review properties after completing a stay'
    );
  }
};

const buildRatingBreakdown = (reviews) => {
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  reviews.forEach((review) => {
    breakdown[review.rating] = (breakdown[review.rating] || 0) + 1;
  });

  return breakdown;
};

export const createReview = async (userId, { propertyId, rating, comment }) => {
  const property = await Property.findById(propertyId);

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  await assertCompletedBooking(userId, propertyId);

  const existing = await Review.findOne({ userId, propertyId });

  if (existing) {
    throw new ApiError(409, 'You have already reviewed this property');
  }

  const review = await Review.create({ userId, propertyId, rating, comment });
  await recalculatePropertyRating(propertyId);

  await review.populate('userId', 'fullName');

  return review;
};

export const getPropertyReviews = async (propertyId) => {
  const property = await Property.findById(propertyId);

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  const reviews = await Review.find({ propertyId })
    .populate('userId', 'fullName')
    .sort({ createdAt: -1 })
    .lean();

  return {
    reviews,
    summary: {
      averageRating: property.averageRating,
      totalReviews: property.totalReviews,
      breakdown: buildRatingBreakdown(reviews),
    },
  };
};

export const updateReview = async (reviewId, userId, { rating, comment }) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  if (review.userId.toString() !== userId.toString()) {
    throw new ApiError(403, 'You can only edit your own reviews');
  }

  if (rating === undefined && comment === undefined) {
    throw new ApiError(400, 'At least one field must be provided to update');
  }

  if (rating !== undefined) review.rating = rating;
  if (comment !== undefined) review.comment = comment;

  await review.save();
  await recalculatePropertyRating(review.propertyId);
  await review.populate('userId', 'fullName');

  return review;
};

export const deleteReview = async (reviewId, requester) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  const isOwner = review.userId.toString() === requester._id.toString();
  const isAdmin = requester.role === ROLES.ADMIN;

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You do not have permission to delete this review');
  }

  const { propertyId } = review;
  await review.deleteOne();
  await recalculatePropertyRating(propertyId);

  return review;
};

export const getHostReviews = async (hostId) => {
  const hostProperties = await Property.find({ ownerId: hostId }).select('_id').lean();
  const hostPropertyIds = hostProperties.map((p) => p._id);

  const reviews = await Review.find({ propertyId: { $in: hostPropertyIds } })
    .populate('userId', 'fullName email')
    .populate('propertyId', 'title location state')
    .sort({ createdAt: -1 })
    .lean();

  return reviews;
};
