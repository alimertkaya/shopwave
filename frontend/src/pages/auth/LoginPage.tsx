import { AuthLayout } from '@/layouts/AuthLayout';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { usePageTitle } from '@/shared/hooks/usePageTitle';

export const LoginPage = () => {
  usePageTitle('Sign In');
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue"
      footerText="Don't have an account?"
      footerLinkLabel="Sign up"
      footerLinkTo="/register"
    >
      <LoginForm />
    </AuthLayout>
  );
};
