'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { LocationSearch } from '../location-search';
import type { Location } from '@/lib/types';

export default function PreferencesPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    preferred_gender: '',
    preferred_age_min: '18',
    preferred_age_max: '99',
    preferred_location: null as Location | null,
  });

  // Validation state
  const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const genderOptions = [
    { value: 'M', label: 'Male' },
    { value: 'F', label: 'Female' },
    { value: 'B', label: 'Both' }
  ];

  // Validate form data
  useEffect(() => {
    const errors: string[] = [];
    
    if (!formData.preferred_gender) {
      errors.push('Please select your gender preference');
    }

    const minAge = parseInt(formData.preferred_age_min);
    const maxAge = parseInt(formData.preferred_age_max);

    if (!formData.preferred_age_min || isNaN(minAge)) {
      errors.push('Please set minimum age');
    } else if (minAge < 18) {
      errors.push('Minimum age must be at least 18');
    }

    if (!formData.preferred_age_max || isNaN(maxAge)) {
      errors.push('Please set maximum age');
    } else if (maxAge > 100) {
      errors.push('Maximum age cannot exceed 100');
    }

    if (minAge && maxAge && minAge > maxAge) {
      errors.push('Minimum age cannot be greater than maximum age');
    }

    if (!formData.preferred_location) {
      errors.push('Please select your preferred location');
    }
    
    setValidationErrors(errors);
    setIsValid(errors.length === 0);
  }, [formData]);

  const handleAgeChange = (field: 'preferred_age_min' | 'preferred_age_max', value: string) => {
    // Allow empty string for backspace/delete
    if (value === '') {
      setFormData(prev => ({
        ...prev,
        [field]: ''
      }));
      return;
    }

    // Only allow numbers
    if (!/^\d+$/.test(value)) return;

    const numValue = parseInt(value, 10);
    
    // Allow any number input, validation will handle the range
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    setError(null);

    try {
      const minAge = parseInt(formData.preferred_age_min);
      const maxAge = parseInt(formData.preferred_age_max);

      if (isNaN(minAge) || isNaN(maxAge) || minAge > maxAge) {
        throw new Error('Invalid age range');
      }

      await apiService.updatePreferences({
        preferred_gender: formData.preferred_gender,
        preferred_age_min: minAge,
        preferred_age_max: maxAge,
        preferred_location: formData.preferred_location,
      });

      const status = await apiService.getOnboardingStatus();
      router.push(status.next_step || '/dashboard');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update preferences. Please check your inputs and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Your Preferences</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Gender Preference */}
        <div>
          <label className="block text-xl mb-4">Interested In</label>
          <select
            value={formData.preferred_gender}
            onChange={(e) => setFormData({ ...formData, preferred_gender: e.target.value })}
            className="w-full p-3 rounded bg-slate-700 border border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select gender preference</option>
            {genderOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Age Range */}
        <div>
          <label className="block text-xl mb-4">Age Range</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="preferred_age_min" className="block text-sm font-medium text-gray-300 mb-2">
                Minimum Age
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                id="preferred_age_min"
                value={formData.preferred_age_min}
                onChange={(e) => handleAgeChange('preferred_age_min', e.target.value)}
                className="w-full p-3 rounded bg-slate-700 border border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="18"
              />
            </div>

            <div>
              <label htmlFor="preferred_age_max" className="block text-sm font-medium text-gray-300 mb-2">
                Maximum Age
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                id="preferred_age_max"
                value={formData.preferred_age_max}
                onChange={(e) => handleAgeChange('preferred_age_max', e.target.value)}
                className="w-full p-3 rounded bg-slate-700 border border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="99"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xl mb-4">Preferred Location</label>
          <LocationSearch
            onSelect={(location: Location) => setFormData({ ...formData, preferred_location: location })}
            defaultValue={formData.preferred_location?.display_name}
          />
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
            {validationErrors.map((error, index) => (
              <p key={index} className="text-red-500">{error}</p>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className={`w-full p-4 rounded-lg text-xl font-semibold transition-colors ${
            isValid && !isLoading
              ? 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900'
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          {isLoading ? 'Loading...' : 'Continue to Calibration'}
        </button>
      </form>
    </div>
  );
} 