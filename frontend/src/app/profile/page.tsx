'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Navigation from '@/components/layout/Navigation';
import type { User } from '@/types';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser(formData);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-white">Your Profile</h1>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
                {error}
              </div>
            )}

            <div className="bg-slate-800 rounded-lg p-6">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300">First Name</label>
                    <input
                      type="text"
                      defaultValue={user?.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300">Last Name</label>
                    <input
                      type="text"
                      defaultValue={user?.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300">Gender</label>
                    <select
                      defaultValue={user?.gender || ''}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'M' | 'F' | 'O' })}
                      className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </form>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 