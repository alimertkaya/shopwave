import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
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
import { Pagination } from '@/shared/components/Pagination';
import { formatPrice } from '@/shared/utils/formatPrice';
import { CATEGORY_CONFIG } from '@/features/products/types/product.types';
import { useAdminProducts, useDeleteProduct } from '@/features/admin/hooks/useAdmin';

const PAGE_SIZE = 15;

export const AdminProductsPage = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [mainCat, setMainCat] = useState('');
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

  const mainConfig = CATEGORY_CONFIG.find((c) => c.id === mainCat);
  const hasSubs = (mainConfig?.sub.length ?? 0) > 0;

  const handleMainCat = (v: string | null) => {
    const val = !v || v === '__all__' ? '' : v;
    setMainCat(val);
    setCategory(val);
    setPage(0);
  };

  const handleSubCat = (v: string | null) => {
    setCategory(!v || v === '__all__' ? mainCat : v);
    setPage(0);
  };

  const clearFilters = () => { setSearch(''); setMainCat(''); setCategory(''); setPage(0); };

  const { data, isLoading } = useAdminProducts({
    page,
    size: PAGE_SIZE,
    search: search || undefined,
    category: category || undefined,
  });
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  const products = data?.content ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold">Products</h1>
        <Button onClick={() => navigate('/admin/products/new')}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Product
        </Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
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
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-9 w-9 rounded object-cover flex-shrink-0 bg-muted"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded bg-muted flex-shrink-0" />
                          )}
                          <span className="font-medium truncate max-w-xs">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(product.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isDeleting}
                            onClick={() => {
                              if (confirm(`Delete "${product.name}"?`)) {
                                deleteProduct(product.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={data?.totalPages ?? 0}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};
