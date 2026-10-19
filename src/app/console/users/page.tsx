'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, type PublicUser } from '@/lib/api';
import { PageHead } from '@/components/app-shell';
import { Empty } from '@/components/ui';
import { initials, timeAgo } from '@/lib/util';

interface Page {
  total: number;
  page: number;
  pageSize: number;
  items: PublicUser[];
}

export default function UsersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Page | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const ctrl = new AbortController();
    api<Page>(`/admin/users?page=${page}&search=${encodeURIComponent(query)}`, { signal: ctrl.signal }).then(setData).catch(() => undefined);
    return () => ctrl.abort();
  }, [page, query]);

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <>
      <PageHead eyebrow="Console · Users" title="People" accent="with accounts." />
      <section className="panel">
        <div className="toolbar">
          <input className="input" type="search" placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search users" />
          <span className="hud faint">{data ? `${data.total.toLocaleString()} total` : ''}</span>
        </div>
        {!data ? (
          <div className="panel-body">
            <div className="skeleton" style={{ height: '8rem' }} />
          </div>
        ) : data.items.length === 0 ? (
          <Empty title="No one matches.">Try a different search.</Empty>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>Last sign-in</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((u) => (
                  <tr key={u.id} className="clickable" onClick={() => router.push(`/console/users/${u.id}`)}>
                    <td>
                      <div className="row" style={{ flexWrap: 'nowrap' }}>
                        <span className="avatar">{initials(u.name)}</span>
                        <div style={{ minWidth: 0 }}>
                          <Link href={`/console/users/${u.id}`} style={{ textDecoration: 'none', color: 'var(--ink-strong)', fontWeight: 500 }}>
                            {u.name}
                          </Link>
                          <div className="faint truncate" style={{ fontSize: '.8125rem' }}>
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {u.status === 'disabled' ? (
                        <span className="badge err">Disabled</span>
                      ) : u.emailVerified ? (
                        <span className="badge ok">Verified</span>
                      ) : (
                        <span className="badge warn">Unverified</span>
                      )}
                    </td>
                    <td>{u.role === 'admin' ? <span className="badge info">Admin</span> : <span className="faint">Member</span>}</td>
                    <td className="nowrap muted">{timeAgo(u.lastLoginAt)}</td>
                    <td className="nowrap muted">{timeAgo(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && pages > 1 && (
          <div className="panel-foot" style={{ justifyContent: 'space-between' }}>
            <span className="hud faint">
              Page {page} of {pages}
            </span>
            <div className="row" style={{ ['--gap' as string]: '.5rem' }}>
              <button type="button" className="btn btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                ← Prev
              </button>
              <button type="button" className="btn btn-sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                Next →
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
