import api from './api.js';

export const register = (data) => api('/auth/register', { method: 'POST', body: data });

export const login = (data) => api('/auth/login', { method: 'POST', body: data });

export const logout = () => api('/auth/logout', { method: 'POST' });

export const getProfile = () => api('/auth/profile');

export const updateProfile = (data) => api('/auth/profile', { method: 'PUT', body: data });

export const uploadAvatar = (formData) =>
  api('/auth/avatar', { method: 'POST', body: formData });

