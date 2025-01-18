'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { apiService } from '@/lib/api';

interface OnboardingStatus {
  status: string;
  current_step: string | null;
  next_step: string | null;
  steps_completed: {
    basic_info: boolean;
    preferences: boolean;
    calibration: boolean;
  };
}

interface RegisterData {
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  onboardingCompleted: boolean;
  currentOnboardingStep: string | null;
  login: (email: string, password: string) => Promise<{ user: User; onboardingStatus: OnboardingStatus }>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const tokens = apiService.getStoredTokens();
        if (tokens) {
          apiService.setStoredTokens(tokens);
          const userDetails = await apiService.getProfile();
          setUser(userDetails);
          
          // Fetch onboarding status
          const status = await apiService.getOnboardingStatus();
          setOnboardingStatus(status);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear tokens if initialization fails
        apiService.setStoredTokens(null);
        setUser(null);
        setOnboardingStatus(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { tokens, user } = await apiService.login(email, password);
      apiService.setStoredTokens(tokens);
      setUser(user);
      
      // Fetch onboarding status after login
      const status = await apiService.getOnboardingStatus();
      setOnboardingStatus(status);
      
      // Return both user and onboarding status
      return { user, onboardingStatus: status };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      const { tokens, user } = await apiService.register(data);
      apiService.setStoredTokens(tokens);
      setUser(user);
      
      // Fetch initial onboarding status after registration
      const status = await apiService.getOnboardingStatus();
      setOnboardingStatus(status);
      
      return user;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    apiService.setStoredTokens(null);
    setUser(null);
    setOnboardingStatus(null);
  }, []);

  const updateUser = useCallback(async (data: Partial<User>) => {
    try {
      const updatedUser = await apiService.updateUserDetails(data);
      setUser(updatedUser);
      
      // Refresh onboarding status after user update
      const status = await apiService.getOnboardingStatus();
      setOnboardingStatus(status);
      
      return updatedUser;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    onboardingCompleted: onboardingStatus?.status === 'complete',
    currentOnboardingStep: onboardingStatus?.current_step || null,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 