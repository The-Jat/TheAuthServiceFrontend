'use client';

import { useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { PageHead, useMe } from '@/components/app-shell';
import { Alert, Field, Modal, PasswordField } from '@/components/ui';
import { formatDate } from '@/lib/util';

export default function ProfilePage() {
  const { me, refresh } = useMe();
  const [name, setName] = useState(me.user.name);
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [resent, setResent] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSaved('');
    try {
      await api('/account', { method: 'PATCH', body: { name } });
      await refresh();
      setSaved('Saved.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead eyebrow="Your account" title="Hello," accent={`${me.user.name.split(' ')[0]}.`} />

      {!me.user.emailVerified && (
        <div className="alert alert-warn row" style={{ marginBottom: '1.5rem', justifyContent: 'space-between' }}>
          <span>Confirm your email to connect apps with this account.</span>
          <button
            type="button"
            className="btn btn-sm"
            disabled={resent}
            onClick={async () => {
              await api('/auth/resend-verification', { body: {} }).catch(() => undefined);
              setResent(true);
            }}
          >
            {resent ? 'Email sent' : 'Resend link'}
          </button>
        </div>
      )}

      <section className="panel">
        <div className="panel-head">
          <h2>Profile</h2>
          <span className="hud faint">Shared with apps you connect</span>
        </div>
        <form className="panel-body stack" onSubmit={save} style={{ maxWidth: '32rem' }}>
          <Alert>{error}</Alert>
          {saved && <Alert kind="success">{saved}</Alert>}
          <Field label="Name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} autoComplete="name" />
          <Field
            label="Email"
            value={me.user.email}
            readOnly
            aside={<span className={`badge ${me.user.emailVerified ? 'ok' : 'warn'}`}>{me.user.emailVerified ? 'Verified' : 'Unverified'}</span>}
          />
          <div className="row">
            <button type="submit" className="btn btn-primary" disabled={busy || name.trim() === me.user.name}>
              {busy ? <span className="spinner" /> : 'Save changes'}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Details</h2>
        </div>
        <div className="panel-body">
          <dl className="kv">
            <dt>Account ID</dt>
            <dd className="mono">{me.user.id}</dd>
            <dt>Role</dt>
            <dd>{me.user.role === 'admin' ? 'Administrator' : 'Member'}</dd>
            <dt>Member since</dt>
            <dd>{formatDate(me.user.createdAt)}</dd>
            <dt>Last sign-in</dt>
            <dd>{formatDate(me.user.lastLoginAt)}</dd>
          </dl>
        </div>
      </section>

      <section className="panel" style={{ borderColor: 'color-mix(in srgb, var(--danger) 40%, transparent)' }}>
        <div className="panel-head">
          <h2>Delete account</h2>
        </div>
        <div className="panel-body row" style={{ justifyContent: 'space-between' }}>
          <p className="muted" style={{ maxWidth: '36rem' }}>
            Permanently deletes your account, passkeys and sessions, and signs you out of every connected app. This can’t be undone.
          </p>
          <button type="button" className="btn btn-danger" onClick={() => setDeleting(true)}>
            Delete account
          </button>
        </div>
      </section>

      {deleting && <DeleteDialog email={me.user.email} hasPassword={me.hasPassword} onClose={() => setDeleting(false)} />}
    </>
  );
}

function DeleteDialog({ email, hasPassword, onClose }: { email: string; hasPassword: boolean; onClose: () => void }) {
  const [confirm, setConfirm] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError('');
    try {
      await api('/account', { method: 'DELETE', body: { confirm, password: password || undefined } });
      window.location.assign('/logged-out');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete the account.');
      setBusy(false);
    }
  }

  return (
    <Modal
      title="Delete your account?"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" disabled={busy || confirm !== email} onClick={submit}>
            {busy ? <span className="spinner" /> : 'Delete forever'}
          </button>
        </>
      }
    >
      <Alert>{error}</Alert>
      <p className="muted">
        Type <strong className="mono">{email}</strong> to confirm.
      </p>
      <Field label="Your email" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" />
      {hasPassword && <PasswordField label="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />}
    </Modal>
  );
}
