'use client';

import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { PageHead } from '@/components/app-shell';
import { Alert, Empty } from '@/components/ui';
import { formatDate } from '@/lib/util';

interface LogItem {
  id: string;
  occurredAt: string;
  service: string;
  event: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  correlationId: string | null;
  userId: string | null;
  meta: Record<string, unknown>;
}

const LEVEL_BADGE: Record<string, string> = { error: 'err', warn: 'warn', info: 'info', debug: 'plain' };

export function LogsView({ initialQuery }: { initialQuery: string }) {
  const [filters, setFilters] = useState({ service: '', level: '', q: initialQuery, correlationId: '' });
  const [items, setItems] = useState<LogItem[] | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [services, setServices] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [error, setError] = useState('');
  const debounced = useRef<NodeJS.Timeout | undefined>(undefined);

  const qs = useCallback(
    (before?: string) => {
      const p = new URLSearchParams();
      for (const [k, v] of Object.entries(filters)) if (v) p.set(k, v);
      if (before) p.set('before', before);
      p.set('limit', '50');
      return p.toString();
    },
    [filters],
  );

  const load = useCallback(async () => {
    try {
      const r = await api<{ items: LogItem[]; nextCursor: string | null }>(`/admin/logs?${qs()}`);
      setItems(r.items);
      setCursor(r.nextCursor);
      setError('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load logs.');
      setItems([]);
    }
  }, [qs]);

  useEffect(() => {
    clearTimeout(debounced.current);
    debounced.current = setTimeout(load, 250);
  }, [load]);

  useEffect(() => {
    api<{ services: { service: string }[] }>('/admin/logs/facets')
      .then((f) => setServices(f.services.map((s) => s.service)))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!live) return;
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [live, load]);

  async function more() {
    if (!cursor) return;
    const r = await api<{ items: LogItem[]; nextCursor: string | null }>(`/admin/logs?${qs(cursor)}`);
    setItems((prev) => [...(prev ?? []), ...r.items]);
    setCursor(r.nextCursor);
  }

  return (
    <>
      <PageHead eyebrow="Console · Logs" title="What happened," accent="and when.">
        <label className="check" style={{ fontSize: '.875rem' }}>
          <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} /> Live
        </label>
      </PageHead>
      <section className="panel">
        <div className="toolbar">
          <input className="input" type="search" placeholder="Search messages and details" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} aria-label="Search logs" />
          <select className="select" value={filters.service} onChange={(e) => setFilters({ ...filters, service: e.target.value })} aria-label="Service">
            <option value="">All services</option>
            {services.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select className="select" value={filters.level} onChange={(e) => setFilters({ ...filters, level: e.target.value })} aria-label="Level">
            <option value="">All levels</option>
            <option value="error">Errors</option>
            <option value="warn">Warnings</option>
            <option value="info">Info</option>
          </select>
          {filters.correlationId && (
            <button className="btn btn-sm" onClick={() => setFilters({ ...filters, correlationId: '' })}>
              Request {filters.correlationId.slice(0, 8)}… ✕
            </button>
          )}
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
          <Empty title="Nothing logged yet.">Events appear here as soon as any service publishes them.</Empty>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Level</th>
                  <th>Service</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {items.map((l) => (
                  <Fragment key={l.id}>
                    <tr className="clickable log-row" onClick={() => setOpen(open === l.id ? null : l.id)}>
                      <td className="mono faint" style={{ fontSize: '.75rem' }}>
                        {formatDate(l.occurredAt)}
                      </td>
                      <td>
                        <span className={`badge ${LEVEL_BADGE[l.level]}`}>{l.level}</span>
                      </td>
                      <td className="mono" style={{ fontSize: '.75rem' }}>
                        {l.service}
                      </td>
                      <td>
                        <div>{l.message}</div>
                        <div className="mono faint" style={{ fontSize: '.6875rem' }}>
                          {l.event}
                        </div>
                      </td>
                    </tr>
                    {open === l.id && (
                      <tr>
                        <td colSpan={4} style={{ background: 'var(--bg-raised)' }}>
                          <div className="row" style={{ marginBottom: '.75rem' }}>
                            {l.correlationId && (
                              <button className="btn btn-sm" onClick={() => setFilters({ ...filters, q: '', correlationId: l.correlationId! })}>
                                Show this whole request
                              </button>
                            )}
                            {l.userId && <span className="hud faint">user {l.userId}</span>}
                          </div>
                          <pre className="json">{JSON.stringify(l.meta, null, 2)}</pre>
                        </td>
                      </tr>
                    )}
                  </Fragment>
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
    </>
  );
}
