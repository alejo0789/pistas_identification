/**
 * App component with Error Boundary
 * filepath: frontend/src/pages/_app.tsx
 */
import React, { useEffect } from 'react';
import { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
import { AnalysisSettingsProvider } from '../contexts/AnalysisSettingsContext';
import ErrorBoundary from '../components/ErrorBoundary';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
 // In your _app.tsx
useEffect(() => {
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.error('Unhandled Promise Rejection:', event.reason);
    event.preventDefault(); // This prevents the error from being shown in console
  };

  window.addEventListener('unhandledrejection', handleUnhandledRejection);
  return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
}, []);
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AnalysisSettingsProvider>
          <Component {...pageProps} />
        </AnalysisSettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default MyApp;