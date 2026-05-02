import { Minus, Plus, Trash2, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/shared/utils/formatPrice';
import { useCartStore } from '../store/cartStore';
import { useFavoritesStore } from '@/features/favorites/store/favoritesStore';
import { cn } from '@/shared/utils/cn';
import type { CartItem as CartItemType } from '../types/cart.types';

interface Props {
  item: CartItemType;
}

export const CartPageItem = ({ item }: Props) => {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem     = useCartStore((s) => s.removeItem);
  const isFavorite     = useFavoritesStore((s) => s.isFavorite(item.productId));
  const toggle         = useFavoritesStore((s) => s.toggle);

  return (
    <div className="flex items-center gap-4 py-5">
      {/* Görsel */}
      <Link to={`/products/${item.productId}`} className="flex-shrink-0">
        <div className="h-24 w-24 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center p-2 overflow-hidden">
          <img
            src={item.imageUrl || '/placeholder-product.svg'}
            alt={item.name}
            className="h-full w-full object-contain"
          />
        </div>
      </Link>

      {/* Orta — Ad + aksiyonlar */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/products/${item.productId}`}
          className="text-sm font-semibold text-gray-800 hover:text-primary line-clamp-2 leading-snug"
        >
          {item.name}
        </Link>

        {/* Aksiyonlar */}
        <div className="flex items-center gap-3 mt-2.5">
          <button
            onClick={() => toggle({ id: item.productId, name: item.name, price: item.price, imageUrl: item.imageUrl ?? '', category: '', description: '' })}
            aria-label={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            <Heart className={cn('h-4 w-4', isFavorite ? 'fill-red-500 text-red-500' : '')} />
          </button>
          <button
            onClick={() => removeItem(item.productId)}
            aria-label="Remove"
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Sağ — Adet + Fiyat */}
      <div className="flex items-center gap-5 flex-shrink-0">
        {/* Adet stepper */}
        <div className="flex items-center gap-0 bg-orange-50 rounded-full px-1 py-1">
          <button
            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
            disabled={item.quantity <= 1}
            aria-label="Decrease"
            className="h-7 w-7 flex items-center justify-center rounded-full text-orange-500 hover:bg-orange-100 transition-colors disabled:opacity-30"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-8 text-center text-sm font-semibold text-gray-800">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
            aria-label="Increase"
            className="h-7 w-7 flex items-center justify-center rounded-full text-orange-500 hover:bg-orange-100 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Fiyat */}
        <div className="text-right w-28">
          <p className="text-base font-bold text-primary">{formatPrice(item.price * item.quantity)}</p>
          {item.quantity > 1 && (
            <p className="text-xs text-gray-400">{formatPrice(item.price)} / each</p>
          )}
        </div>
      </div>
    </div>
  );
};
