import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthHeading, AuthShell } from '@/components/auth-shell';
import type { SearchParams } from '@/lib/server';
import { first } from '@/lib/util';
import { ResetForm } from './reset-form';

export const metadata: Metadata = { title: 'Reset password' };

export default async function ResetPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  const token = first((await searchParams).token);
  return (
    <AuthShell>
      <AuthHeading eyebrow="Account recovery" title="Choose a" accent="new password." sub="You’ll be signed out of every other device." />
      {token ? (
        <ResetForm token={token} />
      ) : (
        <Link className="btn btn-lg btn-block" href="/forgot-password">
          Request a reset link
        </Link>
      )}
    </AuthShell>
  );
}
