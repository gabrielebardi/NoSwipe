interface User {
  id: number;
  username: string;
  email: string;
  gender?: string;
  age?: number;
  location?: string;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  bio?: string;
  interests: string[];
  gender?: string;
  age?: number;
  location?: string;
}

interface UserPreferences {
  preferred_gender?: string;
  preferred_age_min?: number;
  preferred_age_max?: number;
}

interface Photo {
  id: number;
  image_url: string;
}

interface Match {
  id: string;
  user1: UserProfile;
  user2: UserProfile;
  score: number;
  expires_at: string;
}

export type { User, UserProfile, UserPreferences, Photo, Match }; 