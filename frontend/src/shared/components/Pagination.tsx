import { Button } from '@/shared/components/ui/button';

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export const Pagination = ({ currentPage, totalPages, onPageChange, disabled }: Props) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={disabled || currentPage === 0}
      >
        Previous
      </Button>

      <span className="text-sm text-muted-foreground">
        {currentPage + 1} / {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={disabled || currentPage >= totalPages - 1}
      >
        Next
      </Button>
    </div>
  );
};
