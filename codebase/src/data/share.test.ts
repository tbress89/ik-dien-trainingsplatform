import { describe, expect, it } from 'vitest';
import { decodeTraining, encodeTraining, type SharedTraining } from './share';

const training: SharedTraining = {
  date: '2026-10-01',
  team: 'U11 Rangers – Émile’s ploeg',
  theme: 'Afwerken',
  duration: 75,
  plan: {
    wu: [{ uid: 'a', ex: 'rondo', min: 15 }],
    kern: [
      { uid: 'b', ex: 'fshot', min: 20 },
      { uid: 'c', ex: 'fcross', min: 20 },
    ],
    pv: [{ uid: 'd', ex: 'game5', min: 20 }],
  },
};

/** A code as an older or tampered link could contain it. */
const code = (payload: unknown) => btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const exercises = (t: SharedTraining | null) =>
  t && {
    wu: t.plan.wu.map((i) => `${i.ex}:${i.min}`),
    kern: t.plan.kern.map((i) => `${i.ex}:${i.min}`),
    pv: t.plan.pv.map((i) => `${i.ex}:${i.min}`),
  };

describe('share links', () => {
  it('survive a round trip', () => {
    const back = decodeTraining(encodeTraining(training));
    expect(back).toMatchObject({ date: training.date, team: training.team, theme: training.theme, duration: training.duration });
    expect(exercises(back)).toEqual(exercises(training));
  });

  it('only use characters that are safe in a URL', () => {
    expect(encodeTraining(training)).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('stay short enough to send in a chat message', () => {
    expect(encodeTraining(training).length).toBeLessThan(400);
  });

  it('are rejected when they are not a valid link', () => {
    expect(decodeTraining('')).toBeNull();
    expect(decodeTraining('not-a-training')).toBeNull();
    expect(decodeTraining(code({ hello: 'world' }))).toBeNull();
    expect(decodeTraining(code([2, '2026-10-01', '', 'Afwerken', 60, [], [], []]))).toBeNull();
    expect(decodeTraining(code([1, 'tomorrow', '', 'Afwerken', 60, [], [], []]))).toBeNull();
  });

  it('drop exercises that no longer exist and round minutes to steps of 5', () => {
    const t = decodeTraining(
      code([
        1,
        '2026-10-01',
        'U9',
        'Afwerken',
        60,
        [['rondo', 12]],
        [
          ['gone', 10],
          ['fshot', 200],
        ],
        [['game5', 'x']],
      ]),
    );
    expect(exercises(t)).toEqual({ wu: ['rondo:10'], kern: ['fshot:45'], pv: ['game5:20'] });
  });

  it('fall back to a known theme and duration', () => {
    const t = decodeTraining(code([1, '2026-10-01', 'U9', 'Onbekend thema', 45, [], [], []]));
    expect(t?.theme).toBe('Omschakelen');
    expect(t?.duration).toBe(90);
  });
});
