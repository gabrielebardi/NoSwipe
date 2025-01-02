import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const onboardingCookie = request.cookies.get('onboarding_completed');
  const onboardingCompleted = onboardingCookie?.value === 'true';

  // Debug logs
  console.log('DEBUG Middleware - Path:', pathname);
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

  // Always allow access to public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For all other routes, let the client-side auth handle it
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
