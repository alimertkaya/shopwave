import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/adminApi';
import type { ProductFormValues } from '../schemas/productSchema';

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (values: ProductFormValues) => adminApi.createProduct(values as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created');
      navigate('/admin/products');
    },
    onError: () => toast.error('Failed to create product'),
  });
};

export const useUpdateProduct = (id: string) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (values: ProductFormValues) => adminApi.updateProduct(id, values as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated');
      navigate('/admin/products');
    },
    onError: () => toast.error('Failed to update product'),
  });
};
