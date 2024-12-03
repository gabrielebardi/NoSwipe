'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import type { CalibrationPhoto } from '@/types';
import { Star, Loader } from 'lucide-react';

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
        const data = await apiService.getCalibrationPhotos();
        setPhotos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch photos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  const handleRating = async (rating: number) => {
    if (isSubmitting || currentIndex >= photos.length) return;

    setIsSubmitting(true);
    try {
      await apiService.submitPhotoRating(photos[currentIndex].id, rating);

      if (currentIndex === photos.length - 1) {
        await apiService.trainUserModel();
        setIsCompleted(true);
        setTimeout(() => {
          router.push('/matches');
        }, 2000);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex items-center space-x-2 text-white">
          <Loader className="animate-spin" size={24} />
          <span>Loading photos...</span>
        </div>
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
                Calibration Complete!
              </h2>
              <p className="text-slate-400">
                Redirecting you to your matches...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
