import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, ShoppingCart, Package, Users, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { formatPrice } from '@/shared/utils/formatPrice';
import { ORDER_STATUS_LABEL } from '@/shared/constants/orderStatus';
import type { OrderStatus } from '@/shared/constants/orderStatus';
import { useDashboardStats, useRevenueSeries, useOrderStatusCounts } from '@/features/admin/hooks/useAdmin';
import { LowStockAlert } from '@/features/admin/components/LowStockAlert';

const PIE_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

const KpiCard = ({
  title,
  value,
  change,
  icon: Icon,
  format = 'number',
}: {
  title: string;
  value: number | undefined;
  change?: number;
  icon: React.ElementType;
  format?: 'number' | 'currency';
}) => {
  const isPositive = (change ?? 0) >= 0;

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
        {value === undefined ? (
          <Skeleton className="h-7 w-24" />
        ) : (
          <p className="text-2xl font-bold">
            {format === 'currency' ? formatPrice(value) : value.toLocaleString('tr-TR')}
          </p>
        )}
        {change !== undefined && (
          <p
            className={`text-xs mt-1 flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-destructive'}`}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(change)}% vs last month
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export const DashboardPage = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: revenueSeries, isLoading: revenueLoading } = useRevenueSeries(30);
  const { data: statusCounts } = useOrderStatusCounts();

  const pieData = statusCounts?.map((item) => ({
    name: ORDER_STATUS_LABEL[item.status as OrderStatus]?.label ?? item.status,
    value: item.count,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* KPI Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total Revenue"
          value={stats?.totalRevenue}
          icon={DollarSign}
          format="currency"
        />
        <KpiCard
          title="Total Orders"
          value={stats?.totalOrders}
          icon={ShoppingCart}
        />
        <KpiCard
          title="Shipped"
          value={statsLoading ? undefined : (stats?.shippedOrders ?? 0)}
          icon={Package}
        />
        <KpiCard
          title="Cancelled"
          value={statsLoading ? undefined : (stats?.cancelledOrders ?? 0)}
          icon={Users}
        />
      </div>

      {/* Grafikler + LowStock */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Gelir grafiği */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Last 30 Days Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={revenueSeries} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) =>
                      new Date(v).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
                    }
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(v) => [formatPrice(Number(v)), 'Revenue']}
                    labelFormatter={(l) =>
                      new Date(l).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Sipariş durum pasta */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Statuses</CardTitle>
          </CardHeader>
          <CardContent>
            {!pieData ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [Number(v), 'Orders']} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Düşük stok uyarısı */}
      <LowStockAlert />
    </div>
  );
};
