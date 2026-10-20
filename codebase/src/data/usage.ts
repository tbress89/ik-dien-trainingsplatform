import { supabase } from './supabase';

/** What gets counted: an exercise page (item = exercise id) or a training given ('eigen' or 'gedeeld'). */
export type UsageKind = 'oefening' | 'geven';

/**
 * Anonymous usage counts: one daily total per item in the `usage_counts` table, nothing per visitor (no
 * cookies, no storage, no ids). Each key counts once per page load, so going back and forth between pages
 * or React's double effects in development don't inflate the numbers.
 */
export function createCounter(send: (kind: UsageKind, item: string) => Promise<void>) {
  const counted = new Set<string>();
  return (kind: UsageKind, item: string, key = item) => {
    const k = `${kind}:${key}`;
    if (counted.has(k)) return;
    counted.add(k);
    send(kind, item).catch(() => {});
  };
}

export const countUsage = createCounter(async (kind, item) => {
  if (!supabase) return;
  const { error } = await supabase.rpc('count_usage', { p_kind: kind, p_item: item });
  if (error) console.debug('Gebruik tellen mislukt', error.message);
});
