'use client';

import { useEffect, useState } from 'react';
import { Match } from '@/types';
import { apiService } from '@/services/api';

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await apiService.fetchMatches();
      setMatches(response);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to fetch matches');
    }
  };

  const formatDate = (dateString: string) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    return formatter.format(new Date(dateString));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Matches</h1>
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      <div className="space-y-4">
        {matches.map((match) => (
          <div 
            key={match.id} 
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">
                  You ↔ {match.user2.username}
                </h2>
                <p className="text-gray-600">
                  Score: {match.score}
                </p>
              </div>
              <p className="text-sm text-gray-500">
                Expires: {formatDate(match.expires_at)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 