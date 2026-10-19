'use client';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: any,
  ) {
    super(message);
  }
}

/** Same-origin call to the auth API (Caddy routes /api to the NestJS service). */
export async function api<T = any>(path: string, init: { method?: string; body?: unknown; signal?: AbortSignal } = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: init.method ?? (init.body !== undefined ? 'POST' : 'GET'),
    headers: init.body !== undefined ? { 'content-type': 'application/json' } : undefined,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    credentials: 'same-origin',
    cache: 'no-store',
    signal: init.signal,
  });
  const text = await res.text();
  let body: any = undefined;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const message = body?.message ?? body?.error_description ?? (res.status >= 500 ? 'Something went wrong. Please try again.' : `Request failed (${res.status}).`);
    throw new ApiError(message, res.status, body);
  }
  return body as T;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  status: 'active' | 'disabled';
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface Me {
  user: PublicUser;
  hasPassword: boolean;
  passkeyCount: number;
  sessionId: string;
}

export interface PublicConfig {
  brandName: string;
  allowSignup: boolean;
  requireVerifiedEmail: boolean;
}
