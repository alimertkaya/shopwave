import { z } from 'zod';
import { PRODUCT_CATEGORIES } from '@/features/products/types/product.types';

export const productSchema = z.object({
  name:        z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price:       z.number({ error: 'Please enter a valid price' }).positive('Price must be greater than 0'),
  category:    z.enum([...PRODUCT_CATEGORIES] as [string, ...string[]]),
  imageUrl:    z.string().optional().or(z.literal('')),
});

export type ProductFormValues = z.infer<typeof productSchema>;
