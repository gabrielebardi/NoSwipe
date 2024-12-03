'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Location } from '@/lib/types';
import { apiService } from '@/lib/api';
import { debounce } from 'lodash';

interface LocationSearchProps {
  onSelect: (location: Location) => void;
  defaultValue?: string;
}

export function LocationSearch({ onSelect, defaultValue = '' }: LocationSearchProps) {
  const [query, setQuery] = useState(defaultValue);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchLocations = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setLocations([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const results = await apiService.searchLocations(searchQuery);
        setLocations(results);
      } catch (err) {
        console.error('Failed to search locations:', err);
        setError('Failed to search locations. Please try again.');
        setLocations([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    searchLocations(query);
  }, [query, searchLocations]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a city..."
          className="w-full px-4 py-2 pl-10 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
      </div>

      {loading && (
        <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-400">
          Searching...
        </div>
      )}

      {error && (
        <div className="absolute z-10 w-full mt-1 bg-red-900/50 border border-red-700 rounded-lg p-2 text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && locations.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          {locations.map((location) => (
            <li
              key={location.id}
              onClick={() => {
                onSelect(location);
                setQuery(location.display_name);
                setLocations([]);
              }}
              className="px-4 py-2 hover:bg-slate-700 cursor-pointer"
            >
              <div className="font-medium">{location.city || location.region || location.country}</div>
              <div className="text-sm text-slate-400">{location.display_name}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
