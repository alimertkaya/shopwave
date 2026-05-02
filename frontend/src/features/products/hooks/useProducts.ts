import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productApi } from '../api/productApi';
import type { Product, ProductFilters } from '../types/product.types';

export const useProducts = (filters: ProductFilters) =>
  useQuery({
    queryKey: ['products', filters],
    queryFn: () => productApi.getAll(filters),
    placeholderData: keepPreviousData,
  });

export const useProduct = (id: string) =>
  useQuery({
    queryKey: ['products', id],
    queryFn: () => productApi.getById(id),
    enabled: !!id,
  });

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Product, 'id'>) => productApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created');
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Product, 'id'>> }) =>
      productApi.update(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', id] });
      toast.success('Product updated');
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted');
    },
  });
};
