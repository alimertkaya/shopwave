import { AuthLayout } from '@/layouts/AuthLayout';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { usePageTitle } from '@/shared/hooks/usePageTitle';

export const RegisterPage = () => {
  usePageTitle('Sign Up');
  return (
    <AuthLayout
      title="Create an account"
      subtitle="Sign up for ShopWave for free"
      footerText="Already have an account?"
      footerLinkLabel="Sign in"
      footerLinkTo="/login"
    >
      <RegisterForm />
    </AuthLayout>
  );
};
