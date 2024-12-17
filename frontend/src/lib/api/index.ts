import axios from 'axios';
import type { UserProfile, Location } from '@/lib/types';

interface AuthResponse {
  user: UserProfile;
  calibration_completed?: boolean;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  async (config) => {
    // Only get CSRF token for non-GET requests
    if (config.method !== 'get') {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/csrf/`, {
          credentials: 'include',
        });
        const data = await response.json();
        if (config.headers) {
          config.headers['X-CSRFToken'] = data.csrfToken;
        }
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear auth state on unauthorized
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

const handleApiError = (error: any) => {
  if (error.response) {
    if (error.response.data.detail) {
      throw new Error(error.response.data.detail);
    } else if (error.response.data.errors) {
      const errors = Object.entries(error.response.data.errors)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      throw new Error(errors);
    }
    throw new Error('An error occurred while processing your request');
  } else if (error.request) {
    throw new Error('No response received from server');
  } else {
    throw new Error('Error setting up the request');
  }
};

export const apiService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/api/auth/login/', { email, password });
      // Set onboarding cookie based on calibration status
      if (response.data.user.calibration_completed) {
        document.cookie = 'onboarding_completed=true; path=/';
      }
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  register: async (data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password2: string;
  }): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/api/auth/register/', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout/');
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getProfile: async (): Promise<UserProfile> => {
    try {
      const response = await api.get<UserProfile>('/api/user/details/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      const response = await api.patch<UserProfile>('/api/user/details/', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  fetchMatches: async () => {
    try {
      const response = await api.get('/api/matches/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getOnboardingStatus: async () => {
    try {
      const response = await api.get('/api/user/onboarding-status/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getCalibrationPhotos: async () => {
    try {
      const response = await api.get('/api/photos/calibration/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  submitPhotoRating: async (photoId: number, rating: number) => {
    try {
      const response = await api.post('/api/photos/rate/', { photo_id: photoId, rating });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  trainUserModel: async () => {
    try {
      const response = await api.post('/api/user/calibrate/train/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updateUserDetails: async (data: {
    gender: 'M' | 'F' | 'O';
    age: number;
    location: any;
  }): Promise<UserProfile> => {
    try {
      const response = await api.patch<UserProfile>('/api/user/details/', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updatePreferences: async (data: {
    preferred_gender: 'M' | 'F' | 'B';
    preferred_age_min: number;
    preferred_age_max: number;
    preferred_location: any;
    max_distance: number;
  }): Promise<UserProfile> => {
    try {
      const response = await api.patch<UserProfile>('/api/user/preferences/', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  searchLocations: async (query: string): Promise<Location[]> => {
    try {
      const response = await api.get<Location[]>('/api/locations/search/', {
        params: { query }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  processMatchFeedback: async (matchId: number, action: 'accept' | 'reject'): Promise<void> => {
    try {
      await api.post(`/api/matches/${matchId}/feedback/`, { action });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  completeCalibration: async () => {
    try {
      const response = await api.post('/api/user/calibrate/');
      // Set onboarding cookie when calibration is completed
      document.cookie = 'onboarding_completed=true; path=/';
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
