'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthInitializer } from './AuthInitializer';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      {children}
    </QueryClientProvider>
  );
}
