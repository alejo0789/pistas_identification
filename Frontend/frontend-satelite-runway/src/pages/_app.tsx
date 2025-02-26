import React from 'react';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
import { AnalysisSettingsProvider } from '../contexts/AnalysisSettingsContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <AnalysisSettingsProvider>
        <Component {...pageProps} />
      </AnalysisSettingsProvider>
    </AuthProvider>
  );
}

export default MyApp;