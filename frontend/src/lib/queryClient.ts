import { QueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/shared/types/api.types';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error: unknown) => {
        const err = error as AxiosError<ApiError>;
        console.error('[API Error]', {
          status:  err.response?.status,
          code:    err.response?.data?.code,
          message: err.response?.data?.message,
          url:     err.config?.url,
          raw:     err,
        });
      },
    },
  },
});
