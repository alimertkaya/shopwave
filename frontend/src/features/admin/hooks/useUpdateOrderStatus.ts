import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/axios';
import type { OrderStatus } from '@/shared/constants/orderStatus';
import type { Order } from '@/features/orders/types/order.types';

export const useUpdateOrderStatus = (orderId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: OrderStatus) =>
      api.put<Order>(`/api/orders/${orderId}/status`, { status }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders', orderId] });
      toast.success('Order status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });
};
