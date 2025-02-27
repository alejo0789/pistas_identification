/**
 * Service for authentication-related API calls
 * filepath: frontend/src/services/authService.ts
 */
import api from './api';
import { jwtDecode } from 'jwt-decode';
 // FIXED import

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
  /**
   * Logs in a user and stores the token
   */
  login: async (credentials: UserCredentials): Promise<User> => {
    try {
      const response = await api.post('/auth/login', credentials);

      if (!response?.data) {
        throw new Error('Invalid server response');
      }

      const { token, user } = response.data;

      if (!token) {
        throw new Error('No authentication token received');
      }

      if (!user?.id) {
        throw new Error('Invalid user data received');
      }

      localStorage.setItem(TOKEN_KEY, token);
      return user;
    } catch (error: any) {
      console.error('Login failed:', error);

      let errorMessage = 'Login failed. Please try again.';
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Invalid username or password';
        } else if (error.response.status === 404) {
          errorMessage = 'User not found';
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  },

  /**
   * Registers a new user
   */
  register: async (userData: UserRegistration): Promise<User> => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data.user;
    } catch (error: any) {
      console.error('Registration failed:', error);

      let errorMessage = 'Registration failed';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  },

  /**
   * Logs out the user by clearing tokens
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout'); // If the backend has an endpoint for logout
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('returnUrl');
    }
  },

  /**
   * Gets the current authenticated user
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return null;

      try {
        const decoded: DecodedToken = jwtDecode(token);

        if (decoded.exp < Date.now() / 1000) {
          localStorage.removeItem(TOKEN_KEY);
          return null;
        }

        const response = await api.get('/auth/user');
        return response.data.user;
      } catch (decodingError) {
        localStorage.removeItem(TOKEN_KEY);
        return null;
      }
    } catch (error) {
      console.error('Get current user failed:', error);
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
  },

  /**
   * Checks if the user is authenticated
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;

    try {
      const decoded: DecodedToken = jwtDecode(token);

      return decoded.exp > Date.now() / 1000;
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      return false;
    }
  },

  /**
   * Retrieves authentication token
   */
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  }
};

export default authService;
