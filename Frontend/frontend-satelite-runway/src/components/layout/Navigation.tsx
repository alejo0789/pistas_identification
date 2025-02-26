/**
 * Navigation component for sidebar menu
 * filepath: frontend/src/components/layout/Navigation.tsx
 */
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

const Navigation: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  
  // Helper to check if the current route is active
  const isActive = (path: string) => {
    return router.pathname === path || router.pathname.startsWith(`${path}/`);
  };

  // Navigation items
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', showWhen: isAuthenticated },
    { path: '/analysis/new', label: 'New Analysis', icon: '🔍', showWhen: isAuthenticated },
    { path: '/analysis/compare', label: 'Compare Images', icon: '🔄', showWhen: isAuthenticated },
    { path: '/user/settings', label: 'Settings', icon: '⚙️', showWhen: isAuthenticated },
    { path: '/admin/users', label: 'User Management', icon: '👥', showWhen: isAuthenticated && user?.isAdmin }
  ];

  // Filter items based on authentication state
  const visibleNavItems = navItems.filter(item => item.showWhen);

  // Handle logout
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="flex flex-col h-full">
        <div className="mb-8">
          <h1 className="text-xl font-bold">Satellite Analysis</h1>
        </div>
        
        <ul className="flex-1">
          {visibleNavItems.map(item => (
            <li key={item.path} className="mb-2">
              <Link 
                href={item.path}
                className={`flex items-center p-2 rounded hover:bg-gray-700 transition-colors ${
                  isActive(item.path) ? 'bg-gray-700' : ''
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        
        {isAuthenticated && (
          <div className="mt-auto border-t border-gray-700 pt-4">
            <div className="mb-4">
              <p className="text-sm text-gray-400">Logged in as:</p>
              <p className="font-medium">{user?.username}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center"
            >
              <span className="mr-2">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;