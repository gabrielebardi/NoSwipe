export interface UserProfile {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  gender: 'M' | 'F' | 'O' | null;
  location: Location | null;
  bio: string;
  profile_photo: string;
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

export interface UserPreferences {
  preferred_gender: 'M' | 'F' | 'B' | null;
  preferred_age_min: number | null;
  preferred_age_max: number | null;
  preferred_location: Location | null;
  max_distance: number;
}

export interface Photo {
  id: number;
  image_url: string;
  gender: 'M' | 'F' | 'O';
  age: number;
  ethnicity: string;
  features: any;
  created_at: string;
}

export interface Match {
  id: number;
  user: UserProfile;
  matched_user: UserProfile;
  status: 'P' | 'A' | 'R';
  compatibility_score: number;
  created_at: string;
  updated_at: string;
}

export interface ApiError {
  detail: string;
  [key: string]: any;
} 