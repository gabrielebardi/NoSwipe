'use client';

import { useEffect, useState } from 'react';
import { Match } from '@/types';
import { apiService } from '@/lib/api';
import { Heart, X } from 'lucide-react';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await apiService.fetchMatches();
        setMatches(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch matches');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const handleMatchAction = async (matchId: number, action: 'accept' | 'reject') => {
    try {
      await apiService.processMatchFeedback(matchId, action);
      setMatches(matches.filter(match => match.id !== matchId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process match action');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-xl">Loading matches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-red-400 text-center p-8 bg-red-900/50 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">No Matches Yet</h2>
          <p className="text-slate-400">
            Complete your profile and calibration to start getting matches!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Your Matches</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
          <div 
            key={match.id}
            className="bg-slate-800 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Match #{match.id}
                  </h2>
                  <p className="text-slate-400">
                    Score: {match.compatibility_score}%
                  </p>
                </div>
                <p className="text-sm text-slate-500">
                  Expires: {formatDate(match.expires_at)}
                </p>
              </div>
              
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => handleMatchAction(match.id, 'reject')}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition"
                >
                  <X size={20} />
                  <span>Pass</span>
                </button>
                <button
                  onClick={() => handleMatchAction(match.id, 'accept')}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition"
                >
                  <Heart size={20} />
                  <span>Like</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
