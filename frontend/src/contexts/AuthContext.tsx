'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, TokenResponse } from '@/types';
import { apiService } from '@/lib/api';

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
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// List of public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        // Check if we have tokens stored
        const tokens = apiService.getStoredTokens();
        if (!tokens) {
          console.log('No tokens found, clearing auth state');
          setUser(null);
          setIsInitialized(true);
          // If on a protected route, redirect to login
          if (!PUBLIC_ROUTES.includes(pathname)) {
            router.replace('/auth/login');
          }
          return;
        }

        // Validate token and get user profile
        try {
          const response = await apiService.getProfile();
          console.log('Profile fetched successfully:', response);
          setUser(response);
          setIsInitialized(true);
        } catch (error) {
          console.error('Failed to fetch profile, clearing auth state:', error);
          // Clear invalid tokens
          apiService.setStoredTokens(null);
          setUser(null);
          setIsInitialized(true);
          // If on a protected route, redirect to login
          if (!PUBLIC_ROUTES.includes(pathname)) {
            router.replace('/auth/login');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear any invalid state
        apiService.setStoredTokens(null);
        setUser(null);
        setIsInitialized(true);
        // If on a protected route, redirect to login
        if (!PUBLIC_ROUTES.includes(pathname)) {
          router.replace('/auth/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [pathname, router]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.login(email, password);
      setUser(response.user);
      
      // Store tokens
      if (response.tokens) {
        apiService.setStoredTokens(response.tokens);
      }

      // Check onboarding status
      try {
        const status = await apiService.getOnboardingStatus();
        if (status.next_step) {
          router.replace(status.next_step);
        } else {
          router.replace('/dashboard');
        }
      } catch (error) {
        console.error('Failed to get onboarding status:', error);
        router.replace('/onboarding');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await apiService.register(data);
      setUser(response.user);
      
      // Store tokens
      if (response.tokens) {
        apiService.setStoredTokens(response.tokens);
      }
      
      router.replace('/onboarding');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state
      apiService.setStoredTokens(null);
      setUser(null);
      setIsLoading(false);
      router.replace('/');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: isInitialized && !!user && !!apiService.getStoredTokens(),
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 