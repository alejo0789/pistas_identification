/**
 * Base API service with axios instance and interceptors
 * filepath: frontend/src/services/api.ts
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { IncomingMessage } from 'http';

// Create a type to fix the compatibility issue with AxiosRequestConfig
interface CustomRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Create a base axios instance with common configuration
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 seconds timeout
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomRequestConfig;
    
    // Handle unauthorized errors (expired token)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // In a real application, you might want to implement token refresh logic here
      // For now, we'll just redirect to login
      if (typeof window !== 'undefined') {
        // Clear token
        localStorage.removeItem('auth_token');
        
        // Redirect to login page
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }
    
    // Handle server errors
    if (error.response?.status === 500) {
      console.error('Server error:', error);
      // You can add custom error handling for server errors
    }
    
    // Network errors
    if (error.message === 'Network Error') {
      console.error('Network error - API server might be down');
      // You can add custom handling for network errors
    }
    
    return Promise.reject(error);
  }
);

// Handle request cancellation
export const createCancelToken = () => {
  return axios.CancelToken.source();
};

export default api;