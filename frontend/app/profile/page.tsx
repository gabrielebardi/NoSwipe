'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import type { UserProfile } from '@/types';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    username: '',
    email: '',
    bio: '',
    interests: [],
    gender: '',
    age: undefined,
    location: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await apiService.fetchProfile();
      setProfile(data);
    } catch (error) {
      setErrorMessage('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      await apiService.updateProfile(profile);
      setSuccessMessage('Profile updated successfully');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            value={profile.username}
            onChange={(e) => setProfile({...profile, username: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            value={profile.gender || ''}
            onChange={(e) => setProfile({...profile, gender: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Age</label>
          <input
            type="number"
            value={profile.age || ''}
            onChange={(e) => setProfile({...profile, age: parseInt(e.target.value)})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            value={profile.location || ''}
            onChange={(e) => setProfile({...profile, location: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg"
        >
          Save Changes
        </button>
      </form>

      {successMessage && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          {errorMessage}
        </div>
      )}
    </div>
  );
} 