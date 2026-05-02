import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuthStore } from '@/features/auth/store/authStore';

const ProtectedContent = () => <div>Korunan İçerik</div>;
const LoginPage = () => <div>Login Sayfası</div>;

const renderWithRouter = (initialPath = '/orders') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <ProtectedContent />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isAdmin: false,
      isInitializing: false,
    });
  });

  test('whenNotAuthenticated_thenRedirectsToLogin', () => {
    renderWithRouter();
    expect(screen.getByText('Login Sayfası')).toBeInTheDocument();
    expect(screen.queryByText('Korunan İçerik')).not.toBeInTheDocument();
  });

  test('whenAuthenticated_thenRendersChildren', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: '1', email: 'a@b.com', firstName: 'Ali', lastName: 'Mert', role: 'CUSTOMER' },
      accessToken: 'mock-token',
    });

    renderWithRouter();
    expect(screen.getByText('Korunan İçerik')).toBeInTheDocument();
    expect(screen.queryByText('Login Sayfası')).not.toBeInTheDocument();
  });
});
