import Link from 'next/link';
import { AuthHeading, AuthShell } from '@/components/auth-shell';

export default function NotFound() {
  return (
    <AuthShell>
      <AuthHeading eyebrow="404" title="Nothing at this" accent="address." sub="The page you’re looking for doesn’t exist or has moved." />
      <Link className="btn btn-primary btn-lg btn-block" href="/">
        Go home
      </Link>
    </AuthShell>
  );
}
