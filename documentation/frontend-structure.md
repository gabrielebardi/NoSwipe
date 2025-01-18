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
│   │   ├── not-found.tsx    # 404 page
│   │   ├── auth/            # Authentication pages
│   │   │   ├── login/      # Login page
│   │   │   └── register/   # Registration page
│   │   ├── onboarding/     # Onboarding flow
│   │   │   ├── page.tsx   # Basic info
│   │   │   ├── location-search.tsx  # Location search component
│   │   │   └── preferences/ # Preferences page
│   │   ├── calibration/    # Photo calibration
│   │   ├── profile/        # User profile
│   │   └── dashboard/      # Main dashboard
│   ├── components/          # Reusable components
│   │   ├── ErrorBoundary.tsx  # Error handling component
│   │   ├── ProtectedRoute.tsx # Auth protection wrapper
│   │   ├── ClientLayout.tsx   # Client-side layout wrapper
│   │   ├── layout/         # Layout components
│   │   │   └── Navigation.tsx  # Main navigation component
│   │   └── providers/      # Context providers
│   │       └── AuthProvider.tsx  # Authentication state
│   ├── lib/                 # Utilities and services
│   │   ├── api/            # API service
│   │   │   └── index.ts   # API client configuration
│   │   ├── store/          # State management
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   │       └── urls.ts    # URL handling utilities
│   └── middleware.ts        # Next.js middleware for auth & routing
├── public/                  # Static assets
│   └── images/             # Image assets
├── tailwind.config.ts      # Tailwind CSS configuration
├── postcss.config.mjs      # PostCSS configuration
├── next.config.js          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies and scripts
└── .env.local             # Environment variables

```

## Key Features

### Authentication
- JWT-based authentication with secure cookie storage
- Protected routes with middleware
- Login, register, and logout functionality
- Persistent sessions

### Routing & Navigation
- App Router based routing
- Protected route wrapper component
- Middleware for auth checks and redirects
- Dynamic navigation based on auth state

### State Management
- React Context for auth state
- Custom hooks for shared logic
- API service for backend communication

### Styling
- Tailwind CSS for styling
- Custom theme configuration
- Responsive design
- Dark mode support

### API Integration
- Axios-based API client
- Centralized API service
- Type-safe API calls
- Error handling

## Configuration Files

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
      {
        source: '/static/:path*',
        destination: 'http://localhost:8000/static/:path*',
      },
      {
        source: '/media/:path*',
        destination: 'http://localhost:8000/media/:path*',
      },
    ]
  },
}
```

### tailwind.config.ts
- Custom color scheme
- Container configurations
- Extended theme settings
- Content paths configuration

### tsconfig.json
- Strict TypeScript configuration
- Path aliases (@/ for src/)
- Next.js specific settings
- Module resolution settings

## Development Guidelines

1. Component Structure
   - Use functional components with TypeScript
   - Implement proper type definitions
   - Follow single responsibility principle

2. State Management
   - Use contexts for global state
   - Keep component state local when possible
   - Implement proper error handling

3. Styling
   - Use Tailwind CSS utility classes
   - Follow mobile-first approach
   - Maintain consistent spacing and colors

4. Performance
   - Implement proper loading states
   - Use proper image optimization
   - Minimize bundle size

5. Security
   - Implement proper auth checks
   - Sanitize user inputs
   - Use HTTPS for API calls

6. Testing
   - Write unit tests for components
   - Test error scenarios
   - Verify protected routes

7. Code Organization
   - Keep components small and focused
   - Use proper file naming conventions
   - Maintain clear folder structure
``` 