import React, { type ReactNode } from 'react';
import { Button } from '@/shared/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <h1 className="text-2xl font-bold">An unexpected error occurred</h1>
            <Button onClick={() => this.setState({ hasError: false })}>Try Again</Button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
