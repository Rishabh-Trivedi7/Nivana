import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  createReview,
  getPropertyReviews,
  updateReview,
  deleteReview,
  getHostReviews,
} from '../services/reviewService.js';

export const createReviewHandler = asyncHandler(async (req, res) => {
  const review = await createReview(req.user._id, req.body);

  res
    .status(201)
    .json(new ApiResponse(201, { review }, 'Review submitted successfully'));
});

export const getPropertyReviewsHandler = asyncHandler(async (req, res) => {
  const result = await getPropertyReviews(req.params.propertyId);

  res
    .status(200)
    .json(new ApiResponse(200, result, 'Reviews fetched successfully'));
});

export const getHostReviewsHandler = asyncHandler(async (req, res) => {
  const reviews = await getHostReviews(req.user._id);

  res
    .status(200)
    .json(new ApiResponse(200, reviews, 'Host reviews fetched successfully'));
});

export const updateReviewHandler = asyncHandler(async (req, res) => {
  const review = await updateReview(req.params.id, req.user._id, req.body);

  res
    .status(200)
    .json(new ApiResponse(200, { review }, 'Review updated successfully'));
});

export const deleteReviewHandler = asyncHandler(async (req, res) => {
  await deleteReview(req.params.id, req.user);

  res
    .status(200)
    .json(new ApiResponse(200, null, 'Review deleted successfully'));
});
