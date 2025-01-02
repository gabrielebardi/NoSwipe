'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/layout/Navigation';
import { Location } from '@/types';
import { LocationSearch } from './location-search';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    gender: user?.gender || '',
    birth_date: user?.birth_date || '',
    location: user?.location || {
      id: 64454876,
      type: 'city',
      city: 'Zürich',
      region: 'Zürich',
      country: 'Schweiz/Suisse/Svizzera/Svizra',
      latitude: 47.3744489,
      longitude: 8.5410422,
      display_name: 'Zürich, Schweiz/Suisse/Svizzera/Svizra'
    } as Location,
  });

  // Calculate minimum and maximum dates for the date picker
  const today = new Date();
  const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate()).toISOString().split('T')[0];
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().split('T')[0];

  // Check onboarding status on mount and after updates
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const status = await apiService.getOnboardingStatus();
        console.log('Onboarding status:', status);
        
        if (!status) {
          console.warn('No onboarding status received');
          return;
        }

        // If we're not on the correct step or basic info is complete, redirect
        if (status.current_step !== 'details') {
          if (status.next_step) {
            console.log('Redirecting to:', status.next_step);
            router.push(status.next_step);
          }
          return;
        }

        // If basic info is already complete, move to next step
        if (status.steps_completed?.basic_info && status.next_step) {
          console.log('Basic info complete, moving to:', status.next_step);
          router.push(status.next_step);
        }
      } catch (err) {
        console.warn('Failed to check onboarding status:', err);
        // Don't show error to user unless it's a specific API error
        if (err instanceof Error && err.message !== 'Failed to fetch') {
          setError('Failed to check onboarding status. Please try again.');
        }
      }
    };

    checkOnboardingStatus();
  }, [router]);

  const handleLocationSelect = (location: Location) => {
    console.log('Selected location:', location);
    setFormData(prev => ({ ...prev, location }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      // Step 1: Validate form data
      console.log('🔍 Step 1: Validating form data:', {
        gender: formData.gender,
        birth_date: formData.birth_date,
        location: formData.location
      });

      if (!formData.gender) {
        throw new Error('Please select your gender');
      }
      if (!formData.birth_date) {
        throw new Error('Please enter your birth date');
      }
      if (!formData.location) {
        throw new Error('Please select a valid location');
      }

      // Step 2: Validate age
      console.log('🔍 Step 2: Validating age');
      const birthDate = new Date(formData.birth_date);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      console.log('📅 Age calculation:', {
        birthDate,
        age,
        monthDiff,
        isUnder18: age < 18 || (age === 18 && monthDiff < 0)
      });

      if (age < 18 || (age === 18 && monthDiff < 0)) {
        throw new Error('You must be at least 18 years old to use this app');
      }

      // Step 3: Prepare update data
      console.log('📝 Step 3: Preparing update data');
      const updateData = {
        gender: formData.gender as 'M' | 'F' | 'O',
        birth_date: formData.birth_date,
        location: formData.location
      };
      console.log('📦 Update data prepared:', JSON.stringify(updateData, null, 2));

      // Step 4: Update user details
      console.log('🚀 Step 4: Sending update request');
      const updatedUser = await apiService.updateUserDetails(updateData);
      console.log('✅ User details updated successfully:', updatedUser);
      
      if (!updatedUser) {
        throw new Error('Failed to update user details: No response from server');
      }

      // Step 5: Get onboarding status and redirect
      console.log('🔄 Step 5: Getting onboarding status');
      const status = await apiService.getOnboardingStatus();
      console.log('📊 Onboarding status received:', status);

      if (!status) {
        throw new Error('Failed to get onboarding status: No response from server');
      }

      // Step 6: Handle redirect based on status
      console.log('🎯 Step 6: Handling redirect');
      if (status.next_step) {
        console.log('➡️ Redirecting to:', status.next_step);
        router.push(status.next_step);
      } else if (status.steps_completed?.basic_info) {
        console.log('✅ Basic info complete, redirecting to preferences');
        router.push('/onboarding/preferences');
      } else {
        console.warn('⚠️ No next step provided and basic info not complete');
        setError('There was an issue with the onboarding process. Please try again or contact support.');
      }

    } catch (err) {
      const error = err as Error;
      console.error('❌ Error in handleSubmit:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        formData: JSON.stringify(formData, null, 2)
      });

      // Provide more user-friendly error messages
      let userMessage = error.message;
      if (error.message.includes('404')) {
        userMessage = 'The server could not process your request. Please try again later.';
      } else if (error.message.includes('network')) {
        userMessage = 'There seems to be a network issue. Please check your connection and try again.';
      }

      setError(userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <div className="min-h-screen pt-16 flex items-center justify-center">
          <div className="max-w-md w-full space-y-8 p-8 bg-slate-800 rounded-xl shadow-lg">
            <div>
              <h2 className="text-3xl font-bold text-center text-white">
                Welcome to NoSwipe
              </h2>
              <p className="mt-2 text-center text-slate-400">
                Let's get to know you better
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-slate-300">
                  Gender
                </label>
                <select
                  id="gender"
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select your gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="birth_date" className="block text-sm font-medium text-slate-300">
                  Birth Date
                </label>
                <input
                  id="birth_date"
                  type="date"
                  required
                  min={minDate}
                  max={maxDate}
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-slate-400">
                  You must be at least 18 years old
                </p>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-slate-300">
                  Location (City/Town)
                </label>
                <LocationSearch 
                  onSelect={handleLocationSelect}
                  defaultValue={formData.location?.display_name || ''}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                  isLoading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {isLoading ? 'Saving...' : 'Continue'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
