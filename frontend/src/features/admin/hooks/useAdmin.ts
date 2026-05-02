import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminApi } from '../api/adminApi';
import { ORDER_STATUS } from '@/shared/constants/orderStatus';

const TERMINAL_STATUSES: string[] = [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED];

export const useDashboardStats = () =>
  useQuery({ queryKey: ['admin', 'stats'], queryFn: adminApi.getStats });

export const useRevenueSeries = (days = 30) =>
  useQuery({
    queryKey: ['admin', 'revenue', days],
    queryFn: () => adminApi.getRevenueSeries(days),
  });

export const useOrderStatusCounts = () =>
  useQuery({
    queryKey: ['admin', 'order-status-counts'],
    queryFn: adminApi.getOrderStatusCounts,
  });

export const useLowStock = (threshold = 10) =>
  useQuery({
    queryKey: ['admin', 'low-stock', threshold],
    queryFn: () => adminApi.getLowStock(threshold),
  });

export const useAdminInventory = (params: { page: number; size: number; search?: string }) =>
  useQuery({
    queryKey: ['admin', 'inventory', params],
    queryFn: () => adminApi.getInventory(params),
    placeholderData: keepPreviousData,
  });

export const useUpdateStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      adminApi.updateStock(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'low-stock'] });
      toast.success('Stock updated');
    },
    onError: () => toast.error('Failed to update stock'),
  });
};

export const useSetStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      adminApi.setStock(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'low-stock'] });
      toast.success('Stock set');
    },
    onError: () => toast.error('Failed to set stock'),
  });
};

export const useAdminProducts = (params: { page: number; size: number; search?: string; category?: string }) =>
  useQuery({
    queryKey: ['admin', 'products', params],
    queryFn: () => adminApi.getProducts(params),
    placeholderData: keepPreviousData,
  });

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Product deleted');
    },
    onError: () => toast.error('Failed to delete product'),
  });
};

export const useAdminOrders = (params: { page: number; size: number; status?: string }) =>
  useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: () => adminApi.getOrders(params),
    placeholderData: keepPreviousData,
    staleTime: 0,
    refetchInterval: (query) => {
      const orders = query.state.data?.content ?? [];
      const allDone = orders.length > 0 && orders.every((o) => TERMINAL_STATUSES.includes(o.status));
      return allDone ? false : 5000;
    },
  });

export const useAdminOrder = (id: string) =>
  useQuery({
    queryKey: ['admin', 'orders', id],
    queryFn: () => adminApi.getOrder(id),
    enabled: !!id,
    staleTime: 0,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && TERMINAL_STATUSES.includes(status) ? false : 3000;
    },
  });

export const useAdminPayments = (params: { page: number; size: number }) =>
  useQuery({
    queryKey: ['admin', 'payments', params],
    queryFn: () => adminApi.getPayments(params),
    placeholderData: keepPreviousData,
  });

export const useAdminRefunds = (params: { page: number; size: number }) =>
  useQuery({
    queryKey: ['admin', 'refunds', params],
    queryFn: () => adminApi.getRefunds(params),
    placeholderData: keepPreviousData,
  });

export const useInitiateRefund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => adminApi.initiateRefund(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'refunds'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] });
      toast.success('Refund process initiated');
    },
    onError: () => toast.error('Failed to initiate refund'),
  });
};

export const useAdminShipments = (params: { page: number; size: number; status?: string }) =>
  useQuery({
    queryKey: ['admin', 'shipments', params],
    queryFn: () => adminApi.getShipments(params),
    placeholderData: keepPreviousData,
    refetchInterval: params.status === 'IN_TRANSIT' ? 60_000 : false,
  });

export const useAdminNotifications = (params: { page: number; size: number; eventType?: string }) =>
  useQuery({
    queryKey: ['admin', 'notifications', params],
    queryFn: () => adminApi.getNotifications(params),
    placeholderData: keepPreviousData,
  });
