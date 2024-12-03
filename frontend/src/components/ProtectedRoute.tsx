'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiService } from '@/services/api';

const publicPaths = ['/auth/login', '/auth/register'];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await apiService.checkAuth();
        
        if (!isAuthenticated && !publicPaths.includes(pathname)) {
          router.push('/auth/login');
        } else if (isAuthenticated && publicPaths.includes(pathname)) {
          router.push('/');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (!publicPaths.includes(pathname)) {
          router.push('/auth/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
} 