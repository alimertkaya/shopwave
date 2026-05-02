import type { AxiosError } from 'axios';

export interface ApiError {
  code: string;
  message: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export const getErrorMessage = (error: unknown): string => {
  const err = error as AxiosError<ApiError>;
  return err.response?.data?.message ?? 'An unexpected error occurred';
};
