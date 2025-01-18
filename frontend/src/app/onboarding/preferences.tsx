'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { LocationSearch } from './location-search';
import type { Location, UserPreferences } from '@/types';

interface FormData {
  preferred_gender: string;
  preferred_age_min: string;
  preferred_age_max: string;
  preferred_location: Location | null;
  max_distance: string;
}

export default function PreferencesPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    preferred_gender: '',
    preferred_age_min: '18',
    preferred_age_max: '65',
    preferred_location: null,
    max_distance: '50',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.preferred_gender || !formData.preferred_location) {
      setError('Please fill in all fields');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const preferences: UserPreferences = {
        preferred_gender: formData.preferred_gender as 'M' | 'F' | 'B',
        preferred_age_min: parseInt(formData.preferred_age_min.toString()),
        preferred_age_max: parseInt(formData.preferred_age_max.toString()),
        preferred_location: formData.preferred_location,
        max_distance: parseInt(formData.max_distance.toString()),
      };
      await apiService.updatePreferences(preferences);
      router.push('/calibration');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Your Preferences</h1>
            <p className="text-slate-400">Step {step} of 3</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                I am interested in...
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'M', label: 'Men' },
                  { value: 'F', label: 'Women' },
                  { value: 'B', label: 'Both' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, preferred_gender: value });
                      setStep(2);
                    }}
                    className={`p-4 rounded-lg border ${
                      formData.preferred_gender === value
                        ? 'border-blue-500 bg-blue-500/20 text-white'
                        : 'border-slate-700 hover:border-slate-600 text-slate-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {step >= 2 && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Age Range
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="min-age" className="block text-xs text-slate-400 mb-1">
                      Minimum Age
                    </label>
                    <input
                      id="min-age"
                      type="number"
                      min="18"
                      max="100"
                      value={formData.preferred_age_min}
                      onChange={(e) => {
                        setFormData({ ...formData, preferred_age_min: e.target.value });
                        setStep(3);
                      }}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="max-age" className="block text-xs text-slate-400 mb-1">
                      Maximum Age
                    </label>
                    <input
                      id="max-age"
                      type="number"
                      min="18"
                      max="100"
                      value={formData.preferred_age_max}
                      onChange={(e) => {
                        setFormData({ ...formData, preferred_age_max: e.target.value });
                        setStep(3);
                      }}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {step >= 3 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Search Location
                  </label>
                  <LocationSearch
                    onSelect={(location) => {
                      setFormData({ ...formData, preferred_location: location });
                      setStep(4);
                    }}
                  />
                </div>

                {step >= 4 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Maximum Distance (km)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="500"
                      value={formData.max_distance}
                      onChange={(e) => setFormData({ ...formData, max_distance: e.target.value })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>1 km</span>
                      <span>{formData.max_distance} km</span>
                      <span>500 km</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {step >= 4 && formData.preferred_location && (
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Continue to Photo Calibration'}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
