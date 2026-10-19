'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { PageHead, useMe } from '@/components/app-shell';
import { Alert, Empty, Field, Modal } from '@/components/ui';
import { timeAgo } from '@/lib/util';

interface Delivery {
  id: string;
  event: string;
  channel: string;
  template: string;
  to: string;
  subject: string | null;
  status: 'queued' | 'retrying' | 'sent' | 'failed' | 'skipped';
  attempts: number;
  lastError: string | null;
  retryable: boolean;
  createdAt: string;
  sentAt: string | null;
}

const STATUS_BADGE: Record<string, string> = { sent: 'ok', retrying: 'warn', failed: 'err', skipped: 'plain', queued: 'info' };

export default function NotificationsPage() {
  const { me } = useMe();
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Delivery[] | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [testing, setTesting] = useState(false);

  const load = useCallback(async () => {
    const p = new URLSearchParams({ limit: '50' });
    if (status) p.set('status', status);
    if (q) p.set('q', q);
    try {
      const r = await api<{ items: Delivery[]; nextCursor: string | null }>(`/admin/notifications?${p}`);
      setItems(r.items);
      setCursor(r.nextCursor);
      setError('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load notifications.');
      setItems([]);
    }
  }, [status, q]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function more() {
    if (!cursor) return;
    const p = new URLSearchParams({ limit: '50', before: cursor });
    if (status) p.set('status', status);
    if (q) p.set('q', q);
    const r = await api<{ items: Delivery[]; nextCursor: string | null }>(`/admin/notifications?${p}`);
    setItems((prev) => [...(prev ?? []), ...r.items]);
    setCursor(r.nextCursor);
  }

  async function retry(d: Delivery) {
    const r = await api<{ ok: boolean; message?: string }>(`/admin/notifications/${d.id}/retry`, { body: {} });
    if (!r.ok && r.message) window.alert(r.message);
    load();
  }

  return (
    <>
      <PageHead eyebrow="Console · Notifications" title="Every email," accent="accounted for.">
        <button className="btn btn-primary" onClick={() => setTesting(true)}>
          Send test email
        </button>
      </PageHead>
      <section className="panel">
        <div className="toolbar">
          <input className="input" type="search" placeholder="Search recipient, template or subject" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search notifications" />
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
            <option value="">All statuses</option>
            <option value="sent">Sent</option>
            <option value="retrying">Retrying</option>
            <option value="failed">Failed</option>
            <option value="skipped">Skipped</option>
          </select>
        </div>
        {error && (
          <div className="panel-body">
            <Alert kind="warn">{error}</Alert>
          </div>
        )}
        {items === null ? (
          <div className="panel-body">
            <div className="skeleton" style={{ height: '10rem' }} />
          </div>
        ) : items.length === 0 ? (
          <Empty title="No notifications yet.">Verification, reset and security emails will be listed here.</Empty>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Status</th>
                  <th>Template</th>
                  <th>To</th>
                  <th>Details</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((d) => (
                  <tr key={d.id}>
                    <td className="nowrap muted">{timeAgo(d.createdAt)}</td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[d.status]}`}>{d.status}</span>
                    </td>
                    <td className="mono" style={{ fontSize: '.75rem' }}>
                      {d.template}
                    </td>
                    <td className="truncate" style={{ maxWidth: '16rem' }}>
                      {d.to}
                    </td>
                    <td style={{ fontSize: '.8125rem' }}>
                      <div>{d.subject ?? '—'}</div>
                      {d.lastError && <div className="danger">{d.lastError}</div>}
                      <div className="hud faint">{d.attempts} attempt{d.attempts === 1 ? '' : 's'}</div>
                    </td>
                    <td>
                      {d.retryable && (
                        <button className="btn btn-sm" onClick={() => retry(d)}>
                          Retry
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {cursor && (
          <div className="panel-foot" style={{ justifyContent: 'center' }}>
            <button className="btn btn-sm" onClick={more}>
              Load older
            </button>
          </div>
        )}
      </section>
      {testing && <TestEmail defaultTo={me.user.email} onClose={() => (setTesting(false), load())} />}
    </>
  );
}

function TestEmail({ defaultTo, onClose }: { defaultTo: string; onClose: () => void }) {
  const [to, setTo] = useState(defaultTo);
  const [result, setResult] = useState<{ kind: 'success' | 'error' | 'warn'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  async function send() {
    setBusy(true);
    setResult(null);
    try {
      const r = await api<{ status: string; error: string | null; smtpConfigured: boolean }>('/admin/notifications/test', { body: { to } });
      if (r.status === 'sent') setResult({ kind: 'success', text: `Sent to ${to}. Check the inbox (and spam).` });
      else if (!r.smtpConfigured) setResult({ kind: 'warn', text: 'SMTP is not configured on the notification service, so the email was skipped.' });
      else setResult({ kind: 'error', text: r.error ?? `Delivery ${r.status}.` });
    } catch (err) {
      setResult({ kind: 'error', text: err instanceof ApiError ? err.message : 'Could not send.' });
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title="Send a test email"
      onClose={onClose}
      footer={
        <button className="btn btn-primary" onClick={send} disabled={busy}>
          {busy ? <span className="spinner" /> : 'Send'}
        </button>
      }
    >
      {result && <Alert kind={result.kind}>{result.text}</Alert>}
      <Field label="Recipient" type="email" value={to} onChange={(e) => setTo(e.target.value)} />
    </Modal>
  );
}
