'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import Navigation from '@/components/layout/Navigation';
import { Bell, Lock, Eye, Globe, HelpCircle, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await apiService.getProfile();
        setIsLoading(false);
      } catch (err) {
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await apiService.logout();
      router.push('/auth/login');
    } catch (err) {
      setError('Failed to logout');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <div className="min-h-screen pt-16 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <div className="min-h-screen pt-16 flex items-center justify-center">
          <div className="text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: Lock, label: 'Privacy', href: '#' },
        { icon: Bell, label: 'Notifications', href: '#' },
        { icon: Eye, label: 'Visibility', href: '#' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: Globe, label: 'Language', href: '#' },
        { icon: HelpCircle, label: 'Help & Support', href: '#' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation />

      {/* Main Content Area */}
      <main className="container mx-auto px-4 pt-24 pb-8">
        <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

        <div className="max-w-2xl mx-auto space-y-8">
          {settingsSections.map((section) => (
            <div key={section.title} className="bg-slate-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">{section.title}</h2>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    className="w-full flex items-center space-x-4 p-4 text-left text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <item.icon size={20} className="text-slate-400" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-slate-800 rounded-xl p-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 p-4 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 