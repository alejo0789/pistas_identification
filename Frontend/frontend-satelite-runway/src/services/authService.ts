/**
 * Service for authentication-related API calls
 * filepath: frontend/src/services/authService.ts
 */
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

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
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const authService = {
  /**
   * Logs in a user and stores the token
   */
  login: async (credentials: UserCredentials): Promise<User> => {
    try {
      // Force a small delay to ensure UI updates properly
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem(TOKEN_KEY, token);
      
      return user;
    } catch (error: any) {
      // Add a small delay before throwing the error to ensure UI updates
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (error.response && error.response.status === 401) {
        throw new Error('Invalid username or password');
      } else if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      } else if (error.request) {
        throw new Error('No response from server');
      } else {
        throw new Error('Login failed');
      }
    }
  },

  /**
   * Logs out the user by clearing tokens
   */
  logout: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('returnUrl');
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
      } catch (error) {
        localStorage.removeItem(TOKEN_KEY);
        return null;
      }

      const response = await axios.get(`${API_URL}/auth/user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data.user;
    } catch (error) {
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