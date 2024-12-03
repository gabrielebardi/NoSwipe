import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.has('sessionid');
  const onboardingCompleted = request.cookies.get('onboarding_completed')?.value === 'true';

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/register', '/'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Onboarding routes
  const onboardingRoutes = ['/onboarding', '/onboarding/preferences', '/calibration'];
  const isOnboardingRoute = onboardingRoutes.some(route => pathname.startsWith(route));

  // If user is not authenticated and trying to access a protected route
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If user is authenticated but hasn't completed onboarding
  if (isAuthenticated && !onboardingCompleted && !isOnboardingRoute && !isPublicRoute) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  // If user is authenticated and has completed onboarding, but tries to access onboarding routes
  if (isAuthenticated && onboardingCompleted && isOnboardingRoute) {
    return NextResponse.redirect(new URL('/matches', request.url));
  }

  // If user is authenticated and trying to access auth routes
  if (isAuthenticated && isPublicRoute && pathname !== '/') {
    return NextResponse.redirect(new URL('/matches', request.url));
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
