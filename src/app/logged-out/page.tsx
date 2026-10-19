import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthHeading, AuthShell } from '@/components/auth-shell';
import type { SearchParams } from '@/lib/server';
import { first } from '@/lib/util';

export const metadata: Metadata = { title: 'Signed out' };

export default async function LoggedOutPage({ searchParams }: { searchParams: SearchParams }) {
  const app = first((await searchParams).app)?.slice(0, 80);
  return (
    <AuthShell>
      <AuthHeading eyebrow="Signed out" title="See you" accent="soon." sub={app ? `You’ve been signed out of ${app} and your account.` : 'You’ve been signed out of your account on this device.'} />
      <Link className="btn btn-primary btn-lg btn-block" href="/login">
        Sign in again
      </Link>
    </AuthShell>
  );
}
