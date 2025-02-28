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
  logout: () => void;
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

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        if (!authService.isAuthenticated()) {
          setUser(null);
          return;
        }
        
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
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
    } catch (err: any) {
      // Make sure we set the error message and prevent it from being cleared too soon
      const errorMessage = err?.message || 'Login failed';
      setError(errorMessage);
      setUser(null);
      
      // Return the error so the component knows login failed
      return Promise.reject(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      logout, 
      error, 
      clearError 
    }}>
      {children}
    </AuthContext.Provider>
  );
};