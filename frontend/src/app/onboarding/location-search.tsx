'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search } from 'lucide-react';
import { Location } from '@/lib/types';
import { apiService } from '@/lib/api';
import { debounce } from 'lodash';

interface LocationSearchProps {
  onSelect: (location: Location) => void;
  defaultValue?: string;
}

export function LocationSearch({ onSelect, defaultValue = 'Zürich, Zürich, Schweiz/Suisse/Svizzera/Svizra' }: LocationSearchProps) {
  const [query, setQuery] = useState(defaultValue);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  const searchLocations = useCallback(
    debounce(async (searchQuery: string) => {
      console.log('🔍 Starting location search for:', searchQuery);
      if (!searchQuery.trim()) {
        console.log('Empty search query, clearing results');
        setLocations([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('Calling API searchLocations with query:', searchQuery);
        const results = await apiService.searchLocations(searchQuery);
        console.log('API Response:', {
          resultsLength: results?.length || 0,
          firstResult: results?.[0],
          isArray: Array.isArray(results),
          results
        });
        
        if (!Array.isArray(results) || results.length === 0) {
          console.log('No results found for query:', searchQuery);
          setError('No cities found matching your search');
          setLocations([]);
        } else {
          console.log('Found', results.length, 'locations:', 
            results.map(l => `${l.city || l.display_name}, ${l.region || ''}, ${l.country || ''}`));
          setLocations(results);
          setError(null);
        }
        setShowResults(true);
      } catch (err) {
        console.error('Search error details:', {
          error: err,
          message: err instanceof Error ? err.message : 'Unknown error',
          query: searchQuery
        });
        setError('Failed to search locations. Please try again.');
        setLocations([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Debug initial mount and load default location
  useEffect(() => {
    console.log('LocationSearch mounted with defaultValue:', defaultValue);
    
    // Only search on initial mount if we have a default value
    if (isInitialMount.current && defaultValue) {
      isInitialMount.current = false;
      if (defaultValue.includes('Zürich')) {
        // Set initial Zürich location without searching
        setLocations([{
          id: 64454876,
          type: 'city',
          city: 'Zürich',
          region: 'Zürich',
          country: 'Schweiz/Suisse/Svizzera/Svizra',
          latitude: 47.3744489,
          longitude: 8.5410422,
          display_name: 'Zürich, Schweiz/Suisse/Svizzera/Svizra'
        }]);
      } else {
        // For other default values, perform a search
        searchLocations(defaultValue);
      }
    }
  }, [defaultValue, searchLocations]);

  // Handle clicks outside of the search component
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    console.log('Query changed:', {
      query,
      length: query.length,
      shouldSearch: query.length >= 2
    });
    
    if (query.length >= 2) {
      searchLocations(query);
    } else {
      console.log('Query too short, clearing results');
      setLocations([]);
      setShowResults(false);
      setError(null);
    }
  }, [query, searchLocations]);

  const handleSelect = (location: Location) => {
    console.log('Location selected:', {
      location,
      id: location.id,
      city: location.city,
      region: location.region,
      country: location.country
    });
    
    // Create display string from available location data
    const displayParts = [
      location.city,
      location.region,
      location.country
    ].filter(Boolean);
    
    const displayString = displayParts.join(', ') || location.display_name;
    console.log('Setting display string:', displayString);
    
    setQuery(displayString);
    setShowResults(false);
    setError(null);
    onSelect(location);
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (locations.length > 0) {
              setShowResults(true);
            }
          }}
          placeholder="Search for a city..."
          className="w-full px-4 py-2 pl-10 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          autoComplete="off"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
      </div>

      {loading && (
        <div className="absolute z-20 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg p-2 text-slate-300">
          Searching cities...
        </div>
      )}

      {error && !loading && (
        <div className="absolute z-20 w-full mt-1 bg-red-500/10 border border-red-500 rounded-lg p-2 text-red-500">
          {error}
        </div>
      )}

      {!loading && !error && showResults && locations.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg max-h-60 overflow-auto">
          {locations.map((location) => {
            // Create display name from available fields
            const cityName = location.city || location.display_name;
            const details = [location.region, location.country].filter(Boolean).join(', ');
            
            return (
              <button
                key={location.id}
                type="button"
                onClick={() => handleSelect(location)}
                className="w-full px-4 py-2 text-left hover:bg-slate-600 focus:outline-none focus:bg-slate-600 transition-colors"
              >
                <div className="font-medium text-white">
                  {cityName}
                </div>
                {details && (
                  <div className="text-sm text-slate-400">
                    {details}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
