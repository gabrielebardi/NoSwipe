'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services/api';

export default function InterestRatingPage() {
  const router = useRouter();
  const [interests, setInterests] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ratings, setRatings] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    try {
      const response = await apiService.fetchInterests();
      setInterests(response);
      setRatings(new Array(response.length).fill(0));
    } catch (error) {
      console.error('Failed to fetch interests:', error);
    }
  };

  const handleRating = async (rating: number) => {
    const newRatings = [...ratings];
    newRatings[currentIndex] = rating;
    setRatings(newRatings);

    try {
      await apiService.submitInterestRating(interests[currentIndex], rating);
      
      if (currentIndex + 1 >= interests.length) {
        setIsCompleted(true);
        setTimeout(() => {
          router.push('/matches');
        }, 2000);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to submit rating:', error);
    }
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Interest Rating Completed!</h2>
          <p className="text-gray-600">Redirecting to matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-8">
        <h2 className="text-2xl font-bold text-center mb-8">
          Rate your interest in:
        </h2>
        
        {interests[currentIndex] && (
          <div className="text-center">
            <p className="text-3xl mb-8">{interests[currentIndex]}</p>
            
            <div className="flex justify-center space-x-4">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRating(rating)}
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl"
                >
                  {rating}
                </button>
              ))}
            </div>
            
            <p className="mt-4 text-gray-500">
              {currentIndex + 1} of {interests.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 