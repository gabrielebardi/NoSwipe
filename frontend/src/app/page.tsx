import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Navigation from '@/components/layout/Navigation';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-grow flex items-center justify-center pt-16">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text mb-6">
            Find Your Perfect Match with AI
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            NoSwipe uses advanced AI to understand your preferences and find meaningful connections. 
            No more endless swiping - just quality matches based on real compatibility.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <span>Get Started</span>
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/auth/login"
              className="px-6 py-3 text-slate-300 rounded-lg hover:bg-slate-800 transition"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
      <footer className="border-t border-slate-800 py-8">
        <div className="container mx-auto px-4 text-center text-slate-500">
          <p>&copy; {new Date().getFullYear()} NoSwipe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
