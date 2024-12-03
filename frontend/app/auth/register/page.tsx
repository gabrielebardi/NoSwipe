'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    birth_date: '',
    gender: '',
    location: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (formData.password !== formData.password2) {
      throw new Error('Passwords do not match');
    }
    if (formData.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    // Add more validations as needed
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      validateForm();
      await apiService.register(formData);
      router.push('/auth/login?registered=true');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-slate-800 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-white">Create Account</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              className="px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              className="px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          />
          <input
            type="date"
            placeholder="Birth Date"
            value={formData.birth_date}
            onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
            className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          />
          <select
            value={formData.gender}
            onChange={(e) => setFormData({...formData, gender: e.target.value})}
            className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          >
            <option value="">Select Gender</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
          </select>
          <input
            type="text"
            placeholder="Location"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={formData.password2}
            onChange={(e) => setFormData({...formData, password2: e.target.value})}
            className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-blue-400 transition-colors"
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        {errorMessage && (
          <div className="text-red-400 text-center mt-4 p-3 bg-red-900/50 rounded-lg">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
} 