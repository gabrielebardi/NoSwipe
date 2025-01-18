export interface User {
  id: number;
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
  profile_photo?: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface RegisterResponse {
  user: User;
  tokens: TokenResponse;
  message: string;
}

export interface LoginResponse {
  user: User;
  tokens: TokenResponse;
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

export interface CalibrationPhoto {
  id: number;
  image_url: string;
  gender: 'M' | 'F' | 'B';
  age?: number;
  ethnicity?: string;
  features?: Record<string, number>;
  created_at?: string;
}

export interface CalibrationResponse {
  status: 'success' | 'error';
  message?: string;
}

export interface PhotoRatingResponse {
  status: 'success' | 'error';
  message?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  detail?: string;
  [key: string]: string | Record<string, string[]> | undefined;
}

export interface CalibrationPhotosResponse {
  photos: CalibrationPhoto[];
}

export interface UserPreferences {
  preferred_gender: 'M' | 'F' | 'B';
  preferred_location: Location | null;
  preferred_age_min: number | null;
  preferred_age_max: number | null;
  max_distance: number;
}

export interface Match {
  id: number;
  user: User;
  matched_user: User;
  status: 'P' | 'A' | 'R';
  compatibility_score: number;
  created_at: string;
  updated_at: string;
}