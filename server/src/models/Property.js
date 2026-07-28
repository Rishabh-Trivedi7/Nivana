import mongoose from 'mongoose';
import { PROPERTY_CATEGORIES } from '../constants/propertyCategories.js';

const propertySchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 150,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: PROPERTY_CATEGORIES,
      required: [true, 'Category is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 5000,
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: 0,
    },
    amenities: [{ type: String, trim: true }],
    images: [{ type: String }],
    featured: {
      type: Boolean,
      default: false,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    blockedDates: [
      {
        checkInDate: { type: Date, required: true },
        checkOutDate: { type: Date, required: true },
      },
    ],
  },
  { timestamps: true }
);

propertySchema.index({ category: 1, state: 1 });
propertySchema.index({ featured: 1 });
propertySchema.index({ pricePerNight: 1 });
propertySchema.index({ averageRating: -1 });
propertySchema.index({ title: 'text', location: 'text', description: 'text' });

const Property = mongoose.model('Property', propertySchema);

export default Property;
