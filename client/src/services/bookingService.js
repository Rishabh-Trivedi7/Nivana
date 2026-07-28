import api from './api.js';

export const checkAvailability = (propertyId, checkInDate, checkOutDate) => {
  const params = new URLSearchParams({ checkInDate, checkOutDate });
  return api(`/bookings/availability/${propertyId}?${params}`);
};

export const createBooking = (data) =>
  api('/bookings', { method: 'POST', body: data });

export const initiatePayment = (data) =>
  api('/bookings/initiate-payment', { method: 'POST', body: data });

export const getUserBookings = () =>

  api('/bookings/user');

export const getAdminBookings = () =>
  api('/bookings/admin');

export const updateBookingStatus = (id, bookingStatus) =>
  api(`/bookings/${id}`, { method: 'PUT', body: { bookingStatus } });

export const cancelBooking = (id) =>
  api(`/bookings/${id}`, { method: 'DELETE' });
