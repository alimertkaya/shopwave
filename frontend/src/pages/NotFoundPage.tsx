import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { usePageTitle } from '@/shared/hooks/usePageTitle';

export const NotFoundPage = () => {
  usePageTitle('Page Not Found');
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <p className="text-xl">The page you are looking for was not found.</p>
      <Button onClick={() => navigate('/')}>Back to Home</Button>
    </div>
  );
};
