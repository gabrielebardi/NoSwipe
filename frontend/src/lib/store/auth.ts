import { create } from 'zustand';
import { apiService } from '@/lib/api';
import { UserProfile } from '@/lib/types';

interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password2: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  setIsAuthenticated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
  setIsAuthenticated: (value: boolean) => set({ isAuthenticated: value }),

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiService.login(email, password);
      localStorage.setItem('isAuthenticated', 'true');
      set({ isAuthenticated: true, user: data.user, isLoading: false });
    } catch (error) {
      localStorage.removeItem('isAuthenticated');
      set({ 
        isAuthenticated: false,
        user: null,
        error: error instanceof Error ? error.message : 'Login failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.register(data);
      localStorage.setItem('isAuthenticated', 'true');
      set({ isAuthenticated: true, user: response.user, isLoading: false });
    } catch (error) {
      localStorage.removeItem('isAuthenticated');
      set({ 
        isAuthenticated: false,
        user: null,
        error: error instanceof Error ? error.message : 'Registration failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await apiService.logout();
      localStorage.removeItem('isAuthenticated');
      set({ isAuthenticated: false, user: null, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Logout failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiService.getProfile();
      set({ user: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch profile', 
        isLoading: false 
      });
      throw error;
    }
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await apiService.updateProfile(data);
      set({ user: updatedUser, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update profile', 
        isLoading: false 
      });
      throw error;
    }
  },
}));
