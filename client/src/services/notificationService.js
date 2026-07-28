import api from './api.js';

export const getNotifications = () => api('/notifications');

export const markAsRead = (id) =>
  api(`/notifications/${id}/read`, { method: 'PUT' });

export const markAllAsRead = () =>
  api('/notifications/read-all', { method: 'PUT' });
