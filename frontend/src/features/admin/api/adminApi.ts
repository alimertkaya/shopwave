import api from '@/lib/axios';
import type {
  DashboardStats,
  OrderStatusCount,
  LowStockProduct,
  InventoryItem,
  Payment,
  Refund,
  Shipment,
  NotificationLog,
} from '../types/admin.types';
import type { Order } from '@/features/orders/types/order.types';
import type { Product } from '@/features/products/types/product.types';

export const adminApi = {
  // Dashboard
  getStats: () =>
    api.get<DashboardStats>('/api/orders/admin/stats').then((r) => r.data),

  getRevenueSeries: (days = 30) =>
    api.get<Order[]>('/api/orders').then((r) => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);

      // Gün bazında toplam gelir
      const map = new Map<string, number>();
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        map.set(d.toISOString().slice(0, 10), 0);
      }

      r.data
        .filter((o) => o.status !== 'CANCELLED' && new Date(o.createdAt) >= cutoff)
        .forEach((o) => {
          const day = new Date(o.createdAt).toISOString().slice(0, 10);
          if (map.has(day)) map.set(day, (map.get(day) ?? 0) + Number(o.totalPrice));
        });

      return Array.from(map.entries()).map(([date, revenue]) => ({ date, revenue }));
    }),

  getOrderStatusCounts: () =>
    api
      .get<OrderStatusCount[]>('/api/orders/admin/status-counts')
      .then((r) => r.data),

  getLowStock: (threshold = 10) =>
    api
      .get<LowStockProduct[]>('/api/inventories/low-stock', { params: { threshold } })
      .then((r) => r.data),

  // Inventory
  getInventory: (_params: { page: number; size: number; search?: string }) =>
    api
      .get<InventoryItem[]>('/api/inventories')
      .then((r) => ({ content: r.data, totalElements: r.data.length, totalPages: 1, number: 0, size: r.data.length, first: true, last: true })),

  updateStock: (productId: string, quantity: number) =>
    api
      .post('/api/inventories', { productId, quantity })
      .then((r) => r.data),

  setStock: (productId: string, quantity: number) =>
    api
      .put(`/api/inventories/${productId}?quantity=${quantity}`)
      .then((r) => r.data),

  // Products (admin)
  getProducts: (params: { page: number; size: number; search?: string; category?: string }) =>
    api.get<Product[]>('/api/products').then((r) => {
      let data = r.data;
      if (params.search) {
        const q = params.search.toLowerCase();
        data = data.filter((p) => p.name.toLowerCase().includes(q));
      }
      if (params.category) {
        data = data.filter((p) => p.category === params.category);
      }
      const { page = 0, size = 15 } = params;
      const totalElements = data.length;
      const totalPages = Math.max(1, Math.ceil(totalElements / size));
      return {
        content: data.slice(page * size, (page + 1) * size),
        totalElements,
        totalPages,
        number: page,
        size,
        first: page === 0,
        last: page >= totalPages - 1,
      };
    }),

  createProduct: (data: Omit<Product, 'id'>) =>
    api.post<Product>('/api/products', data).then((r) => r.data),

  updateProduct: (id: string, data: Omit<Product, 'id'>) =>
    api.put<Product>(`/api/products/${id}`, data).then((r) => r.data),

  deleteProduct: (id: string) =>
    api.delete(`/api/products/${id}`).then((r) => r.data),

  // Orders (admin)
  getOrders: (params: { page: number; size: number; status?: string }) =>
    api.get<Order[]>('/api/orders').then((r) => {
      let sorted = [...r.data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      if (params.status) sorted = sorted.filter((o) => o.status === params.status);
      return { content: sorted, totalElements: sorted.length, totalPages: 1, number: 0, size: sorted.length, first: true, last: true };
    }),

  getOrder: (id: string) =>
    api.get<Order>(`/api/orders/${id}`).then((r) => r.data),

  // Payments
  getPayments: (_params: { page: number; size: number }) =>
    api.get<Payment[]>('/api/payments').then((r) => ({
      content: r.data, totalElements: r.data.length, totalPages: 1,
      number: 0, size: r.data.length, first: true, last: true,
    })),

  getRefunds: (_params: { page: number; size: number }) =>
    api.get<Refund[]>('/api/payments/refunds').then((r) => ({
      content: r.data, totalElements: r.data.length, totalPages: 1,
      number: 0, size: r.data.length, first: true, last: true,
    })),

  initiateRefund: (_orderId: string) =>
    Promise.resolve(),

  // Shipping
  getShipments: (params: { page: number; size: number; status?: string }) =>
    api.get<Shipment[]>('/api/shipments').then((r) => {
      const filtered = params.status ? r.data.filter((s) => s.status === params.status) : r.data;
      return { content: filtered, totalElements: filtered.length, totalPages: 1, number: 0, size: filtered.length, first: true, last: true };
    }),

  // Notifications
  getNotifications: (_params: { page: number; size: number; eventType?: string }) =>
    api.get<NotificationLog[]>('/api/notifications').then((r) => ({
      content: r.data, totalElements: r.data.length, totalPages: 1,
      number: 0, size: r.data.length, first: true, last: true,
    })),
};
