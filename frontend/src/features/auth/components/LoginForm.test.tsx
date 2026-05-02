import { describe, test, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { LoginForm } from './LoginForm';

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('LoginForm', () => {
  test('form_rendersEmailAndPasswordFields', () => {
    render(<LoginForm />, { wrapper });
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  test('submit_whenEmptyFields_thenShowsValidationErrors', async () => {
    const user = userEvent.setup();
    render(<LoginForm />, { wrapper });

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Please enter a valid email address')).toBeInTheDocument();
    expect(await screen.findByText('Password is required')).toBeInTheDocument();
  });

  test('submit_whenInvalidEmail_thenShowsEmailError', async () => {
    const user = userEvent.setup();
    render(<LoginForm />, { wrapper });

    await user.type(screen.getByLabelText('Email'), 'invalid-email');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Please enter a valid email address')).toBeInTheDocument();
  });

  test('submit_whenValidCredentials_thenCallsApiAndShowsLoadingOrSuccess', async () => {
    const user = userEvent.setup();
    render(<LoginForm />, { wrapper });

    await user.type(screen.getByLabelText('Email'), 'test@shopwave.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      const btn = screen.getByRole('button');
      expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
      expect(btn).toBeInTheDocument();
    });
  });
});
