'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { LocationSearch } from '../location-search';
import type { Location } from '@/lib/types';
import Navigation from '@/components/layout/Navigation';

export default function PreferencesPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    preferred_gender: '',
    preferred_age_min: '',
    preferred_age_max: '',
    preferred_location: null as Location | null,
    max_distance: '50',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await apiService.updatePreferences({
        preferred_gender: formData.preferred_gender as 'M' | 'F' | 'B',
        preferred_age_min: parseInt(formData.preferred_age_min),
        preferred_age_max: parseInt(formData.preferred_age_max),
        preferred_location: formData.preferred_location,
        max_distance: parseInt(formData.max_distance),
      });
      router.push('/calibration');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Your Preferences</h1>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800 rounded-xl p-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Interested In
              </label>
              <select
                value={formData.preferred_gender}
                onChange={(e) => setFormData({ ...formData, preferred_gender: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">Select gender preference</option>
                <option value="M">Men</option>
                <option value="F">Women</option>
                <option value="B">Both</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Min Age
                </label>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={formData.preferred_age_min}
                  onChange={(e) => setFormData({ ...formData, preferred_age_min: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Max Age
                </label>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={formData.preferred_age_max}
                  onChange={(e) => setFormData({ ...formData, preferred_age_max: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Preferred Location
              </label>
              <LocationSearch
                onSelect={(location) => setFormData({ ...formData, preferred_location: location })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Maximum Distance (km)
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={formData.max_distance}
                onChange={(e) => setFormData({ ...formData, max_distance: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Continue to Calibration
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 