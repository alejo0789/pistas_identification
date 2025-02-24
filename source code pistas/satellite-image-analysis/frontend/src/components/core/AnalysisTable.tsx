/**
 * Component for displaying analysis results in a table format
 * filepath: frontend/src/components/core/AnalysisTable.tsx
 */
import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button } from '../ui/Button';

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

interface AnalysisTableProps {
  analyses: Analysis[];
  onDelete?: (id: number) => void;
}

const AnalysisTable: React.FC<AnalysisTableProps> = ({ analyses, onDelete }) => {
  const router = useRouter();

  // Function to format date strings
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle view details click
  const handleViewDetails = (id: number) => {
    router.push(`/analysis/${id}`);
  };

  // Handle delete click
  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    if (onDelete && window.confirm('Are you sure you want to delete this analysis?')) {
      onDelete(id);
    }
  };

  if (analyses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">No analyses found. Create a new analysis to get started.</p>
        <Link href="/analysis/new">
          <Button className="mt-4">Create New Analysis</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="py-3 px-4 text-left">Name</th>
            <th className="py-3 px-4 text-left">Coordinates</th>
            <th className="py-3 px-4 text-left">Date</th>
            <th className="py-3 px-4 text-center">Runway</th>
            <th className="py-3 px-4 text-center">Aircraft</th>
            <th className="py-3 px-4 text-center">Houses</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {analyses.map((analysis) => (
            <tr
              key={analysis.id}
              className="border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => handleViewDetails(analysis.id)}
            >
              <td className="py-3 px-4">{analysis.name}</td>
              <td className="py-3 px-4">
                {analysis.latitude.toFixed(4)}, {analysis.longitude.toFixed(4)}
              </td>
              <td className="py-3 px-4">{formatDate(analysis.analysisDate)}</td>
              <td className="py-3 px-4 text-center">
                {analysis.runwayDetected ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    No
                  </span>
                )}
              </td>
              <td className="py-3 px-4 text-center">{analysis.aircraftCount}</td>
              <td className="py-3 px-4 text-center">{analysis.houseCount}</td>
              <td className="py-3 px-4 text-right space-x-2">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(analysis.id);
                  }}
                >
                  View
                </Button>
                {onDelete && (
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={(e) => handleDelete(analysis.id, e)}
                  >
                    Delete
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AnalysisTable;