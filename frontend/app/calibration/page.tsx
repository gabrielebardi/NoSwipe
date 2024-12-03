'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services/api';

interface Photo {
  id: number;
  image_url: string;
}

export default function CalibrationPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ratings, setRatings] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

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
    return <div className="text-center p-8">Loading calibration photos...</div>;
  }

  if (errorMessage) {
    return <div className="text-center text-red-500 p-8">{errorMessage}</div>;
  }

  if (photos.length === 0) {
    return <div className="text-center p-8">No photos available for calibration.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Photo Calibration</h1>
      <div className="max-w-md mx-auto">
        {!isCompleted && currentIndex < photos.length && (
          <>
            <img 
              src={photos[currentIndex].image_url} 
              alt={`Calibration photo ${currentIndex + 1}`}
              className="w-full h-auto rounded-lg shadow-lg mb-4"
            />
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRating(rating)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className="text-center mt-4">
              Photo {currentIndex + 1} of {photos.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 