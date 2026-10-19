'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { PageHead } from '@/components/app-shell';
import { Alert, CopyButton, Empty, Field, Modal } from '@/components/ui';
import { timeAgo } from '@/lib/util';

interface App {
  id: string;
  clientId: string;
  name: string;
  description: string | null;
  homepageUrl: string | null;
  logoUrl: string | null;
  redirectUris: string[];
  postLogoutRedirectUris: string[];
  allowedScopes: string[];
  firstParty: boolean;
  confidential: boolean;
  disabled: boolean;
  createdAt: string;
  activeUsers: number;
}

const ALL_SCOPES = ['openid', 'profile', 'email', 'offline_access'];

export default function AppsPage() {
  const [items, setItems] = useState<App[] | null>(null);
  const [editing, setEditing] = useState<App | 'new' | null>(null);
  const [secret, setSecret] = useState<{ app: App; secret: string } | null>(null);
  const [details, setDetails] = useState<App | null>(null);
  const load = useCallback(() => api<App[]>('/admin/apps').then(setItems).catch(() => setItems([])), []);
  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <PageHead eyebrow="Console · Apps" title="Apps that sign in" accent="with us.">
        <button type="button" className="btn btn-primary" onClick={() => setEditing('new')}>
          Register app
        </button>
      </PageHead>
      <section className="panel">
        {items === null ? (
          <div className="panel-body">
            <div className="skeleton" style={{ height: '6rem' }} />
          </div>
        ) : items.length === 0 ? (
          <Empty title="No apps yet.">Register TheShort, the vault, or any app that should use “Sign in with TheJat”.</Empty>
        ) : (
          <ul className="list">
            {items.map((a) => (
              <li key={a.id}>
                {a.logoUrl ? <img className="app-logo" src={a.logoUrl} alt="" /> : <span className="app-logo">{a.name.slice(0, 1)}</span>}
                <div className="grow">
                  <strong>{a.name}</strong>{' '}
                  {a.disabled && <span className="badge err">Disabled</span>} {a.firstParty && <span className="badge info">First-party</span>}{' '}
                  <span className="badge plain">{a.confidential ? 'Confidential' : 'Public (PKCE)'}</span>
                  <div className="hud faint" style={{ marginTop: '.3rem' }}>
                    <span className="mono" style={{ textTransform: 'none', letterSpacing: 0 }}>
                      {a.clientId}
                    </span>{' '}
                    · {a.activeUsers} active users · created {timeAgo(a.createdAt)}
                  </div>
                </div>
                <button type="button" className="btn btn-sm" onClick={() => setDetails(a)}>
                  Integrate
                </button>
                <button type="button" className="btn btn-sm" onClick={() => setEditing(a)}>
                  Edit
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {editing && (
        <AppEditor
          app={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(app, newSecret) => {
            setEditing(null);
            load();
            if (newSecret) setSecret({ app, secret: newSecret });
          }}
        />
      )}
      {secret && (
        <Modal title="Save the client secret" onClose={() => setSecret(null)} footer={<button className="btn btn-primary" onClick={() => setSecret(null)}>I’ve saved it</button>}>
          <Alert kind="warn">This is the only time the secret is shown. Store it in the app’s server-side config; never in browser code.</Alert>
          <span className="label">Client ID</span>
          <div className="secret">
            <code>{secret.app.clientId}</code>
            <CopyButton value={secret.app.clientId} />
          </div>
          <span className="label">Client secret</span>
          <div className="secret">
            <code>{secret.secret}</code>
            <CopyButton value={secret.secret} />
          </div>
        </Modal>
      )}
      {details && <IntegrationModal app={details} onClose={() => setDetails(null)} />}
    </>
  );
}

function AppEditor({ app, onClose, onSaved }: { app: App | null; onClose: () => void; onSaved: (app: App, secret?: string) => void }) {
  const [form, setForm] = useState({
    name: app?.name ?? '',
    description: app?.description ?? '',
    homepageUrl: app?.homepageUrl ?? '',
    logoUrl: app?.logoUrl ?? '',
    redirectUris: (app?.redirectUris ?? []).join('\n'),
    postLogoutRedirectUris: (app?.postLogoutRedirectUris ?? []).join('\n'),
    allowedScopes: app?.allowedScopes ?? ALL_SCOPES,
    firstParty: app?.firstParty ?? true,
    confidential: app?.confidential ?? true,
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const lines = (s: string) => s.split(/\s+/).map((l) => l.trim()).filter(Boolean);

  async function save() {
    setBusy('save');
    setError('');
    const body = {
      name: form.name,
      description: form.description || undefined,
      homepageUrl: form.homepageUrl || undefined,
      logoUrl: form.logoUrl || undefined,
      redirectUris: lines(form.redirectUris),
      postLogoutRedirectUris: lines(form.postLogoutRedirectUris),
      allowedScopes: form.allowedScopes,
      firstParty: form.firstParty,
      ...(app ? {} : { confidential: form.confidential }),
    };
    try {
      if (app) {
        const r = await api<{ app: App }>(`/admin/apps/${app.id}`, { method: 'PATCH', body });
        onSaved(r.app);
      } else {
        const r = await api<{ app: App; clientSecret: string | null }>('/admin/apps', { body });
        onSaved(r.app, r.clientSecret ?? undefined);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save.');
      setBusy('');
    }
  }

  async function action(label: string, path: string, method = 'POST') {
    if (label === 'delete' && !window.confirm(`Delete ${app!.name}? Everyone signed in through it is signed out.`)) return;
    if (label === 'rotate' && !window.confirm('Rotate the secret? The current secret stops working immediately.')) return;
    setBusy(label);
    setError('');
    try {
      const r = await api<{ app?: App; clientSecret?: string }>(path, { method, body: method === 'POST' ? {} : undefined });
      onSaved(r.app ?? app!, r.clientSecret);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Action failed.');
      setBusy('');
    }
  }

  const toggleScope = (s: string) =>
    setForm((f) => ({ ...f, allowedScopes: f.allowedScopes.includes(s) ? f.allowedScopes.filter((x) => x !== s) : [...f.allowedScopes, s] }));

  return (
    <Modal
      title={app ? `Edit ${app.name}` : 'Register an app'}
      onClose={onClose}
      footer={
        <>
          {app && (
            <>
              <button className="btn btn-sm btn-danger" disabled={!!busy} onClick={() => action('delete', `/admin/apps/${app.id}`, 'DELETE')}>
                Delete
              </button>
              <button className="btn btn-sm" disabled={!!busy} onClick={() => action('toggle', `/admin/apps/${app.id}/${app.disabled ? 'enable' : 'disable'}`)}>
                {app.disabled ? 'Enable' : 'Disable'}
              </button>
              {app.confidential && (
                <button className="btn btn-sm" disabled={!!busy} onClick={() => action('rotate', `/admin/apps/${app.id}/rotate-secret`)}>
                  Rotate secret
                </button>
              )}
              <span className="spacer" />
            </>
          )}
          <button className="btn btn-primary" disabled={!!busy} onClick={save}>
            {busy === 'save' ? <span className="spinner" /> : app ? 'Save' : 'Register'}
          </button>
        </>
      }
    >
      <Alert>{error}</Alert>
      <Field label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="TheShort" required />
      <Field label="Homepage URL" value={form.homepageUrl} onChange={(e) => setForm({ ...form, homepageUrl: e.target.value })} placeholder="https://short.thejat.in" />
      <div className="field">
        <label className="label">Redirect URIs</label>
        <textarea className="textarea" rows={3} value={form.redirectUris} onChange={(e) => setForm({ ...form, redirectUris: e.target.value })} placeholder="https://short.thejat.in/user/sso/callback" />
        <span className="hint">One per line, matched exactly. https only (http allowed for localhost).</span>
      </div>
      <div className="field">
        <label className="label">Post-logout redirect URIs</label>
        <textarea className="textarea" rows={2} value={form.postLogoutRedirectUris} onChange={(e) => setForm({ ...form, postLogoutRedirectUris: e.target.value })} placeholder="https://short.thejat.in/" />
      </div>
      <div className="field">
        <span className="label">Allowed scopes</span>
        <div className="row">
          {ALL_SCOPES.map((s) => (
            <label key={s} className="check" style={{ fontSize: '.875rem' }}>
              <input type="checkbox" checked={form.allowedScopes.includes(s)} onChange={() => toggleScope(s)} /> <span className="mono">{s}</span>
            </label>
          ))}
        </div>
      </div>
      <label className="check">
        <input type="checkbox" checked={form.firstParty} onChange={(e) => setForm({ ...form, firstParty: e.target.checked })} />
        <span>
          First-party app <span className="faint">(one of yours: skip the consent screen)</span>
        </span>
      </label>
      {!app && (
        <label className="check">
          <input type="checkbox" checked={form.confidential} onChange={(e) => setForm({ ...form, confidential: e.target.checked })} />
          <span>
            Has a server <span className="faint">(gets a client secret; untick for SPAs and mobile apps, which use PKCE only)</span>
          </span>
        </label>
      )}
    </Modal>
  );
}

function IntegrationModal({ app, onClose }: { app: App; onClose: () => void }) {
  const issuer = `${window.location.origin}/api`;
  const env = `AUTH_ISSUER=${issuer}
AUTH_CLIENT_ID=${app.clientId}
AUTH_CLIENT_SECRET=${app.confidential ? '<the secret shown when you registered or rotated>' : '(none: public client, use PKCE)'}
AUTH_REDIRECT_URI=${app.redirectUris[0] ?? ''}
AUTH_SCOPES=${app.allowedScopes.join(' ')}`;
  return (
    <Modal title={`Integrate ${app.name}`} onClose={onClose}>
      <p className="muted">Any OpenID Connect library can sign users in with these values. PKCE (S256) is required for every app.</p>
      <dl className="kv">
        <dt>Discovery</dt>
        <dd className="mono">{issuer}/.well-known/openid-configuration</dd>
        <dt>Authorize</dt>
        <dd className="mono">{issuer}/oauth/authorize</dd>
        <dt>Token</dt>
        <dd className="mono">{issuer}/oauth/token</dd>
        <dt>Userinfo</dt>
        <dd className="mono">{issuer}/oauth/userinfo</dd>
        <dt>Logout</dt>
        <dd className="mono">{issuer}/oauth/logout</dd>
      </dl>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="label">.env for the app</span>
        <CopyButton value={env} />
      </div>
      <pre className="json">{env}</pre>
    </Modal>
  );
}
