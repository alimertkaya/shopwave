import { useState, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingBag, Heart } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { CartDrawer } from '@/features/cart/components/CartDrawer';
import { NotificationBell } from '@/features/orders/components/NotificationBell';
import { useAuthStore } from '@/features/auth/store/authStore';

interface Props {
  children: ReactNode;
}

export const CustomerLayout = ({ children }: Props) => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  const [query, setQuery] = useState('');

  const handleSearch = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate(`/?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          {/* Logo */}
          <NavLink to="/" className="flex-shrink-0 flex items-center gap-1.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900 hidden sm:block">
              Shop<span className="text-primary">Wave</span>
            </span>
          </NavLink>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 flex items-center max-w-2xl mx-auto">
            <div className="relative w-full">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, categories or brands..."
                className="pr-12 h-10 rounded-full border-2 border-gray-200 focus-visible:border-primary bg-gray-50 focus-visible:bg-white transition-colors"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-4 rounded-r-full bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {isAuthenticated ? (
              <>
                {user?.id && <NotificationBell userId={user.id} />}
                <Button variant="ghost" size="icon" onClick={() => navigate('/favorites')} aria-label="My Favorites">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex gap-1.5"
                  onClick={() => navigate('/orders')}
                >
                  <ShoppingBag className="h-4 w-4" />
                  My Orders
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigate('/profile')} aria-label="My Account">
                  <User className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => navigate('/login')}>
                <User className="h-4 w-4 mr-1.5" />
                Sign In
              </Button>
            )}
            <CartDrawer />
          </div>
        </div>
      </header>

      {/* İçerik */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t py-6 mt-auto bg-white">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()}{' '}
          <span className="text-primary font-semibold">ShopWave</span>.{' '}
          All rights reserved.
        </div>
      </footer>
    </div>
  );
};
