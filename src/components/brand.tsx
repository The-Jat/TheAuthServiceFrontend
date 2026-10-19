import Link from 'next/link';
import { BRAND } from '@/lib/brand';

export function Brand({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="brand" aria-label={`${BRAND} home`}>
      <span className="brand-mark" aria-hidden>
        {BRAND.slice(0, 1).toUpperCase()}
      </span>
      <span>{BRAND}</span>
    </Link>
  );
}
