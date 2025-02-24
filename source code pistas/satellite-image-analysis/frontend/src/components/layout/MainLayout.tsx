/**
 * Main layout component that wraps most pages with header, footer, and navigation
 * filepath: frontend/src/components/layout/MainLayout.tsx
 */
import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import Navigation from './Navigation';
import { useAuth } from '../../contexts/AuthContext';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // TODO: Implement redirect to login if not authenticated

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Navigation />
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default MainLayout;