import type { User } from '@supabase/supabase-js';
import type { RemoteTraining } from './sync';
import { supabase } from './supabase';
import type { Session } from './training';

/** Thin layer over Supabase; the merge logic lives in sync.ts. Every call throws when it fails. */
function client() {
  if (!supabase) throw new Error('Accounts are not configured');
  return supabase;
}

const check = ({ error }: { error: { message: string } | null }) => {
  if (error) throw new Error(error.message);
};

export async function fetchAll(): Promise<{ trainings: RemoteTraining[]; favs: string[] }> {
  const db = client();
  const [trainings, favs] = await Promise.all([db.from('trainings').select('id, data, saved_at, deleted_at'), db.from('favorites').select('exercise_id')]);
  check(trainings);
  check(favs);
  return {
    trainings: (trainings.data ?? []).map((r) => ({ id: r.id, data: r.data, savedAt: Number(r.saved_at), deletedAt: r.deleted_at === null ? null : Number(r.deleted_at) })),
    favs: (favs.data ?? []).map((r) => r.exercise_id),
  };
}

export async function upsertTrainings(user: User['id'], sessions: Session[]) {
  const rows = sessions.map((s) => ({
    user_id: user,
    id: s.id,
    data: { date: s.date, team: s.team, theme: s.theme, duration: s.duration, plan: s.plan },
    saved_at: s.savedAt,
    deleted_at: null,
  }));
  check(await client().from('trainings').upsert(rows, { onConflict: 'user_id,id' }));
}

/** Writes tombstones (without content), also for trainings that never reached the account. */
export async function markDeleted(user: User['id'], deleted: { id: string; at: number }[]) {
  const rows = deleted.map(({ id, at }) => ({ user_id: user, id, data: {}, saved_at: at, deleted_at: at }));
  check(await client().from('trainings').upsert(rows, { onConflict: 'user_id,id' }));
}

export async function addFavs(user: User['id'], ids: string[]) {
  const rows = ids.map((exercise_id) => ({ user_id: user, exercise_id }));
  check(await client().from('favorites').upsert(rows, { onConflict: 'user_id,exercise_id', ignoreDuplicates: true }));
}

export async function removeFavs(user: User['id'], ids: string[]) {
  check(await client().from('favorites').delete().eq('user_id', user).in('exercise_id', ids));
}
