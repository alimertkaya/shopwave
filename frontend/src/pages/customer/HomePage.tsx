import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Pagination } from '@/shared/components/Pagination';
import { ProductGrid, ProductGridSkeleton } from '@/features/products/components/ProductGrid';
import { CATEGORY_CONFIG } from '@/features/products/types/product.types';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useCartStore } from '@/features/cart/store/cartStore';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { cn } from '@/shared/utils/cn';
import { toast } from 'sonner';
import type { Product } from '@/features/products/types/product.types';

const PAGE_SIZE = 24;

export const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery    = searchParams.get('q') ?? '';
  const urlCategory = searchParams.get('category') ?? '';

  const [category, setCategory]         = useState(urlCategory);
  const [expandedSub, setExpandedSub]   = useState<string | null>(null);
  const [minPrice, setMinPrice]         = useState('');
  const [maxPrice, setMaxPrice]         = useState('');
  const [showFilters, setShowFilters]   = useState(false);
  const [page, setPage]                 = useState(0);

  const debouncedMin = useDebounce(minPrice, 400);
  const debouncedMax = useDebounce(maxPrice, 400);

  const addItem = useCartStore((s) => s.addItem);

  const activeMain = CATEGORY_CONFIG.find(
    (c) => c.id === category || c.sub.includes(category)
  );

  useEffect(() => { setPage(0); }, [urlQuery, category, debouncedMin, debouncedMax]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (urlQuery)  params.q = urlQuery;
    if (category)  params.category = category;
    setSearchParams(params, { replace: true });
  }, [category]);

  const selectMainCat = (catId: string) => {
    const cfg = CATEGORY_CONFIG.find((c) => c.id === catId)!;
    if (activeMain?.id === catId) {
      if (cfg.sub.length > 0 && expandedSub !== catId) {
        setExpandedSub(catId);
      } else {
        setCategory('');
        setExpandedSub(null);
      }
    } else {
      setCategory(catId);
      setExpandedSub(cfg.sub.length > 0 ? catId : null);
    }
  };

  const selectSub = (sub: string) => {
    setCategory(category === sub ? activeMain?.id ?? '' : sub);
  };

  const clearAll = () => {
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setExpandedSub(null);
    setPage(0);
    setSearchParams(urlQuery ? { q: urlQuery } : {}, { replace: true });
  };

  const hasFilters = urlQuery || category || minPrice || maxPrice;

  const { data, isLoading, isError, isPlaceholderData } = useProducts({
    search:   urlQuery || undefined,
    category: category || undefined,
    minPrice: debouncedMin ? Number(debouncedMin) : undefined,
    maxPrice: debouncedMax ? Number(debouncedMax) : undefined,
    page,
    size: PAGE_SIZE,
  });

  const handleAddToCart = (product: Product) => {
    addItem({ productId: product.id, name: product.name, price: product.price, quantity: 1, imageUrl: product.imageUrl });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="min-h-screen">
      {/* Sticky category bar */}
      <div className="sticky top-16 z-30 bg-white border-b shadow-sm">
        {/* Main category bar */}
        <div className="overflow-x-auto scrollbar-none border-b">
          <div className="flex items-center px-4 min-w-max">
            {/* All Categories */}
            <button
              onClick={() => { setCategory(''); setExpandedSub(null); }}
              className={cn(
                'relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
                !category ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              All Categories
              {!category && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>

            {CATEGORY_CONFIG.map((cat) => {
              const isActive = activeMain?.id === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => selectMainCat(cat.id)}
                  className={cn(
                    'relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {cat.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subcategory strip */}
        {expandedSub && (
          <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-none">
            <Badge
              variant={category === activeMain?.id ? 'default' : 'outline'}
              className="cursor-pointer shrink-0"
              onClick={() => setCategory(activeMain?.id ?? '')}
            >
              All
            </Badge>
            {CATEGORY_CONFIG.find((c) => c.id === expandedSub)?.sub.map((sub) => (
              <Badge
                key={sub}
                variant={category === sub ? 'default' : 'outline'}
                className="cursor-pointer shrink-0 hover:bg-muted"
                onClick={() => selectSub(sub)}
              >
                {sub}
              </Badge>
            ))}
          </div>
        )}

        {/* Filter row */}
        <div className="flex items-center gap-2 px-4 py-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 shrink-0"
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filter
          </Button>

          {showFilters && (
            <>
              <Input
                type="number"
                placeholder="Min ₺"
                className="w-24 h-8"
                min={0}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max ₺"
                className="w-24 h-8"
                min={0}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </>
          )}

          {hasFilters && (
            <Button variant="ghost" size="sm" className="gap-1 ml-auto" onClick={clearAll}>
              <X className="h-3.5 w-3.5" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400">
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/10" />
        <div className="absolute right-24 bottom-0 h-40 w-40 rounded-full bg-orange-600/30" />
        <div className="absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-orange-300/30" />

        <div className="relative container mx-auto px-4 py-10 flex items-center justify-between">
          <div className="max-w-lg">
            <p className="text-orange-100 text-sm font-medium mb-2 tracking-wide uppercase">This Week's Deals</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-3">
              The Best Offers<br />Await You
            </h2>
            <p className="text-orange-100 text-sm mb-6 leading-relaxed">
              Discover special discounts on hundreds of products and this week's best deals.
            </p>
            <button
              onClick={() => { setCategory(''); setExpandedSub(null); }}
              className="inline-flex items-center gap-2 bg-white text-orange-600 font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-orange-50 transition-colors shadow-md"
            >
              Explore All →
            </button>
          </div>
          <div className="hidden lg:flex items-end gap-3 opacity-30 pb-2">
            <div className="h-20 w-20 rounded-2xl bg-white/40 rotate-12" />
            <div className="h-28 w-28 rounded-2xl bg-white/30 -rotate-6" />
            <div className="h-16 w-16 rounded-2xl bg-white/50 rotate-3" />
          </div>
        </div>
      </div>

      {/* Product listing */}
      <div className="container mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center gap-3">
          {activeMain ? (
            <span className="font-semibold">
              {activeMain.emoji} {category !== activeMain.id ? category : activeMain.label}
            </span>
          ) : urlQuery ? (
            <span className="font-semibold">Results for "{urlQuery}"</span>
          ) : (
            <span className="font-semibold">All Products</span>
          )}
          {data && (
            <span className="text-sm text-muted-foreground">{data.totalElements} products</span>
          )}
        </div>

        {isLoading ? (
          <ProductGridSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
            <p className="text-lg font-medium">Error loading products</p>
            <p className="text-sm">Please refresh the page and try again</p>
          </div>
        ) : (
          <>
            <ProductGrid products={data?.content ?? []} onAddToCart={handleAddToCart} />
            <Pagination
              currentPage={page}
              totalPages={data?.totalPages ?? 0}
              onPageChange={setPage}
              disabled={isPlaceholderData}
            />
          </>
        )}
      </div>
    </div>
  );
};
