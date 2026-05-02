import { useState } from 'react';
import { useProducts } from '@/features/products/hooks/useProducts';
import { ProductGrid, ProductGridSkeleton } from '@/features/products/components/ProductGrid';
import { ProductFilters } from '@/features/products/components/ProductFilters';
import { Pagination } from '@/shared/components/Pagination';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { useCartStore } from '@/features/cart/store/cartStore';
import { toast } from 'sonner';
import type { Product } from '@/features/products/types/product.types';

const PAGE_SIZE = 12;

export const ProductsPage = () => {
  usePageTitle('Products');

  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<{
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }>({});

  const { data, isLoading, isError, isPlaceholderData } = useProducts({
    ...filters,
    page,
    size: PAGE_SIZE,
  });

  const addItem = useCartStore((s) => s.addItem);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(0);
  };

  const handleAddToCart = (product: Product) => {
    addItem({ productId: product.id, name: product.name, price: product.price, quantity: 1, imageUrl: product.imageUrl });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Products</h1>
        {data && (
          <p className="text-sm text-muted-foreground">
            {data.totalElements} products found
          </p>
        )}
      </div>

      <ProductFilters onFilterChange={handleFilterChange} />

      {isLoading ? (
        <ProductGridSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <p className="text-lg font-medium">Error loading products</p>
          <p className="text-sm">Please refresh the page and try again</p>
        </div>
      ) : (
        <>
          <ProductGrid
            products={data?.content ?? []}
            onAddToCart={handleAddToCart}
          />
          <Pagination
            currentPage={page}
            totalPages={data?.totalPages ?? 0}
            onPageChange={setPage}
            disabled={isPlaceholderData}
          />
        </>
      )}
    </div>
  );
};
