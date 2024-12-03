interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  birth_date?: string;
  gender?: string;
  location?: string;
  bio?: string;
  is_active: boolean;
  date_joined: string;
  last_login?: string;
}

interface UserProfile extends User {
  interests: string[];
  photos: Photo[];
  preferences: UserPreferences;
}

interface UserPreferences {
  preferred_gender?: string;
  preferred_age_min?: number;
  preferred_age_max?: number;
  preferred_location?: string;
  max_distance?: number;
}

interface Photo {
  id: number;
  user: number;
  image_url: string;
  uploaded_at: string;
  is_profile_photo: boolean;
}

interface Match {
  id: number;
  user1: number;
  user2: number;
  compatibility_score: number;
  created_at: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface CalibrationPhoto {
  id: number;
  image_url: string;
}

interface UserInterest {
  user: number;
  interest: string;
  rating: number;
}

export type { 
  User, 
  UserProfile, 
  UserPreferences, 
  Photo, 
  Match, 
  CalibrationPhoto,
  UserInterest 
}; 