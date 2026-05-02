import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, ImageOff, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { formatPrice } from '@/shared/utils/formatPrice';
import { ORDER_STATUS_LABEL } from '@/shared/constants/orderStatus';
import { useOrderStatusPoller } from '@/features/orders/hooks/useOrders';
import { OrderTracker } from '@/features/orders/components/OrderTracker';
import { productApi } from '@/features/products/api/productApi';

export const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, isError } = useOrderStatusPoller(id ?? '');

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product', order?.productId],
    queryFn: () => productApi.getById(order!.productId),
    enabled: !!order?.productId,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-destructive mb-4">Order not found.</p>
        <Button onClick={() => navigate('/orders')}>Back to My Orders</Button>
      </div>
    );
  }

  const { label, className: statusClass } = ORDER_STATUS_LABEL[order.status];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Başlık */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/orders')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-sm text-muted-foreground">
            {order.createdAt
              ? new Date(order.createdAt).toLocaleDateString('en-US', {
                  day: '2-digit', month: 'long', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })
              : '—'}
          </p>
        </div>
        <Badge variant="outline" className={`ml-auto ${statusClass}`}>{label}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Ürün Kartı */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4" />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {productLoading ? (
                <div className="flex gap-4">
                  <Skeleton className="h-24 w-24 rounded-lg flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ) : product ? (
                <div className="flex gap-4">
                  {/* Görsel */}
                  <div className="h-24 w-24 rounded-lg border bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
                    ) : (
                      <ImageOff className="h-8 w-8 text-muted-foreground/40" />
                    )}
                  </div>
                  {/* Bilgi */}
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-base">{product.name}</p>
                    <Badge variant="outline" className="text-xs">{product.category}</Badge>
                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                    )}
                    <p className="text-sm text-muted-foreground font-mono">
                      ID: {order.productId.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground font-mono">
                  {order.productId.slice(0, 8).toUpperCase()}
                </p>
              )}

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unit Price</span>
                  <span>{product ? formatPrice(product.price) : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity</span>
                  <span>{order.quantity}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(order.totalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sağ kolon */}
        <div className="space-y-4">
          {/* Sipariş Durumu */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTracker status={order.status} />
            </CardContent>
          </Card>

          {/* Teslimat Adresi */}
          {order.address && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">{order.recipientName}</p>
                <p className="text-muted-foreground">{order.phone}</p>
                <p className="text-muted-foreground">{order.address}</p>
                <p className="text-muted-foreground">{order.city} {order.postalCode}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
