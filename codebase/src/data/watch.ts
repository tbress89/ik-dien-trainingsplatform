import { EXERCISE_BY_ID, type ExerciseDetail } from './exercises';
import type { SharedTraining } from './share';
import { supabase } from './supabase';
import { BLOCKS, type BlockId } from './training';

/**
 * "Naar horloge": a training as the Apple Watch app reads it (`TrainingPlan` in watch/Engine). It is
 * self-contained — titles, minutes and coaching points included — so the watch never needs the exercise
 * catalogue, and a later change on the site can't break a training that's already on a watch.
 * Bump the version only together with the watch app, which refuses versions it doesn't know.
 */
export const WATCH_PAYLOAD_VERSION = 1;

export interface WatchItem {
  id: string;
  exercise: string;
  block: BlockId;
  title: string;
  minutes: number;
  coaching: string[];
  players?: string;
  field?: string;
}

export interface WatchPayload {
  version: number;
  date: string;
  team: string;
  theme: string;
  items: WatchItem[];
}

/** The training for the watch; `details` adds the coaching points (without them the list stays empty). */
export function watchPayload(training: SharedTraining, details: Record<string, ExerciseDetail> | null): WatchPayload {
  const items = BLOCKS.flatMap((b) =>
    training.plan[b.id].flatMap((it): WatchItem[] => {
      const e = EXERCISE_BY_ID[it.ex];
      if (!e) return [];
      return [
        {
          id: it.uid,
          exercise: it.ex,
          block: b.id,
          title: e.title,
          minutes: it.min,
          coaching: details?.[it.ex]?.coaching ?? [],
          players: e.playersDetail ? `${e.players} ${e.playersDetail}` : e.players,
          field: e.field,
        },
      ];
    }),
  );
  return { version: WATCH_PAYLOAD_VERSION, date: training.date, team: training.team.trim(), theme: training.theme, items };
}

export interface WatchCode {
  code: string;
  /** When the code stops working (ms since epoch). */
  expiresAt: number;
}

/** Stores the training for the watch and returns its 4-digit code (see supabase/migrations/0003). */
export async function createWatchCode(payload: WatchPayload): Promise<WatchCode> {
  if (!supabase) throw new Error('Naar horloge is not configured');
  const { data, error } = await supabase.rpc('create_watch_code', { p_payload: payload });
  if (error) throw new Error(error.message);
  const row = (Array.isArray(data) ? data[0] : data) as { code?: unknown; expires_at?: unknown } | null;
  if (typeof row?.code !== 'string' || typeof row.expires_at !== 'string') throw new Error('Unexpected answer');
  return { code: row.code, expiresAt: Date.parse(row.expires_at) };
}
