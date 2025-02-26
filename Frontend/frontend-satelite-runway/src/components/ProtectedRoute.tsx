/**
 * Protected route component that guards authenticated routes
 * filepath: frontend/src/components/auth/ProtectedRoute.tsx
 */
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false 
}) => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Only run verification when the auth loading is complete
    if (!isLoading) {
      const verifyAccess = async () => {
        try {
          // Check if the user is authenticated
          if (!isAuthenticated) {
            router.push(`/login?returnUrl=${encodeURIComponent(router.asPath)}&error=auth_required`);
            return;
          }

          // For admin-only routes, check if the user is an admin
          if (adminOnly && user && !user.isAdmin) {
            router.push('/dashboard?error=admin_required');
            return;
          }

          // Verification passed
          setIsVerifying(false);
        } catch (error) {
          console.error('Route protection error:', error);
          router.push('/login?error=auth_error');
        }
      };

      verifyAccess();
    }
  }, [isAuthenticated, isLoading, router, adminOnly, user]);

  // Show nothing while loading or verifying
  if (isLoading || isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If we get here, the user is authenticated and has the right permissions
  return <>{children}</>;
};

export default ProtectedRoute;