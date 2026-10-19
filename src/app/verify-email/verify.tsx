'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { api, ApiError, type Me } from '@/lib/api';
import { Alert } from '@/components/ui';

/** Consumes a verification link token. */
export function ConsumeToken({ token, returnTo }: { token: string; returnTo: string }) {
  const [state, setState] = useState<'working' | 'done' | 'failed'>('working');
  const [error, setError] = useState('');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    api('/auth/verify-email', { body: { token } })
      .then(() => setState('done'))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Verification failed.');
        setState('failed');
      });
  }, [token]);

  if (state === 'working') return <p className="muted row"><span className="spinner" /> Confirming your email…</p>;
  if (state === 'failed')
    return (
      <div className="stack">
        <Alert>{error}</Alert>
        <Link className="btn btn-lg btn-block" href="/verify-email?pending=1">
          Send a new link
        </Link>
      </div>
    );
  return (
    <div className="stack">
      <Alert kind="success">Your email is confirmed. You’re all set.</Alert>
      <a className="btn btn-primary btn-lg btn-block" href={returnTo}>
        Continue
      </a>
    </div>
  );
}

/** "Check your inbox" screen with resend, polling until the email is verified. */
export function Pending({ returnTo }: { returnTo: string }) {
  const [me, setMe] = useState<Me | null>(null);
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let stop = false;
    const tick = async () => {
      const m = await api<Me>('/auth/me').catch(() => null);
      if (stop) return;
      setMe(m);
      if (m?.user.emailVerified) window.location.assign(returnTo);
    };
    tick();
    const t = setInterval(tick, 5000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [returnTo]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function resend() {
    setBusy(true);
    setMessage(null);
    try {
      await api('/auth/resend-verification', { body: {} });
      setMessage({ kind: 'success', text: 'A new link is on its way.' });
      setCooldown(60);
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof ApiError ? err.message : 'Could not resend.' });
    } finally {
      setBusy(false);
    }
  }

  if (me === null) {
    return (
      <div className="stack">
        <p className="muted">Sign in to resend your verification email.</p>
        <Link className="btn btn-primary btn-lg btn-block" href={`/login?return_to=${encodeURIComponent('/verify-email?pending=1&return_to=' + encodeURIComponent(returnTo))}`}>
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="app-chip">
        <span className="avatar">@</span>
        <div className="truncate">
          <div className="hud faint">Sent to</div>
          <strong>{me.user.email}</strong>
        </div>
      </div>
      {message && <Alert kind={message.kind}>{message.text}</Alert>}
      <p className="muted" style={{ fontSize: '.9rem' }}>
        Open the link in that email to continue. This page will move on automatically once you’ve confirmed.
      </p>
      <button type="button" className="btn btn-lg btn-block" onClick={resend} disabled={busy || cooldown > 0}>
        {cooldown > 0 ? `Resend in ${cooldown}s` : busy ? <span className="spinner" /> : 'Resend email'}
      </button>
      <Link href="/account" className="link" style={{ fontSize: '.875rem' }}>
        Go to my account instead
      </Link>
    </div>
  );
}
