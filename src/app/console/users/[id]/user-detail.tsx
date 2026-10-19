'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, type PublicUser } from '@/lib/api';
import { PageHead, useMe } from '@/components/app-shell';
import { Alert } from '@/components/ui';
import { describeDevice, formatDate, timeAgo } from '@/lib/util';

interface Detail {
  user: PublicUser;
  locked: boolean;
  sessions: { id: string; ip: string | null; userAgent: string | null; authMethod: string; lastUsedAt: string }[];
  passkeys: { id: string; name: string; createdAt: string }[];
  apps: { id: string; name: string }[];
}

export function UserDetail({ id }: { id: string }) {
  const { me } = useMe();
  const [d, setD] = useState<Detail | null>(null);
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState('');

  const load = useCallback(() => api<Detail>(`/admin/users/${id}`).then(setD), [id]);
  useEffect(() => {
    load().catch((err) => setMsg({ kind: 'error', text: err instanceof ApiError ? err.message : 'Could not load this user.' }));
  }, [load]);

  async function act(label: string, fn: () => Promise<unknown>, success: string) {
    setBusy(label);
    setMsg(null);
    try {
      await fn();
      setMsg({ kind: 'success', text: success });
      await load();
    } catch (err) {
      setMsg({ kind: 'error', text: err instanceof ApiError ? err.message : 'Action failed.' });
    } finally {
      setBusy('');
    }
  }

  if (!d) return msg ? <Alert>{msg.text}</Alert> : <div className="skeleton" style={{ height: '16rem' }} />;
  const u = d.user;
  const self = u.id === me.user.id;

  return (
    <>
      <PageHead eyebrow="Console · User" title={u.name}>
        <Link className="btn btn-sm" href="/console/users">
          ← All users
        </Link>
      </PageHead>
      {msg && (
        <div style={{ marginBottom: '1.5rem' }}>
          <Alert kind={msg.kind}>{msg.text}</Alert>
        </div>
      )}

      <section className="panel">
        <div className="panel-head">
          <h2>Account</h2>
          <div className="row" style={{ ['--gap' as string]: '.35rem' }}>
            {u.status === 'disabled' && <span className="badge err">Disabled</span>}
            {d.locked && <span className="badge warn">Locked</span>}
            <span className={`badge ${u.emailVerified ? 'ok' : 'warn'}`}>{u.emailVerified ? 'Verified' : 'Unverified'}</span>
            {u.role === 'admin' && <span className="badge info">Admin</span>}
          </div>
        </div>
        <div className="panel-body">
          <dl className="kv">
            <dt>Email</dt>
            <dd>{u.email}</dd>
            <dt>User ID</dt>
            <dd className="mono">{u.id}</dd>
            <dt>Joined</dt>
            <dd>{formatDate(u.createdAt)}</dd>
            <dt>Last sign-in</dt>
            <dd>{formatDate(u.lastLoginAt)}</dd>
            <dt>Passkeys</dt>
            <dd>{d.passkeys.length ? d.passkeys.map((p) => p.name).join(', ') : 'None'}</dd>
            <dt>Apps</dt>
            <dd>{d.apps.length ? d.apps.map((a) => a.name).join(', ') : 'None'}</dd>
          </dl>
        </div>
        <div className="panel-foot" style={{ justifyContent: 'flex-start', flexWrap: 'wrap' }}>
          {!u.emailVerified && (
            <button className="btn btn-sm" disabled={!!busy} onClick={() => act('verify', () => api(`/admin/users/${id}/verify-email`, { body: {} }), 'Email marked as verified.')}>
              Mark verified
            </button>
          )}
          {d.locked && (
            <button className="btn btn-sm" disabled={!!busy} onClick={() => act('unlock', () => api(`/admin/users/${id}/unlock`, { body: {} }), 'Account unlocked.')}>
              Unlock
            </button>
          )}
          <button className="btn btn-sm" disabled={!!busy} onClick={() => act('reset', () => api(`/admin/users/${id}/send-reset`, { body: {} }), 'Password reset email sent.')}>
            Send reset link
          </button>
          <button className="btn btn-sm" disabled={!!busy} onClick={() => act('signout', () => api(`/admin/users/${id}/sign-out`, { body: {} }), 'Signed out everywhere.')}>
            Sign out everywhere
          </button>
          {!self && (
            <>
              <button
                className="btn btn-sm"
                disabled={!!busy}
                onClick={() => act('role', () => api(`/admin/users/${id}`, { method: 'PATCH', body: { role: u.role === 'admin' ? 'user' : 'admin' } }), 'Role updated.')}
              >
                {u.role === 'admin' ? 'Remove admin' : 'Make admin'}
              </button>
              <button
                className="btn btn-sm btn-danger"
                disabled={!!busy}
                onClick={() =>
                  act('status', () => api(`/admin/users/${id}`, { method: 'PATCH', body: { status: u.status === 'active' ? 'disabled' : 'active' } }), u.status === 'active' ? 'Account disabled.' : 'Account enabled.')
                }
              >
                {u.status === 'active' ? 'Disable' : 'Enable'}
              </button>
              <button
                className="btn btn-sm btn-danger"
                disabled={!!busy}
                onClick={async () => {
                  if (!window.confirm(`Permanently delete ${u.email}?`)) return;
                  try {
                    await api(`/admin/users/${id}`, { method: 'DELETE' });
                    window.location.assign('/console/users');
                  } catch (err) {
                    setMsg({ kind: 'error', text: err instanceof ApiError ? err.message : 'Delete failed.' });
                  }
                }}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Active sessions</h2>
          <span className="hud faint">{d.sessions.length}</span>
        </div>
        <ul className="list">
          {d.sessions.length === 0 && (
            <li>
              <span className="muted">No active sessions.</span>
            </li>
          )}
          {d.sessions.map((s) => (
            <li key={s.id}>
              <div className="grow">
                <strong>{describeDevice(s.userAgent)}</strong>
                <div className="hud faint">
                  {s.ip ?? 'unknown IP'} · {s.authMethod} · active {timeAgo(s.lastUsedAt)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <Link className="btn btn-sm" href={`/console/logs?q=${encodeURIComponent(u.email)}`}>
        View this user’s activity in logs →
      </Link>
    </>
  );
}
