import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthHeading, AuthShell } from '@/components/auth-shell';
import type { SearchParams } from '@/lib/server';
import { first } from '@/lib/util';

export const metadata: Metadata = { title: 'Something went wrong' };

export default async function ErrorPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const code = first(sp.error) ?? 'error';
  const message = first(sp.error_description) ?? 'The request could not be completed.';
  return (
    <AuthShell>
      <AuthHeading eyebrow={`Error · ${code.replace(/[^a-z_]/gi, '').slice(0, 40)}`} title="We couldn’t" accent="sign you in." />
      <div className="stack">
        <div className="alert alert-error">{message.slice(0, 300)}</div>
        <p className="muted" style={{ fontSize: '.9rem' }}>
          If you followed a link from an app, go back and try again. If it keeps happening, the app may be misconfigured. Contact its owner.
        </p>
        <Link className="btn btn-lg btn-block" href="/">
          Go to {`accounts home`}
        </Link>
      </div>
    </AuthShell>
  );
}
