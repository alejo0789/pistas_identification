/**
 * Authentication layout for login and register pages
 * filepath: frontend/src/components/layout/AuthLayout.tsx
 */
import React, { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title = 'Satellite Image Analysis' 
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Satellite Image Analysis Platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Link href="/" className="flex items-center">
              <span className="text-blue-600 text-2xl font-bold">SatAnalysis</span>
            </Link>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          {children}
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <span>&copy; {new Date().getFullYear()} Satellite Image Analysis</span>
        </div>
      </div>
    </>
  );
};

export default AuthLayout;