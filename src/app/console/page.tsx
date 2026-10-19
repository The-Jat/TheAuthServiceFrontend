'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { PageHead } from '@/components/app-shell';
import { Alert, Bars } from '@/components/ui';

interface Overview {
  counts: { users: number; verified: number; new_users_7d: number; active_sessions: number; apps: number; passkeys: number };
  signups: { day: string; count: number }[];
  logins: { day: string; count: number }[];
  logs: { last24h: Record<string, number>; hourly: { hour: string; errors: number; warnings: number; total: number }[] } | null;
  notifications: { last7d: Record<string, number>; smtpConfigured: boolean } | null;
}

export default function ConsoleOverview() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Overview>('/admin/overview')
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load the overview.'));
  }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!data) return <div className="skeleton" style={{ height: '20rem' }} />;
  const c = data.counts;
  const day = (d: string) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <>
      <PageHead eyebrow="Console · Overview" title="Everything," accent="at a glance." />

      <section className="panel">
        <div className="kpis">
          <Kpi label="Users" value={c.users} note={`${c.verified} verified`} />
          <Kpi label="New · 7 days" value={c.new_users_7d} />
          <Kpi label="Active sessions" value={c.active_sessions} note={`${c.passkeys} passkeys`} />
          <Kpi label="Apps" value={c.apps} />
        </div>
      </section>

      <div className="grid-lines cols-2" style={{ border: '1px solid var(--line)', marginBottom: '1.5rem' }}>
        <div>
          <div className="panel-head" style={{ borderBottom: 0 }}>
            <h2>Sign-ups</h2>
            <span className="hud faint">14 days</span>
          </div>
          <Bars data={data.signups.map((s) => ({ key: day(s.day), value: s.count }))} label={[day(data.signups[0].day), 'Today']} />
        </div>
        <div>
          <div className="panel-head" style={{ borderBottom: 0 }}>
            <h2>Sign-ins</h2>
            <span className="hud faint">14 days</span>
          </div>
          <Bars data={data.logins.map((s) => ({ key: day(s.day), value: s.count }))} label={[day(data.logins[0].day), 'Today']} />
        </div>
      </div>

      <div className="grid-lines cols-2" style={{ border: '1px solid var(--line)' }}>
        <div>
          <div className="panel-head" style={{ borderBottom: 0 }}>
            <h2>Logs</h2>
            <Link href="/console/logs" className="hud faint" style={{ textDecoration: 'none' }}>
              Open →
            </Link>
          </div>
          {data.logs ? (
            <>
              <div className="row" style={{ padding: '0 1.25rem' }}>
                <span className="badge err">{data.logs.last24h.error} errors</span>
                <span className="badge warn">{data.logs.last24h.warn} warnings</span>
                <span className="badge info">{data.logs.last24h.info} info</span>
                <span className="hud faint">last 24h</span>
              </div>
              <Bars
                data={data.logs.hourly.map((h) => ({ key: h.hour.slice(11), value: h.total, tone: h.errors ? 'err' : h.warnings ? 'warn' : undefined }))}
                label={['24h ago', 'Now']}
              />
            </>
          ) : (
            <div className="panel-body">
              <Alert kind="warn">The logger service is unreachable.</Alert>
            </div>
          )}
        </div>
        <div>
          <div className="panel-head" style={{ borderBottom: 0 }}>
            <h2>Notifications</h2>
            <Link href="/console/notifications" className="hud faint" style={{ textDecoration: 'none' }}>
              Open →
            </Link>
          </div>
          {data.notifications ? (
            <div className="panel-body stack">
              {!data.notifications.smtpConfigured && <Alert kind="warn">SMTP isn’t configured, so emails are being skipped. Set SMTP_* on the notifier.</Alert>}
              <dl className="kv">
                {Object.entries(data.notifications.last7d).map(([k, v]) => (
                  <FragmentKV key={k} k={k} v={v} />
                ))}
              </dl>
            </div>
          ) : (
            <div className="panel-body">
              <Alert kind="warn">The notification service is unreachable.</Alert>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function FragmentKV({ k, v }: { k: string; v: number }) {
  return (
    <>
      <dt>{k} · 7d</dt>
      <dd>{v}</dd>
    </>
  );
}

function Kpi({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="kpi">
      <span className="hud">{label}</span>
      <strong>{value.toLocaleString()}</strong>
      {note && <span className="hud faint">{note}</span>}
    </div>
  );
}
