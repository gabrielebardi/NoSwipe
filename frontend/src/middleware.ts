import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register'];

// List of onboarding routes in order
const ONBOARDING_ROUTES = [
  '/onboarding',                // Step 1: Basic Information
  '/onboarding/preferences',    // Step 2: Partner Preferences
  '/calibration'                // Step 3: Photo Calibration (moved from /onboarding/calibration)
];

// List of valid routes in the application
const VALID_ROUTES = [
  ...PUBLIC_ROUTES,
  ...ONBOARDING_ROUTES,
  '/dashboard',
  '/profile',
  '/settings',
  '/404',
  '/_not-found'
];

// Cookie configuration for better security
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
};

const DEBUG = process.env.NODE_ENV === 'development';

function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log(...args);
  }
}

function isValidAuthToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const parsed = JSON.parse(token);
    // Check if token exists and has required fields
    if (!parsed?.access || !parsed?.refresh) return false;
    
    // Basic JWT structure validation (header.payload.signature)
    const accessParts = parsed.access.split('.');
    if (accessParts.length !== 3) return false;
    
    // Check token expiration if possible
    try {
      const payload = JSON.parse(atob(accessParts[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.log('DEBUG Middleware - Token expired');
        return false;
      }
    } catch {
      // If we can't decode the payload, consider token invalid
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

function clearAuthCookies(response: NextResponse): NextResponse {
  // Clear auth related cookies
  ['auth_tokens', 'onboarding_status', 'user_preferences'].forEach(cookieName => {
    response.cookies.delete(cookieName);
  });
  return response;
}

function getOnboardingStep(onboardingCookie: string | undefined): number | null {
  debugLog('DEBUG Middleware - Onboarding cookie:', onboardingCookie);
  
  if (!onboardingCookie) {
    debugLog('DEBUG Middleware - No onboarding cookie found, defaulting to step 1');
    return 1;
  }
  
  // Handle string value 'complete'
  if (onboardingCookie === 'complete') {
    debugLog('DEBUG Middleware - Onboarding complete (string value)');
    return null;
  }
  
  try {
    const status = JSON.parse(onboardingCookie);
    debugLog('DEBUG Middleware - Parsed onboarding status:', status);
    
    // Handle JSON object with status field
    if (status.status === 'complete') {
      debugLog('DEBUG Middleware - Onboarding complete (JSON value)');
      return null;
    }
    
    if (!status.current_step) {
      debugLog('DEBUG Middleware - No current step, defaulting to step 1');
      return 1;
    }
    
    // Map backend paths to frontend paths
    const stepPath = status.current_step === 'calibration' ? '/calibration' : status.current_step;
    const stepIndex = ONBOARDING_ROUTES.indexOf(stepPath);
    debugLog('DEBUG Middleware - Current step index:', stepIndex + 1);
    return stepIndex + 1;
  } catch (error) {
    // If the cookie is not JSON and not 'complete', default to step 1
    debugLog('DEBUG Middleware - Error parsing onboarding cookie:', error);
    return 1;
  }
}

export function middleware(request: NextRequest) {
  debugLog('DEBUG Middleware - Path:', request.nextUrl.pathname);

  // Create base response to possibly modify
  const response = NextResponse.next();

  // Special handling for 404 and not-found pages
  if (request.nextUrl.pathname === '/404' || request.nextUrl.pathname === '/_not-found') {
    return response;
  }

  // Check if the route exists
  if (!VALID_ROUTES.includes(request.nextUrl.pathname)) {
    debugLog('DEBUG Middleware - Invalid route, redirecting to 404');
    return NextResponse.rewrite(new URL('/404', request.url));
  }

  // Get and validate auth token from cookies
  const authTokens = request.cookies.get('auth_tokens');
  const isAuthenticated = isValidAuthToken(authTokens?.value);

  debugLog('DEBUG Middleware - Auth status:', isAuthenticated);

  // If user is not authenticated and tries to access a protected route
  if (!isAuthenticated && !PUBLIC_ROUTES.includes(request.nextUrl.pathname)) {
    console.log('DEBUG Middleware - Unauthorized access, redirecting to login');
    const redirectResponse = NextResponse.redirect(new URL('/auth/login', request.url));
    return clearAuthCookies(redirectResponse);
  }

  // If user is authenticated but tries to access public routes
  if (isAuthenticated && PUBLIC_ROUTES.includes(request.nextUrl.pathname)) {
    console.log('DEBUG Middleware - Authenticated user on public route, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Handle onboarding flow for authenticated users
  if (isAuthenticated) {
    const onboardingCookie = request.cookies.get('onboarding_status');
    console.log('DEBUG Middleware - Raw onboarding cookie:', onboardingCookie); // Debug raw cookie
    
    const currentStep = getOnboardingStep(onboardingCookie?.value);
    console.log('DEBUG Middleware - Determined step:', currentStep);

    // If onboarding is completed (currentStep is null), allow access to all routes
    if (currentStep === null) {
      console.log('DEBUG Middleware - Onboarding complete, allowing access');
      return response;
    }

    // If onboarding is not completed
    const currentStepRoute = ONBOARDING_ROUTES[currentStep - 1];
    console.log('DEBUG Middleware - Current step route:', currentStepRoute);
    
    // Allow access to current onboarding step
    if (request.nextUrl.pathname === currentStepRoute) {
      return response;
    }
    
    // Redirect to current onboarding step if trying to access other routes
    if (!ONBOARDING_ROUTES.includes(request.nextUrl.pathname)) {
      console.log('DEBUG Middleware - Redirecting to current onboarding step:', currentStepRoute);
      return NextResponse.redirect(new URL(currentStepRoute, request.url));
    }
    
    // Prevent access to future onboarding steps
    const attemptedStepIndex = ONBOARDING_ROUTES.indexOf(request.nextUrl.pathname);
    if (attemptedStepIndex > currentStep - 1) {
      console.log('DEBUG Middleware - Attempting to skip steps, redirecting to current step');
      return NextResponse.redirect(new URL(currentStepRoute, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
