import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('quickToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('quickToken');
      localStorage.removeItem('quickUser');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);


// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/update', data);

// Services
export const getServices = () => API.get('/services');
export const createService = (data) => API.post('/services', data);
export const updateService = (id, data) => API.put(`/services/${id}`, data);
export const deleteService = (id) => API.delete(`/services/${id}`);

// Bookings
export const createBooking = (data) => API.post('/bookings', data);
export const getMyBookings = () => API.get('/bookings/my');
export const getBookingById = (id) => API.get(`/bookings/${id}`);
export const getNearbyProviders = (params) => API.get('/bookings/nearby-providers', { params });
export const getPendingNearby = (params) => API.get('/bookings/pending-nearby', { params });
export const acceptBooking = (id) => API.put(`/bookings/${id}/accept`);
export const confirmBooking = (id) => API.put(`/bookings/${id}/confirm`);
export const rejectBooking = (id) => API.put(`/bookings/${id}/reject`);
export const updateBookingStatus = (id, status) => API.put(`/bookings/${id}/status`, { status });
export const cancelBooking = (id) => API.put(`/bookings/${id}/cancel`);
export const getAllBookings = () => API.get('/bookings/admin/all');

// Admin
export const getAllUsers = () => API.get('/admin/users');
export const approveProvider = (id) => API.put(`/admin/approve/${id}`);
export const toggleUserStatus = (id) => API.put(`/admin/toggle/${id}`);
export const getAdminStats = () => API.get('/admin/stats');

export default API;