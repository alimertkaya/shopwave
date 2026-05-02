import api from '@/lib/axios';

export interface StockInfo {
  productId: string;
  quantity: number;
}

export const inventoryApi = {
  getByProductId: (productId: string) =>
    api.get<StockInfo>(`/api/inventories/${productId}`).then((r) => r.data),
};
