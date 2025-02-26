import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <Head>
        <title>Satellite Image Analysis</title>
        <meta name="description" content="Analyze satellite imagery for geographical features and objects" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="flex w-full flex-1 flex-col items-center justify-center px-4 sm:px-20 text-center">
        <div className="max-w-4xl bg-white rounded-lg shadow-xl p-8 sm:p-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            Satellite Image Analysis Platform
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Analyze satellite imagery to detect and monitor features like runways, aircraft, 
            buildings, roads, and water bodies. Compare images over time to track changes.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 max-w-3xl mx-auto">
            <div className="flex flex-col items-center p-6 bg-blue-50 rounded-lg border border-blue-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Geographic Analysis</h2>
              <p className="text-gray-600 text-center">Analyze satellite imagery from any location using precise coordinates</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-green-50 rounded-lg border border-green-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Change Detection</h2>
              <p className="text-gray-600 text-center">Compare imagery over time to identify changes and developments</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <button 
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Login
                </Link>
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                >
                  Try as Guest
                </button>
              </>
            )}
          </div>
        </div>
      </main>
      
      <footer className="w-full p-6 text-center text-gray-600 text-sm">
        <p>© {new Date().getFullYear()} Satellite Image Analysis Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;