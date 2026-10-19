'use client';

import { useEffect, useState } from 'react';
import { api, ApiError, type Me } from '@/lib/api';
import { Alert } from '@/components/ui';

interface ConsentInfo {
  client: { name: string; description: string | null; homepageUrl: string | null; logoUrl: string | null };
  scopes: { scope: string; description: string }[];
}

export function Consent({ params }: { params: Record<string, string> }) {
  const [info, setInfo] = useState<ConsentInfo | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<'allow' | 'deny' | null>(null);
  const qs = new URLSearchParams(params).toString();

  useEffect(() => {
    Promise.all([api<ConsentInfo>(`/oauth/consent?${qs}`), api<Me>('/auth/me')])
      .then(([i, m]) => {
        setInfo(i);
        setMe(m);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          window.location.assign(`/login?return_to=${encodeURIComponent(`/api/oauth/authorize?${qs}`)}`);
          return;
        }
        setError(err instanceof ApiError ? err.message : 'This request could not be loaded.');
      });
  }, [qs]);

  async function decide(approve: boolean) {
    setBusy(approve ? 'allow' : 'deny');
    try {
      const { redirectTo } = await api<{ redirectTo: string }>('/oauth/consent', { body: { ...params, approve } });
      window.location.assign(redirectTo);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
      setBusy(null);
    }
  }

  if (error) return <Alert>{error}</Alert>;
  if (!info || !me) return <p className="muted row"><span className="spinner" /> Loading…</p>;

  const host = info.client.homepageUrl ? new URL(info.client.homepageUrl).host : null;
  return (
    <div className="stack">
      <div className="app-chip">
        {info.client.logoUrl ? <img className="app-logo" src={info.client.logoUrl} alt="" /> : <span className="app-logo">{info.client.name.slice(0, 1)}</span>}
        <div style={{ minWidth: 0 }}>
          <strong className="truncate" style={{ display: 'block' }}>
            {info.client.name}
          </strong>
          {host && <span className="hud faint">{host}</span>}
        </div>
      </div>
      <p className="muted" style={{ fontSize: '.9375rem' }}>
        <strong style={{ color: 'var(--ink)' }}>{info.client.name}</strong> wants to use your {me.user.email} account to:
      </p>
      <ul className="scope-list">
        {info.scopes.map((s) => (
          <li key={s.scope}>{s.description}</li>
        ))}
      </ul>
      <div className="row" style={{ ['--gap' as string]: '.5rem', flexWrap: 'nowrap' }}>
        <button type="button" className="btn btn-lg" style={{ flex: 1 }} onClick={() => decide(false)} disabled={!!busy}>
          {busy === 'deny' ? <span className="spinner" /> : 'Cancel'}
        </button>
        <button type="button" className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => decide(true)} disabled={!!busy}>
          {busy === 'allow' ? <span className="spinner" /> : 'Allow'}
        </button>
      </div>
      <p className="faint" style={{ fontSize: '.8125rem' }}>
        You can disconnect this app anytime from your account’s Connected apps page.
      </p>
    </div>
  );
}
