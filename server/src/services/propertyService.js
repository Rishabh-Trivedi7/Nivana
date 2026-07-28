import Property from '../models/Property.js';
import Booking from '../models/Booking.js';
import ApiError from '../utils/ApiError.js';
import { ACTIVE_BOOKING_STATUSES } from '../constants/bookingStatus.js';

const SORT_MAP = {
  price_asc: { pricePerNight: 1 },
  price_desc: { pricePerNight: -1 },
  rating_desc: { averageRating: -1 },
  newest: { createdAt: -1 },
};

export const getProperties = async (query = {}) => {
  const {
    search,
    state,
    category,
    sort = 'newest',
    featured,
    page = 1,
    limit = 12,
    ownerId,
  } = query;

  const filter = {};

  if (ownerId) {
    filter.ownerId = ownerId;
  }

  if (search) {
    filter.$text = { $search: search };
  }

  if (state) {
    filter.state = { $regex: new RegExp(`^${state}$`, 'i') };
  }

  if (category) {
    filter.category = category;
  }

  if (featured === 'true') {
    filter.featured = true;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * limitNum;

  const sortOption = SORT_MAP[sort] || SORT_MAP.newest;

  const [properties, total] = await Promise.all([
    Property.find(filter).sort(sortOption).skip(skip).limit(limitNum).lean(),
    Property.countDocuments(filter),
  ]);

  return {
    properties,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum) || 1,
    },
  };
};

export const getPropertyById = async (id) => {
  const property = await Property.findById(id).lean();

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  // Check if this property is currently occupied (active booking overlapping today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const activeBookingToday = await Booking.findOne({
    propertyId: property._id,
    bookingStatus: { $in: ACTIVE_BOOKING_STATUSES },
    checkInDate: { $lt: tomorrow },
    checkOutDate: { $gt: today },
  }).lean();

  return {
    ...property,
    isCurrentlyBooked: !!activeBookingToday,
    activeBookingCheckOut: activeBookingToday?.checkOutDate || null,
  };
};

export const createProperty = async (data) => {
  const property = await Property.create(data);
  return property;
};

export const updateProperty = async (id, data) => {
  const property = await Property.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  return property;
};

export const deleteProperty = async (id) => {
  const property = await Property.findByIdAndDelete(id);

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  return property;
};

export const getRegionCounts = async () => {
  const counts = await Property.aggregate([
    {
      $group: {
        _id: { $toLower: '$state' },
        count: { $sum: 1 },
      },
    },
  ]);

  const map = {};
  counts.forEach((item) => {
    if (item._id) {
      map[item._id] = item.count;
    }
  });

  return map;
};

