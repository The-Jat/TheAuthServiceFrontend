'use client';

import { IconMoon, IconSun } from './icons';

/** Inline script for <head>: applies the saved/OS theme before first paint. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('tj-theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','dark')}})()`;

export function ThemeToggle({ className = 'nav-btn' }: { className?: string }) {
  function toggle() {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('tj-theme', next);
    } catch {}
  }
  return (
    <button type="button" className={className} onClick={toggle} aria-label="Toggle light and dark theme">
      <IconSun className="theme-moon" />
      <IconMoon className="theme-sun" />
    </button>
  );
}
