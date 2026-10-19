import type { Metadata } from 'next';
import { AppShell } from '@/components/app-shell';

export const metadata: Metadata = { title: 'Your account', robots: { index: false } };

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AppShell area="account">{children}</AppShell>;
}
