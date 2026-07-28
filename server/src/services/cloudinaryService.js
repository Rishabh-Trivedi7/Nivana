import { Readable } from 'stream';
import { cloudinary } from '../config/cloudinary.js';
import ApiError from '../utils/ApiError.js';

const uploadFromBuffer = (buffer, folder = 'nivana/properties') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    Readable.from(buffer).pipe(stream);
  });

export const uploadImages = async (files) => {
  if (!files?.length) {
    throw new ApiError(400, 'No images provided');
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new ApiError(500, 'Image upload is not configured');
  }

  const uploads = await Promise.all(
    files.map((file) => uploadFromBuffer(file.buffer))
  );

  return uploads.map((result) => ({
    url: result.secure_url,
    publicId: result.public_id,
  }));
};

export const uploadSingleImage = async (file, folder = 'nivana/avatars') => {
  if (!file) {
    throw new ApiError(400, 'No image provided');
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    // If Cloudinary is not configured, fallback to base64 data URL
    const base64 = file.buffer.toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64}`;
    return { url: dataUrl, publicId: null };
  }

  const result = await uploadFromBuffer(file.buffer, folder);
  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

export const deleteImage = async (publicId) => {
  if (!publicId || !process.env.CLOUDINARY_CLOUD_NAME) return;

  await cloudinary.uploader.destroy(publicId);
};

