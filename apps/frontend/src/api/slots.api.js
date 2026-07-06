import api from './axios';
export const getAvailableSlots = (providerId) => api.get(`/slots/provider/${providerId}/available`);
export const createSlot        = (data)        => api.post('/slots', data);
export const getMySlots        = (providerId)  => api.get(`/slots/provider/${providerId}`);
export const deleteSlot        = (id)          => api.delete(`/slots/${id}`);
