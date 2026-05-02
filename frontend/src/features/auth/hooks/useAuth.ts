import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { getErrorMessage } from '@/shared/types/api.types';

export const useLogin = () => {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: () => {
      toast.success('Signed in successfully');
      const isAdmin = useAuthStore.getState().isAdmin;
      navigate(isAdmin ? '/admin/dashboard' : '/', { replace: true });
    },
  });
};

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) => {
      const { authApi } = await import('../api/authApi');
      const { useAuthStore: store } = await import('../store/authStore');
      const result = await authApi.register(data);
      store.setState({
        user: result.user,
        accessToken: result.accessToken,
        isAuthenticated: true,
        isAdmin: result.user.role === 'ADMIN',
      });
    },
    onSuccess: () => {
      toast.success('Registration successful, welcome!');
      navigate('/', { replace: true });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};
