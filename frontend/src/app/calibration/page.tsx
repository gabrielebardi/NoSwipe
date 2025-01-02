'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { getImageUrl } from '@/lib/utils/urls';
import type { CalibrationPhoto } from '@/types';
import { Star, Loader, Home } from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function CalibrationPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<CalibrationPhoto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await apiService.getCalibrationPhotos();
        if (!data || data.length === 0) {
          throw new Error('No calibration photos available');
        }
        const validPhotos = data.filter(photo => photo.image_url && photo.id);
        if (validPhotos.length === 0) {
          throw new Error('No valid photos available for calibration');
        }
        setPhotos(validPhotos);
      } catch (err) {
        console.error('Failed to fetch calibration photos:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch calibration photos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  const handleRating = async (rating: number) => {
    if (isSubmitting || currentIndex >= photos.length) return;

    const currentPhoto = photos[currentIndex];
    if (!currentPhoto?.id) {
      setError('Invalid photo data');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Submit the rating for the current photo
      await apiService.submitPhotoRating(currentPhoto.id, rating);

      if (currentIndex === photos.length - 1) {
        // On the last photo, complete calibration
        const response = await apiService.completeCalibration();
        if (response.status === 'error') {
          throw new Error(response.message || 'Failed to complete calibration');
        }
        setIsCompleted(true);
      } else {
        // Move to next photo
        setCurrentIndex(prev => prev + 1);
      }
    } catch (err) {
      console.error('Failed to submit rating:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit rating');
      
      // If there's an error on the last photo, allow retrying
      if (currentIndex === photos.length - 1) {
        setCurrentIndex(prev => prev - 1);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoHome = async () => {
    try {
      // Check onboarding status before redirecting
      const status = await apiService.getOnboardingStatus();
      router.push(status.next_step || '/dashboard');
    } catch (err) {
      console.error('Failed to get next step:', err);
      // Default to dashboard if we can't get the status
      router.push('/dashboard');
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-900">
          <Navigation />
          <div className="min-h-screen pt-16 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-white">
              <Loader className="animate-spin" size={24} />
              <span>Loading photos...</span>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-900">
          <Navigation />
          <div className="min-h-screen pt-16 flex items-center justify-center">
            <div className="max-w-md mx-auto text-center">
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-6">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (photos.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-900">
          <Navigation />
          <div className="min-h-screen pt-16 flex items-center justify-center">
            <div className="text-white text-xl text-center">
              <p className="mb-4">No photos available for calibration.</p>
              <button
                onClick={handleGoHome}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8 pt-24">
          <h1 className="text-3xl font-bold text-white text-center mb-8">
            {isCompleted ? 'Calibration Complete!' : 'Rate Your Preferences'}
          </h1>
          <div className="max-w-md mx-auto bg-slate-800 rounded-xl shadow-lg p-6">
            {!isCompleted && currentIndex < photos.length && (
              <>
                {photos[currentIndex]?.image_url ? (
                  <img 
                    src={getImageUrl(photos[currentIndex].image_url)}
                    alt={`Calibration photo ${currentIndex + 1}`}
                    className="w-full h-auto rounded-lg shadow-lg mb-6"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      console.error('Failed to load image:', target.src);
                      setError('Failed to load image');
                    }}
                  />
                ) : (
                  <div className="w-full h-64 bg-slate-700 rounded-lg flex items-center justify-center mb-6">
                    <p className="text-slate-400">Image not available</p>
                  </div>
                )}
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRating(rating)}
                      disabled={isSubmitting}
                      className={`p-2 rounded-full transition ${
                        isSubmitting
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-blue-600/20'
                      }`}
                    >
                      <Star
                        size={32}
                        className={`text-yellow-400 transition ${
                          isSubmitting ? 'opacity-50' : 'hover:scale-110'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-slate-400 mt-4">
                  Photo {currentIndex + 1} of {photos.length}
                </p>
              </>
            )}

            {isCompleted && (
              <div className="text-center py-8">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Thank you for your feedback!
                </h2>
                <p className="text-slate-400 mb-8">
                  We'll use your preferences to find matches that you might be interested in. 
                  Come back soon to check your potential matches!
                </p>
                <button
                  onClick={handleGoHome}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Home className="mr-2" size={20} />
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
