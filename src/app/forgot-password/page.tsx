'use client';

import Link from 'next/link';
import { useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { AuthHeading, AuthShell } from '@/components/auth-shell';
import { Alert, Field, Submit } from '@/components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/auth/forgot-password', { body: { email } });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send the email.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <AuthHeading eyebrow="Account recovery" title="Forgot your" accent="password?" sub="Enter your email and we’ll send a link to choose a new one." />
      {sent ? (
        <div className="stack">
          <Alert kind="success">If an account exists for {email}, a reset link is on its way. It expires in 30 minutes.</Alert>
          <Link className="btn btn-lg btn-block" href="/login">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form className="stack" style={{ ['--gap' as string]: '1.125rem' }} onSubmit={onSubmit}>
          <Alert>{error}</Alert>
          <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@domain.com" />
          <Submit busy={busy}>Send reset link</Submit>
          <Link href="/login" className="link" style={{ fontSize: '.9rem' }}>
            ← Back to sign in
          </Link>
        </form>
      )}
    </AuthShell>
  );
}
