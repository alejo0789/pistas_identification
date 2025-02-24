/**
 * Main layout component that wraps most pages with header, footer, and navigation
 * filepath: frontend/src/components/layout/MainLayout.tsx
 */
import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from './Header';
import Footer from './Footer';
import Navigation from './Navigation';
import { useAuth } from '../../contexts/AuthContext';

interface MainLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  requireAuth = true,
  adminOnly = false 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && requireAuth) {
      // Redirect to login if not authenticated
      if (!isAuthenticated) {
        router.push({
          pathname: '/login',
          query: { returnUrl: router.asPath }
        });
      }
      
      // Redirect to dashboard if not admin but trying to access admin page
      if (adminOnly && user && !user.isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, router, requireAuth, adminOnly, user]);

  // Show loading spinner while checking authentication
  if (isLoading && requireAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Don't render protected content if not authenticated
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Don't render admin content if not admin
  if (adminOnly && (!user || !user.isAdmin)) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex flex-1">
        <Navigation />
        
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default MainLayout;