'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import Navigation from '@/components/layout/Navigation';
import { Search, MessageCircle } from 'lucide-react';

export default function MessagesPage() {
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
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <div className="min-h-screen pt-16 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <div className="min-h-screen pt-16 flex items-center justify-center">
          <div className="text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation />

      {/* Main Content Area */}
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Messages</h1>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Messages List - Placeholder for now */}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-xl p-4 flex items-center space-x-4 hover:bg-slate-700 transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-slate-700 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-slate-700 rounded w-1/4 animate-pulse"></div>
                  <div className="h-3 bg-slate-700 rounded w-16 animate-pulse"></div>
                </div>
                <div className="h-3 bg-slate-700 rounded w-3/4 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {false && (
          <div className="text-center py-12">
            <MessageCircle size={48} className="mx-auto text-slate-600 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Messages Yet</h2>
            <p className="text-slate-400">
              Start matching with people to begin conversations
            </p>
          </div>
        )}
      </main>
    </div>
  );
} 