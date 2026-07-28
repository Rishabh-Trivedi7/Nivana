import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getRegionCounts,
} from '../services/propertyService.js';
import { uploadImages } from '../services/cloudinaryService.js';

export const listProperties = asyncHandler(async (req, res) => {
  const result = await getProperties(req.query);

  res
    .status(200)
    .json(new ApiResponse(200, result, 'Properties fetched successfully'));
});

export const getRegionCountsHandler = asyncHandler(async (_req, res) => {
  const counts = await getRegionCounts();

  res
    .status(200)
    .json(new ApiResponse(200, counts, 'Region counts fetched successfully'));
});

export const getProperty = asyncHandler(async (req, res) => {
  const property = await getPropertyById(req.params.id);

  res
    .status(200)
    .json(new ApiResponse(200, { property }, 'Property fetched successfully'));
});

export const createPropertyHandler = asyncHandler(async (req, res) => {
  const property = await createProperty({ ...req.body, ownerId: req.user._id });

  res
    .status(201)
    .json(new ApiResponse(201, { property }, 'Property created successfully'));
});

export const updatePropertyHandler = asyncHandler(async (req, res) => {
  const property = await getPropertyById(req.params.id);
  if (property.ownerId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You do not have permission to update this property');
  }

  const updated = await updateProperty(req.params.id, req.body);

  res
    .status(200)
    .json(new ApiResponse(200, { property: updated }, 'Property updated successfully'));
});

export const deletePropertyHandler = asyncHandler(async (req, res) => {
  const property = await getPropertyById(req.params.id);
  if (property.ownerId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You do not have permission to delete this property');
  }

  await deleteProperty(req.params.id);

  res
    .status(200)
    .json(new ApiResponse(200, null, 'Property deleted successfully'));
});

export const uploadPropertyImages = asyncHandler(async (req, res) => {
  const uploaded = await uploadImages(req.files);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { images: uploaded.map((img) => img.url) },
        'Images uploaded successfully'
      )
    );
});
