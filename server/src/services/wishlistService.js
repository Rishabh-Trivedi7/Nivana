import User from '../models/User.js';
import Property from '../models/Property.js';
import ApiError from '../utils/ApiError.js';

export const addToWishlist = async (userId, propertyId) => {
  const property = await Property.findById(propertyId);

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const alreadySaved = user.wishlist.some(
    (id) => id.toString() === propertyId.toString()
  );

  if (alreadySaved) {
    throw new ApiError(409, 'Property is already in your wishlist');
  }

  user.wishlist.push(propertyId);
  await user.save();

  await user.populate({
    path: 'wishlist',
    select: 'title location state category pricePerNight images averageRating featured',
  });

  return user.wishlist;
};

export const removeFromWishlist = async (userId, propertyId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const index = user.wishlist.findIndex(
    (id) => id.toString() === propertyId.toString()
  );

  if (index === -1) {
    throw new ApiError(404, 'Property not found in wishlist');
  }

  user.wishlist.splice(index, 1);
  await user.save();

  await user.populate({
    path: 'wishlist',
    select: 'title location state category pricePerNight images averageRating featured',
  });

  return user.wishlist;
};

export const getWishlist = async (userId) => {
  const user = await User.findById(userId).populate({
    path: 'wishlist',
    select: 'title location state category pricePerNight images averageRating featured',
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user.wishlist;
};
