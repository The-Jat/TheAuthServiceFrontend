'use client';

import { useCallback, useEffect, useState } from 'react';
import { browserSupportsWebAuthn, startRegistration } from '@simplewebauthn/browser';
import { api, ApiError } from '@/lib/api';
import { PageHead, useMe } from '@/components/app-shell';
import { Alert, Empty, PasswordField } from '@/components/ui';
import { IconFingerprint } from '@/components/icons';
import { describeDevice, timeAgo } from '@/lib/util';

interface Passkey {
  id: string;
  name: string;
  deviceType: string | null;
  backedUp: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}
interface Session {
  id: string;
  ip: string | null;
  userAgent: string | null;
  authMethod: string;
  createdAt: string;
  lastUsedAt: string;
  current: boolean;
}

export default function SecurityPage() {
  return (
    <>
      <PageHead eyebrow="Security" title="Keep it" accent="yours." />
      <PasswordPanel />
      <PasskeysPanel />
      <SessionsPanel />
    </>
  );
}

function PasswordPanel() {
  const { me, refresh } = useMe();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await api('/account/password', { body: { currentPassword: current || undefined, newPassword: next } });
      setCurrent('');
      setNext('');
      setMsg({ kind: 'success', text: 'Password updated. Other devices were signed out.' });
      await refresh();
    } catch (err) {
      setMsg({ kind: 'error', text: err instanceof ApiError ? err.message : 'Could not update the password.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>{me.hasPassword ? 'Change password' : 'Set a password'}</h2>
        <span className="hud faint">Argon2id · never stored in plain text</span>
      </div>
      <form className="panel-body stack" style={{ maxWidth: '32rem' }} onSubmit={submit}>
        {msg && <Alert kind={msg.kind}>{msg.text}</Alert>}
        {me.hasPassword && <PasswordField label="Current password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} />}
        <PasswordField label="New password" autoComplete="new-password" required minLength={10} showMeter value={next} onChange={(e) => setNext(e.target.value)} />
        <div>
          <button className="btn btn-primary" type="submit" disabled={busy || next.length < 10}>
            {busy ? <span className="spinner" /> : me.hasPassword ? 'Update password' : 'Set password'}
          </button>
        </div>
      </form>
    </section>
  );
}

function PasskeysPanel() {
  const { refresh } = useMe();
  const [items, setItems] = useState<Passkey[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [supported, setSupported] = useState(true);

  const load = useCallback(() => api<Passkey[]>('/account/passkeys').then(setItems).catch(() => setItems([])), []);
  useEffect(() => {
    setSupported(browserSupportsWebAuthn());
    load();
  }, [load]);

  async function add() {
    setBusy(true);
    setError('');
    try {
      const optionsJSON = await api('/account/passkeys/options', { body: {} });
      const response = await startRegistration({ optionsJSON });
      setItems(await api<Passkey[]>('/account/passkeys', { body: { response } }));
      await refresh();
    } catch (err: any) {
      if (err?.name === 'InvalidStateError') setError('This device already has a passkey for your account.');
      else if (err?.name !== 'NotAllowedError') setError(err instanceof ApiError ? err.message : 'Could not add the passkey.');
    } finally {
      setBusy(false);
    }
  }

  async function rename(p: Passkey) {
    const name = window.prompt('Name this passkey', p.name);
    if (!name || name === p.name) return;
    setItems(await api<Passkey[]>(`/account/passkeys/${p.id}`, { method: 'PATCH', body: { name } }));
  }

  async function remove(p: Passkey) {
    if (!window.confirm(`Remove “${p.name}”? You won’t be able to sign in with it anymore.`)) return;
    try {
      setItems(await api<Passkey[]>(`/account/passkeys/${p.id}`, { method: 'DELETE' }));
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not remove it.');
    }
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Passkeys</h2>
        <button type="button" className="btn btn-sm btn-primary" onClick={add} disabled={busy || !supported}>
          {busy ? <span className="spinner" /> : <IconFingerprint />} Add a passkey
        </button>
      </div>
      {error && (
        <div className="panel-body" style={{ paddingBottom: 0 }}>
          <Alert>{error}</Alert>
        </div>
      )}
      {!supported && (
        <div className="panel-body" style={{ paddingBottom: 0 }}>
          <Alert kind="info">This browser doesn’t support passkeys.</Alert>
        </div>
      )}
      {items === null ? (
        <div className="panel-body">
          <div className="skeleton" style={{ height: '3rem' }} />
        </div>
      ) : items.length === 0 ? (
        <Empty title="No passkeys yet.">Sign in with your fingerprint, face or device PIN instead of a password. They can’t be phished.</Empty>
      ) : (
        <ul className="list">
          {items.map((p) => (
            <li key={p.id}>
              <span className="avatar">
                <IconFingerprint />
              </span>
              <div className="grow">
                <strong>{p.name}</strong>
                <div className="hud faint">
                  {p.backedUp ? 'Synced' : 'This device only'} · added {timeAgo(p.createdAt)} · {p.lastUsedAt ? `used ${timeAgo(p.lastUsedAt)}` : 'never used'}
                </div>
              </div>
              <button type="button" className="btn btn-sm" onClick={() => rename(p)}>
                Rename
              </button>
              <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(p)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SessionsPanel() {
  const [items, setItems] = useState<Session[] | null>(null);
  const load = useCallback(() => api<Session[]>('/account/sessions').then(setItems).catch(() => setItems([])), []);
  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Where you’re signed in</h2>
        {items && items.length > 1 && (
          <button
            type="button"
            className="btn btn-sm"
            onClick={async () => {
              await api('/account/sessions/revoke-others', { body: {} });
              load();
            }}
          >
            Sign out other devices
          </button>
        )}
      </div>
      {items === null ? (
        <div className="panel-body">
          <div className="skeleton" style={{ height: '3rem' }} />
        </div>
      ) : (
        <ul className="list">
          {items.map((s) => (
            <li key={s.id}>
              <div className="grow">
                <strong>{describeDevice(s.userAgent)}</strong> {s.current && <span className="badge ok">This device</span>}
                <div className="hud faint">
                  {s.ip ?? 'unknown IP'} · {s.authMethod} · active {timeAgo(s.lastUsedAt)} · since {timeAgo(s.createdAt)}
                </div>
              </div>
              {!s.current && (
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={async () => {
                    await api(`/account/sessions/${s.id}`, { method: 'DELETE' });
                    load();
                  }}
                >
                  Sign out
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
