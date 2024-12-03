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
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      await apiService.register(formData);
      // Show success message and redirect to login
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center">Create Account</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="First Name"
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              value={formData.password2}
              onChange={(e) => setFormData({...formData, password2: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg"
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        {errorMessage && (
          <div className="text-red-500 text-center">{errorMessage}</div>
        )}
      </div>
    </div>
  );
} 