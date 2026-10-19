// Minimal 16px line icons (1.4 stroke) matching the ArtCraft hairline style.
type P = { className?: string };
const base = { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, 'aria-hidden': true } as const;

export const IconSun = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="8" cy="8" r="3.25" />
    <path d="M8 1v1.75M8 13.25V15M1 8h1.75M13.25 8H15M3.05 3.05l1.24 1.24M11.71 11.71l1.24 1.24M3.05 12.95l1.24-1.24M11.71 4.29l1.24-1.24" />
  </svg>
);
export const IconMoon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M13.5 9.6A5.75 5.75 0 0 1 6.4 2.5a5.75 5.75 0 1 0 7.1 7.1Z" />
  </svg>
);
export const IconUser = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="8" cy="5.5" r="2.75" />
    <path d="M2.5 14c.8-2.6 3-4 5.5-4s4.7 1.4 5.5 4" />
  </svg>
);
export const IconShield = (p: P) => (
  <svg {...base} {...p}>
    <path d="M8 1.5 13.5 3.5v4c0 3.4-2.3 5.9-5.5 7-3.2-1.1-5.5-3.6-5.5-7v-4L8 1.5Z" />
    <path d="m5.75 8 1.6 1.6 3-3.2" />
  </svg>
);
export const IconGrid = (p: P) => (
  <svg {...base} {...p}>
    <path d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z" />
  </svg>
);
export const IconUsers = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="6" cy="5.5" r="2.5" />
    <path d="M1.5 14c.6-2.3 2.4-3.6 4.5-3.6s3.9 1.3 4.5 3.6M10.5 3.2a2.5 2.5 0 0 1 0 4.6M12 10.6c1.3.5 2.2 1.7 2.5 3.4" />
  </svg>
);
export const IconApps = (p: P) => (
  <svg {...base} {...p}>
    <rect x="2" y="2" width="12" height="12" />
    <path d="M2 5.5h12M4.25 3.75h.01M6 3.75h.01" />
  </svg>
);
export const IconLogs = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 3h10M3 6.33h10M3 9.66h6M3 13h8" />
  </svg>
);
export const IconBell = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 11V7a4 4 0 0 1 8 0v4l1.25 1.5H2.75L4 11ZM6.5 14.25a1.6 1.6 0 0 0 3 0" />
  </svg>
);
export const IconKey = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="5" cy="10.5" r="3" />
    <path d="m7.2 8.3 6.3-6.3M11.5 4l1.75 1.75M9.75 5.75l1.25 1.25" />
  </svg>
);
export const IconLink = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6.5 9.5 9.5 6.5M7 4.5l1.3-1.3a2.83 2.83 0 0 1 4 4L11 8.5M9 11.5l-1.3 1.3a2.83 2.83 0 0 1-4-4L5 7.5" />
  </svg>
);
export const IconArrow = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);
export const IconCopy = (p: P) => (
  <svg {...base} {...p}>
    <rect x="5" y="5" width="9" height="9" />
    <path d="M11 5V2H2v9h3" />
  </svg>
);
export const IconMenu = (p: P) => (
  <svg {...base} {...p}>
    <path d="M2 5h12M2 11h12" />
  </svg>
);
export const IconLogout = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6 2.5H2.5v11H6M10 5l3 3-3 3M13 8H6" />
  </svg>
);
export const IconFingerprint = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4.2 3.6A5.5 5.5 0 0 1 13.5 7.5v1M2.5 9.5V7.5c0-.8.2-1.6.5-2.3M5 13.2c.7-1.3 1-2.7 1-4.2V7.5a2 2 0 0 1 4 0v1.2M8 7.5v1.5c0 2.2-.6 4.2-1.6 5.8M10.6 14c.4-1 .7-2.1.8-3.2" />
  </svg>
);
