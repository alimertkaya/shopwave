import { useState } from 'react';
import { PackageSearch, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Separator } from '@/shared/components/ui/separator';
import { Pagination } from '@/shared/components/Pagination';
import { OrderCard } from '@/features/orders/components/OrderCard';
import { useOrders } from '@/features/orders/hooks/useOrders';
import { useCheckoutStore } from '@/features/orders/store/checkoutStore';
import { ORDER_STATUS_LABEL } from '@/shared/constants/orderStatus';
import { formatPrice } from '@/shared/utils/formatPrice';
import type { Order } from '@/features/orders/types/order.types';
import type { OrderStatus } from '@/shared/constants/orderStatus';

const PAGE_SIZE = 20;

const worstStatus = (orders: Order[]): OrderStatus => {
  const priority: OrderStatus[] = [
    'CANCELLED', 'CREATED', 'PAYMENT_PROCESSED', 'STOCK_RESERVED', 'SHIPPED', 'COMPLETED',
  ];
  return orders.reduce<OrderStatus>((worst, o) => {
    const wi = priority.indexOf(worst);
    const oi = priority.indexOf(o.status as OrderStatus);
    return oi < wi ? o.status as OrderStatus : worst;
  }, 'COMPLETED');
};

interface GroupCardProps {
  orders: Order[];
  checkoutId: string;
}

const GroupCard = ({ orders, checkoutId }: GroupCardProps) => {
  const [open, setOpen] = useState(false);
  const status = worstStatus(orders);
  const { label, className: statusClass } = ORDER_STATUS_LABEL[status] ?? { label: status, className: '' };
  const total = orders.reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <Card>
      <CardContent className="pt-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Checkout #{checkoutId.slice(0, 8).toUpperCase()}</p>
            <p className="text-sm font-medium">{orders.length} items</p>
          </div>
          <Badge variant="outline" className={statusClass}>{label}</Badge>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <p className="font-semibold">{formatPrice(total)}</p>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs"
            onClick={() => setOpen((p) => !p)}
          >
            {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {open ? 'Hide' : 'View Orders'}
          </Button>
        </div>

        {open && (
          <div className="space-y-3 pt-1">
            <Separator />
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const OrdersPage = () => {
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  const { data, isLoading, isError } = useOrders({ page, size: PAGE_SIZE });
  const groups = useCheckoutStore((s) => s.groups);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <h1 className="text-2xl font-bold">My Orders</h1>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-destructive">
        Error loading orders.
      </div>
    );
  }

  const orders = data?.content ?? [];

  // Her sipariş hangi checkout grubuna ait?
  const orderToGroup = new Map<string, string>();
  groups.forEach((g) => g.orderIds.forEach((id) => orderToGroup.set(id, g.checkoutId)));

  // Gruplu ve tekli siparişleri ayır
  const renderedGroupIds = new Set<string>();
  const rows: Array<{ type: 'group'; checkoutId: string; orders: Order[] } | { type: 'single'; order: Order }> = [];

  for (const order of orders) {
    const checkoutId = orderToGroup.get(order.id);
    if (checkoutId) {
      if (!renderedGroupIds.has(checkoutId)) {
        renderedGroupIds.add(checkoutId);
        const groupOrders = orders.filter((o) => orderToGroup.get(o.id) === checkoutId);
        rows.push({ type: 'group', checkoutId, orders: groupOrders });
      }
    } else {
      rows.push({ type: 'single', order });
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-muted-foreground">
          <PackageSearch className="h-16 w-16 opacity-30" />
          <p className="text-lg">No orders yet</p>
          <Button onClick={() => navigate('/products')}>Start Shopping</Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {rows.map((row) =>
              row.type === 'group' ? (
                <GroupCard key={row.checkoutId} checkoutId={row.checkoutId} orders={row.orders} />
              ) : (
                <OrderCard key={row.order.id} order={row.order} />
              )
            )}
          </div>
          <Pagination currentPage={page} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};
