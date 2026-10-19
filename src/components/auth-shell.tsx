import Link from 'next/link';
import { Brand } from './brand';
import { ThemeToggle } from './theme';
import { BRAND } from '@/lib/brand';

/** Split-screen frame for every sign-in style page (ArtCraft auth layout). */
export function AuthShell({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="auth">
      <div className="auth-main">
        <header className="auth-top">
          <Brand />
          <div className="nav-group">
            <ThemeToggle />
            <Link href="/" className="nav-link" style={{ borderLeft: '1px solid var(--line)', paddingInline: '1rem' }}>
              <span>← Home</span>
            </Link>
          </div>
        </header>
        <main className="auth-body">
          <div className="auth-card">{children}</div>
        </main>
        <footer className="auth-foot hud">
          <span>
            © {new Date().getFullYear()} {BRAND}
          </span>
          <span>Secured with passkeys · OIDC</span>
        </footer>
      </div>
      <aside className="auth-aside" aria-hidden>
        <div className="inner">
          <p className="hud faint">{BRAND} · Accounts</p>
        </div>
        <div className="inner">
          {aside ?? (
            <>
              <h2>
                One account,
                <br />
                <span className="serif muted">every app.</span>
              </h2>
              <p>Sign in once and move between {BRAND} apps without another password. Add a passkey and skip passwords entirely.</p>
            </>
          )}
        </div>
        <div className="specs">
          <div>
            <span className="hud faint">Sign-in</span>
            <strong>Passkeys · Password</strong>
          </div>
          <div>
            <span className="hud faint">Standard</span>
            <strong>OpenID Connect</strong>
          </div>
          <div>
            <span className="hud faint">Passwords</span>
            <strong>Argon2id hashed</strong>
          </div>
          <div>
            <span className="hud faint">Sessions</span>
            <strong>Revocable anytime</strong>
          </div>
        </div>
      </aside>
    </div>
  );
}

export function AuthHeading({ eyebrow, title, accent, sub }: { eyebrow: string; title: string; accent?: string; sub?: React.ReactNode }) {
  return (
    <>
      <p className="hud faint">{eyebrow}</p>
      <h1>
        {title} {accent && <span className="serif muted">{accent}</span>}
      </h1>
      {sub && <p className="sub">{sub}</p>}
    </>
  );
}
