import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  title: string;
  subtitle?: string;
  footerText: string;
  footerLinkLabel: string;
  footerLinkTo: string;
}

export const AuthLayout = ({
  children,
  title,
  subtitle,
  footerText,
  footerLinkLabel,
  footerLinkTo,
}: Props) => (
  <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
    <div className="w-full max-w-md space-y-6">
      {/* Logo */}
      <div className="text-center">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          ShopWave
        </Link>
        <h1 className="mt-4 text-xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>

      {/* Form card */}
      {children}

      {/* Footer link */}
      <p className="text-center text-sm text-muted-foreground">
        {footerText}{' '}
        <Link to={footerLinkTo} className="font-medium text-primary hover:underline">
          {footerLinkLabel}
        </Link>
      </p>
    </div>
  </div>
);
