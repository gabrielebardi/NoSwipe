'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import { Heart, User, LogOut } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();

  const isActive = (path: string) => pathname === path;

  // Show minimal navbar for auth pages and home
  if (pathname === '/auth/login' || pathname === '/auth/register' || pathname === '/') {
    return (
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
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

  // Full navbar for authenticated users
  return (
    <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link 
          href="/matches" 
          className="text-2xl font-bold text-white hover:text-blue-400 transition"
        >
          NoSwipe
        </Link>
        <div className="flex items-center space-x-6">
          <Link
            href="/matches"
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
              isActive('/matches') 
                ? 'bg-blue-600 text-white' 
                : 'hover:bg-slate-800'
            }`}
          >
            <Heart size={20} />
            <span>Matches</span>
          </Link>
          <Link
            href="/profile"
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
              isActive('/profile') 
                ? 'bg-blue-600 text-white' 
                : 'hover:bg-slate-800'
            }`}
          >
            <User size={20} />
            <span>Profile</span>
          </Link>
          <button
            onClick={() => logout()}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
