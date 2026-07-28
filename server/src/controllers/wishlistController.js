import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from '../services/wishlistService.js';

export const addToWishlistHandler = asyncHandler(async (req, res) => {
  const wishlist = await addToWishlist(req.user._id, req.body.propertyId);

  res
    .status(200)
    .json(new ApiResponse(200, { wishlist }, 'Property added to wishlist'));
});

export const removeFromWishlistHandler = asyncHandler(async (req, res) => {
  const wishlist = await removeFromWishlist(req.user._id, req.params.propertyId);

  res
    .status(200)
    .json(new ApiResponse(200, { wishlist }, 'Property removed from wishlist'));
});

export const getWishlistHandler = asyncHandler(async (req, res) => {
  const wishlist = await getWishlist(req.user._id);

  res
    .status(200)
    .json(new ApiResponse(200, { wishlist }, 'Wishlist fetched successfully'));
});
