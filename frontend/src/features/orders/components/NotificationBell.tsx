import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { orderApi } from '../api/orderApi';
import { ORDER_STATUS_LABEL, ORDER_STATUS } from '@/shared/constants/orderStatus';
import type { OrderStatus } from '@/shared/constants/orderStatus';

const TERMINAL: string[] = [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED];

interface Props {
  userId: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

export const NotificationBell = ({ userId }: Props) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: orders = [] } = useQuery({
    queryKey: ['orders', 'user', userId],
    queryFn: () => orderApi.getByUserId(userId),
    enabled: !!userId,
    refetchInterval: 10000,
  });

  const activeCount = orders.filter((o) => !TERMINAL.includes(o.status)).length;
  const recent = orders.slice(0, 6);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Notifications"
        onClick={() => setOpen((p) => !p)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {activeCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg border bg-background shadow-lg z-50">
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-semibold">My Orders</p>
          </div>

          {recent.length === 0 ? (
            <p className="px-4 py-6 text-sm text-center text-muted-foreground">
              No orders yet
            </p>
          ) : (
            <ul>
              {recent.map((order) => {
                const meta = ORDER_STATUS_LABEL[order.status as OrderStatus] ?? { label: order.status, className: '' };
                return (
                  <li key={order.id}>
                    <Link
                      to={`/orders/${order.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-mono">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <Badge variant="outline" className={`mt-1 text-xs ${meta.className}`}>
                          {meta.label}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap mt-0.5">
                        {timeAgo(order.createdAt)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="border-t px-4 py-2">
            <Link
              to="/orders"
              onClick={() => setOpen(false)}
              className="text-xs text-primary hover:underline"
            >
              View all orders →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
