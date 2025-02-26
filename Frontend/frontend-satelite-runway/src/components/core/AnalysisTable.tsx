/**
 * Table component to display analysis history
 * filepath: frontend/src/components/core/AnalysisTable.tsx
 */
import React from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';

// Interface matching the Analysis type from dashboard.tsx
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
}

const AnalysisTable: React.FC<AnalysisTableProps> = ({ analyses }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="p-3 text-left">Usuario</th>
            <th className="p-3 text-left">Nombre Análisis</th>
            <th className="p-3 text-left">Fecha Análisis</th>
            <th className="p-3 text-left">Coordenadas</th>
            <th className="p-3 text-left">Pista Detectada</th>
            <th className="p-3 text-left">No. Aeronaves</th>
            <th className="p-3 text-left">Casas</th>
            <th className="p-3 text-left">Fecha Imagen</th>
            <th className="p-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {analyses.length === 0 ? (
            <tr>
              <td colSpan={9} className="p-4 text-center text-gray-500">
                No hay análisis disponibles
              </td>
            </tr>
          ) : (
            analyses.map((analysis) => (
              <tr key={analysis.id} className="border-b hover:bg-gray-50">
                <td className="p-3">nombre_usuario</td>
                <td className="p-3">{analysis.name}</td>
                <td className="p-3">{analysis.analysisDate}</td>
                <td className="p-3">
                  {analysis.latitude.toFixed(4)}, {analysis.longitude.toFixed(4)}
                </td>
                <td className="p-3">
                  {analysis.runwayDetected ? 'Sí' : 'No'}
                </td>
                <td className="p-3">{analysis.aircraftCount}</td>
                <td className="p-3">{analysis.houseCount}</td>
                <td className="p-3">{analysis.analysisDate}</td>
                <td className="p-3">
                  <div className="flex space-x-2">
                    <Link href={`/analysis/${analysis.id}`}>
                      <Button variant="small">Ver</Button>
                    </Link>
                    <Link href={`/analysis/${analysis.id}/ppt`}>
                      <Button variant="small" color="secondary">PPT</Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AnalysisTable;