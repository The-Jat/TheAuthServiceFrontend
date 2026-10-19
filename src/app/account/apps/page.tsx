'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHead } from '@/components/app-shell';
import { Empty } from '@/components/ui';
import { timeAgo } from '@/lib/util';

interface ConnectedApp {
  id: string;
  name: string;
  homepageUrl: string | null;
  logoUrl: string | null;
  scopes: string[];
  grantedAt: string | null;
}

const SCOPE_LABEL: Record<string, string> = { openid: 'Identity', profile: 'Name', email: 'Email', offline_access: 'Stay signed in' };

export default function ConnectedAppsPage() {
  const [items, setItems] = useState<ConnectedApp[] | null>(null);
  const load = useCallback(() => api<ConnectedApp[]>('/account/apps').then(setItems).catch(() => setItems([])), []);
  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <PageHead eyebrow="Connected apps" title="Apps using" accent="your account." />
      <section className="panel">
        {items === null ? (
          <div className="panel-body">
            <div className="skeleton" style={{ height: '3rem' }} />
          </div>
        ) : items.length === 0 ? (
          <Empty title="Nothing connected yet.">When you sign in to an app with this account, it shows up here.</Empty>
        ) : (
          <ul className="list">
            {items.map((a) => (
              <li key={a.id}>
                {a.logoUrl ? <img className="app-logo" src={a.logoUrl} alt="" /> : <span className="app-logo">{a.name.slice(0, 1)}</span>}
                <div className="grow">
                  <strong>{a.name}</strong>
                  <div className="row" style={{ ['--gap' as string]: '.35rem', marginTop: '.35rem' }}>
                    {a.scopes.map((s) => (
                      <span key={s} className="badge plain">
                        {SCOPE_LABEL[s] ?? s}
                      </span>
                    ))}
                    <span className="hud faint">· connected {timeAgo(a.grantedAt)}</span>
                  </div>
                </div>
                {a.homepageUrl && (
                  <a className="btn btn-sm" href={a.homepageUrl} target="_blank" rel="noreferrer">
                    Open
                  </a>
                )}
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={async () => {
                    if (!window.confirm(`Disconnect ${a.name}? It will be signed out and must ask for access again.`)) return;
                    await api(`/account/apps/${a.id}`, { method: 'DELETE' });
                    load();
                  }}
                >
                  Disconnect
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
