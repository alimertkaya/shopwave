import { useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Pagination } from '@/shared/components/Pagination';
import { useAdminNotifications } from '@/features/admin/hooks/useAdmin';

const PAGE_SIZE = 20;

export const NotificationsPage = () => {
  const [page, setPage] = useState(0);

  const { data, isLoading } = useAdminNotifications({ page, size: PAGE_SIZE });
  const logs = data?.content ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Notification History</h1>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                      No notifications found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">
                        {log.orderId.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.notificationType}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-sm truncate">
                        {log.message}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(log.sentAt).toLocaleString('en-US')}
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
