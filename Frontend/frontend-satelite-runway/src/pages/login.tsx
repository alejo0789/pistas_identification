/**
 * Login page component
 * filepath: frontend/src/pages/login.tsx
 */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  
  const router = useRouter();
  const { login, error: authError, clearError, isAuthenticated, isLoading } = useAuth();

  // Check for query parameters that might contain error messages
  useEffect(() => {
    const { error, returnUrl } = router.query;
    
    if (error === 'auth_required') {
      setFormError('Please log in to access this page.');
      setShowErrorMessage(true);
    } else if (error === 'session_expired') {
      setFormError('Your session has expired. Please log in again.');
      setShowErrorMessage(true);
    } else if (error === 'auth_error') {
      setFormError('Authentication error. Please log in again.');
      setShowErrorMessage(true);
    }
    
    // Store return URL in localStorage if provided
    if (returnUrl && typeof returnUrl === 'string') {
      localStorage.setItem('returnUrl', returnUrl);
    }
    
    return () => {
      // Clear errors when component unmounts
      setFormError(null);
      clearError();
    };
  }, [router.query, clearError]);

  // Handle auth error from context
  useEffect(() => {
    if (authError) {
      setFormError(authError);
      setShowErrorMessage(true);
    }
  }, [authError]);

  // Redirect if authenticated - but only if no error is showing
  useEffect(() => {
    if (!isLoading && isAuthenticated && !showErrorMessage) {
      const returnUrl = localStorage.getItem('returnUrl') || '/dashboard';
      localStorage.removeItem('returnUrl');
      router.push(returnUrl);
    }
  }, [isAuthenticated, router, isLoading, showErrorMessage]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    // Clear previous errors
    setFormError(null);
    setShowErrorMessage(false);
    clearError();
  
    // Basic validation
    if (!username.trim()) {
      setFormError('Username is required');
      setShowErrorMessage(true);
      return;
    }
  
    if (!password) {
      setFormError('Password is required');
      setShowErrorMessage(true);
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      // Manual error handling - don't rely on auth context for UI errors
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid username or password');
        } else {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || `Error: ${response.status}`);
        }
      }
      
      const data = await response.json();
      
      if (!data.token) {
        throw new Error('No authentication token received');
      }
      
      // Store token
      localStorage.setItem('auth_token', data.token);
      
      // Let context know login succeeded - but we've already handled token storage
      login(username, password).catch(() => {
        // Ignore errors here since we're already handling auth manually
      });
      
    } catch (err: any) {
      // Set error and prevent instant redirect
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setFormError(errorMessage);
      setShowErrorMessage(true);
      
      // Keep the error visible
      setTimeout(() => {
        setIsSubmitting(false);
      }, 300);
      return;
    }
    
    setIsSubmitting(false);
  };
  
  // We use formError directly now instead of combining with authError
  const displayError = formError;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="mt-2 text-gray-600">Sign in to your account to continue</p>
        </div>
        
        {/* Display any errors */}
        {showErrorMessage && displayError && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
            {displayError}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;