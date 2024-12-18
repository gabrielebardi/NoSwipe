export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  birth_date?: string;
  gender?: 'M' | 'F' | 'O';
  location?: Location;
  bio?: string;
  is_active: boolean;
  date_joined: string;
  last_login?: string;
  calibration_completed: boolean;
}

export interface Location {
  id: number;
  type: 'postal_code' | 'city' | 'region' | 'country';
  postal_code?: string;
  city?: string;
  region?: string;
  country: string;
  latitude: number;
  longitude: number;
  display_name: string;
}

export interface UserProfile extends User {
  interests: string[];
  photos: Photo[];
  preferences: UserPreferences;
}

export interface UserPreferences {
  preferred_gender: 'M' | 'F' | 'B';
  preferred_age_min: number;
  preferred_age_max: number;
  preferred_location: Location;
  max_distance: number;
}

export interface Photo {
  id: number;
  user: number;
  image_url: string;
  uploaded_at: string;
  is_profile_photo: boolean;
}

export interface Match {
  id: number;
  user1: number;
  user2: number;
  compatibility_score: number;
  created_at: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface CalibrationPhoto {
  id: number;
  image_url: string;
}

export interface UserInterest {
  user: number;
  interest: string;
  rating: number;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface ApiError {
  detail: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface LocationSearchResult {
  id: number;
  type: 'postal_code' | 'city' | 'region' | 'country';
  postal_code?: string;
  city?: string;
  region?: string;
  country: string;
  latitude: number;
  longitude: number;
  display_name: string;
}

export interface OnboardingStatus {
  status: 'complete' | 'incomplete';
  current_step: 'details' | 'preferences' | 'calibration' | null;
  next_step: string;
  steps_completed: {
    basic_info: boolean;
    preferences: boolean;
    calibration: boolean;
  };
  missing_fields: {
    basic_info: {
      gender: boolean;
      birth_date: boolean;
      location: boolean;
    };
    preferences: {
      preferred_gender: boolean;
      preferred_location: boolean;
      preferred_age_min: boolean;
      preferred_age_max: boolean;
    };
    calibration: boolean;
  };
}