import type { SearchParams } from '@/lib/server';
import { first } from '@/lib/util';
import { LogsView } from './logs-view';

export default async function LogsPage({ searchParams }: { searchParams: SearchParams }) {
  return <LogsView initialQuery={first((await searchParams).q)?.slice(0, 200) ?? ''} />;
}
