import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { ProductGrid } from '@/features/products/components/ProductGrid';
import { useFavoritesStore } from '@/features/favorites/store/favoritesStore';
import { useCartStore } from '@/features/cart/store/cartStore';
import { toast } from 'sonner';
import type { Product } from '@/features/products/types/product.types';

export const FavoritesPage = () => {
  const navigate  = useNavigate();
  const items     = useFavoritesStore((s) => s.items);
  const addItem   = useCartStore((s) => s.addItem);

  const handleAddToCart = (product: Product) => {
    addItem({ productId: product.id, name: product.name, price: product.price, quantity: 1, imageUrl: product.imageUrl });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">My Favorites</h1>
        {items.length > 0 && (
          <span className="text-sm text-muted-foreground">{items.length} items</span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
          <Heart className="h-16 w-16 opacity-20" />
          <p className="text-lg font-medium">No favorite products yet</p>
          <p className="text-sm">Click the heart icon on products you like to add them to your favorites.</p>
          <Button onClick={() => navigate('/')}>Start Shopping</Button>
        </div>
      ) : (
        <ProductGrid products={items} onAddToCart={handleAddToCart} />
      )}
    </div>
  );
};
