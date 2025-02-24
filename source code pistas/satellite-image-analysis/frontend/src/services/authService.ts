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
  email: string;
  is_admin: boolean;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Helper to safely parse JSON
const safeJSONParse = <T>(data: string | null, fallback: T): T => {
  if (!data) return fallback;
  try {
    return JSON.parse(data) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return fallback;
  }
};

const authService = {
  // Login user and store token
  login: async (credentials: UserCredentials): Promise<User> => {
    try {
      // For development, we'll simulate an API call
      // In a real app, uncomment the following:
      // const response = await api.post<AuthResponse>('/auth/login', credentials);
      // const { access_token } = response.data;
      
      // Simulated response for development
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      
      // Validate credentials (simple check for demo purposes)
      if (credentials.username !== 'admin' && credentials.username !== 'user') {
        throw new Error('Invalid credentials');
      }
      
      // Create mock token and user data based on username
      const isAdmin = credentials.username === 'admin';
      const userId = isAdmin ? 1 : 2;
      const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({
          sub: credentials.username,
          user_id: userId,
          email: `${credentials.username}@example.com`,
          is_admin: isAdmin,
          exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
        })
      )}.MOCK_SIGNATURE`;
      
      // Create user object
      const user: User = {
        id: userId,
        username: credentials.username,
        email: `${credentials.username}@example.com`,
        isAdmin: isAdmin
      };
      
      // Store token and user data
      localStorage.setItem(TOKEN_KEY, mockToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  // Register new user
  register: async (userData: UserRegistration): Promise<User> => {
    try {
      // For development, simulate API call
      // In a real app, uncomment the following:
      // const response = await api.post<User>('/auth/register', userData);
      // return response.data;
      
      // Simulated response for development
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      
      // Create mock user
      const user: User = {
        id: Math.floor(Math.random() * 1000) + 3, // Random ID starting from 3
        username: userData.username,
        email: userData.email,
        isAdmin: false
      };
      
      return user;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  // Logout user
  logout: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Get current authenticated user
  getCurrentUser: async (): Promise<User | null> => {
    try {
      // Check for token
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        return null;
      }
      
      // Check for cached user data
      const cachedUser = localStorage.getItem(USER_KEY);
      if (cachedUser) {
        const user = safeJSONParse<User | null>(cachedUser, null);
        if (user) return user;
      }
      
      // If no cached user but token exists, try to decode it
      // In a real app, you would validate the token with the backend
      try {
        // For development, simulate token decoding
        const decoded = jwtDecode<DecodedToken>(token);
        
        // Check if token is expired
        if (decoded.exp < Date.now() / 1000) {
          this.logout();
          return null;
        }
        
        // Create user from token info
        const user: User = {
          id: decoded.user_id,
          username: decoded.sub,
          email: decoded.email || `${decoded.sub}@example.com`,
          isAdmin: decoded.is_admin
        };
        
        // Cache user data
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        
        return user;
      } catch (error) {
        // Invalid token
        console.error('Error decoding token:', error);
        this.logout();
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
    
    try {
      // In a real app with JWT, check token expiration
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp > Date.now() / 1000;
    } catch {
      // Token couldn't be decoded, consider user not authenticated
      return false;
    }
  },

  // Get authentication token
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  }
};

export default authService;