import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

console.log('API URL:', API_URL);

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to every request
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', (config.baseURL || '') + (config.url || ''));
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.data);
    return response;
  },
  (error: AxiosError) => {
    console.error('Response error:', error);
    console.error('Error response data:', error.response?.data);
    console.error('Error status:', error.response?.status);
    if (error.response?.status === 401) {
      // Unauthorized - Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Helper function to handle API errors
export const getErrorMessage = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
