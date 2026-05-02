import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useEffect, useState } from 'react';
import { CATEGORY_CONFIG } from '../types/product.types';
import { cn } from '@/shared/utils/cn';

interface FilterState {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
}

interface Props {
  onFilterChange: (filters: Partial<{ search: string; category: string; minPrice: number; maxPrice: number }>) => void;
}

const EMPTY: FilterState = { search: '', category: '', minPrice: '', maxPrice: '' };

export const ProductFilters = ({ onFilterChange }: Props) => {
  const [local, setLocal] = useState<FilterState>(EMPTY);
  const [expandedMain, setExpandedMain] = useState<string | null>(null);
  const debouncedSearch = useDebounce(local.search, 400);
  const debouncedMin = useDebounce(local.minPrice, 400);
  const debouncedMax = useDebounce(local.maxPrice, 400);

  useEffect(() => {
    onFilterChange({
      search: debouncedSearch || undefined,
      category: local.category || undefined,
      minPrice: debouncedMin ? Number(debouncedMin) : undefined,
      maxPrice: debouncedMax ? Number(debouncedMax) : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, local.category, debouncedMin, debouncedMax]);

  const hasFilters = Object.values(local).some(Boolean);

  const reset = () => {
    setLocal(EMPTY);
    setExpandedMain(null);
    onFilterChange({});
  };

  const selectCategory = (cat: string) => {
    const next = local.category === cat ? '' : cat;
    setLocal((p) => ({ ...p, category: next }));
    if (next === '') setExpandedMain(null);
  };

  const activeConfig = CATEGORY_CONFIG.find(
    (c) => c.id === local.category || c.sub.includes(local.category)
  );

  return (
    <div className="space-y-4">
      {/* Arama + Fiyat */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search products..."
            className="pl-9"
            value={local.search}
            onChange={(e) => setLocal((p) => ({ ...p, search: e.target.value }))}
          />
        </div>
        <Input
          type="number"
          placeholder="Min ₺"
          className="w-28"
          min={0}
          value={local.minPrice}
          onChange={(e) => setLocal((p) => ({ ...p, minPrice: e.target.value }))}
        />
        <Input
          type="number"
          placeholder="Max ₺"
          className="w-28"
          min={0}
          value={local.maxPrice}
          onChange={(e) => setLocal((p) => ({ ...p, maxPrice: e.target.value }))}
        />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={reset} className="gap-1 shrink-0">
            <X className="h-4 w-4" /> Clear
          </Button>
        )}
      </div>

      {/* Ana kategori kartları */}
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-11 gap-2">
        {CATEGORY_CONFIG.map((cat) => {
          const isActive = local.category === cat.id || cat.sub.includes(local.category);
          const isExpanded = expandedMain === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                if (cat.sub.length > 0) {
                  setExpandedMain(isExpanded ? null : cat.id);
                  if (!isActive) selectCategory(cat.id);
                } else {
                  selectCategory(cat.id);
                  setExpandedMain(null);
                }
              }}
              className={cn(
                'relative flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition-all hover:shadow-sm',
                isActive
                  ? `${cat.color} border-current shadow-sm`
                  : 'bg-background border-border hover:bg-muted/50',
              )}
            >
              <span className="text-2xl leading-none">{cat.emoji}</span>
              <span className="text-[10px] font-medium leading-tight line-clamp-2">{cat.label}</span>
              {cat.sub.length > 0 && (
                <span className="absolute top-1 right-1 text-muted-foreground">
                  {isExpanded ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Seçili kategorinin alt kategorileri */}
      {expandedMain && (
        <div className="flex flex-wrap gap-2 px-1">
          {CATEGORY_CONFIG.find((c) => c.id === expandedMain)?.sub.map((sub) => (
            <Badge
              key={sub}
              variant="outline"
              className={cn(
                'cursor-pointer px-3 py-1 text-xs transition-colors hover:bg-muted',
                local.category === sub && activeConfig
                  ? `${activeConfig.color} border-current`
                  : '',
              )}
              onClick={() => selectCategory(sub)}
            >
              {sub}
            </Badge>
          ))}
        </div>
      )}

      {/* Seçili filtre etiketi */}
      {local.category && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Category:</span>
          <Badge
            variant="outline"
            className={cn('gap-1', activeConfig?.color)}
          >
            {activeConfig?.emoji} {local.category}
            <button onClick={() => { setLocal((p) => ({ ...p, category: '' })); setExpandedMain(null); }}>
              <X className="h-3 w-3 ml-0.5" />
            </button>
          </Badge>
        </div>
      )}
    </div>
  );
};
