'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function NotFound() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">Page Not Found</h2>
        <p className="text-slate-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href={isAuthenticated ? '/dashboard' : '/'}
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Go back {isAuthenticated ? 'home' : 'to landing page'}
        </Link>
      </div>
    </div>
  );
} 