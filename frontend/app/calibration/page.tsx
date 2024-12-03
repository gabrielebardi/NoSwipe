'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services/api';
import { CalibrationPhoto } from '@/types';

export default function CalibrationPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<CalibrationPhoto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ratings, setRatings] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuthenticated = await apiService.checkAuth();
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }
      fetchPhotos();
    } catch (error) {
      router.push('/auth/login');
    }
  };

  const fetchPhotos = async () => {
    try {
      const fetchedPhotos = await apiService.getCalibrationPhotos('preferred_gender');
      setPhotos(fetchedPhotos);
      setRatings(new Array(fetchedPhotos.length).fill(5));
      setIsLoading(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load photos');
      setIsLoading(false);
    }
  };

  const handleRating = async (rating: number) => {
    try {
      await apiService.submitPhotoRating(photos[currentIndex].id, rating);
      
      // Update ratings array
      const newRatings = [...ratings];
      newRatings[currentIndex] = rating;
      setRatings(newRatings);
      
      if (currentIndex + 1 >= photos.length) {
        setIsCompleted(true);
        await apiService.trainUserModel();
        router.push('/matches');
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit rating');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-xl">Loading calibration photos...</div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-red-400 text-center p-8 bg-red-900/50 rounded-lg">
          {errorMessage}
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-xl">No photos available for calibration.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Rate Your Preferences
        </h1>
        <div className="max-w-md mx-auto bg-slate-800 rounded-xl shadow-lg p-6">
          {!isCompleted && currentIndex < photos.length && (
            <>
              <img 
                src={photos[currentIndex].image_url} 
                alt={`Calibration photo ${currentIndex + 1}`}
                className="w-full h-auto rounded-lg shadow-lg mb-6"
              />
              <div className="grid grid-cols-5 gap-2 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRating(rating)}
                    className={`px-4 py-3 ${
                      ratings[currentIndex] === rating 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                    } rounded-lg transition-colors`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <div className="text-center text-slate-400">
                Photo {currentIndex + 1} of {photos.length}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 