import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { CartPageItem } from '@/features/cart/components/CartPageItem';
import { useCartStore } from '@/features/cart/store/cartStore';
import { formatPrice } from '@/shared/utils/formatPrice';
import { usePageTitle } from '@/shared/hooks/usePageTitle';

export const CartPage = () => {
  usePageTitle('My Cart');
  const items      = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const totalItems = useCartStore((s) => s.totalItems);
  const clearCart  = useCartStore((s) => s.clearCart);
  const navigate   = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center gap-4 text-muted-foreground">
        <ShoppingCart className="h-16 w-16 opacity-20" />
        <p className="text-xl font-semibold">Your cart is empty</p>
        <p className="text-sm">Start shopping to add products to your cart.</p>
        <Button onClick={() => navigate('/')}>Start Shopping</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Continue Shopping
      </button>

      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product list */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100 px-5">
            {items.map((item) => (
              <CartPageItem key={item.productId} item={item} />
            ))}
          </div>

          <button
            onClick={clearCart}
            className="mt-3 text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Clear cart
          </button>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 sticky top-24">
            <h2 className="font-semibold text-lg text-gray-800">Order Summary</h2>
            <Separator />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>{totalItems()} items</span>
                <span>{formatPrice(totalPrice())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-800">Total</span>
              <span className="text-xl font-bold text-primary">{formatPrice(totalPrice())}</span>
            </div>

            <Button
              className="w-full h-12 text-base font-semibold rounded-xl"
              onClick={() => navigate('/checkout')}
            >
              Place Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
