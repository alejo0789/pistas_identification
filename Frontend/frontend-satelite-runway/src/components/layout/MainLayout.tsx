/**
 * Main layout component that wraps most pages with header, footer, and navigation
 * filepath: frontend/src/components/layout/MainLayout.tsx
 */
import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from './Header';
import Footer from './Footer';
import Navigation from './Navigation';
import { useAuth } from '../../contexts/AuthContext';

interface MainLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Redirect to login if not authenticated and auth is required
  useEffect(() => {
    // Only check auth after the initial auth loading is complete
    if (!isLoading) {
      if (!isAuthenticated && requireAuth) {
        router.push(`/login?returnUrl=${encodeURIComponent(router.asPath)}`);
      }
      // Mark auth check as complete
      setIsCheckingAuth(false);
    }
  }, [isAuthenticated, isLoading, requireAuth, router]);

  // Show loading state only during initial auth check
  if (isLoading || (requireAuth && isCheckingAuth)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // For authenticated pages, if not authenticated, don't render (will redirect via useEffect)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex flex-1">
        <Navigation />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="container mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default MainLayout;