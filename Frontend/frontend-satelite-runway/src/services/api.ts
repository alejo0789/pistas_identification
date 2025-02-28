// Update your api.ts file with this code

import axios from 'axios';
import { useRouter } from 'next/router';
// Create a custom axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
   
    return Promise.reject(error);
  }
);

// Response interceptor - standardize errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
   
    // Create standardized error object
    let message = 'An unexpected error occurred';

    if (error.response) {
     
      // Server responded with error status
      if (error.response.data && error.response.data.error) {
        message = error.response.data.error;
        
      } else if (error.response.status ===401) {
     
        message = 'Unauthorized: Please log in again';
      } else if (error.response.status === 404) {
        message = 'Resource not found';
      } else if (error.response.status === 500) {
        message = 'Server error: Please try again later';
      }
    } else if (error.request) {
      // Request made but no response
      message = 'No response from server: Check your connection';
    } else {
      // Error setting up request
      message = error.message || 'Error preparing request';
    }
    
    // Create standardized error
    const standardError = new Error(message);
    
    // Log for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: message
    });
    
    return Promise.reject(standardError);
  }
);

export default api;