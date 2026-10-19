'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { Alert, PasswordField, Submit } from '@/components/ui';

export function ResetForm({ token }: { token: string }) {
  const [valid, setValid] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    api<{ valid: boolean }>(`/auth/reset-password/check?token=${encodeURIComponent(token)}`)
      .then((r) => setValid(r.valid))
      .catch(() => setValid(false));
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) return setError('The passwords don’t match.');
    setBusy(true);
    setError('');
    try {
      await api('/auth/reset-password', { body: { token, password } });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reset your password.');
      setBusy(false);
    }
  }

  if (valid === null) return <p className="muted row"><span className="spinner" /> Checking your link…</p>;
  if (!valid)
    return (
      <div className="stack">
        <Alert>This reset link is invalid, already used, or expired.</Alert>
        <Link className="btn btn-primary btn-lg btn-block" href="/forgot-password">
          Request a new link
        </Link>
      </div>
    );
  if (done)
    return (
      <div className="stack">
        <Alert kind="success">Your password was changed and you’ve been signed out everywhere.</Alert>
        <Link className="btn btn-primary btn-lg btn-block" href="/login">
          Sign in
        </Link>
      </div>
    );
  return (
    <form className="stack" style={{ ['--gap' as string]: '1.125rem' }} onSubmit={onSubmit}>
      <Alert>{error}</Alert>
      <PasswordField label="New password" autoComplete="new-password" required minLength={10} showMeter value={password} onChange={(e) => setPassword(e.target.value)} />
      <PasswordField label="Confirm password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      <Submit busy={busy}>Set new password</Submit>
    </form>
  );
}
