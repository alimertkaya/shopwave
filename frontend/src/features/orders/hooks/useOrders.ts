import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { orderApi } from '../api/orderApi';
import type { CreateOrderRequest } from '../types/order.types';
import { ORDER_STATUS } from '@/shared/constants/orderStatus';
import { useCartStore } from '@/features/cart/store/cartStore';

const TERMINAL = [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED] as string[];

export const useOrders = (params: { page: number; size: number }) =>
  useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderApi.getAll(params),
    placeholderData: keepPreviousData,
    staleTime: 0,
    refetchInterval: (query) => {
      const orders = query.state.data?.content ?? [];
      const allDone = orders.length > 0 && orders.every((o) => TERMINAL.includes(o.status));
      return allDone ? false : 5000;
    },
  });

export const useOrder = (id: string) =>
  useQuery({
    queryKey: ['orders', id],
    queryFn: () => orderApi.getById(id),
    enabled: !!id,
  });

// Saga akışı async — terminal duruma gelene kadar 3 sn'de bir polling
export const useOrderStatusPoller = (id: string) =>
  useQuery({
    queryKey: ['orders', id],
    queryFn: () => orderApi.getById(id),
    enabled: !!id,
    staleTime: 0,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && TERMINAL.includes(status) ? false : 3000;
    },
  });

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const clearCart = useCartStore((s) => s.clearCart);

  return useMutation({
    mutationFn: (data: CreateOrderRequest) => orderApi.create(data),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      clearCart();
      toast.success('Your order has been placed!');
      navigate(`/orders/${order.id}`);
    },
    onError: () => {
      toast.error('Failed to place order, please try again');
    },
  });
};
