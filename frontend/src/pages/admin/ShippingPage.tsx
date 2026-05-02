import { useState } from 'react';
import { Download } from 'lucide-react';
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
import { exportToCsv } from '@/shared/utils/exportCsv';
import { useAdminShipments } from '@/features/admin/hooks/useAdmin';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PREPARING:  'outline',
  SHIPPED:    'default',
  IN_TRANSIT: 'default',
  DELIVERED:  'secondary',
  FAILED:     'destructive',
};

const STATUS_LABEL: Record<string, string> = {
  PREPARING:  'Preparing',
  SHIPPED:    'Shipped',
  IN_TRANSIT: 'In Transit',
  DELIVERED:  'Delivered',
  FAILED:     'Failed',
};

const PAGE_SIZE = 15;

export const ShippingPage = () => {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading } = useAdminShipments({
    page,
    size: PAGE_SIZE,
    status: statusFilter || undefined,
  });

  const shipments = data?.content ?? [];

  const handleExport = () =>
    exportToCsv('shipments', shipments.map((s) => ({
      id: s.id,
      orderId: s.orderId,
      trackingNumber: s.trackingNumber,
      status: STATUS_LABEL[s.status] ?? s.status,
      date: new Date(s.createdAt).toLocaleDateString('en-US'),
    })));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Shipment Tracking</h1>

      <div className="flex items-center justify-between gap-4">
        <Select
          value={statusFilter}
          onValueChange={(v) => { setStatusFilter(v === 'ALL' ? '' : (v ?? '')); setPage(0); }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Statuses">
              {statusFilter ? (STATUS_LABEL[statusFilter] ?? statusFilter) : null}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PREPARING">Preparing</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={handleExport} disabled={!shipments.length}>
          <Download className="h-4 w-4 mr-1.5" />
          Download CSV
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Tracking No</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                      No shipment records found
                    </TableCell>
                  </TableRow>
                ) : (
                  shipments.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs">
                        {s.orderId.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{s.trackingNumber}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[s.status] ?? 'outline'}>
                          {STATUS_LABEL[s.status] ?? s.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(s.createdAt).toLocaleDateString('en-US')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={data?.totalPages ?? 0}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};
