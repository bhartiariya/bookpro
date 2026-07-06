import api from './axios';
export const createBooking         = (data) => api.post('/bookings', data);
export const getMyBookings         = (params) => api.get('/bookings/my', { params });
export const getProviderBookings   = (params) => api.get('/bookings/provider', { params });
export const confirmBooking        = (id)   => api.patch(`/bookings/${id}/confirm`);
export const rejectBooking         = (id)   => api.patch(`/bookings/${id}/reject`);
export const cancelBooking         = (id, data) => api.patch(`/bookings/${id}/cancel`, data);
export const completeBooking       = (id)   => api.patch(`/bookings/${id}/complete`);
