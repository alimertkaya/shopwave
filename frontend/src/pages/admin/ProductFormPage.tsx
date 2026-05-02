import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ImageUpload } from '@/shared/components/ImageUpload';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { formatPrice } from '@/shared/utils/formatPrice';
import { CATEGORY_CONFIG } from '@/features/products/types/product.types';
import { useProduct } from '@/features/products/hooks/useProducts';
import { productSchema, type ProductFormValues } from '@/features/admin/schemas/productSchema';
import { useCreateProduct, useUpdateProduct } from '@/features/admin/hooks/useAdminProduct';

export const ProductFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { data: existing, isLoading } = useProduct(id ?? '');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({ resolver: zodResolver(productSchema) });

  const selectedCategory = watch('category') ?? '';

  const activeMain = CATEGORY_CONFIG.find(
    (c) => c.id === selectedCategory || c.sub.includes(selectedCategory)
  );
  const [mainCategory, setMainCategory] = useState<string>('');

  useEffect(() => {
    if (existing) {
      const main = CATEGORY_CONFIG.find(
        (c) => c.id === existing.category || c.sub.includes(existing.category)
      );
      setMainCategory(main?.id ?? existing.category);
      reset({
        name:        existing.name,
        description: existing.description,
        price:       existing.price,
        category:    existing.category,
        imageUrl:    existing.imageUrl ?? '',
      });
    }
  }, [existing, reset]);

  const handleMainChange = (val: string | null) => {
    if (!val) return;
    setMainCategory(val);
    setValue('category', val as ProductFormValues['category'], { shouldValidate: true });
  };

  const handleSubChange = (val: string | null) => {
    if (!val) return;
    setValue('category', val as ProductFormValues['category'], { shouldValidate: true });
  };

  const mainConfig = CATEGORY_CONFIG.find((c) => c.id === mainCategory);
  const hasSubs = (mainConfig?.sub.length ?? 0) > 0;
  const subValue = hasSubs && selectedCategory !== mainCategory && activeMain?.id === mainCategory
    ? selectedCategory
    : '';

  const { mutate: create, isPending: isCreating } = useCreateProduct();
  const { mutate: update, isPending: isUpdating } = useUpdateProduct(id ?? '');
  const isPending = isCreating || isUpdating;

  const onSubmit = (values: ProductFormValues) => {
    isEdit ? update(values) : create(values);
  };

  const previewUrl = watch('imageUrl');
  const previewPrice = watch('price');

  if (isEdit && isLoading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/products')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} {...register('description')} />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                className="w-48"
                {...register('price', { valueAsNumber: true })}
              />
              {previewPrice > 0 && (
                <p className="text-xs text-muted-foreground">{formatPrice(previewPrice)}</p>
              )}
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="grid grid-cols-2 gap-4">
              {/* Main Category */}
              <div className="space-y-1.5">
                <Label>Main Category</Label>
                <Select value={mainCategory} onValueChange={handleMainChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select">
                      {mainCategory
                        ? `${CATEGORY_CONFIG.find((c) => c.id === mainCategory)?.emoji} ${mainCategory}`
                        : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_CONFIG.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subcategory */}
              {hasSubs && (
                <div className="space-y-1.5">
                  <Label>Subcategory <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Select value={subValue} onValueChange={handleSubChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory">
                        {subValue || null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {mainConfig?.sub.map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {errors.category && (
              <p className="text-xs text-destructive">{errors.category.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Image */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Product Image</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              value={previewUrl || undefined}
              onChange={(base64) => setValue('imageUrl', base64 ?? '')}
            />
            {errors.imageUrl && (
              <p className="text-xs text-destructive mt-2">{errors.imageUrl.message}</p>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending
              ? isEdit
                ? 'Saving...'
                : 'Creating...'
              : isEdit
                ? 'Save Changes'
                : 'Create Product'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/products')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
