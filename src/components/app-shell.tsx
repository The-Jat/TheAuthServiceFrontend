'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, ApiError, type Me } from '@/lib/api';
import { initials } from '@/lib/util';
import { Brand } from './brand';
import { ThemeToggle } from './theme';
import { IconApps, IconBell, IconGrid, IconLink, IconLogout, IconLogs, IconShield, IconUser, IconUsers } from './icons';

interface Ctx {
  me: Me;
  refresh: () => Promise<void>;
}
const MeContext = createContext<Ctx | null>(null);

export function useMe(): Ctx {
  const ctx = useContext(MeContext);
  if (!ctx) throw new Error('useMe outside AppShell');
  return ctx;
}

const ACCOUNT_NAV = [
  { href: '/account', label: 'Profile', icon: IconUser },
  { href: '/account/security', label: 'Security', icon: IconShield },
  { href: '/account/apps', label: 'Connected apps', icon: IconLink },
];

const CONSOLE_NAV = [
  { href: '/console', label: 'Overview', icon: IconGrid },
  { href: '/console/users', label: 'Users', icon: IconUsers },
  { href: '/console/apps', label: 'Apps', icon: IconApps },
  { href: '/console/logs', label: 'Logs', icon: IconLogs },
  { href: '/console/notifications', label: 'Notifications', icon: IconBell },
];

export function AppShell({ area, children }: { area: 'account' | 'console'; children: React.ReactNode }) {
  const pathname = usePathname();
  const [me, setMe] = useState<Me | null>(null);
  const [denied, setDenied] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setMe(await api<Me>('/auth/me'));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        window.location.assign(`/login?return_to=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      }
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (me && area === 'console' && me.user.role !== 'admin') setDenied(true);
  }, [me, area]);

  async function signOut() {
    await api('/auth/logout', { body: {} }).catch(() => undefined);
    window.location.assign('/login');
  }

  const isActive = (href: string) => (href === '/account' || href === '/console' ? pathname === href : pathname.startsWith(href));
  const nav = area === 'console' ? CONSOLE_NAV : ACCOUNT_NAV;

  return (
    <>
      <nav className="nav" aria-label="Primary">
        <div className="nav-inner">
          <div className="nav-group">
            <Brand href="/account" />
            <ul className="nav-links">
              <li style={{ display: 'flex' }}>
                <Link className="nav-link" href="/account" aria-current={area === 'account' ? 'page' : undefined}>
                  <span>Account</span>
                </Link>
              </li>
              {me?.user.role === 'admin' && (
                <li style={{ display: 'flex' }}>
                  <Link className="nav-link" href="/console" aria-current={area === 'console' ? 'page' : undefined}>
                    <span>Console</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>
          <div className="nav-group">
            <ThemeToggle />
            {me && (
              <span className="nav-link" style={{ borderLeft: '1px solid var(--line)', paddingInline: '.875rem', gap: '.625rem', cursor: 'default' }}>
                <span className="avatar" style={{ width: '1.5rem', height: '1.5rem', fontSize: '.625rem' }}>
                  {initials(me.user.name)}
                </span>
                <span className="truncate" style={{ maxWidth: '12rem', padding: 0, background: 'none', color: 'var(--muted)' }}>
                  {me.user.email}
                </span>
              </span>
            )}
            <button type="button" className="nav-btn" onClick={signOut} aria-label="Sign out" title="Sign out">
              <IconLogout />
            </button>
          </div>
        </div>
      </nav>
      <div className="shell">
        <aside className="sidebar" aria-label={area === 'console' ? 'Console sections' : 'Account sections'}>
          <span className="hud">{area === 'console' ? 'Console' : 'Your account'}</span>
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="side-link" aria-current={isActive(item.href) ? 'page' : undefined}>
              <item.icon /> {item.label}
            </Link>
          ))}
          {area === 'account' && me?.user.role === 'admin' && (
            <>
              <span className="hud">Admin</span>
              <Link href="/console" className="side-link">
                <IconGrid /> Console
              </Link>
            </>
          )}
          {area === 'console' && (
            <>
              <span className="hud">You</span>
              <Link href="/account" className="side-link">
                <IconUser /> My account
              </Link>
            </>
          )}
        </aside>
        <main className="main" id="main">
          {denied ? (
            <div className="panel">
              <div className="empty">
                <p className="serif">Administrators only.</p>
                <p>Your account doesn’t have access to the console.</p>
              </div>
            </div>
          ) : me ? (
            <MeContext.Provider value={{ me, refresh }}>{children}</MeContext.Provider>
          ) : (
            <div className="stack">
              <div className="skeleton" style={{ height: '2.5rem', width: '40%' }} />
              <div className="skeleton" style={{ height: '12rem' }} />
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export function PageHead({ eyebrow, title, accent, children }: { eyebrow: string; title: string; accent?: string; children?: React.ReactNode }) {
  return (
    <header className="page-head">
      <div>
        <p className="hud faint">{eyebrow}</p>
        <h1>
          {title} {accent && <span className="serif muted">{accent}</span>}
        </h1>
      </div>
      {children && <div className="row">{children}</div>}
    </header>
  );
}
