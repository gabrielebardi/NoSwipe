'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Navigation from '@/components/layout/Navigation';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8 pt-24">
          <h1 className="text-3xl font-bold text-white mb-8">
            Welcome, {user?.first_name}!
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Dashboard content will go here */}
            <div className="bg-slate-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">Your Matches</h2>
              <p className="text-slate-400">
                No matches yet. Complete your profile to start matching!
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 