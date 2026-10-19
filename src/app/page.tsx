import Link from 'next/link';
import { Brand } from '@/components/brand';
import { ThemeToggle } from '@/components/theme';
import { BRAND } from '@/lib/brand';
import { getPublicConfig } from '@/lib/server';

const MARQUEE = ['Passkeys', 'Single sign-on', 'OpenID Connect', 'PKCE everywhere', 'Refresh rotation', 'Session control', 'Email verification', 'Audit logs', 'Security alerts', 'Argon2id'];

const APPS = [
  { name: 'Short', host: 'short.thejat.in', blurb: 'Links, QR codes and bio pages.' },
  { name: 'Vault', host: 'vault.thejat.in', blurb: 'End-to-end encrypted passwords.' },
  { name: 'TheJat.in', host: 'thejat.in', blurb: 'Articles, courses and notes.' },
  { name: 'Your next app', host: 'anything.thejat.in', blurb: 'Register it in the console in a minute.' },
];

export default async function Home() {
  const cfg = await getPublicConfig();
  const letters = BRAND.toUpperCase().split('');
  return (
    <>
      <nav className="nav" aria-label="Primary">
        <div className="nav-inner">
          <div className="nav-group">
            <Brand />
            <ul className="nav-links">
              <li style={{ display: 'flex' }}>
                <a className="nav-link" href="#security">
                  <span>Security</span>
                </a>
              </li>
              <li style={{ display: 'flex' }}>
                <a className="nav-link" href="#developers">
                  <span>Developers</span>
                </a>
              </li>
              <li style={{ display: 'flex' }}>
                <a className="nav-link" href="#apps">
                  <span>Apps</span>
                </a>
              </li>
            </ul>
          </div>
          <div className="nav-group">
            <ThemeToggle />
            <Link className="nav-link" href="/login" style={{ borderLeft: '1px solid var(--line)', paddingInline: '1rem' }}>
              <span>Sign in</span>
            </Link>
            {cfg.allowSignup && (
              <Link className="btn btn-primary nav-cta" href="/signup">
                Create account
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-bg" aria-hidden />
          <div className="hero-inner">
            <div className="wordmark" role="img" aria-label={BRAND}>
              <span aria-hidden>{letters.join('')}</span>
            </div>
            <h1 id="hero-title">
              One account <span className="serif muted">for everything.</span>
            </h1>
            <p className="lede">Sign in once to every {BRAND} app. Passkeys instead of passwords, sessions you can see and end, and alerts when something changes.</p>
            <div className="row" style={{ justifyContent: 'center', marginTop: '1.75rem' }}>
              {cfg.allowSignup && (
                <Link className="btn btn-primary btn-lg" href="/signup">
                  Create your account
                </Link>
              )}
              <Link className="btn btn-lg" href="/login">
                Sign in
              </Link>
            </div>
            <div className="hero-meta hud">
              <span>OpenID Connect provider</span>
              <span>Passkeys · Password</span>
              <span>Free</span>
            </div>
          </div>
        </section>

        <div className="marquee hud" aria-hidden>
          {[0, 1].map((n) => (
            <ul key={n}>
              {MARQUEE.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          ))}
        </div>

        <section id="security" className="section" style={{ borderTop: 0 }}>
          <div className="frame">
            <span className="tick tick-tl" />
            <span className="tick tick-tr" />
            <div className="eyebrow hud">
              <p>
                <span className="num">01</span>
                <span className="sep">/</span>Security
              </p>
              <p className="faint">Built to be boring for attackers</p>
            </div>
            <div className="section-head">
              <h2>
                Your keys, <span className="serif">not</span> our guesswork.
              </h2>
              <p>Every sign-in path follows the current standards, and every session is visible and revocable from your account.</p>
            </div>
            <div className="grid-lines cols-3">
              <article className="feature">
                <p className="glyph">A</p>
                <h3>Passkeys first</h3>
                <p>Sign in with your fingerprint, face or device PIN. Passkeys can’t be phished, reused or leaked.</p>
              </article>
              <article className="feature">
                <p className="glyph">B</p>
                <h3>Sessions you control</h3>
                <p>See every device that’s signed in and end any of them. Changing your password signs out the rest.</p>
              </article>
              <article className="feature">
                <p className="glyph">C</p>
                <h3>Alerts that matter</h3>
                <p>New device, new passkey, password changed: you hear about it immediately, by email.</p>
              </article>
            </div>
          </div>
        </section>

        <section id="developers" className="section">
          <div className="frame">
            <span className="tick tick-tl" />
            <span className="tick tick-tr" />
            <div className="eyebrow hud">
              <p>
                <span className="num">02</span>
                <span className="sep">/</span>Developers
              </p>
              <p className="faint">Standard OpenID Connect</p>
            </div>
            <div className="section-head">
              <h2>
                Add <span className="serif">“Sign in with {BRAND}”</span> in minutes.
              </h2>
              <p>Register your app in the console, then point any OIDC library at the discovery document. Authorization code + PKCE, rotating refresh tokens, RS256-signed ID tokens.</p>
            </div>
            <pre className="codeblock">
              <span className="c"># 1. Discover endpoints</span>
              {'\n'}GET <span className="k">/api/.well-known/openid-configuration</span>
              {'\n\n'}
              <span className="c"># 2. Send the user to sign in (PKCE S256 required)</span>
              {'\n'}GET <span className="k">/api/oauth/authorize</span>?response_type=code&amp;client_id=…&amp;redirect_uri=…&amp;scope=openid%20profile%20email&amp;code_challenge=…&amp;code_challenge_method=S256&amp;state=…
              {'\n\n'}
              <span className="c"># 3. Exchange the code on your server</span>
              {'\n'}POST <span className="k">/api/oauth/token</span>{'  '}grant_type=authorization_code&amp;code=…&amp;code_verifier=…
              {'\n\n'}
              <span className="c"># 4. Read the profile</span>
              {'\n'}GET <span className="k">/api/oauth/userinfo</span>{'  '}Authorization: Bearer …
            </pre>
          </div>
        </section>

        <section id="apps" className="section">
          <div className="frame">
            <span className="tick tick-tl" />
            <span className="tick tick-tr" />
            <div className="eyebrow hud">
              <p>
                <span className="num">03</span>
                <span className="sep">/</span>Ecosystem
              </p>
              <p className="faint">One login across the family</p>
            </div>
            <div className="section-head">
              <h2>
                Works <span className="serif">everywhere</span> you do.
              </h2>
            </div>
            <div className="grid-lines cols-4">
              {APPS.map((a, i) => (
                <article key={a.name} className="feature">
                  <p className="hud faint">{String(i + 1).padStart(2, '0')}</p>
                  <h3>{a.name}</h3>
                  <p>{a.blurb}</p>
                  <p className="hud faint" style={{ marginTop: '1rem' }}>
                    {a.host}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="frame" style={{ textAlign: 'center', padding: 'clamp(4rem, 10vw, 7rem) var(--gutter)' }}>
            <p className="hud faint">Free · Takes a minute</p>
            <h2 style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', letterSpacing: '-.045em', lineHeight: 0.98, marginTop: '1rem' }}>
              Sign in <span className="serif">once.</span>
            </h2>
            <div className="row" style={{ justifyContent: 'center', marginTop: '2rem' }}>
              <Link className="btn btn-primary btn-lg" href={cfg.allowSignup ? '/signup' : '/login'}>
                {cfg.allowSignup ? 'Create your account' : 'Sign in'}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="frame">
          <div className="footer-bottom hud">
            <span>
              © {new Date().getFullYear()} {BRAND}
            </span>
            <span className="row" style={{ ['--gap' as string]: '1.25rem' }}>
              <Link href="/login">Sign in</Link>
              <Link href="/account">Account</Link>
              <a href="/api/.well-known/openid-configuration">OIDC discovery</a>
            </span>
          </div>
          <div className="footer-giant" aria-hidden>
            <span>{BRAND}</span>
          </div>
        </div>
      </footer>
    </>
  );
}
