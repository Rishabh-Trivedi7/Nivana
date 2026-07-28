import api from './api.js';

export const getWishlist = () => api('/wishlist');

export const addToWishlist = (propertyId) =>
  api('/wishlist', { method: 'POST', body: { propertyId } });

export const removeFromWishlist = (propertyId) =>
  api(`/wishlist/${propertyId}`, { method: 'DELETE' });
