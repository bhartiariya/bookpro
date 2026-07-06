import api from './axios';
export const getOverview      = () => api.get('/analytics/overview');
export const getBookingTrend  = () => api.get('/analytics/bookings/trend');
export const getTopProviders  = () => api.get('/analytics/top-providers');
