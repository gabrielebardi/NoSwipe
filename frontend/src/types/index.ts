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
}

export interface CalibrationPhotosResponse {
  photos: CalibrationPhoto[];
}