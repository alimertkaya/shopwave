import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Minus, Plus, Heart } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Separator } from '@/shared/components/ui/separator';
import { useProduct } from '@/features/products/hooks/useProducts';
import { useStock } from '@/features/products/hooks/useInventory';
import { useCartStore } from '@/features/cart/store/cartStore';
import { useFavoritesStore } from '@/features/favorites/store/favoritesStore';
import { formatPrice } from '@/shared/utils/formatPrice';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { cn } from '@/shared/utils/cn';
import { toast } from 'sonner';

export const ProductDetailPage = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, isError } = useProduct(id);
  const { data: stock } = useStock(id);
  const addItem      = useCartStore((s) => s.addItem);
  const isFavorite   = useFavoritesStore((s) => s.isFavorite(id));
  const toggleFav    = useFavoritesStore((s) => s.toggle);

  usePageTitle(product?.name ?? 'Product Details');

  const availableStock = stock?.quantity ?? 0;
  const outOfStock = availableStock === 0;

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: product.imageUrl,
    });
    toast.success(`${product.name} added to cart`);
  };

  if (isLoading) return <ProductDetailSkeleton />;

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        <p className="text-lg">Product not found.</p>
        <Button variant="ghost" onClick={() => navigate('/products')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Görsel */}
        <div className="aspect-square bg-muted rounded-xl overflow-hidden">
          <img
            src={product.imageUrl || '/placeholder-product.svg'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Bilgiler */}
        <div className="flex flex-col gap-5">
          <Badge variant="secondary" className="w-fit">{product.category}</Badge>

          <h1 className="text-3xl font-bold leading-tight">{product.name}</h1>

          <p className="text-3xl font-bold text-primary">{formatPrice(product.price)}</p>

          <Separator />

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Stock status */}
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Stock:</span>
            {outOfStock ? (
              <Badge variant="destructive">Out of Stock</Badge>
            ) : availableStock <= 5 ? (
              <Badge variant="outline" className="text-amber-600 border-amber-400">
                Only {availableStock} left
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-green-700">In Stock</Badge>
            )}
          </div>

          {/* Quantity selector */}
          {!outOfStock && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                  disabled={quantity >= availableStock}
                  aria-label="Increase"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Sepete ekle + Favori */}
          <div className="flex gap-2 mt-2">
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              {outOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => product && toggleFav(product)}
              aria-label={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              className="px-4"
            >
              <Heart className={cn('h-5 w-5', isFavorite ? 'fill-red-500 text-red-500' : '')} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductDetailSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <Skeleton className="h-9 w-20 mb-6" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <Skeleton className="aspect-square rounded-xl" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-px w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <Skeleton className="h-10 w-full mt-4" />
      </div>
    </div>
  </div>
);
