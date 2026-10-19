import type { Metadata } from 'next';
import { AuthHeading, AuthShell } from '@/components/auth-shell';
import type { SearchParams } from '@/lib/server';
import { Consent } from './consent';

export const metadata: Metadata = { title: 'Allow access' };

const KEYS = ['response_type', 'client_id', 'redirect_uri', 'scope', 'state', 'code_challenge', 'code_challenge_method', 'nonce'];

export default async function ConsentPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const params: Record<string, string> = {};
  for (const k of KEYS) {
    const v = sp[k];
    if (typeof v === 'string') params[k] = v;
  }
  return (
    <AuthShell>
      <AuthHeading eyebrow="Allow access" title="Connect" accent="an app." />
      <Consent params={params} />
    </AuthShell>
  );
}
