import { verifyToken } from '../utils/generateToken.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import { AUTH_COOKIE_NAME } from '../config/cookie.js';

const authenticate = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    throw new ApiError(401, 'Authentication required');
  }

  let decoded;

  try {
    decoded = verifyToken(token);
  } catch {
    throw new ApiError(401, 'Invalid or expired session');
  }

  const user = await User.findById(decoded.id).select('+password');

  if (!user) {
    throw new ApiError(401, 'User no longer exists');
  }

  if (decoded.tokenVersion !== user.tokenVersion) {
    throw new ApiError(401, 'Session has been invalidated. Please log in again.');
  }

  req.user = user;
  next();
});

export default authenticate;
