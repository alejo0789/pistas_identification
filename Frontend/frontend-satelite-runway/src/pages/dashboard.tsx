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

// Loading Skeleton Component
const AnalysisTableSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="w-full h-12 bg-gray-200 mb-4"></div>
      {[1, 2, 3, 4, 5].map((row) => (
        <div key={row} className="w-full h-12 bg-gray-100 mb-2"></div>
      ))}
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        setIsLoading(true);
        // Simulating API call for development
        const mockAnalyses: Analysis[] = [
          {
            id: 1,
            name: 'Análisis Aeropuerto',
            latitude: 19.4326,
            longitude: -99.1332,
            analysisDate: '2024-02-25',
            runwayDetected: true,
            aircraftCount: 5,
            houseCount: 20
          },
          {
            id: 2,
            name: 'Análisis Zona Industrial',
            latitude: 19.4500,
            longitude: -99.1500,
            analysisDate: '2024-02-24',
            runwayDetected: false,
            aircraftCount: 2,
            houseCount: 50
          }
        ];
        
        // Uncomment when actual API is ready
        // const mockAnalyses = await analysisService.getAnalyses();
        
        setAnalyses(mockAnalyses);
        setError(null);
      } catch (err) {
        setError('No se pudieron cargar los análisis');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyses();
  }, []);

  // Basic search functionality
  const filteredAnalyses = analyses.filter(analysis => 
    analysis.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="dashboard-container">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Link href="/analysis/new">
            <Button>Nuevo Análisis</Button>
          </Link>
        </div>

        <div className="mb-6">
          <SearchBar 
            placeholder="Buscar análisis..." 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>

        {isLoading ? (
          <AnalysisTableSkeleton />
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : filteredAnalyses.length > 0 ? (
          <AnalysisTable analyses={filteredAnalyses} />
        ) : (
          <div className="text-center text-gray-500 py-8">
            No hay análisis disponibles. 
            <Link href="/analysis/new" className="text-blue-500 ml-2 hover:underline">
              Crear nuevo análisis
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default DashboardPage;