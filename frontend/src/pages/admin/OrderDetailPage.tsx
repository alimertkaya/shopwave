import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, User, ImageOff, Mail, MapPin, Phone } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import { formatPrice } from '@/shared/utils/formatPrice';
import { ORDER_STATUS, ORDER_STATUS_LABEL, type OrderStatus } from '@/shared/constants/orderStatus';
import { useAdminOrder } from '@/features/admin/hooks/useAdmin';
import { useUpdateOrderStatus } from '@/features/admin/hooks/useUpdateOrderStatus';
import { OrderSagaTimeline } from '@/features/admin/components/orders/OrderSagaTimeline';
import { productApi } from '@/features/products/api/productApi';
import { authApi } from '@/features/auth/api/authApi';

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [ORDER_STATUS.CREATED]:           [ORDER_STATUS.PAYMENT_PROCESSED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PAYMENT_PROCESSED]: [ORDER_STATUS.STOCK_RESERVED,    ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.STOCK_RESERVED]:    [ORDER_STATUS.SHIPPED,            ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.SHIPPED]:           [ORDER_STATUS.COMPLETED],
  [ORDER_STATUS.COMPLETED]:         [],
  [ORDER_STATUS.CANCELLED]:         [],
};

export const AdminOrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, isError } = useAdminOrder(id ?? '');
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus(id ?? '');

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product', order?.productId],
    queryFn: () => productApi.getById(order!.productId),
    enabled: !!order?.productId,
    staleTime: 1000 * 60 * 5,
  });

  const { data: customer, isLoading: customerLoading } = useQuery({
    queryKey: ['user', order?.userId],
    queryFn: () => authApi.getUserById(order!.userId),
    enabled: !!order?.userId,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive mb-4">Order not found.</p>
        <Button onClick={() => navigate('/admin/orders')}>Go Back</Button>
      </div>
    );
  }

  const { label, className: statusClass } = ORDER_STATUS_LABEL[order.status];
  const nextStatuses = STATUS_TRANSITIONS[order.status] ?? [];

  return (
    <div className="max-w-3xl space-y-6">
      {/* Başlık */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/orders')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-sm text-muted-foreground">
            {order.createdAt ? new Date(order.createdAt).toLocaleString('en-US') : '—'}
          </p>
        </div>
        <Badge variant="outline" className={statusClass}>{label}</Badge>
      </div>

      {/* Saga Timeline */}
      <Card>
        <CardHeader><CardTitle className="text-base">Saga Flow</CardTitle></CardHeader>
        <CardContent><OrderSagaTimeline status={order.status} /></CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Durum güncelleme */}
        {nextStatuses.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Update Status</CardTitle></CardHeader>
            <CardContent>
              <Select onValueChange={(v) => updateStatus(v as OrderStatus)} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {nextStatuses.map((s) => (
                    <SelectItem key={s} value={s}>{ORDER_STATUS_LABEL[s].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Müşteri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {customerLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            ) : customer ? (
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-base">
                  {customer.firstName} {customer.lastName}
                </p>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {customer.email}
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    {customer.phone}
                  </div>
                )}
                <Badge variant="outline" className="text-xs">{customer.role}</Badge>
                <p className="text-xs text-muted-foreground font-mono">
                  ID: {order.userId.slice(0, 8).toUpperCase()}
                </p>
              </div>
            ) : (
              <p className="text-sm font-mono text-muted-foreground">
                {order.userId.slice(0, 8).toUpperCase()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ürün */}
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
              <div className="h-24 w-24 rounded-lg border bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
                ) : (
                  <ImageOff className="h-8 w-8 text-muted-foreground/40" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-semibold text-base">{product.name}</p>
                <Badge variant="outline" className="text-xs">{product.category}</Badge>
                {product.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                )}
                <p className="text-xs text-muted-foreground font-mono">
                  ID: {order.productId.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm font-mono text-muted-foreground">
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
  );
};
