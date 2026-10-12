import { describe, expect, it } from 'vitest';
import { EXERCISES } from './exercises';
import { emptyPending, isPendingEmpty, mergeFavs, mergeTrainings, readPending, subtractPending, type RemoteTraining } from './sync';
import type { Session } from './training';

const [ex1, ex2] = EXERCISES;

const plan = (...ids: string[]) => ({ wu: ids.map((ex, i) => ({ uid: `i${i}`, ex, min: 10 })), kern: [], pv: [] });

const local = (id: string, savedAt: number, team = 'U11'): Session => ({ id, date: '2026-09-29', team, theme: 'Dribbelen', duration: 90, plan: plan(ex1.id), savedAt });

const remote = (id: string, savedAt: number, team = 'U13', deletedAt: number | null = null, data?: unknown): RemoteTraining => ({
  id,
  savedAt,
  deletedAt,
  data: data ?? { date: '2026-10-01', team, theme: 'Dribbelen', duration: 75, plan: plan(ex2.id) },
});

describe('mergeTrainings', () => {
  it('keeps a new local training and uploads it', () => {
    const l = local('a', 5);
    const r = mergeTrainings([l], []);
    expect(r.merged).toEqual([l]);
    expect(r.push).toEqual([l]);
  });

  it('takes a training that is new in the account', () => {
    const r = mergeTrainings([], [remote('b', 7)]);
    expect(r.merged).toHaveLength(1);
    expect(r.merged[0]).toMatchObject({ id: 'b', team: 'U13', duration: 75, savedAt: 7 });
    expect(r.push).toEqual([]);
  });

  it('lets the newest savedAt win', () => {
    const newerRemote = mergeTrainings([local('a', 5)], [remote('a', 9)]);
    expect(newerRemote.merged[0]).toMatchObject({ team: 'U13', savedAt: 9 });
    expect(newerRemote.push).toEqual([]);
    expect(newerRemote.changed).toEqual(['a']);

    const newerLocal = mergeTrainings([local('a', 9)], [remote('a', 5)]);
    expect(newerLocal.merged[0]).toMatchObject({ team: 'U11', savedAt: 9 });
    expect(newerLocal.push.map((s) => s.id)).toEqual(['a']);
    expect(newerLocal.changed).toEqual([]);
  });

  it('does nothing for identical saves', () => {
    const r = mergeTrainings([local('a', 5)], [remote('a', 5)]);
    expect(r.merged[0].team).toBe('U11');
    expect(r.push).toEqual([]);
  });

  it('removes a local training that was deleted elsewhere (tombstone wins)', () => {
    const r = mergeTrainings([local('a', 5)], [remote('a', 5, 'U13', 8, {})]);
    expect(r.merged).toEqual([]);
    expect(r.changed).toEqual(['a']);
    expect(r.push).toEqual([]);
  });

  it('keeps a local training saved after the deletion (tombstone loses) and uploads it again', () => {
    const r = mergeTrainings([local('a', 12)], [remote('a', 5, 'U13', 8, {})]);
    expect(r.merged.map((s) => s.id)).toEqual(['a']);
    expect(r.push.map((s) => s.id)).toEqual(['a']);
  });

  it('ignores a tombstone for a training this browser never had', () => {
    expect(mergeTrainings([], [remote('z', 5, 'U13', 8, {})]).merged).toEqual([]);
  });

  it('drops unknown exercises and unusable rows from the account', () => {
    const r = mergeTrainings(
      [],
      [
        remote('a', 5, 'U13', null, { date: '2026-10-01', team: 'X', theme: 'Dribbelen', duration: 90, plan: plan('bestaat-niet', ex1.id) }),
        remote('b', 5, 'U13', null, { date: 'kapot' }),
        remote('c', 5, 'U13', null, 'junk'),
      ],
    );
    expect(r.merged.map((s) => s.id)).toEqual(['a']);
    expect(r.merged[0].plan.wu.map((i) => i.ex)).toEqual([ex1.id]);
  });

  it('ignores the account copy of a training whose deletion is still pending', () => {
    const r = mergeTrainings([], [remote('a', 5)], new Set(['a']));
    expect(r.merged).toEqual([]);
  });
});

describe('mergeFavs', () => {
  it('combines local and remote on first link and uploads the local ones', () => {
    const r = mergeFavs([ex1.id], [ex2.id], { mode: 'link' });
    expect(new Set(r.merged)).toEqual(new Set([ex1.id, ex2.id]));
    expect(r.push).toEqual([ex1.id]);
  });

  it('follows the account on refresh, so removals elsewhere stick', () => {
    const r = mergeFavs([ex1.id, ex2.id], [ex2.id], { mode: 'refresh' });
    expect(r.merged).toEqual([ex2.id]);
    expect(r.push).toEqual([]);
  });

  it('keeps unsent changes on refresh', () => {
    const r = mergeFavs([ex1.id], [ex2.id], { mode: 'refresh', pendingAdd: [ex1.id], pendingRemove: [ex2.id] });
    expect(r.merged).toEqual([ex1.id]);
    expect(r.push).toEqual([ex1.id]);
  });

  it('drops ids of exercises that no longer exist', () => {
    expect(mergeFavs([], ['bestaat-niet', ex1.id, 5], { mode: 'link' }).merged).toEqual([ex1.id]);
  });
});

describe('pending changes', () => {
  it('validates stored data', () => {
    expect(isPendingEmpty(readPending(null))).toBe(true);
    expect(readPending({ up: ['a', 1], del: [{ id: 'b', at: 3 }, { id: 4 }], favAdd: 'x', favDel: ['y'] })).toEqual({ up: ['a'], del: [{ id: 'b', at: 3 }], favAdd: [], favDel: ['y'] });
  });

  it('subtracts what was sent', () => {
    const pending = { ...emptyPending(), up: ['a', 'b'], del: [{ id: 'c', at: 1 }] };
    expect(subtractPending(pending, { ...emptyPending(), up: ['a'], del: [{ id: 'c', at: 1 }] })).toEqual({ ...emptyPending(), up: ['b'] });
  });
});
