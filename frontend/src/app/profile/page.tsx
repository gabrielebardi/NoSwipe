'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Navigation from '@/components/layout/Navigation';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Your Profile</h1>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
                {error}
              </div>
            )}

            <div className="bg-slate-800 rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300">Name</label>
                  <p className="text-white mt-1">
                    {user?.first_name} {user?.last_name}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300">Email</label>
                  <p className="text-white mt-1">{user?.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300">Gender</label>
                  <p className="text-white mt-1">
                    {user?.gender === 'M' ? 'Male' : user?.gender === 'F' ? 'Female' : 'Other'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300">Location</label>
                  <p className="text-white mt-1">
                    {user?.location ? [
                      user.location.city,
                      user.location.region,
                      user.location.country
                    ].filter(Boolean).join(', ') : 'Not set'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 