import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth';

export function AuthInitializer() {
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(isAuthenticated);
  }, [setIsAuthenticated]);

  return null;
} 