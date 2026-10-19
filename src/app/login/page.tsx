import type { Metadata } from 'next';
import { AuthHeading, AuthShell } from '@/components/auth-shell';
import { getPublicConfig, type SearchParams } from '@/lib/server';
import { first, safeReturnTo } from '@/lib/util';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Sign in' };

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const returnTo = safeReturnTo(sp.return_to);
  const cfg = await getPublicConfig();
  const fromApp = returnTo.startsWith('/api/oauth/authorize');
  return (
    <AuthShell>
      <AuthHeading
        eyebrow="Sign in"
        title="Welcome"
        accent="back."
        sub={fromApp ? 'Sign in to continue to the app that sent you here.' : 'Sign in to manage your account, security and connected apps.'}
      />
      <LoginForm returnTo={returnTo} allowSignup={cfg.allowSignup} initialError={first(sp.error)} />
    </AuthShell>
  );
}
