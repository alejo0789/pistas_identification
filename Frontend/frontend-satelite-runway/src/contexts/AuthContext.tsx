/**
 * Context provider for authentication state management
 * filepath: frontend/src/contexts/AuthContext.tsx
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import authService, { User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Clear error function
  const clearError = () => setError(null);

  // Load user from localStorage on mount & check token validity
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);

      try {
        const token = authService.getToken();
        if (!token || !authService.isAuthenticated()) {
          setUser(null);
          return;
        }

        // Fetch user details
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        setError(null);
      } catch (err) {
        console.error('Error loading user:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    clearError();
    setIsLoading(true);

    try {
      const userData = await authService.login({ username, password });
      setUser(userData);

      // Store return URL before redirecting
      const returnUrl = localStorage.getItem('returnUrl') || '/dashboard';
      localStorage.removeItem('returnUrl');
      router.push(returnUrl);
    } catch (err: any) {
      console.error('Login error:', err);

      // Handle API errors properly
      setError(err.message || 'Invalid username or password');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('auth_token'); // Ensure token is removed
      setUser(null);
      router.push('/login');
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};
