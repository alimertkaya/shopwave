import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Eye, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Pagination } from '@/shared/components/Pagination';
import { formatPrice } from '@/shared/utils/formatPrice';
import { exportToCsv } from '@/shared/utils/exportCsv';
import { cn } from '@/shared/utils/cn';
import { ORDER_STATUS_LABEL } from '@/shared/constants/orderStatus';
import { useAdminOrders } from '@/features/admin/hooks/useAdmin';
import { useCheckoutStore } from '@/features/orders/store/checkoutStore';
import { useBulkSelection } from '@/shared/hooks/useBulkSelection';
import type { Order } from '@/features/orders/types/order.types';
import type { OrderStatus } from '@/shared/constants/orderStatus';

const PAGE_SIZE = 15;

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

export const AdminOrdersPage = () => {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const { data, isLoading } = useAdminOrders({ page, size: PAGE_SIZE, status: statusFilter || undefined });
  const groups = useCheckoutStore((s) => s.groups);
  const orders = data?.content ?? [];

  const { selectedIds, isSelected, isAllSelected, toggleOne, toggleAll, clearAll } =
    useBulkSelection(orders);

  const toggleGroup = (id: string) =>
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleExport = () => {
    const rows = (selectedIds.length > 0
      ? orders.filter((o) => selectedIds.includes(o.id))
      : orders
    ).map((o) => ({
      id: o.id,
      status: ORDER_STATUS_LABEL[o.status].label,
      total: o.totalPrice,
      quantity: o.quantity,
      date: new Date(o.createdAt).toLocaleDateString('en-US'),
    }));
    exportToCsv('orders', rows);
    clearAll();
  };

  // orderToGroup map
  const orderToGroup = new Map<string, string>();
  groups.forEach((g) => g.orderIds.forEach((id) => orderToGroup.set(id, g.checkoutId)));

  // Satır yapısı
  type Row =
    | { type: 'group'; checkoutId: string; groupOrders: Order[] }
    | { type: 'single'; order: Order }
    | { type: 'group-child'; order: Order; checkoutId: string; last: boolean };

  const renderedGroupIds = new Set<string>();
  const rows: Row[] = [];

  for (const order of orders) {
    const checkoutId = orderToGroup.get(order.id);
    if (checkoutId) {
      if (!renderedGroupIds.has(checkoutId)) {
        renderedGroupIds.add(checkoutId);
        const groupOrders = orders.filter((o) => orderToGroup.get(o.id) === checkoutId);
        rows.push({ type: 'group', checkoutId, groupOrders });
        if (expandedGroups.has(checkoutId)) {
          groupOrders.forEach((o, i) =>
            rows.push({ type: 'group-child', order: o, checkoutId, last: i === groupOrders.length - 1 })
          );
        }
      }
    } else {
      rows.push({ type: 'single', order });
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Orders</h1>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Select
          value={statusFilter}
          onValueChange={(v) => { setStatusFilter(v === 'ALL' ? '' : (v ?? '')); setPage(0); clearAll(); }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Statuses">
              {statusFilter ? (ORDER_STATUS_LABEL[statusFilter as OrderStatus]?.label ?? statusFilter) : null}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {Object.entries(ORDER_STATUS_LABEL).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedIds.length > 0 ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{selectedIds.length} orders selected</span>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1.5" />Download Selected
            </Button>
            <Button variant="ghost" size="sm" onClick={clearAll}>Cancel</Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={handleExport} disabled={!orders.length}>
            <Download className="h-4 w-4 mr-1.5" />Download CSV
          </Button>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input type="checkbox" checked={isAllSelected} onChange={toggleAll} className="cursor-pointer" />
                  </TableHead>
                  <TableHead>Order No</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => {
                    if (row.type === 'group') {
                      const status = worstStatus(row.groupOrders);
                      const { label, className: statusClass } = ORDER_STATUS_LABEL[status] ?? { label: status, className: '' };
                      const total = row.groupOrders.reduce((s, o) => s + o.totalPrice, 0);
                      const totalQty = row.groupOrders.reduce((s, o) => s + o.quantity, 0);
                      const isOpen = expandedGroups.has(row.checkoutId);
                      return (
                        <TableRow key={row.checkoutId} className="bg-muted/30 hover:bg-muted/50 font-medium">
                          <TableCell>
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">Group Order</span>
                              <span className="font-mono text-xs">#{row.checkoutId.slice(0, 8).toUpperCase()}</span>
                              <span className="text-xs text-muted-foreground">{row.groupOrders.length} orders</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusClass}>{label}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{formatPrice(total)}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{totalQty}</TableCell>
                          <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                            {new Date(row.groupOrders[0].createdAt).toLocaleDateString('en-US')}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => toggleGroup(row.checkoutId)}>
                              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    }

                    if (row.type === 'group-child') {
                      const { label, className: statusClass } = ORDER_STATUS_LABEL[row.order.status] ?? { label: row.order.status, className: '' };
                      return (
                        <TableRow
                          key={row.order.id}
                          className={cn('bg-muted/10', !row.last && 'border-b border-dashed')}
                        >
                          <TableCell>
                            <input type="checkbox" checked={isSelected(row.order.id)} onChange={() => toggleOne(row.order.id)} className="cursor-pointer" />
                          </TableCell>
                          <TableCell className="font-mono text-xs pl-6">
                            ↳ {row.order.id.slice(0, 8).toUpperCase()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn(statusClass, 'text-xs')}>{label}</Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm">{formatPrice(row.order.totalPrice)}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{row.order.quantity}</TableCell>
                          <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                            {new Date(row.order.createdAt).toLocaleDateString('en-US')}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/orders/${row.order.id}`)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    }

                    // single
                    const { label, className: statusClass } = ORDER_STATUS_LABEL[row.order.status] ?? { label: row.order.status, className: '' };
                    return (
                      <TableRow key={row.order.id} className={cn(isSelected(row.order.id) && 'bg-muted/50')}>
                        <TableCell>
                          <input type="checkbox" checked={isSelected(row.order.id)} onChange={() => toggleOne(row.order.id)} className="cursor-pointer" />
                        </TableCell>
                        <TableCell className="font-mono text-xs">{row.order.id.slice(0, 8).toUpperCase()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusClass}>{label}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatPrice(row.order.totalPrice)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{row.order.quantity}</TableCell>
                        <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                          {new Date(row.order.createdAt).toLocaleDateString('en-US')}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/orders/${row.order.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <Pagination currentPage={page} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};
