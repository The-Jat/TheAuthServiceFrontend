'use client';

import { useId, useState } from 'react';
import { passwordScore } from '@/lib/util';

export function Alert({ kind = 'error', children }: { kind?: 'error' | 'success' | 'info' | 'warn'; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className={`alert alert-${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}

export function Field({
  label,
  hint,
  aside,
  ...input
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: React.ReactNode; aside?: React.ReactNode }) {
  const id = useId();
  return (
    <div className="field">
      <div className="label-row">
        <label className="label" htmlFor={id}>
          {label}
        </label>
        {aside}
      </div>
      <input id={id} className="input" {...input} />
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}

export function PasswordField({ label = 'Password', showMeter, aside, ...input }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; showMeter?: boolean; aside?: React.ReactNode }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const value = String(input.value ?? '');
  const score = passwordScore(value);
  const colors = ['var(--danger)', 'var(--danger)', 'var(--warning)', 'var(--accent)', 'var(--success)'];
  return (
    <div className="field">
      <div className="label-row">
        <label className="label" htmlFor={id}>
          {label}
        </label>
        {aside ?? (
          <button type="button" className="link hud" style={{ textDecoration: 'none' }} onClick={() => setVisible((v) => !v)}>
            {visible ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      <input id={id} className="input" type={visible ? 'text' : 'password'} {...input} />
      {showMeter && (
        <>
          <div className="strength" style={{ ['--strength' as string]: colors[score] }} aria-hidden>
            {[1, 2, 3, 4].map((i) => (
              <i key={i} className={score >= i ? 'on' : ''} />
            ))}
          </div>
          <span className="hint">At least 10 characters. A short phrase of random words works well.</span>
        </>
      )}
    </div>
  );
}

export function Submit({ busy, children, className = 'btn btn-primary btn-lg btn-block', ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }) {
  return (
    <button type="submit" className={className} disabled={busy || rest.disabled} {...rest}>
      {busy ? <span className="spinner" aria-label="Working" /> : children}
    </button>
  );
}

export function Modal({ title, onClose, children, footer }: { title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()} role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
        <div className="panel-head">
          <h2>{title}</h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">
            Close
          </button>
        </div>
        <div className="panel-body stack">{children}</div>
        {footer && <div className="panel-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-sm"
      onClick={async () => {
        await navigator.clipboard.writeText(value).catch(() => undefined);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? 'Copied' : label}
    </button>
  );
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="empty">
      <p className="serif">{title}</p>
      {children && <p>{children}</p>}
    </div>
  );
}

/** Tiny bar chart for daily/hourly series. */
export function Bars({ data, label }: { data: { key: string; value: number; tone?: 'warn' | 'err' }[]; label?: [string, string] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <>
      <div className="bars" role="img" aria-label={`Chart: ${data.map((d) => `${d.key} ${d.value}`).join(', ')}`}>
        {data.map((d) => (
          <div key={d.key} title={`${d.key}: ${d.value}`}>
            <i className={d.tone ?? ''} style={{ height: `${(d.value / max) * 100}%` }} />
          </div>
        ))}
      </div>
      {label && (
        <div className="bars-axis hud">
          <span>{label[0]}</span>
          <span>{label[1]}</span>
        </div>
      )}
    </>
  );
}
