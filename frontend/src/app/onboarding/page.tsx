'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth';
import Navigation from '@/components/layout/Navigation';
import { Location } from '@/types';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Check onboarding status on mount and after updates
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const status = await apiService.getOnboardingStatus();
        console.log('Onboarding status:', status);
        
        // If current step is not 'details', redirect to the appropriate step
        if (status.current_step !== 'details' && status.next_step) {
          console.log('Redirecting to:', status.next_step);
          router.push(status.next_step);
        }
      } catch (err) {
        console.error('Failed to check onboarding status:', err);
      }
    };

    checkOnboardingStatus();
  }, [router]);

  // Initialize form data with existing user data if available
  const [formData, setFormData] = useState({
    gender: user?.gender || '',
    birth_date: user?.birth_date || '',
    location: user?.location || null as Location | null,
  });

  // Calculate minimum and maximum dates for the date picker
  const today = new Date();
  const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate()).toISOString().split('T')[0];
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().split('T')[0];

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        try {
          setIsSearching(true);
          setError(null);
          console.log('Searching locations for:', searchQuery); // Debug log
          const results = await apiService.searchLocations(searchQuery);
          console.log('Search results:', results); // Debug log
          
          if (results.length === 0) {
            setError('No cities found matching your search');
          }
          
          setSearchResults(results);
          setShowResults(true);
        } catch (err) {
          console.error('Location search error:', err);
          setError('Failed to search locations. Please try again.');
          setSearchResults([]);
          setShowResults(false);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
        setError(null);
      }
    }, 500); // Increased debounce time to 500ms

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLocationSelect = (location: Location) => {
    console.log('Selected location:', location); // Debug log
    setFormData(prev => ({ ...prev, location }));
    setSearchQuery(location.city ? `${location.city}, ${location.country}` : location.display_name);
    setShowResults(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.gender) {
      setError('Please select your gender');
      return;
    }
    if (!formData.birth_date) {
      setError('Please enter your birth date');
      return;
    }
    if (!formData.location) {
      setError('Please select a valid location');
      return;
    }

    // Validate age (must be at least 18)
    const birthDate = new Date(formData.birth_date);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (age < 18 || (age === 18 && monthDiff < 0)) {
      setError('You must be at least 18 years old to use this app');
      return;
    }
    
    setError(null);
    setIsLoading(true);

    try {
      console.log('Submitting user details:', formData);

      const updatedUser = await apiService.updateUserDetails({
        gender: formData.gender as 'M' | 'F' | 'O',
        birth_date: formData.birth_date,
        location: {
          ...formData.location,
          display_name: `${formData.location.city}${formData.location.region ? `, ${formData.location.region}` : ''}${formData.location.country ? `, ${formData.location.country}` : ''}`
        }
      });

      console.log('User details updated:', updatedUser);
      updateUser(updatedUser);

      // Get updated onboarding status and redirect to next step
      const status = await apiService.getOnboardingStatus();
      if (status.next_step) {
        router.push(status.next_step);
      }
    } catch (err) {
      console.error('Failed to update user details:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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

            <div className="relative">
              <label htmlFor="location" className="block text-sm font-medium text-slate-300">
                Location (City/Town)
              </label>
              <input
                id="location"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Start typing your city name..."
                autoComplete="off"
              />
              
              {isSearching && (
                <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg p-2 text-slate-300">
                  Searching cities...
                </div>
              )}

              {error && !isSearching && (
                <div className="absolute z-10 w-full mt-1 bg-red-500/10 border border-red-500 rounded-lg p-2 text-red-500">
                  {error}
                </div>
              )}

              {showResults && searchResults.length > 0 && !isSearching && (
                <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {searchResults.map((location) => (
                    <button
                      key={location.id}
                      type="button"
                      className="w-full px-4 py-2 text-left hover:bg-slate-600 focus:outline-none focus:bg-slate-600"
                      onClick={() => handleLocationSelect(location)}
                    >
                      <div className="font-medium text-white">
                        {location.city}
                      </div>
                      <div className="text-sm text-slate-400">
                        {location.region && `${location.region}, `}{location.country}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {formData.location && (
                <p className="mt-1 text-sm text-slate-400">
                  Selected: {formData.location.city}
                  {formData.location.region && `, ${formData.location.region}`}
                  {formData.location.country && `, ${formData.location.country}`}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
