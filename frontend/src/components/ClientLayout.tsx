'use client';

import { useEffect } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch CSRF token on app start
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('/api/csrf/', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          }
        });
        
        if (!response.ok) {
          console.warn('CSRF token fetch failed, but continuing...');
          return;
        }
        
        // Token is automatically set in cookies by the backend
        console.log('CSRF token fetched successfully');
      } catch (err) {
        // Don't throw error as this shouldn't block the app
        console.warn('Failed to fetch CSRF token, but continuing:', err);
      }
    };

    fetchCsrfToken();
  }, []);

  return (
    <div className={`${inter.className} h-full bg-slate-950 text-slate-50`}>
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">
          {children}
        </main>
      </div>
    </div>
  );
} 