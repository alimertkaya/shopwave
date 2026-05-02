import api from '@/lib/axios';
import type { Product, ProductFilters } from '../types/product.types';

export const productApi = {
  getAll: (filters: ProductFilters) =>
    api.get<Product[]>('/api/products').then((r) => {
      const { search, category, minPrice, maxPrice, page = 0, size = 12 } = filters;
      let data = r.data;

      if (search) {
        const q = search.toLowerCase();
        data = data.filter(
          (p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q),
        );
      }
      if (category) data = data.filter((p) => p.category === category);
      if (minPrice !== undefined) data = data.filter((p) => p.price >= minPrice);
      if (maxPrice !== undefined) data = data.filter((p) => p.price <= maxPrice);

      const totalElements = data.length;
      const totalPages = Math.max(1, Math.ceil(totalElements / size));
      const content = data.slice(page * size, (page + 1) * size);

      return { content, totalElements, totalPages, number: page, size, first: page === 0, last: page >= totalPages - 1 };
    }),

  getById: (id: string) =>
    api.get<Product>(`/api/products/${id}`).then((r) => r.data),

  create: (data: Omit<Product, 'id'>) =>
    api.post<Product>('/api/products', data).then((r) => r.data),

  update: (id: string, data: Partial<Omit<Product, 'id'>>) =>
    api.put<Product>(`/api/products/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/api/products/${id}`),

  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await api.post<{ url: string }>('/products/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.url;
  },
};
