import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';

interface Props {
  children: ReactNode;
}

export const AdminRoute = ({ children }: Props) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAdmin = useAuthStore((s) => s.isAdmin);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4">
      <p className="text-lg font-semibold">Access Denied</p>
      <p className="text-sm text-muted-foreground">You need admin privileges to access this page.</p>
      <a href="/" className="text-sm text-primary underline-offset-2 hover:underline">Back to home</a>
    </div>
  );
  return <>{children}</>;
};
