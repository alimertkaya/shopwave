import { useState, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  CreditCard,
  Truck,
  Bell,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { cn } from '@/shared/utils/cn';
import { useAuthStore } from '@/features/auth/store/authStore';

interface Props {
  children: ReactNode;
}

const NAV_ITEMS = [
  { to: '/admin/dashboard',      label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/admin/products',       label: 'Products',       icon: Package },
  { to: '/admin/orders',         label: 'Orders',         icon: ShoppingCart },
  { to: '/admin/inventory',      label: 'Inventory',      icon: Warehouse },
  { to: '/admin/payments',       label: 'Payments',       icon: CreditCard },
  { to: '/admin/shipping',       label: 'Shipping',       icon: Truck },
  { to: '/admin/notifications',  label: 'Notifications',  icon: Bell },
];

const NavItems = ({ onClose }: { onClose?: () => void }) => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 h-16 flex items-center flex-shrink-0">
        <span className="text-lg font-bold tracking-tight">ShopWave</span>
        <span className="ml-2 text-xs bg-primary text-primary-foreground rounded px-1.5 py-0.5">
          Admin
        </span>
      </div>

      <Separator />

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <Separator />

      {/* Logout */}
      <div className="px-2 py-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export const AdminLayout = ({ children }: Props) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 border-r bg-background flex-shrink-0">
        <NavItems />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-56 border-r bg-background flex flex-col md:hidden transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <NavItems onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="md:hidden sticky top-0 z-30 border-b bg-background/95 backdrop-blur h-14 flex items-center px-4 gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <span className="font-semibold">ShopWave Admin</span>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};
