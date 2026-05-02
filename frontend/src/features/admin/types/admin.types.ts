export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  cancelledOrders: number;
  shippedOrders: number;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
}

export interface OrderStatusCount {
  status: string;
  count: number;
}

export interface LowStockProduct {
  productId: string;
  quantity: number;
}

export interface InventoryItem {
  id: string;
  productId: string;
  quantity: number;
}

// Payments
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: string; // SUCCESS | FAILED
  createdAt: string;
}

export interface Refund {
  id: string;
  orderId: string;
  amount: number;
  reason: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  requestedAt: string;
}

// Shipping
export interface Shipment {
  id: string;
  orderId: string;
  trackingNumber: string;
  status: string; // PREPARING | SHIPPED | IN_TRANSIT | DELIVERED
  createdAt: string;
}

// Notifications
export interface NotificationLog {
  id: string;
  orderId: string;
  notificationType: string; // EMAIL | SMS
  message: string;
  sentAt: string;
}
