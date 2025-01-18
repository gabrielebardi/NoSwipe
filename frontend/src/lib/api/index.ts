import axios from 'axios';
import Cookies from 'js-cookie';
import type { 
  CalibrationPhoto as _CalibrationPhoto, 
  CalibrationResponse, 
  CalibrationPhotosResponse,
  RegisterResponse, 
  LoginResponse, 
  Location, 
  User,
  UserPreferences
} from '@/types';

interface _ApiErrorResponse {
  message?: string;
  detail?: string;
  [key: string]: string | undefined;
}

interface TokenResponse {
  access: string;
  refresh: string;
}

interface OnboardingStatus {
  status: string;
  current_step: string;
  next_step: string | null;
  steps_completed: {
    basic_info: boolean;
    preferences: boolean;
    calibration: boolean;
  };
  missing_fields: {
    basic_info: Record<string, boolean>;
    preferences: Record<string, boolean>;
    calibration: boolean;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Token management
const TOKEN_STORAGE_KEY = 'auth_tokens';
const ONBOARDING_STATUS_KEY = 'onboarding_status';

const getStoredTokens = () => {
  try {
    const tokens = Cookies.get(TOKEN_STORAGE_KEY);
    return tokens ? JSON.parse(tokens) : null;
  } catch (error) {
    console.error('Failed to parse stored tokens:', error);
    return null;
  }
};

const setStoredTokens = (tokens: TokenResponse | null) => {
  try {
    if (tokens) {
      Cookies.set(TOKEN_STORAGE_KEY, JSON.stringify(tokens), { 
        expires: 7, // 7 days
        path: '/',
        sameSite: 'strict'
      });
    } else {
      Cookies.remove(TOKEN_STORAGE_KEY, { path: '/' });
    }
  } catch (error) {
    console.error('Failed to store tokens:', error);
  }
};

const setOnboardingStatus = (status: OnboardingStatus) => {
  try {
    Cookies.set(ONBOARDING_STATUS_KEY, JSON.stringify(status), {
      expires: 7,
      path: '/',
      sameSite: 'strict'
    });
  } catch (error) {
    console.error('Failed to store onboarding status:', error);
  }
};

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor for JWT tokens and CSRF
api.interceptors.request.use(
  (config) => {
    // Add JWT token if available
    const tokens = getStoredTokens();
    if (tokens?.access) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    
    // Add CSRF token for non-GET requests that are not auth endpoints
    if (config.method !== 'get' && 
        typeof document !== 'undefined' && 
        !config.url?.includes('/api/auth/')) {
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
        
      if (csrfToken) {
        config.headers = config.headers || {};
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Skip token refresh for auth endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/api/auth/');
    if (isAuthEndpoint) {
      // For auth endpoints, return a more specific error
      const message = error.response?.data?.detail 
        || error.response?.data?.message
        || (error.response?.status === 401 ? 'Invalid credentials' : 'Authentication failed');
      return Promise.reject(new Error(message));
    }
    
    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const tokens = getStoredTokens();
        if (!tokens?.refresh) {
          console.log('No refresh token available, clearing tokens');
          setStoredTokens(null);
          throw new Error('No refresh token available');
        }
        
        // Try to refresh the token
        const response = await axios.post<TokenResponse>(
          `${API_URL}/api/auth/token/refresh/`,
          { refresh: tokens.refresh },
          {
            // Don't use the intercepted instance for refresh
            baseURL: undefined,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );
        
        // Store new tokens
        const newTokens = response.data;
        setStoredTokens(newTokens);
        
        // Update authorization header
        originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
        
        // Retry the original request with new token
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // If refresh fails, clear tokens and throw error
        setStoredTokens(null);
        throw new Error('Session expired. Please login again.');
      }
    }
    
    // Format error message
    const message = error.response?.data?.message 
      || error.response?.data?.detail
      || error.message
      || 'An error occurred';
    
    return Promise.reject(new Error(message));
  }
);

export const apiService = {
  // Token management
  getStoredTokens,
  setStoredTokens,

  // Auth
  register: async (data: { email: string; password: string; first_name: string; last_name: string; password2: string }) => {
    try {
      const response = await api.post<RegisterResponse>('/api/auth/register/', data);
      
      // Store tokens from response
      if (response.data.tokens) {
        setStoredTokens(response.data.tokens);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    try {
      console.log('🔑 API: Attempting login with:', { email });
      const response = await api.post<LoginResponse>('/api/auth/login/', { email, password });
      console.log('🔑 API: Login response:', response.data);
      
      // Store tokens from response
      if (response.data.tokens) {
        setStoredTokens(response.data.tokens);
      }
      
      // Get and store onboarding status
      const onboardingResponse = await api.get<OnboardingStatus>('/api/user/onboarding-status/');
      console.log('🔑 API: Onboarding status:', onboardingResponse.data);
      setOnboardingStatus(onboardingResponse.data);
      
      return response.data;
    } catch (error) {
      console.error('🔑 API: Login failed:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const tokens = getStoredTokens();
      if (tokens?.refresh) {
        await api.post('/api/auth/logout/', { refresh_token: tokens.refresh });
      }
    } finally {
      // Always clear tokens on logout attempt
      setStoredTokens(null);
    }
  },

  // User
  getProfile: async () => {
    const response = await api.get<User>('/api/user/details/');
    return response.data;
  },

  updateProfile: async (data: Partial<User>) => {
    const response = await api.patch<User>('/api/user/details/', data);
    return response.data;
  },

  updateUserDetails: async (data: Partial<User>) => {
    console.log('🚀 API: Starting user details update with:', JSON.stringify(data, null, 2));
    try {
      console.log('📤 API: Sending PATCH request to /api/user/details/');
      const response = await api.patch<{ user: User; basic_info_complete: boolean }>('/api/user/details/', data);
      
      console.log('📥 API: Received response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      });
      
      if (!response.data) {
        console.error('❌ API: No data in response');
        throw new Error('No data received from server');
      }
      
      console.log('✅ API: Successfully updated user details:', response.data.user);
      return response.data.user;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('❌ API: Update user details error:', {
          name: err.name,
          message: err.message,
        });
        throw err;
      }
      throw new Error('An unknown error occurred while updating user details');
    }
  },

  // Location
  searchLocations: async (query: string): Promise<Location[]> => {
    console.log('API: Searching locations with query:', query);
    const response = await api.get<Location[]>('/api/locations/search/', {
      params: { query }
    });
    console.log('API: Location search response:', response.data);
    return response.data;
  },

  // Onboarding
  getOnboardingStatus: async () => {
    const response = await api.get<OnboardingStatus>('/api/user/onboarding-status/');
    setOnboardingStatus(response.data);
    return response.data;
  },

  // User Preferences
  updatePreferences: async (preferences: UserPreferences) => {
    console.log('🚀 API: Updating user preferences:', JSON.stringify(preferences, null, 2));
    const response = await api.patch<{ user: User; preferences_complete: boolean }>('/api/user/preferences/', preferences);
    return response.data;
  },

  // Calibration
  getCalibrationPhotos: async () => {
    try {
      console.log('📸 API: Getting calibration photos');
      const response = await api.get<CalibrationPhotosResponse>('/api/photos/calibration/');
      console.log('📸 API: Raw response:', response);
      
      if (!response.data?.photos) {
        throw new Error('No photos received from calibration endpoint');
      }
      
      const photos = response.data.photos;
      console.log('📸 API: Processed photos:', photos);
      
      // Validate each photo has required fields
      const validPhotos = photos.filter(photo => {
        const isValid = photo.id && photo.image_url && photo.gender;
        if (!isValid) {
          console.warn('❌ Invalid photo data:', photo);
        }
        return isValid;
      });
      
      if (validPhotos.length === 0) {
        throw new Error('No valid photos available for calibration');
      }
      
      // Sort photos randomly
      const shuffledPhotos = [...validPhotos].sort(() => Math.random() - 0.5);
      
      return shuffledPhotos;
    } catch (error) {
      console.error('❌ API: Failed to get calibration photos:', error);
      throw error;
    }
  },

  submitPhotoRating: async (photoId: number, rating: number) => {
    try {
      console.log('⭐ API: Submitting photo rating:', { photoId, rating });
      const response = await api.post('/api/photos/rate/', { photo_id: photoId, rating });
      console.log('⭐ API: Rating submitted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API: Failed to submit photo rating:', error);
      throw error;
    }
  },

  completeCalibration: async () => {
    try {
      console.log('🎯 API: Completing calibration');
      const response = await api.post<CalibrationResponse>('/api/user/calibrate/');
      console.log('🎯 API: Calibration completed successfully:', response.data);
      return response.data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('❌ API: Failed to complete calibration:', err);
        throw err;
      }
      throw new Error('An unknown error occurred during calibration');
    }
  },

  handleError(error: unknown): never {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred');
  },
};
