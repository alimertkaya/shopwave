import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { formatPrice } from '@/shared/utils/formatPrice';
import { useCartStore } from '../store/cartStore';
import { CartItem } from './CartItem';

export const CartDrawer = () => {
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const totalItems = useCartStore((s) => s.totalItems);
  const clearCart = useCartStore((s) => s.clearCart);
  const navigate = useNavigate();

  return (
    <Sheet>
      <SheetTrigger>
        <span className="relative inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-muted transition-colors cursor-pointer" aria-label="Open cart">
          <ShoppingCart className="h-5 w-5" />
          {totalItems() > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {totalItems() > 99 ? '99+' : totalItems()}
            </span>
          )}
        </span>
      </SheetTrigger>

      <SheetContent className="flex flex-col w-full sm:max-w-md px-5">
        <SheetHeader>
          <SheetTitle>
            My Cart {items.length > 0 && `(${totalItems()} items)`}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 opacity-30" />
            <p>Your cart is empty</p>
            <Button variant="outline" onClick={() => navigate('/products')}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Ürün listesi */}
            <div className="flex-1 overflow-y-auto -mx-6 px-6 divide-y">
              {items.map((item) => (
                <CartItem key={item.productId} item={item} />
              ))}
            </div>

            {/* Özet */}
            <div className="pt-3 space-y-3">
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-700">Total</span>
                <span className="text-xl font-bold text-gray-900">{formatPrice(totalPrice())}</span>
              </div>
              <Button className="w-full h-12 text-base font-semibold rounded-xl" onClick={() => navigate('/cart')}>
                Go to Cart
              </Button>
              <Button
                variant="outline"
                className="w-full h-10 rounded-xl text-sm text-gray-500 hover:text-red-500 hover:border-red-300 hover:bg-red-50 transition-colors"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
