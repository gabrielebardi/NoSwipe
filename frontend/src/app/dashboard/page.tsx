'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { User, Compass, MessageCircle } from 'lucide-react';
import { apiService } from '@/lib/api';
import Link from 'next/link';
import Navigation from '@/components/layout/Navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await apiService.getProfile();
        setIsLoading(false);
      } catch (err) {
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation />

      {/* Main Content Area */}
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {/* Profile Box */}
          <Link href="/profile" 
            className="bg-slate-800 rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px] 
              transition-all duration-300 hover:bg-slate-700 hover:scale-105 cursor-pointer">
            <User size={64} className="text-pink-400 mb-4" />
            <h2 className="text-2xl font-semibold text-white mt-4">Profile</h2>
          </Link>

          {/* Explore Box */}
          <Link href="/explore"
            className="bg-slate-800 rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px]
              transition-all duration-300 hover:bg-slate-700 hover:scale-105 cursor-pointer">
            <Compass size={64} className="text-blue-400 mb-4" />
            <h2 className="text-2xl font-semibold text-white mt-4">Explore</h2>
          </Link>

          {/* Chat Box */}
          <Link href="/messages"
            className="bg-slate-800 rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px]
              transition-all duration-300 hover:bg-slate-700 hover:scale-105 cursor-pointer">
            <MessageCircle size={64} className="text-green-400 mb-4" />
            <h2 className="text-2xl font-semibold text-white mt-4">Chat</h2>
          </Link>
        </div>
      </main>
    </div>
  );
} 