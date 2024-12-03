'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services/api';

export default function Navigation() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiService.logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-7">
            <div className="flex items-center py-4">
              <Link href="/" className="text-lg font-semibold">
                NoSwipe
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/matches" className="py-2 px-3 hover:text-gray-700">
              Matches
            </Link>
            <Link href="/profile" className="py-2 px-3 hover:text-gray-700">
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="py-2 px-3 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 