import { UserProfile, Match, Photo } from '@/types';

class ApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  private csrfToken: string | null = null;

  private async getCsrfToken(): Promise<string | null> {
    if (this.csrfToken) return this.csrfToken;

    try {
      const response = await fetch(`${this.baseUrl}/api/csrf/`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }

      const data = await response.json();
      this.csrfToken = data.csrfToken;
      return this.csrfToken;
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      return null;
    }
  }

  async checkAuth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/check/`, {
        credentials: 'include'
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async login(email: string, password: string): Promise<Response> {
    try {
      const csrfToken = await this.getCsrfToken();
      
      const response = await fetch(`${this.baseUrl}/api/auth/login/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          detail: 'Login failed. Please check your credentials.'
        }));
        throw new Error(errorData.detail || 'Login failed');
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    await fetch(`${this.baseUrl}/api/auth/logout/`, {
      method: 'POST',
      credentials: 'include'
    });
  }

  async fetchMatches(): Promise<Match[]> {
    // Implementation
    return [];
  }

  async fetchProfile(): Promise<UserProfile> {
    const response = await fetch(`${this.baseUrl}/profile`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  }

  async updateProfile(profile: UserProfile): Promise<void> {
    const response = await fetch(`${this.baseUrl}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(profile)
    });
    if (!response.ok) throw new Error('Failed to update profile');
  }

  async getCalibrationPhotos(gender: string): Promise<any> {
    try {
      const csrfToken = await this.getCsrfToken();
      const response = await fetch(
        `${this.baseUrl}/api/photos/?gender=${gender}&count=30`,
        {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'X-CSRFToken': csrfToken || '',
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          detail: 'Failed to fetch calibration photos'
        }));
        throw new Error(errorData.detail || 'Failed to fetch calibration photos');
      }

      const data = await response.json();
      console.log('Calibration photos response:', data);
      return data;

    } catch (error) {
      console.error('Error fetching calibration photos:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch calibration photos');
    }
  }

  async submitPhotoRating(photoId: number, rating: number): Promise<void> {
    const csrfToken = await this.getCsrfToken();
    const response = await fetch(`${this.baseUrl}/api/photos/${photoId}/rate/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken || '',
      },
      credentials: 'include',
      body: JSON.stringify({ rating })
    });
    if (!response.ok) throw new Error('Failed to submit rating');
  }

  async trainUserModel(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/user/train-model/`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to train user model');
    }
  }

  async register(formData: any): Promise<Response> {
    const response = await fetch(`${this.baseUrl}/api/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Registration failed');
    }

    return response;
  }

  async fetchInterests(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/interests`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch interests');
    return response.json();
  }

  async submitInterestRating(interest: string, rating: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/interests/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ interest, rating })
    });
    if (!response.ok) throw new Error('Failed to submit interest rating');
  }
}

export const apiService = new ApiService(); 