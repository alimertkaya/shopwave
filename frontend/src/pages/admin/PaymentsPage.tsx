import { useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
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
import { useAdminPayments, useAdminRefunds } from '@/features/admin/hooks/useAdmin';
import type { Refund } from '@/features/admin/types/admin.types';

const REFUND_STATUS_VARIANT: Record<Refund['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
  COMPLETED: 'default',
  PENDING:   'outline',
  FAILED:    'destructive',
};

const REFUND_STATUS_LABEL: Record<Refund['status'], string> = {
  COMPLETED: 'Completed',
  PENDING:   'Pending',
  FAILED:    'Failed',
};

const PAGE_SIZE = 15;

const PaymentsTab = () => {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useAdminPayments({ page, size: PAGE_SIZE });
  const payments = data?.content ?? [];

  return (
    <div className="space-y-4">
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.orderId.slice(0, 8).toUpperCase()}</TableCell>
                      <TableCell className="font-medium">{formatPrice(p.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={p.status === 'SUCCESS' ? 'default' : 'destructive'}>
                          {p.status === 'SUCCESS' ? 'Success' : 'Failed'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(p.createdAt).toLocaleDateString('en-US')}
                      </TableCell>
                    </TableRow>
                  ))
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

const RefundsTab = () => {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useAdminRefunds({ page, size: PAGE_SIZE });
  const refunds = data?.content ?? [];

  return (
    <div className="space-y-4">
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refunds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                      No refund requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  refunds.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.orderId.slice(0, 8).toUpperCase()}</TableCell>
                      <TableCell className="font-medium">{formatPrice(r.amount)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-xs truncate">{r.reason}</TableCell>
                      <TableCell>
                        <Badge variant={REFUND_STATUS_VARIANT[r.status]}>
                          {REFUND_STATUS_LABEL[r.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(r.requestedAt).toLocaleDateString('en-US')}
                      </TableCell>
                    </TableRow>
                  ))
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

export const PaymentsPage = () => (
  <div className="space-y-4">
    <h1 className="text-xl font-bold">Payment & Refund Management</h1>
    <Tabs defaultValue="payments">
      <TabsList>
        <TabsTrigger value="payments">Payments</TabsTrigger>
        <TabsTrigger value="refunds">Refunds</TabsTrigger>
      </TabsList>
      <TabsContent value="payments" className="mt-2"><PaymentsTab /></TabsContent>
      <TabsContent value="refunds" className="mt-2"><RefundsTab /></TabsContent>
    </Tabs>
  </div>
);
