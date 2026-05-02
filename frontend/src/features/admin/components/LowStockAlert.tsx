import { AlertTriangle } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useLowStock } from '../hooks/useAdmin';
import api from '@/lib/axios';
import type { Product } from '@/features/products/types/product.types';

export const LowStockAlert = () => {
  const { data: items, isLoading } = useLowStock(10);
  const navigate = useNavigate();

  const { data: products } = useQuery({
    queryKey: ['products', 'all-list'],
    queryFn: () => api.get<Product[]>('/api/products').then((r) => r.data),
  });

  const productNameMap = useMemo(() => {
    const map = new Map<string, string>();
    products?.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [products]);

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Card className="border-amber-500/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-amber-600 text-base">
          <AlertTriangle className="h-4 w-4" />
          Low Stock Alert ({items.length} products)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.slice(0, 5).map((item) => (
          <div key={item.productId} className="flex items-center justify-between text-sm">
            <span className="truncate flex-1">
              {productNameMap.get(item.productId) ?? item.productId.slice(0, 8).toUpperCase()}
            </span>
            <Badge
              variant={item.quantity === 0 ? 'destructive' : 'outline'}
              className="ml-2 flex-shrink-0"
            >
              {item.quantity === 0 ? 'Out of Stock' : `${item.quantity} left`}
            </Badge>
          </div>
        ))}
        {items.length > 5 && (
          <p className="text-xs text-muted-foreground">+{items.length - 5} more products</p>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={() => navigate('/admin/inventory')}
        >
          Go to Inventory Management
        </Button>
      </CardContent>
    </Card>
  );
};
