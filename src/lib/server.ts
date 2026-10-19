import 'server-only';
import type { PublicConfig } from './api';

/** Where server components reach the API: the internal container URL in Docker, or localhost in dev. */
const INTERNAL_API = (process.env.AUTH_API_INTERNAL_URL || 'http://localhost:4000').replace(/\/+$/, '');

export async function getPublicConfig(): Promise<PublicConfig> {
  try {
    const res = await fetch(`${INTERNAL_API}/api/auth/config`, { next: { revalidate: 60 } });
    if (res.ok) return res.json();
  } catch {}
  return { brandName: 'TheJat Accounts', allowSignup: true, requireVerifiedEmail: true };
}

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;
