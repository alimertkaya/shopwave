import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { AdminRoute } from '@/shared/components/AdminRoute';
import { CustomerLayout } from '@/layouts/CustomerLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Customer pages — lazy
const HomePage          = lazy(() => import('@/pages/customer/HomePage').then((m) => ({ default: m.HomePage })));
const ProductDetailPage = lazy(() => import('@/pages/customer/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })));
const CartPage          = lazy(() => import('@/pages/customer/CartPage').then((m) => ({ default: m.CartPage })));
const CheckoutPage      = lazy(() => import('@/pages/customer/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const OrdersPage        = lazy(() => import('@/pages/customer/OrdersPage').then((m) => ({ default: m.OrdersPage })));
const OrderDetailPage   = lazy(() => import('@/pages/customer/OrderDetailPage').then((m) => ({ default: m.OrderDetailPage })));
const ProfilePage       = lazy(() => import('@/pages/customer/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const FavoritesPage     = lazy(() => import('@/pages/customer/FavoritesPage').then((m) => ({ default: m.FavoritesPage })));

// Auth pages — lazy
const LoginPage    = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));

// Admin pages — lazy
const DashboardPage        = lazy(() => import('@/pages/admin/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const AdminProductsPage    = lazy(() => import('@/pages/admin/ProductsPage').then((m) => ({ default: m.AdminProductsPage })));
const ProductFormPage      = lazy(() => import('@/pages/admin/ProductFormPage').then((m) => ({ default: m.ProductFormPage })));
const AdminOrdersPage      = lazy(() => import('@/pages/admin/OrdersPage').then((m) => ({ default: m.AdminOrdersPage })));
const AdminOrderDetailPage = lazy(() => import('@/pages/admin/OrderDetailPage').then((m) => ({ default: m.AdminOrderDetailPage })));
const InventoryPage        = lazy(() => import('@/pages/admin/InventoryPage').then((m) => ({ default: m.InventoryPage })));
const PaymentsPage         = lazy(() => import('@/pages/admin/PaymentsPage').then((m) => ({ default: m.PaymentsPage })));
const ShippingPage         = lazy(() => import('@/pages/admin/ShippingPage').then((m) => ({ default: m.ShippingPage })));
const NotificationsPage    = lazy(() => import('@/pages/admin/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));

const WithCustomerLayout = ({ children }: { children: React.ReactNode }) => (
  <CustomerLayout>{children}</CustomerLayout>
);

export const Router = () => (
  <BrowserRouter>
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <Routes>
        {/* Customer — CustomerLayout ile sarılı */}
        <Route path="/" element={<WithCustomerLayout><HomePage /></WithCustomerLayout>} />
        <Route path="/products" element={<Navigate to="/" replace />} />
        <Route path="/products/:id" element={<WithCustomerLayout><ProductDetailPage /></WithCustomerLayout>} />
        <Route path="/cart" element={<WithCustomerLayout><CartPage /></WithCustomerLayout>} />
        <Route path="/checkout" element={<WithCustomerLayout><ProtectedRoute><CheckoutPage /></ProtectedRoute></WithCustomerLayout>} />
        <Route path="/orders" element={<WithCustomerLayout><ProtectedRoute><OrdersPage /></ProtectedRoute></WithCustomerLayout>} />
        <Route path="/orders/:id" element={<WithCustomerLayout><ProtectedRoute><OrderDetailPage /></ProtectedRoute></WithCustomerLayout>} />
        <Route path="/profile" element={<WithCustomerLayout><ProtectedRoute><ProfilePage /></ProtectedRoute></WithCustomerLayout>} />
        <Route path="/favorites" element={<WithCustomerLayout><ProtectedRoute><FavoritesPage /></ProtectedRoute></WithCustomerLayout>} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminLayout><DashboardPage /></AdminLayout></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminLayout><AdminProductsPage /></AdminLayout></AdminRoute>} />
        <Route path="/admin/products/new" element={<AdminRoute><AdminLayout><ProductFormPage /></AdminLayout></AdminRoute>} />
        <Route path="/admin/products/:id/edit" element={<AdminRoute><AdminLayout><ProductFormPage /></AdminLayout></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminLayout><AdminOrdersPage /></AdminLayout></AdminRoute>} />
        <Route path="/admin/orders/:id" element={<AdminRoute><AdminLayout><AdminOrderDetailPage /></AdminLayout></AdminRoute>} />
        <Route path="/admin/inventory" element={<AdminRoute><AdminLayout><InventoryPage /></AdminLayout></AdminRoute>} />
        <Route path="/admin/payments" element={<AdminRoute><AdminLayout><PaymentsPage /></AdminLayout></AdminRoute>} />
        <Route path="/admin/shipping" element={<AdminRoute><AdminLayout><ShippingPage /></AdminLayout></AdminRoute>} />
        <Route path="/admin/notifications" element={<AdminRoute><AdminLayout><NotificationsPage /></AdminLayout></AdminRoute>} />

        {/* 404 */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);
