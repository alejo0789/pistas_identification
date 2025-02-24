/**
 * Service for authentication-related API calls
 * filepath: frontend/src/services/authService.ts
 */
import api from './api';
import jwtDecode from 'jwt-decode';
import { AxiosResponse } from 'axios';

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
  access_token: string;
  token_type: string;
}

export interface DecodedToken {
  sub: string; // username
  exp: number; // expiration time
  iat: number; // issued at time
  user_id: number;
  is_admin: boolean;
}

const TOKEN_KEY = 'auth_token';

const authService = {
  // Login user and store token
  login: async (credentials: UserCredentials): Promise<User> => {
    try {
      // TODO: Implement actual API call
      // const response = await api.post<AuthResponse>('/auth/login', credentials);
      // const { access_token } = response.data;
      
      // For development, create a fake token response
      const access_token = 'fake_token';
      
      // Store token in localStorage
      localStorage.setItem(TOKEN_KEY, access_token);
      
      // Return user info
      return {
        id: 1,
        username: credentials.username,
        email: `${credentials.username}@example.com`,
        isAdmin: false
      };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  // Register new user
  register: async (userData: UserRegistration): Promise<User> => {
    try {
      // TODO: Implement actual API call
      // const response = await api.post<User>('/auth/register', userData);
      // return response.data;
      
      // For development
      return {
        id: 1,
        username: userData.username,
        email: userData.email,
        isAdmin: false
      };
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  // Logout user
  logout: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Get current authenticated user
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (!token) {
        return null;
      }
      
      // TODO: Implement actual API call to validate token and get current user
      // const response = await api.get<User>('/auth/user');
      // return response.data;
      
      // For development, decode the token (in real app, verify with backend)
      try {
        // This would be actual JWT decoding in a real app
        // const decoded = jwtDecode<DecodedToken>(token);
        
        // For development
        return {
          id: 1,
          username: 'testuser',
          email: 'testuser@example.com',
          isAdmin: false
        };
      } catch {
        // Invalid token
        localStorage.removeItem(TOKEN_KEY);
        return null;
      }
    } catch (error) {
      console.error('Get current user failed:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (!token) {
      return false;
    }
    
    // In a real app, you would verify token expiration
    // const decoded = jwtDecode<DecodedToken>(token);
    // return decoded.exp > Date.now() / 1000;
    
    // For development
    return true;
  },

  // Get authentication token
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  }
};

export default authService;