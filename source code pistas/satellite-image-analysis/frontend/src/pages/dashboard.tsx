/**
 * Dashboard page component displaying analysis history and summary
 * filepath: frontend/src/pages/dashboard.tsx
 */
import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Button } from '../components/ui/Button';
import AnalysisTable from '../components/core/AnalysisTable';
import { SearchBar } from '../components/ui/SearchBar';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import analysisService from '../services/analysisService';

interface Analysis {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  analysisDate: string;
  runwayDetected: boolean;
  aircraftCount: number;
  houseCount: number;
}

const DashboardPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { user } = useAuth();

  // TODO: Implement fetching analysis history
  useEffect(() => {
    // Call analysisService.getAnalyses and update state
  }, []);

  // TODO: Implement search functionality
  const filteredAnalyses = analyses;

  return (
    <MainLayout>
      <div className="dashboard-container">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Link href="/analysis/new">
            <Button>New Analysis</Button>
          </Link>
        </div>

        <div className="mb-6">
          <SearchBar placeholder="Search analyses..." onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <AnalysisTable analyses={filteredAnalyses} />
        )}
      </div>
    </MainLayout>
  );
};

export default DashboardPage;