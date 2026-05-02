import { Skeleton } from '@/shared/components/ui/skeleton';
import { ProductCard } from './ProductCard';
import type { Product } from '../types/product.types';

interface Props {
  products: Product[];
  onAddToCart?: (product: Product) => void;
}

export const ProductGrid = ({ products, onAddToCart }: Props) => {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
        <p className="text-lg font-medium">No products found</p>
        <p className="text-sm">Try changing the filters and search again</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
};

export const ProductGridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
    {Array.from({ length: 24 }).map((_, i) => (
      <div key={i} className="flex flex-col gap-2">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-7 w-20" />
        </div>
      </div>
    ))}
  </div>
);
