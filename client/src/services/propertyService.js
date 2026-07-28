import api from './api.js';

export const getProperties = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      query.set(key, value);
    }
  });

  const qs = query.toString();
  return api(`/properties${qs ? `?${qs}` : ''}`);
};

export const getPropertyById = (id) => api(`/properties/${id}`);

export const getRegionCounts = () => api('/properties/region-counts');

