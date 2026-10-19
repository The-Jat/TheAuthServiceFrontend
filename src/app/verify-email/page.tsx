import type { Metadata } from 'next';
import { AuthHeading, AuthShell } from '@/components/auth-shell';
import type { SearchParams } from '@/lib/server';
import { first, safeReturnTo } from '@/lib/util';
import { ConsumeToken, Pending } from './verify';

export const metadata: Metadata = { title: 'Verify email' };

export default async function VerifyEmailPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const token = first(sp.token);
  const returnTo = safeReturnTo(sp.return_to);
  return (
    <AuthShell>
      {token ? (
        <>
          <AuthHeading eyebrow="Verify email" title="Confirming" accent="it’s you." />
          <ConsumeToken token={token} returnTo={returnTo} />
        </>
      ) : (
        <>
          <AuthHeading eyebrow="Verify email" title="Check your" accent="inbox." sub="We sent you a link to confirm your email address." />
          <Pending returnTo={returnTo} />
        </>
      )}
    </AuthShell>
  );
}
