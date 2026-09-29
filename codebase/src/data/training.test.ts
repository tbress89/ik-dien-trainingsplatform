import { describe, expect, it } from 'vitest';
import {
  clampMinutes,
  daysBetween,
  formatTrainingDate,
  hasExercises,
  lastTeam,
  readConcept,
  readFavs,
  readTrainings,
  relativeDay,
  sameTraining,
  type Session,
} from './training';

/**
 * Trainings and bookmarks live in the browser's localStorage, so the app must cope with whatever it finds
 * there: older formats, exercises that were removed since, or plain junk.
 */
describe('stored trainings', () => {
  const good = {
    id: 't1',
    date: '2026-09-29',
    team: '  U11 Rangers ',
    theme: 'Dribbelen',
    duration: 60,
    plan: { wu: [{ uid: 'i1', ex: 'dbox', min: 10 }], kern: [], pv: [] },
    savedAt: 5,
  };

  it('keeps a valid training as it was saved (with the team name trimmed)', () => {
    const [t] = readTrainings([good]);
    expect(t).toMatchObject({ id: 't1', date: '2026-09-29', team: 'U11 Rangers', theme: 'Dribbelen', duration: 60, savedAt: 5 });
    expect(t.plan.wu).toEqual([{ uid: 'i1', ex: 'dbox', min: 10 }]);
  });

  it('ignores anything that is not a list of trainings', () => {
    expect(readTrainings(null)).toEqual([]);
    expect(readTrainings({ t1: good })).toEqual([]);
    expect(readTrainings('[]')).toEqual([]);
  });

  it('skips entries without an id or a valid date, and duplicate ids', () => {
    const list = readTrainings([
      good,
      { ...good, id: 't1', team: 'copy' },
      { ...good, id: 't2', date: '29/09/2026' },
      { ...good, id: undefined },
      42,
      null,
    ]);
    expect(list.map((t: Session) => t.id)).toEqual(['t1']);
  });

  it('drops exercises that no longer exist and repairs minutes', () => {
    const [t] = readTrainings([
      {
        ...good,
        plan: {
          wu: [
            { uid: 'a', ex: 'removed-exercise', min: 10 },
            { uid: 'b', ex: 'dbox', min: 12 },
          ],
          kern: [{ ex: 'duel', min: 'lang' }],
          pv: 'geen lijst',
        },
      },
    ]);
    expect(t.plan.wu.map((i) => [i.ex, i.min])).toEqual([['dbox', 10]]);
    expect(t.plan.kern[0].ex).toBe('duel');
    expect(t.plan.kern[0].min % 5).toBe(0);
    expect(t.plan.kern[0].uid).toBeTruthy();
    expect(t.plan.pv).toEqual([]);
  });

  it('falls back to a known theme and duration', () => {
    const [t] = readTrainings([{ ...good, theme: 'Iets anders', duration: 42 }]);
    expect(t.theme).toBe('Omschakelen');
    expect(t.duration).toBe(90);
  });
});

describe('stored bookmarks', () => {
  it('keep only ids of existing exercises', () => {
    expect(readFavs(['rondo', 'removed-exercise', 3, 'duel'])).toEqual(['rondo', 'duel']);
    expect(readFavs('rondo')).toEqual([]);
  });
});

describe('training helpers', () => {
  it('keep minutes between 5 and 45', () => {
    expect([clampMinutes(0), clampMinutes(20), clampMinutes(60)]).toEqual([5, 20, 45]);
  });

  it('say how far away a training is', () => {
    expect(daysBetween('2026-09-29', '2026-10-01')).toBe(2);
    expect(daysBetween('2026-09-29', '2026-09-28')).toBe(-1);
    // Across the switch to winter time, a day still counts as one.
    expect(daysBetween('2026-10-24', '2026-10-26')).toBe(2);
    expect([
      relativeDay('2026-09-29', '2026-09-29'),
      relativeDay('2026-09-30', '2026-09-29'),
      relativeDay('2026-10-02', '2026-09-29'),
    ]).toEqual(['vandaag', 'morgen', 'over 3 dagen']);
  });

  it('write dates in Dutch', () => {
    expect(formatTrainingDate('2026-09-29')).toBe('dinsdag 29 september');
    expect(formatTrainingDate('2027-01-03')).toBe('zondag 3 januari');
  });

  it('take the team of the most recently saved training', () => {
    const s = (team: string, savedAt: number) => ({ team, savedAt }) as Session;
    expect(lastTeam([s('U9', 1), s('U11', 3), s('U13', 2)])).toBe('U11');
    expect(lastTeam([])).toBe('');
  });
});

describe('autosave and the unsaved-training safety net', () => {
  const base = {
    date: '2026-09-29',
    team: 'U11',
    theme: 'Dribbelen' as const,
    duration: 60 as const,
    plan: { wu: [{ uid: 'a', ex: 'dbox', min: 10 }], kern: [], pv: [] },
  };

  it('see two trainings with the same content as the same (ids and spacing in the team name do not count)', () => {
    expect(sameTraining(base, { ...base, team: ' U11 ', plan: { ...base.plan, wu: [{ uid: 'other', ex: 'dbox', min: 10 }] } })).toBe(true);
  });

  it('notice every change that should be saved', () => {
    expect(sameTraining(base, { ...base, date: '2026-10-01' })).toBe(false);
    expect(sameTraining(base, { ...base, team: 'U13' })).toBe(false);
    expect(sameTraining(base, { ...base, theme: 'Afwerken' })).toBe(false);
    expect(sameTraining(base, { ...base, duration: 75 })).toBe(false);
    expect(sameTraining(base, { ...base, plan: { ...base.plan, wu: [{ uid: 'a', ex: 'dbox', min: 15 }] } })).toBe(false);
    expect(sameTraining(base, { ...base, plan: { wu: [], kern: [{ uid: 'a', ex: 'dbox', min: 10 }], pv: [] } })).toBe(false);
  });

  it('know whether a training has exercises', () => {
    expect(hasExercises(base)).toBe(true);
    expect(hasExercises({ plan: { wu: [], kern: [], pv: [] } })).toBe(false);
  });

  it('restore a stored unsaved training as a new one (without an id)', () => {
    const t = readConcept(base);
    expect(t?.id).toBeNull();
    expect(t && sameTraining(t, base)).toBe(true);
  });

  it('ignore a stored unsaved training that is empty or broken', () => {
    expect(readConcept({ ...base, plan: { wu: [], kern: [], pv: [] } })).toBeNull();
    expect(readConcept({ ...base, plan: { wu: [{ ex: 'removed-exercise', min: 10 }] } })).toBeNull();
    expect(readConcept({ ...base, date: 'morgen' })).toBeNull();
    expect(readConcept(null)).toBeNull();
    expect(readConcept('training')).toBeNull();
  });
});
