import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getDashboardStats } from '../services/adminService.js';
import User from '../models/User.js';

export const getStats = asyncHandler(async (req, res) => {
  const stats = await getDashboardStats(req.user._id);

  res
    .status(200)
    .json(new ApiResponse(200, stats, 'Dashboard stats fetched successfully'));
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 }).lean();
  res.status(200).json(new ApiResponse(200, { users }, 'Users fetched successfully'));
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    throw new ApiError(400, 'Invalid role. Must be "user" or "admin"');
  }

  if (id === req.user._id.toString()) {
    throw new ApiError(403, 'You cannot change your own role');
  }

  const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
  if (!user) throw new ApiError(404, 'User not found');

  res.status(200).json(new ApiResponse(200, { user }, 'User role updated successfully'));
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (id === req.user._id.toString()) {
    throw new ApiError(403, 'You cannot delete your own account');
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) throw new ApiError(404, 'User not found');

  res.status(200).json(new ApiResponse(200, null, 'User deleted successfully'));
});
