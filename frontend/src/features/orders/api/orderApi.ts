import api from '@/lib/axios';
import type { CreateOrderRequest, Order } from '../types/order.types';

export const orderApi = {
  create: (data: CreateOrderRequest) =>
    api.post<Order>('/api/orders', data).then((r) => r.data),

  getAll: (_params: { page: number; size: number }) =>
    api.get<Order[]>('/api/orders').then((r) => {
      const sorted = [...r.data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return { content: sorted, totalElements: sorted.length, totalPages: 1, number: 0, size: sorted.length, first: true, last: true };
    }),

  getById: (id: string) =>
    api.get<Order>(`/api/orders/${id}`).then((r) => r.data),

  getByUserId: (userId: string) =>
    api.get<Order[]>(`/api/orders/user/${userId}`).then((r) =>
      [...r.data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    ),
};
