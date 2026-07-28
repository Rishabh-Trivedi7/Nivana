import api from './api.js';

export const getStats = () => api('/admin/stats');

export const getUsers = () => api('/admin/users');

export const updateUserRole = (id, role) =>
  api(`/admin/users/${id}/role`, { method: 'PUT', body: { role } });

export const deleteUser = (id) =>
  api(`/admin/users/${id}`, { method: 'DELETE' });

export const createProperty = (data) =>
  api('/properties', { method: 'POST', body: data });

export const updateProperty = (id, data) =>
  api(`/properties/${id}`, { method: 'PUT', body: data });

export const deleteProperty = (id) =>
  api(`/properties/${id}`, { method: 'DELETE' });

export const uploadImages = (formData) =>
  api('/properties/upload-images', { method: 'POST', body: formData });
