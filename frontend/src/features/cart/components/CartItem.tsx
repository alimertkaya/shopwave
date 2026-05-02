import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatPrice } from '@/shared/utils/formatPrice';
import { useCartStore } from '../store/cartStore';
import type { CartItem as CartItemType } from '../types/cart.types';

interface Props {
  item: CartItemType;
}

export const CartItem = ({ item }: Props) => {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex gap-3 py-4">
      {/* Görsel */}
      <div className="h-18 w-18 min-w-[72px] rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center p-1.5">
        <img
          src={item.imageUrl || '/placeholder-product.svg'}
          alt={item.name}
          className="h-full w-full object-contain"
        />
      </div>

      {/* Bilgiler */}
      <div className="flex flex-col flex-1 min-w-0 gap-1.5">
        {/* İsim + Sil */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug line-clamp-2 text-gray-800">{item.name}</p>
          <button
            onClick={() => removeItem(item.productId)}
            aria-label={`Remove ${item.name} from cart`}
            className="flex-shrink-0 h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Fiyat */}
        <p className="text-sm font-bold text-primary">{formatPrice(item.price)}</p>

        {/* Miktar + Toplam */}
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-0 border border-gray-200 rounded-lg overflow-hidden">
            <button
              className="h-7 w-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-40"
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label="Decrease"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
            <button
              className="h-7 w-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              aria-label="Increase"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <span className="text-sm font-bold text-gray-900">
            {formatPrice(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
};
