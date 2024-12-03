'use client';
import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
  
    try {
      const response = await apiService.login(email, password);
      
      // Check if user needs calibration
      const calibrationResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/calibration-status/`,
        {
          credentials: 'include',
        }
      );
      
      if (!calibrationResponse.ok) {
        throw new Error('Failed to check calibration status');
      }
      
      const calibrationData = await calibrationResponse.json();
      
      if (calibrationData.isCalibrated) {
        router.push('/matches');
      } else {
        router.push('/calibration');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : 'Unable to connect to server. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-slate-800 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-white">Login</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg bg-slate-700 text-white border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg bg-slate-700 text-white border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-blue-400 transition-colors"
          >
            {isLoading ? 'Logging in...' : 'Login'}
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