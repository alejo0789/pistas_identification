/**
 * Authentication layout component for login and registration pages
 * filepath: frontend/src/components/layout/AuthLayout.tsx
 */
import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const router = useRouter();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              Satellite Image Analysis
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          {children}
        </div>
      </main>
      
      <footer className="bg-white py-4 shadow-inner">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Satellite Image Analysis. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;