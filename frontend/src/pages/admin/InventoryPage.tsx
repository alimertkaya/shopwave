import { useState, useMemo } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { cn } from '@/shared/utils/cn';
import { CATEGORY_CONFIG } from '@/features/products/types/product.types';
import { useAdminInventory, useUpdateStock, useSetStock } from '@/features/admin/hooks/useAdmin';
import { productApi } from '@/features/products/api/productApi';

const LOW_STOCK_THRESHOLD = 10;

interface EditTarget {
  productId: string;
  productName: string;
  currentQty: number;
  isNew: boolean;
}

export const InventoryPage = () => {
  const [search, setSearch] = useState('');
  const [mainCat, setMainCat] = useState('');
  const [category, setCategory] = useState('');
  const [editing, setEditing] = useState<EditTarget | null>(null);

  const mainConfig = CATEGORY_CONFIG.find((c) => c.id === mainCat);
  const hasSubs = (mainConfig?.sub.length ?? 0) > 0;

  const handleMainCat = (v: string | null) => {
    const val = !v || v === '__all__' ? '' : v;
    setMainCat(val);
    setCategory(val);
  };

  const handleSubCat = (v: string | null) => {
    setCategory(!v || v === '__all__' ? mainCat : v);
  };

  const clearFilters = () => { setSearch(''); setMainCat(''); setCategory(''); };
  const [newQty, setNewQty] = useState('');
  const [mode, setMode] = useState<'add' | 'set'>('add');

  const { data: inventoryData, isLoading: invLoading } = useAdminInventory({ page: 0, size: 1000 });
  const { data: productsPage, isLoading: prodLoading } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => productApi.getAll({ page: 0, size: 1000 }),
  });
  const { mutate: updateStock, isPending: addPending } = useUpdateStock();
  const { mutate: setStock, isPending: setPending } = useSetStock();
  const isPending = addPending || setPending;

  const inventoryMap = useMemo(() => {
    const map = new Map<string, number>();
    inventoryData?.content.forEach((inv) => map.set(inv.productId, inv.quantity));
    return map;
  }, [inventoryData]);

  const rows = useMemo(() => {
    let all = productsPage?.content ?? [];
    if (search) all = all.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (category) all = all.filter((p) => p.category === category);
    return all.map((p) => ({
      productId: p.id,
      productName: p.name,
      quantity: inventoryMap.get(p.id) ?? null,
    }));
  }, [productsPage, inventoryMap, search, category]);

  const isLoading = invLoading || prodLoading;

  const openEdit = (productId: string, productName: string, quantity: number | null) => {
    setEditing({
      productId,
      productName,
      currentQty: quantity ?? 0,
      isNew: quantity === null,
    });
    setNewQty('');
    setMode('add');
  };

  const handleSave = () => {
    if (!editing) return;
    const qty = parseInt(newQty, 10);
    if (isNaN(qty) || qty < 0) return;
    const onSuccess = () => setEditing(null);
    if (mode === 'set') {
      setStock({ productId: editing.productId, quantity: qty }, { onSuccess });
    } else {
      updateStock({ productId: editing.productId, quantity: qty }, { onSuccess });
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Inventory Management</h1>

      <div className="flex items-center gap-3 flex-wrap">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />

        <Select value={mainCat || '__all__'} onValueChange={handleMainCat}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories">
              {mainCat
                ? `${mainConfig?.emoji ?? ''} ${mainConfig?.label ?? mainCat}`
                : 'All Categories'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Categories</SelectItem>
            {CATEGORY_CONFIG.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.emoji} {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasSubs && (
          <Select value={category !== mainCat ? category : '__all__'} onValueChange={handleSubCat}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Subcategories">
                {category !== mainCat ? category : 'All Subcategories'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Subcategories</SelectItem>
              {mainConfig?.sub.map((sub) => (
                <SelectItem key={sub} value={sub}>{sub}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {(search || mainCat) && (
          <Button variant="ghost" size="sm" className="gap-1" onClick={clearFilters}>
            <X className="h-4 w-4" /> Clear
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const hasInventory = row.quantity !== null;
                  const isLow = hasInventory && row.quantity! <= LOW_STOCK_THRESHOLD;
                  return (
                    <TableRow
                      key={row.productId}
                      className={cn(isLow && 'bg-destructive/5')}
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{row.productName}</span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {row.productId.slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {hasInventory ? (
                          <span className={cn(
                            'font-medium',
                            row.quantity === 0 ? 'text-destructive' : isLow ? 'text-amber-600' : ''
                          )}>
                            {row.quantity}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">No record</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(row.productId, row.productName, row.quantity)}
                        >
                          {hasInventory ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing?.isNew ? 'Add Stock' : 'Update Stock'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm font-medium">{editing?.productName}</p>
            <p className="text-xs text-muted-foreground">Current stock: <span className="font-semibold">{editing?.currentQty}</span></p>
            {!editing?.isNew && (
              <div className="flex rounded-md border overflow-hidden text-sm">
                <button
                  className={`flex-1 py-1.5 transition-colors ${mode === 'add' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  onClick={() => setMode('add')}
                >Add</button>
                <button
                  className={`flex-1 py-1.5 transition-colors ${mode === 'set' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  onClick={() => setMode('set')}
                >Set</button>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="qty">
                {editing?.isNew ? 'Initial Stock Quantity' : mode === 'add' ? 'Quantity to Add' : 'New Stock Quantity'}
              </Label>
              <Input
                id="qty"
                type="number"
                min="0"
                value={newQty}
                onChange={(e) => setNewQty(e.target.value)}
                placeholder={mode === 'add' ? 'How many to add?' : 'Set stock to?'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
