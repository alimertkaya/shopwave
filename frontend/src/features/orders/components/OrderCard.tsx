import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ImageOff } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { formatPrice } from '@/shared/utils/formatPrice';
import { ORDER_STATUS_LABEL } from '@/shared/constants/orderStatus';
import { productApi } from '@/features/products/api/productApi';
import type { Order } from '../types/order.types';

interface Props {
  order: Order;
}

export const OrderCard = ({ order }: Props) => {
  const navigate = useNavigate();
  const { label, className: statusClass } = ORDER_STATUS_LABEL[order.status];

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product', order.productId],
    queryFn: () => productApi.getById(order.productId),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <Card>
      <CardContent className="pt-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Order No</p>
            <p className="font-mono text-sm font-medium">{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <Badge variant="outline" className={statusClass}>{label}</Badge>
        </div>

        <Separator />

        {/* Ürün */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-md border bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center">
            {productLoading ? (
              <Skeleton className="h-full w-full" />
            ) : product?.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
            ) : (
              <ImageOff className="h-4 w-4 text-muted-foreground/40" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {productLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <p className="text-sm font-medium truncate">{product?.name ?? order.productId.slice(0, 8).toUpperCase()}</p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">{order.quantity} items</p>
          </div>
          <p className="text-sm font-semibold shrink-0">{formatPrice(order.totalPrice)}</p>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {order.createdAt
              ? new Date(order.createdAt).toLocaleDateString('en-US', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })
              : '—'}
          </p>
          <Button size="sm" variant="outline" onClick={() => navigate(`/orders/${order.id}`)}>
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
