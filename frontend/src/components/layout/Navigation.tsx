'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Compass, MessageCircle, Settings, Heart } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still try to redirect to home page
      router.push('/');
    }
  };

  // Show minimal navbar for auth pages and home
  if (pathname === '/auth/login' || pathname === '/auth/register' || pathname === '/') {
    return (
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm fixed w-full top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link 
            href="/" 
            className="text-2xl font-bold text-white hover:text-blue-400 transition"
          >
            NoSwipe
          </Link>
          {!isAuthenticated && (
            <div className="space-x-4">
              {pathname !== '/auth/login' && (
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-lg hover:bg-slate-800 transition"
                >
                  Login
                </Link>
              )}
              {pathname !== '/auth/register' && (
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Register
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>
    );
  }

  // Full navbar for authenticated pages
  return (
    <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm fixed w-full top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link 
          href="/" 
          className="text-2xl font-bold text-white hover:text-blue-400 transition"
        >
          NoSwipe
        </Link>

        <div className="flex items-center space-x-6">
          <Link
            href="/explore"
            className={`flex flex-col items-center text-sm ${
              isActive('/explore')
                ? 'text-blue-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="h-6 w-6" />
            <span>Explore</span>
          </Link>

          <Link
            href="/matches"
            className={`flex flex-col items-center text-sm ${
              isActive('/matches')
                ? 'text-blue-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="h-6 w-6" />
            <span>Matches</span>
          </Link>

          <Link
            href="/messages"
            className={`flex flex-col items-center text-sm ${
              isActive('/messages')
                ? 'text-blue-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageCircle className="h-6 w-6" />
            <span>Messages</span>
          </Link>

          <Link
            href="/profile"
            className={`flex flex-col items-center text-sm ${
              isActive('/profile')
                ? 'text-blue-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="h-6 w-6" />
            <span>Profile</span>
          </Link>

          <Link
            href="/settings"
            className={`flex flex-col items-center text-sm ${
              isActive('/settings')
                ? 'text-blue-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="h-6 w-6" />
            <span>Settings</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex flex-col items-center text-sm text-slate-400 hover:text-white"
          >
            <LogOut className="h-6 w-6" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
} 