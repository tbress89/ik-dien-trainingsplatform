import { readFavs, readTrainings, type Session } from './training';

/** A row of the `trainings` table, as the sync layer sees it. */
export interface RemoteTraining {
  id: string;
  /** `{ date, team, theme, duration, plan }`; unvalidated until it goes through `readTrainings`. */
  data: unknown;
  savedAt: number;
  /** Set (ms since epoch) when the training was deleted. */
  deletedAt: number | null;
}

export interface TrainingMerge {
  /** The trainings to keep, in local order with new remote ones appended. */
  merged: Session[];
  /** Trainings that are new or newer locally and have to be uploaded. */
  push: Session[];
  /** Ids whose content now comes from the account, or that were removed because they were deleted elsewhere. */
  changed: string[];
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

/** Validates a remote row like stored data: null when it's unusable (unknown shape, invalid date, …). */
function readRemote(r: RemoteTraining): Session | null {
  const data = isRecord(r.data) ? r.data : {};
  return readTrainings([{ ...data, id: r.id, savedAt: r.savedAt }])[0] ?? null;
}

/**
 * Merges the trainings in this browser with the ones in the account. Per id the newest `savedAt` wins; a
 * tombstone removes a training unless the local copy was saved after the deletion. Remote data is validated
 * like localStorage data, so exercises that no longer exist are dropped. `skip` holds ids with a deletion
 * that hasn't been uploaded yet: the remote copy of those is ignored.
 */
export function mergeTrainings(local: Session[], remote: RemoteTraining[], skip: ReadonlySet<string> = new Set()): TrainingMerge {
  const remoteById = new Map(remote.filter((r) => !skip.has(r.id)).map((r) => [r.id, r]));
  const merged: Session[] = [];
  const push: Session[] = [];
  const changed: string[] = [];

  for (const s of local) {
    const r = remoteById.get(s.id);
    remoteById.delete(s.id);
    if (!r) {
      merged.push(s);
      push.push(s);
    } else if (r.deletedAt !== null && r.deletedAt >= s.savedAt) {
      changed.push(s.id);
    } else if (r.deletedAt !== null) {
      merged.push(s);
      push.push(s);
    } else if (r.savedAt > s.savedAt) {
      const fromRemote = readRemote(r);
      if (fromRemote) {
        merged.push(fromRemote);
        changed.push(s.id);
      } else {
        merged.push(s);
      }
    } else {
      merged.push(s);
      if (s.savedAt > r.savedAt) push.push(s);
    }
  }

  for (const r of remoteById.values()) {
    if (r.deletedAt !== null) continue;
    const fromRemote = readRemote(r);
    if (fromRemote) merged.push(fromRemote);
  }
  return { merged, push, changed };
}

export interface FavMerge {
  merged: string[];
  /** Ids that have to be added to the account. */
  push: string[];
}

export interface FavMergeOptions {
  /**
   * 'link': first time this account is used in this browser, so local and remote are combined.
   * 'refresh': the account is the truth (a missing id was removed elsewhere), apart from unsent changes.
   */
  mode: 'link' | 'refresh';
  /** Additions and removals that haven't reached the account yet. */
  pendingAdd?: readonly string[];
  pendingRemove?: readonly string[];
}

/** Merges saved exercise ids; remote ids go through `readFavs`, so removed exercises are dropped. */
export function mergeFavs(local: string[], remote: unknown, { mode, pendingAdd = [], pendingRemove = [] }: FavMergeOptions): FavMerge {
  const remoteIds = readFavs(remote);
  const removed = new Set(pendingRemove);
  const wanted = new Set([...remoteIds, ...pendingAdd, ...(mode === 'link' ? local : [])]);
  for (const id of removed) wanted.delete(id);
  const merged = [...local.filter((id) => wanted.has(id)), ...[...wanted].filter((id) => !local.includes(id))];
  const remoteSet = new Set(remoteIds);
  return { merged, push: merged.filter((id) => !remoteSet.has(id)) };
}

/** Changes that haven't reached the account yet (kept in `ikdien:sync-pending`, retried when back online). */
export interface Pending {
  /** Ids of trainings to upload. */
  up: string[];
  /** Deleted trainings, with the time of deletion. */
  del: { id: string; at: number }[];
  favAdd: string[];
  favDel: string[];
}

export const emptyPending = (): Pending => ({ up: [], del: [], favAdd: [], favDel: [] });

export const isPendingEmpty = (p: Pending) => !p.up.length && !p.del.length && !p.favAdd.length && !p.favDel.length;

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

/** Validates stored pending changes; anything malformed becomes empty. */
export function readPending(stored: unknown): Pending {
  if (!isRecord(stored)) return emptyPending();
  const del = Array.isArray(stored.del)
    ? stored.del.filter((d): d is { id: string; at: number } => isRecord(d) && typeof d.id === 'string' && typeof d.at === 'number' && Number.isFinite(d.at))
    : [];
  return { up: strings(stored.up), del: del.map(({ id, at }) => ({ id, at })), favAdd: strings(stored.favAdd), favDel: strings(stored.favDel) };
}

/** `pending` without the changes in `sent`. */
export function subtractPending(pending: Pending, sent: Pending): Pending {
  const delIds = new Set(sent.del.map((d) => d.id));
  return {
    up: pending.up.filter((id) => !sent.up.includes(id)),
    del: pending.del.filter((d) => !delIds.has(d.id)),
    favAdd: pending.favAdd.filter((id) => !sent.favAdd.includes(id)),
    favDel: pending.favDel.filter((id) => !sent.favDel.includes(id)),
  };
}
