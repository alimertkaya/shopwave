import { cn } from '@/shared/utils/cn';

interface Props {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

export const LoadingSpinner = ({ className, size = 'md' }: Props) => (
  <div className="flex items-center justify-center w-full h-full min-h-[200px]">
    <div
      role="status"
      aria-live="polite"
      className={cn('animate-spin rounded-full border-2 border-muted border-t-primary', sizeMap[size], className)}
    >
      <span className="sr-only">Loading...</span>
    </div>
  </div>
);
