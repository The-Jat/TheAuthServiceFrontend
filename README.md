# TheJat Accounts — web

The accounts website at `auth.thejat.in`, in the ArtCraft design language (hairline grid, mono HUD
labels, serif-italic accents, square controls; dark and light themes).

| Route | |
|---|---|
| `/` | Landing page |
| `/login`, `/signup`, `/verify-email`, `/forgot-password`, `/reset-password` | Sign-in flows (password or passkey) |
| `/consent` | Approve a third-party app's access |
| `/error`, `/logged-out` | OIDC error and post-logout pages |
| `/account`, `/account/security`, `/account/apps` | Profile, password, passkeys, sessions, connected apps |
| `/console/*` | Admin: overview, users, apps (OAuth clients), logs, notifications |

The browser talks only to same-origin `/api/*`. In production Caddy routes that to the auth service.
For local development, set `AUTH_API_INTERNAL_URL=http://localhost:4000` and `next dev` proxies it.

```bash
npm ci
AUTH_API_INTERNAL_URL=http://localhost:4000 npm run dev
```

Deployed with the rest of the stack from `the-auth-service/deploy`.
