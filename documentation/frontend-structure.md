# Frontend Structure Documentation

## Overview

The frontend is built using Next.js 13+ with TypeScript, utilizing the App Router for routing and React Server Components. The application follows a modular architecture with clear separation of concerns.

## Directory Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx         # Landing page
│   │   ├── auth/            # Authentication pages
│   │   │   ├── login/      # Login page
│   │   │   └── register/   # Registration page
│   │   ├── onboarding/     # Onboarding flow
│   │   │   ├── page.tsx   # Basic info
│   │   │   └── preferences/ # Preferences page
│   │   ├── calibration/    # Photo calibration
│   │   └── dashboard/      # Main dashboard
│   ├── components/          # Reusable components
│   │   ├── auth/           # Auth-related components
│   │   ├── layout/         # Layout components
│   │   └── ui/             # UI components
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx # Authentication context
│   ├── lib/                 # Utilities and services
│   │   ├── api/            # API service
│   │   ├── utils/          # Utility functions
│   │   └── hooks/          # Custom hooks
│   └── types/               # TypeScript type definitions
```

## Authentication

### Protected Routes

All protected routes are wrapped with the `ProtectedRoute` component that handles authentication state and redirects:

```typescript
// components/ProtectedRoute.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-white">
          <Loader className="animate-spin" size={24} />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  return <>{children}</>;
};
```

Usage example:

```typescript
// app/onboarding/page.tsx
'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <div>Onboarding content</div>
    </ProtectedRoute>
  );
}
```

### Authentication Context

The application uses a global authentication context to manage auth state:

```typescript
// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await apiService.getProfile();
        setUser(response);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ... rest of the implementation
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### API Service

The API service handles all communication with the backend, including authentication:

```typescript
// lib/api/index.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor for JWT tokens
api.interceptors.request.use(
  (config) => {
    const tokens = getStoredTokens();
    if (tokens?.access) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle token refresh and errors
  }
);

export const apiService = {
  // Auth methods
  register: async (data: RegisterData) => { /* ... */ },
  login: async (email: string, password: string) => { /* ... */ },
  logout: async () => { /* ... */ },
  
  // User methods
  getProfile: async () => { /* ... */ },
  updateProfile: async (data: Partial<User>) => { /* ... */ },
  
  // Other API methods...
};
```

## Custom Hooks

The application uses custom hooks for common functionality:

```typescript
// lib/hooks/useAuth.ts
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// lib/hooks/useOnboarding.ts
export function useOnboarding() {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const data = await apiService.getOnboardingStatus();
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch onboarding status:', error);
    }
  };

  return { status, refetchStatus: fetchStatus };
}
```

## Error Handling

The application implements consistent error handling:

```typescript
// components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong</div>;
    }

    return this.props.children;
  }
}
```

## Form Handling

Forms are handled using React Hook Form with Zod validation:

```typescript
// components/auth/LoginForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
``` 