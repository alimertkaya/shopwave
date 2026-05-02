import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventoryApi';

export const useStock = (productId: string) =>
  useQuery({
    queryKey: ['inventory', productId],
    queryFn: () => inventoryApi.getByProductId(productId),
    enabled: !!productId,
    staleTime: 1000 * 60
  });
