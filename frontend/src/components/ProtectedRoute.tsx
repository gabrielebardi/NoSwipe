'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// List of public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register'];

// Onboarding flow routes in order
const ONBOARDING_ROUTES = ['/onboarding', '/onboarding/preferences', '/calibration'];

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only check auth after initialization is complete
    if (!isLoading) {
      // If not authenticated and trying to access a protected route
      if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
        console.log('ProtectedRoute: Not authenticated, redirecting to login');
        router.replace('/auth/login');
        return;
      }

      // If authenticated and trying to access a public route
      if (isAuthenticated && PUBLIC_ROUTES.includes(pathname)) {
        console.log('ProtectedRoute: Authenticated user on public route, redirecting to dashboard');
        router.replace('/dashboard');
        return;
      }
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-white">
          <Loader className="animate-spin" size={24} />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Allow access to public routes regardless of auth state
  if (PUBLIC_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  // Don't render anything while redirecting
  if (!isAuthenticated) {
    return null;
  }

  // Show children only if authenticated
  return <>{children}</>;
} 