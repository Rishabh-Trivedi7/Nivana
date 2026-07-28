import api from './api.js';

export const getPropertyReviews = (propertyId) => api(`/reviews/${propertyId}`);

export const createReview = (data) =>
  api('/reviews', { method: 'POST', body: data });

export const updateReview = (id, data) =>
  api(`/reviews/${id}`, { method: 'PUT', body: data });

export const deleteReview = (id) =>
  api(`/reviews/${id}`, { method: 'DELETE' });

export const getHostReviews = () => api('/reviews/host/all');
