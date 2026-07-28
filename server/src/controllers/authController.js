import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
} from '../services/authService.js';
import { uploadSingleImage } from '../services/cloudinaryService.js';
import { AUTH_COOKIE_NAME, COOKIE_OPTIONS } from '../config/cookie.js';

const setAuthCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_NAME, token, COOKIE_OPTIONS);
};

const clearAuthCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: COOKIE_OPTIONS.httpOnly,
    secure: COOKIE_OPTIONS.secure,
    sameSite: COOKIE_OPTIONS.sameSite,
    path: COOKIE_OPTIONS.path,
  });
};

export const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body;
  const { user, token } = await registerUser({ fullName, email, password, role });

  setAuthCookie(res, token);

  res
    .status(201)
    .json(
      new ApiResponse(201, { user: user.toPublicJSON() }, 'Registered successfully')
    );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await loginUser({ email, password });

  setAuthCookie(res, token);

  res
    .status(200)
    .json(new ApiResponse(200, { user: user.toPublicJSON() }, 'Logged in successfully'));
});

export const logout = asyncHandler(async (req, res) => {
  await logoutUser(req.user._id);
  clearAuthCookie(res);

  res
    .status(200)
    .json(new ApiResponse(200, null, 'Logged out successfully'));
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await getUserProfile(req.user._id);

  res
    .status(200)
    .json(new ApiResponse(200, { user: user.toPublicJSON() }, 'Profile fetched'));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, email, password, avatar, phone, bio } = req.body;
  const { user, token } = await updateUserProfile(req.user._id, {
    fullName,
    email,
    password,
    avatar,
    phone,
    bio,
  });

  if (token) {
    setAuthCookie(res, token);
  }

  res
    .status(200)
    .json(new ApiResponse(200, { user: user.toPublicJSON() }, 'Profile updated successfully'));
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  const result = await uploadSingleImage(req.file, 'nivana/avatars');
  const { user } = await updateUserProfile(req.user._id, { avatar: result.url });

  res.status(200).json(
    new ApiResponse(
      200,
      { avatarUrl: result.url, user: user.toPublicJSON() },
      'Profile image uploaded successfully'
    )
  );
});

