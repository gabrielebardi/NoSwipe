'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { LocationSearch } from './location-search';
import type { Location } from '@/types';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    gender: '',
    age: '',
    location: null as Location | null,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.gender || !formData.age || !formData.location) {
      setError('Please fill in all fields');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await apiService.updateUserDetails({
        gender: formData.gender as 'M' | 'F' | 'O',
        age: parseInt(formData.age),
        location: formData.location,
      });
      router.push('/onboarding/preferences');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Tell Us About Yourself</h1>
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
                I am a...
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'M', label: 'Man' },
                  { value: 'F', label: 'Woman' },
                  { value: 'O', label: 'Other' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, gender: value });
                      setStep(2);
                    }}
                    className={`p-4 rounded-lg border ${
                      formData.gender === value
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
                <label htmlFor="age" className="block text-sm font-medium text-slate-300 mb-2">
                  How old are you?
                </label>
                <input
                  id="age"
                  type="number"
                  min="18"
                  max="100"
                  value={formData.age}
                  onChange={(e) => {
                    setFormData({ ...formData, age: e.target.value });
                    if (e.target.value) setStep(3);
                  }}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your age"
                />
              </div>
            )}

            {step >= 3 && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Where do you live?
                </label>
                <LocationSearch
                  onSelect={(location) => setFormData({ ...formData, location })}
                  selected={formData.location}
                />
              </div>
            )}

            {step === 3 && formData.location && (
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Continue'}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
