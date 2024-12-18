import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.has('sessionid');
  const onboardingCookie = request.cookies.get('onboarding_completed');
  const onboardingCompleted = onboardingCookie?.value === 'true';

  // Debug logs
  console.log('DEBUG Middleware - Path:', pathname);
  console.log('DEBUG Middleware - isAuthenticated:', isAuthenticated);
  console.log('DEBUG Middleware - onboarding cookie:', onboardingCookie);
  console.log('DEBUG Middleware - onboardingCompleted:', onboardingCompleted);

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/register', '/'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Onboarding flow routes in order
  const onboardingFlow = [
    '/onboarding',
    '/onboarding/preferences',
    '/calibration'
  ];
  const isOnboardingRoute = onboardingFlow.includes(pathname);

  // Protected routes that require completed onboarding
  const protectedRoutes = ['/dashboard', '/matches', '/messages', '/explore', '/profile', '/settings'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // If user is not authenticated and trying to access a protected route
  if (!isAuthenticated && !isPublicRoute) {
    console.log('DEBUG Middleware - Redirecting to login: Not authenticated');
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If user is authenticated but hasn't completed onboarding
  if (isAuthenticated && !onboardingCompleted) {
    // Allow access to current onboarding step
    if (isOnboardingRoute) {
      console.log('DEBUG Middleware - Allowing access to onboarding route');
      return NextResponse.next();
    }
    
    // For any other route, redirect to the appropriate onboarding step
    // This will be handled by the onboarding page based on the user's progress
    if (!pathname.startsWith('/onboarding')) {
      console.log('DEBUG Middleware - Redirecting to onboarding: Onboarding not completed');
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  // If user is authenticated and has completed onboarding
  if (isAuthenticated && onboardingCompleted) {
    // Prevent access to onboarding routes if already completed
    if (isOnboardingRoute) {
      console.log('DEBUG Middleware - Redirecting to dashboard: Onboarding already completed');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // If user is authenticated and on root path, redirect appropriately
  if (isAuthenticated && pathname === '/') {
    console.log('DEBUG Middleware - Redirecting from root path:', onboardingCompleted ? 'to dashboard' : 'to onboarding');
    return NextResponse.redirect(new URL(onboardingCompleted ? '/dashboard' : '/onboarding', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
