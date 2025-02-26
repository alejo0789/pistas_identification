/**
 * Service for authentication-related API calls
 * filepath: frontend/src/services/authService.ts
 */
import api from './api';
import * as jwt_decode from 'jwt-decode';

// User interfaces
export interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface UserRegistration {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DecodedToken {
  id: number;
  username: string;
  is_admin: boolean;
  exp: number;
}

const TOKEN_KEY = 'auth_token';

const authService = {
  // Login user and store token
  login: async (credentials: UserCredentials): Promise<User> => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Check if the response and data are valid
      if (!response || !response.data) {
        throw new Error('Invalid server response');
      }
      
      // Extract token and user from response
      const token = response.data.token;
      const user = response.data.user;
      
      // Validate token and user data
      if (!token) {
        throw new Error('No authentication token received');
      }
      
      if (!user || !user.id) {
        throw new Error('Invalid user data received');
      }
      
      // Store token in localStorage
      localStorage.setItem(TOKEN_KEY, token);
      
      return user;
    } catch (error: any) {
      // Handle various error scenarios
      console.error('Login failed:', error);
      
      // Extract error message from response if available
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          errorMessage = 'Invalid username or password';
        } else if (error.response.status === 404) {
          errorMessage = 'User not found';
        } else if (error.response.data && error.response.data.error) {
          // Use error message from API if available
          errorMessage = error.response.data.error;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection.';
      } else if (error.message) {
        // Use error message if available
        errorMessage = error.message;
      }
      
      // Create a new error with the message
      const formattedError = new Error(errorMessage);
      
      // Add properties to help with debugging
      (formattedError as any).originalError = error;
      (formattedError as any).status = error.response?.status;
      
      throw formattedError;
    }
  },

  // Register new user (admin only)
  register: async (userData: UserRegistration): Promise<User> => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data.user;
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      let errorMessage = 'Registration failed';
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      // Try to call backend logout endpoint if implemented
      await api.post('/auth/logout');
    } catch (error) {
      // If the backend call fails, just continue with local logout
      console.error('Logout error:', error);
    } finally {
      // Always remove the token from localStorage
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  // Get current authenticated user
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (!token) {
        return null;
      }
      
      // Verify with backend
      const response = await api.get('/auth/user');
      return response.data.user;
    } catch (error) {
      console.error('Get current user failed:', error);
      // Clear token on error
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (!token) {
      return false;
    }
    
    try {
      // Verify token expiration
      const decoded = jwt_decode.default<DecodedToken>(token);
      return decoded.exp > Date.now() / 1000;
    } catch (error) {
      // Invalid token
      localStorage.removeItem(TOKEN_KEY);
      return false;
    }
  },

  // Get authentication token
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  }
};

export default authService;