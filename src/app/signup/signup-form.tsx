'use client';

import Link from 'next/link';
import { useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { Alert, Field, PasswordField, Submit } from '@/components/ui';

export function SignupForm({ returnTo }: { returnTo: string }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agree) return setError('Please accept the terms to continue.');
    setError('');
    setBusy(true);
    try {
      await api('/auth/signup', { body: form });
      // New accounts must confirm their email before apps can use them.
      window.location.assign(`/verify-email?pending=1&return_to=${encodeURIComponent(returnTo)}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create your account.');
      setBusy(false);
    }
  }

  return (
    <form className="stack" style={{ ['--gap' as string]: '1.125rem' }} onSubmit={onSubmit}>
      <Alert>{error}</Alert>
      <Field label="Name" name="name" autoComplete="name" required maxLength={80} value={form.name} onChange={set('name')} placeholder="Your name" />
      <Field label="Email" type="email" name="email" autoComplete="email" required value={form.email} onChange={set('email')} placeholder="name@domain.com" />
      <PasswordField label="Password" name="password" autoComplete="new-password" required minLength={10} showMeter value={form.password} onChange={set('password')} />
      <label className="check">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <span className="muted">I agree to the terms of service and privacy policy.</span>
      </label>
      <Submit busy={busy}>Create account</Submit>
      <p className="muted" style={{ fontSize: '.9rem' }}>
        Already have an account?{' '}
        <Link href={`/login?return_to=${encodeURIComponent(returnTo)}`} style={{ color: 'var(--ink)' }}>
          Sign in →
        </Link>
      </p>
    </form>
  );
}
