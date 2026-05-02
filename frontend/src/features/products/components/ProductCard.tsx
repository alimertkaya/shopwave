import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { formatPrice } from '@/shared/utils/formatPrice';
import { CATEGORY_CONFIG } from '../types/product.types';
import { cn } from '@/shared/utils/cn';
import { useFavoritesStore } from '@/features/favorites/store/favoritesStore';
import type { Product } from '../types/product.types';

interface Props {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export const ProductCard = ({ product, onAddToCart }: Props) => {
  const outOfStock  = product.stock !== undefined && product.stock === 0;
  const isFavorite  = useFavoritesStore((s) => s.isFavorite(product.id));
  const toggle      = useFavoritesStore((s) => s.toggle);
  const cfg = CATEGORY_CONFIG.find(
    (c) => c.id === product.category || c.sub.includes(product.category)
  );

  return (
    <div className="group flex flex-col bg-white rounded-xl border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* Görsel */}
      <div className="relative">
        <Link to={`/products/${product.id}`} className="block overflow-hidden bg-gray-50 aspect-square p-2">
          <img
            src={product.imageUrl || '/placeholder-product.svg'}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Favori butonu — her zaman görünür */}
        <button
          onClick={() => toggle(product)}
          aria-label={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 hover:scale-110 transition-transform"
        >
          <Heart className={cn('h-3.5 w-3.5 transition-colors', isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-300')} />
        </button>

        {outOfStock && (
          <div className="absolute top-2 left-2">
            <span className="text-[10px] bg-red-50 text-red-500 border border-red-200 px-1.5 py-0.5 rounded-md font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Bilgiler */}
      <div className="flex flex-col flex-1 gap-1 p-2.5">
        <Badge variant="outline" className={cn('w-fit text-[10px] px-1.5 py-0 border-0 bg-orange-50 text-orange-600', cfg?.color)}>
          {product.category}
        </Badge>

        <Link
          to={`/products/${product.id}`}
          className="text-xs font-medium leading-snug hover:text-primary line-clamp-2 min-h-[2.5rem] text-gray-700"
        >
          {product.name}
        </Link>

        <div className="mt-auto pt-1.5">
          <span className="text-sm font-bold text-gray-900 block mb-1.5">{formatPrice(product.price)}</span>
          <button
            className={cn(
              'w-full h-8 text-xs flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors',
              outOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100',
            )}
            onClick={() => !outOfStock && onAddToCart?.(product)}
            disabled={outOfStock}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {outOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};
