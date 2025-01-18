'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { LocationSearch } from '../location-search';
import type { Location, UserPreferences } from '@/types';

export default function PreferencesPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UserPreferences>({
    preferred_gender: 'B',
    preferred_age_min: 18,
    preferred_age_max: 50,
    max_distance: 5,
    preferred_location: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await apiService.updatePreferences(formData);
      router.push('/onboarding/calibration');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (location: Location | null) => {
    setFormData((prev: UserPreferences) => ({
      ...prev,
      preferred_location: location
    }));
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Your Preferences</h1>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Interested in
              </label>
              <select
                value={formData.preferred_gender}
                onChange={(e) => setFormData((prev: UserPreferences) => ({
                  ...prev,
                  preferred_gender: e.target.value as 'M' | 'F' | 'B'
                }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                <option value="B">Both</option>
                <option value="M">Men</option>
                <option value="F">Women</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Age Range
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  value={formData.preferred_age_min ?? 18}
                  onChange={(e) => setFormData((prev: UserPreferences) => ({
                    ...prev,
                    preferred_age_min: parseInt(e.target.value)
                  }))}
                  min="18"
                  max="99"
                  className="w-24 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
                <span className="text-slate-300">to</span>
                <input
                  type="number"
                  value={formData.preferred_age_max ?? 50}
                  onChange={(e) => setFormData((prev: UserPreferences) => ({
                    ...prev,
                    preferred_age_max: parseInt(e.target.value)
                  }))}
                  min="18"
                  max="99"
                  className="w-24 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Maximum Distance (km)
              </label>
              <input
                type="number"
                value={formData.max_distance}
                onChange={(e) => setFormData((prev: UserPreferences) => ({
                  ...prev,
                  max_distance: parseInt(e.target.value)
                }))}
                min="1"
                max="500"
                className="w-24 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Preferred Location
              </label>
              <LocationSearch onSelect={handleLocationSelect} />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 