import type { OrderStatus } from '@/shared/constants/orderStatus';

export interface Order {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  recipientName?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

export interface DeliveryAddress {
  recipientName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface CreateOrderRequest {
  userId: string;
  productId: string;
  quantity: number;
  recipientName?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}
