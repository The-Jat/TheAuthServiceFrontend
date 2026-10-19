'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { browserSupportsWebAuthn, startAuthentication } from '@simplewebauthn/browser';
import { api, ApiError, type Me } from '@/lib/api';
import { Alert, Field, PasswordField, Submit } from '@/components/ui';
import { IconFingerprint } from '@/components/icons';

export function LoginForm({ returnTo, allowSignup, initialError }: { returnTo: string; allowSignup: boolean; initialError?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(initialError ?? '');
  const [busy, setBusy] = useState<'password' | 'passkey' | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [passkeys, setPasskeys] = useState(false);

  useEffect(() => {
    setPasskeys(browserSupportsWebAuthn());
    api<Me>('/auth/me').then(setMe).catch(() => undefined);
  }, []);

  const go = () => window.location.assign(returnTo);

  async function onPassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy('password');
    try {
      await api('/auth/login', { body: { email, password } });
      go();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not sign in.');
      setBusy(null);
    }
  }

  async function onPasskey() {
    setError('');
    setBusy('passkey');
    try {
      const optionsJSON = await api('/auth/passkey/options', { body: {} });
      const response = await startAuthentication({ optionsJSON });
      await api('/auth/passkey/verify', { body: { response } });
      go();
    } catch (err: any) {
      if (err?.name !== 'NotAllowedError') setError(err instanceof ApiError ? err.message : 'Passkey sign-in was cancelled or failed.');
      setBusy(null);
    }
  }

  if (me) {
    return (
      <div className="stack">
        <Alert kind="info">
          You’re signed in as <strong>{me.user.email}</strong>.
        </Alert>
        <button type="button" className="btn btn-primary btn-lg btn-block" onClick={go}>
          Continue as {me.user.name.split(' ')[0]}
        </button>
        <button
          type="button"
          className="btn btn-lg btn-block"
          onClick={async () => {
            await api('/auth/logout', { body: {} }).catch(() => undefined);
            setMe(null);
          }}
        >
          Use another account
        </button>
      </div>
    );
  }

  return (
    <div className="stack" style={{ ['--gap' as string]: '1.125rem' }}>
      <Alert>{error}</Alert>
      {passkeys && (
        <>
          <button type="button" className="btn btn-lg btn-block" onClick={onPasskey} disabled={!!busy}>
            {busy === 'passkey' ? <span className="spinner" /> : <IconFingerprint />} Sign in with a passkey
          </button>
          <div className="divider hud">or</div>
        </>
      )}
      <form className="stack" style={{ ['--gap' as string]: '1.125rem' }} onSubmit={onPassword}>
        <Field label="Email" type="email" name="email" autoComplete="username webauthn" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@domain.com" />
        <PasswordField
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aside={<Link href="/forgot-password">Forgot password?</Link>}
        />
        <Submit busy={busy === 'password'} disabled={!!busy}>
          Sign in
        </Submit>
      </form>
      {allowSignup && (
        <p className="muted" style={{ fontSize: '.9rem' }}>
          New here?{' '}
          <Link href={`/signup?return_to=${encodeURIComponent(returnTo)}`} style={{ color: 'var(--ink)' }}>
            Create an account →
          </Link>
        </p>
      )}
    </div>
  );
}
