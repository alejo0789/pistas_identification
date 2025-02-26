/**
 * App component with Error Boundary
 * filepath: frontend/src/pages/_app.tsx
 */
import React from 'react';
import { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
import { AnalysisSettingsProvider } from '../contexts/AnalysisSettingsContext';
import ErrorBoundary from '../components/ErrorBoundary';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
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