import { useEffect } from 'react';
import { QueryProvider } from './QueryProvider';
import { Router } from './Router';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { useAuthStore } from '@/features/auth/store/authStore';
import { setTokenGetter } from '@/lib/axios';
import { Toaster } from '@/shared/components/ui/sonner';

const AppContent = () => {
  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  const isInitializing = useAuthStore((s) => s.isInitializing);

  useEffect(() => {
    setTokenGetter(() => useAuthStore.getState().accessToken);
    initializeAuth();
  }, [initializeAuth]);

  if (isInitializing) return <LoadingSpinner size="lg" />;

  return <Router />;
};

export const App = () => (
  <ErrorBoundary>
    <QueryProvider>
      <AppContent />
      <Toaster richColors position="top-right" />
    </QueryProvider>
  </ErrorBoundary>
);
