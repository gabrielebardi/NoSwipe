'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth';
import Navigation from '@/components/layout/Navigation';
import { Camera, Plus, X } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    bio: user?.bio || '',
    birthday: user?.birthday || '',
    interests: user?.interests || [],
    dislikes: user?.dislikes || [],
  });

  // Display user info from registration
  const userInfo = {
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    gender: user?.gender || '',
    age: user?.age || '',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const updatedUser = await apiService.updateProfile({
        ...formData,
        interests: formData.interests,
        dislikes: formData.dislikes,
      });

      updateUser(updatedUser);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddInterest = (type: 'interests' | 'dislikes') => {
    const interest = prompt(`Add new ${type === 'interests' ? 'interest' : 'dislike'}`);
    if (interest) {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], interest],
      }));
    }
  };

  const handleRemoveItem = (type: 'interests' | 'dislikes', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Edit Profile</h1>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
              {error}
            </div>
          )}

          <div className="space-y-8">
            {/* User Info Section */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400">Email</label>
                  <div className="mt-1 text-white">{userInfo.email}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400">Name</label>
                  <div className="mt-1 text-white">{`${userInfo.first_name} ${userInfo.last_name}`}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400">Gender</label>
                  <div className="mt-1 text-white">
                    {userInfo.gender === 'M' ? 'Male' : userInfo.gender === 'F' ? 'Female' : 'Other'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400">Age</label>
                  <div className="mt-1 text-white">{userInfo.age}</div>
                </div>
              </div>
            </div>

            {/* Photos Section */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Photos</h2>
              <div className="grid grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-600 transition-colors cursor-pointer"
                  >
                    {i === 0 ? (
                      <Camera size={24} className="text-slate-400" />
                    ) : (
                      <Plus size={24} className="text-slate-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800 rounded-xl p-6">
              <div>
                <label htmlFor="birthday" className="block text-sm font-medium text-slate-300">
                  Birthday
                </label>
                <input
                  id="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-slate-300">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Interests Section */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Things You Love
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-400"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem('interests', index)}
                        className="ml-2 hover:text-blue-300"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => handleAddInterest('interests')}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  + Add Interest
                </button>
              </div>

              {/* Dislikes Section */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Things You Don't Like (Icks)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.dislikes.map((dislike, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-red-500/20 text-red-400"
                    >
                      {dislike}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem('dislikes', index)}
                        className="ml-2 hover:text-red-300"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => handleAddInterest('dislikes')}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  + Add Dislike
                </button>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
