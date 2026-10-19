import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthHeading, AuthShell } from '@/components/auth-shell';
import { getPublicConfig, type SearchParams } from '@/lib/server';
import { safeReturnTo } from '@/lib/util';
import { SignupForm } from './signup-form';

export const metadata: Metadata = { title: 'Create account' };

export default async function SignupPage({ searchParams }: { searchParams: SearchParams }) {
  const returnTo = safeReturnTo((await searchParams).return_to);
  const cfg = await getPublicConfig();
  return (
    <AuthShell>
      <AuthHeading eyebrow="Create account" title="One account," accent="every app." sub="It takes a minute. You’ll confirm your email next." />
      {cfg.allowSignup ? (
        <SignupForm returnTo={returnTo} />
      ) : (
        <div className="stack">
          <div className="alert alert-info">New sign-ups are closed right now.</div>
          <Link className="btn btn-lg btn-block" href="/login">
            Back to sign in
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
