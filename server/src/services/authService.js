import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { generateToken } from '../utils/generateToken.js';

const buildTokenPayload = (user) => ({
  id: user._id.toString(),
  role: user.role,
  tokenVersion: user.tokenVersion,
});

export const registerUser = async ({ fullName, email, password, role = 'user' }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await User.create({ fullName, email, password, role });
  const token = generateToken(buildTokenPayload(user));

  return { user, token };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(buildTokenPayload(user));

  return { user, token };
};

export const logoutUser = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { tokenVersion: 1 } },
    { new: true }
  );

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).populate({
    path: 'wishlist',
    select: 'title location state category pricePerNight images averageRating featured',
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

export const updateUserProfile = async (
  userId,
  { fullName, email, password, avatar, phone, bio }
) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (email && email.toLowerCase() !== user.email.toLowerCase()) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(409, 'An account with this email already exists');
    }
    user.email = email;
  }

  if (fullName !== undefined) user.fullName = fullName;
  if (avatar !== undefined) user.avatar = avatar;
  if (phone !== undefined) user.phone = phone;
  if (bio !== undefined) user.bio = bio;

  let token = null;
  if (password) {
    user.password = password;
    user.tokenVersion += 1;
  }

  await user.save();

  if (password) {
    token = generateToken(buildTokenPayload(user));
  }

  const updatedUser = await getUserProfile(userId);
  return { user: updatedUser, token };
};
