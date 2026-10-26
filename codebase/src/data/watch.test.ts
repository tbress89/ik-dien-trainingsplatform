import { describe, expect, it } from 'vitest';
import watchSampleText from '../../../watch/Engine/Sources/IkDienEngine/Resources/SampleTraining.json?raw';
import { EXERCISE_DETAILS } from './exerciseDetails';
import type { SharedTraining } from './share';
import { WATCH_PAYLOAD_VERSION, watchPayload } from './watch';

/** The training bundled with the watch app, which was written by hand in the watch's format. */
const watchSample = JSON.parse(watchSampleText);

const sample: SharedTraining = {
  date: '2026-10-27',
  team: ' U11 ',
  theme: 'Positiespel',
  duration: 75,
  plan: {
    wu: [{ uid: 'i1', ex: 'rondo', min: 15 }],
    kern: [
      { uid: 'i2', ex: 'pass', min: 15 },
      { uid: 'i3', ex: 'pos', min: 15 },
      { uid: 'i4', ex: 'fin', min: 10 },
    ],
    pv: [{ uid: 'i5', ex: 'game5', min: 20 }],
  },
};

describe('watch payload', () => {
  it('matches the format the watch app decodes', () => {
    // The same training built by the site must equal the watch's own sample, field for field.
    expect(watchPayload(sample, EXERCISE_DETAILS)).toEqual(watchSample);
    expect(watchSample.version).toBe(WATCH_PAYLOAD_VERSION);
  });

  it('keeps the block order of the training', () => {
    const shuffled: SharedTraining = { ...sample, plan: { pv: sample.plan.pv, wu: sample.plan.wu, kern: sample.plan.kern } };
    expect(watchPayload(shuffled, null).items.map((i) => i.block)).toEqual(['wu', 'kern', 'kern', 'kern', 'pv']);
  });

  it('works before the coaching text has loaded', () => {
    expect(watchPayload(sample, null).items.every((i) => i.coaching.length === 0)).toBe(true);
  });

  it('drops exercises that no longer exist', () => {
    const old: SharedTraining = { ...sample, plan: { ...sample.plan, wu: [{ uid: 'x', ex: 'gone', min: 10 }, ...sample.plan.wu] } };
    expect(watchPayload(old, null).items.map((i) => i.id)).toEqual(['i1', 'i2', 'i3', 'i4', 'i5']);
  });

  it('stays well under the size the database accepts', () => {
    const big: SharedTraining = { ...sample, plan: { wu: [], pv: [], kern: Array.from({ length: 12 }, (_, i) => ({ uid: `k${i}`, ex: 'pos', min: 5 })) } };
    expect(JSON.stringify(watchPayload(big, EXERCISE_DETAILS)).length).toBeLessThan(32768);
  });
});
