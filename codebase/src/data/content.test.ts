import { describe, expect, it } from 'vitest';
import { AGES, EXERCISE_BY_ID, EXERCISES, PHASES, THEMES, TYPES, type AgeGroup } from './exercises';
import { EXERCISE_DETAILS } from './exerciseDetails';
import { RECOMMENDED } from './recommended';
import { REFERENCE_TRAININGS } from './referenceTrainings';
import { BLOCKS, BLOCK_TARGETS, DURATIONS } from './training';

/**
 * Content rules for the exercise data. These are the mistakes that are easy to make when adding or
 * editing exercises by hand, and that would otherwise only show up as a broken page on the live site.
 */

const ids = EXERCISES.map((e) => e.id);
const idSet = new Set(ids);
const duplicates = (list: string[]) => [...new Set(list.filter((x, i) => list.indexOf(x) !== i))];

/** "U10 – U21" → [10, 21], "U8" → [8, 8], "Alle" → null. */
function ageRange(label: string): [number, number] | null {
  const nums = [...label.matchAll(/U(\d+)/g)].map((m) => Number(m[1]));
  if (nums.length === 0) return null;
  return [Math.min(...nums), Math.max(...nums)];
}
const BUCKET: Record<AgeGroup, [number, number]> = { 'U6–9': [6, 9], 'U10–13': [10, 13], 'U14–15': [14, 15], 'U16–21': [16, 21] };

describe('exercises', () => {
  it('have unique ids', () => {
    expect(duplicates(ids)).toEqual([]);
  });

  it('have ids that are safe in a URL', () => {
    expect(ids.filter((id) => !/^[a-z0-9]+$/.test(id))).toEqual([]);
  });

  it('last a multiple of 5 minutes', () => {
    expect(EXERCISES.filter((e) => e.min % 5 !== 0 || e.min < 5).map((e) => `${e.id} (${e.min} min)`)).toEqual([]);
  });

  it('use known types, phases and themes', () => {
    const types = TYPES.map((t) => t.name as string);
    const phases = [...PHASES, 'Algemeen'] as string[];
    const bad = EXERCISES.flatMap((e) => [
      ...(types.includes(e.type) ? [] : [`${e.id}: type ${e.type}`]),
      ...(phases.includes(e.phase) ? [] : [`${e.id}: phase ${e.phase}`]),
      ...(e.themes.length === 0 ? [`${e.id}: no themes`] : []),
      ...e.themes.filter((t) => !THEMES.includes(t)).map((t) => `${e.id}: theme ${t}`),
    ]);
    expect(bad).toEqual([]);
  });

  it('have age filter buckets that cover their age label', () => {
    const bad = EXERCISES.flatMap((e) => {
      if (e.ages.some((a) => !AGES.includes(a))) return [`${e.id}: unknown age group`];
      const range = ageRange(e.ageLabel);
      const needed = range ? AGES.filter((a) => BUCKET[a][0] <= range[1] && BUCKET[a][1] >= range[0]) : AGES;
      const missing = needed.filter((a) => !e.ages.includes(a));
      return missing.length ? [`${e.id} (${e.ageLabel}) is missing ${missing.join(', ')}`] : [];
    });
    expect(bad).toEqual([]);
  });

  it('have sensible numbers', () => {
    const bad = EXERCISES.filter(
      (e) => !(e.pmin >= 1) || ![1, 2, 3].includes(e.diff) || !(e.intensity >= 1 && e.intensity <= 5) || !e.title.trim(),
    ).map((e) => e.id);
    expect(bad).toEqual([]);
  });
});

describe('exercise details', () => {
  it('exist for every exercise, and only for exercises', () => {
    const detailIds = Object.keys(EXERCISE_DETAILS);
    expect(ids.filter((id) => !(id in EXERCISE_DETAILS))).toEqual([]);
    expect(detailIds.filter((id) => !idSet.has(id))).toEqual([]);
  });

  it('have a summary, steps, variations, objectives and coaching points', () => {
    const bad = ids.filter((id) => {
      const d = EXERCISE_DETAILS[id];
      return (
        !d.summary.trim() ||
        d.steps.length === 0 ||
        !d.easier.trim() ||
        !d.harder.trim() ||
        d.objectives.length === 0 ||
        d.coaching.length === 0
      );
    });
    expect(bad).toEqual([]);
  });

  it('have step titles ending in a period', () => {
    const bad = ids.flatMap((id) => EXERCISE_DETAILS[id].steps.filter((s) => !s.title.endsWith('.')).map((s) => `${id}: ${s.title}`));
    expect(bad).toEqual([]);
  });

  it('link to existing exercises under "Past goed bij", never to themselves', () => {
    const bad = ids.flatMap((id) =>
      EXERCISE_DETAILS[id].related.filter((r) => !idSet.has(r.id) || r.id === id).map((r) => `${id} → ${r.id}`),
    );
    expect(bad).toEqual([]);
  });

  it('credit their source with a valid link, and a valid YouTube video and start time', () => {
    const bad = ids.flatMap((id) => {
      const s = EXERCISE_DETAILS[id].source;
      if (!s) return [];
      const problems = [];
      if (!s.label.trim()) problems.push('no label');
      if (!/^https:\/\//.test(s.url)) problems.push(`url ${s.url}`);
      if (s.youtube && !/^[A-Za-z0-9_-]{11}$/.test(s.youtube.id)) problems.push(`youtube id ${s.youtube.id}`);
      if (s.youtube?.start !== undefined && !(Number.isInteger(s.youtube.start) && s.youtube.start >= 0)) problems.push(`start ${s.youtube.start}`);
      return problems.map((p) => `${id}: ${p}`);
    });
    expect(bad).toEqual([]);
  });

  it('have versions that start with the exercise itself, each with a name, text and its own diagram', () => {
    const bad = ids.flatMap((id) => {
      const versions = EXERCISE_DETAILS[id].versions;
      if (!versions) return [];
      const problems = [];
      if (versions.length < 2) problems.push('fewer than two versions');
      if (versions[0]?.variant !== EXERCISE_BY_ID[id].variant) problems.push('first version is not the exercise diagram');
      if (new Set(versions.map((v) => v.name)).size !== versions.length) problems.push('duplicate names');
      if (new Set(versions.map((v) => v.variant)).size !== versions.length) problems.push('versions share a diagram');
      for (const v of versions) {
        if (!v.name.trim() || !v.text.trim()) problems.push(`empty name or text in ${v.name}`);
        if ((v.diagramSteps ?? []).some(([label, hint]) => !label.trim() || !hint.trim())) problems.push(`empty diagram stage in ${v.name}`);
        if (v.videoStart !== undefined && !(Number.isInteger(v.videoStart) && v.videoStart >= 0 && EXERCISE_DETAILS[id].source?.youtube))
          problems.push(`video start in ${v.name}`);
      }
      return problems.map((p) => `${id}: ${p}`);
    });
    expect(bad).toEqual([]);
  });

  it('have diagram stages with a label and a hint', () => {
    const bad = ids.flatMap((id) =>
      (EXERCISE_DETAILS[id].diagramSteps ?? []).filter(([label, hint]) => !label.trim() || !hint.trim()).map(() => id),
    );
    expect(bad).toEqual([]);
  });
});

describe('recommended order', () => {
  it('lists every exercise exactly once', () => {
    expect(duplicates(RECOMMENDED)).toEqual([]);
    expect(ids.filter((id) => !RECOMMENDED.includes(id))).toEqual([]);
    expect(RECOMMENDED.filter((id) => !idSet.has(id))).toEqual([]);
  });
});

describe('training blocks', () => {
  it('add up to each training duration', () => {
    for (const d of DURATIONS) {
      expect(BLOCKS.reduce((sum, b) => sum + BLOCK_TARGETS[d][b.id], 0)).toBe(d);
    }
  });
});

describe('reference trainings', () => {
  it('have unique ids', () => {
    expect(duplicates(REFERENCE_TRAININGS.map((r) => r.id))).toEqual([]);
  });

  it.each(REFERENCE_TRAININGS.map((r) => [r.id, r] as const))('%s uses existing exercises and fills its blocks', (_, r) => {
    expect(r.items.filter(([, ex]) => !idSet.has(ex)).map(([, ex]) => ex)).toEqual([]);
    expect(THEMES).toContain(r.theme);
    const sums = Object.fromEntries(
      BLOCKS.map((b) => [b.id, r.items.filter(([block]) => block === b.id).reduce((s, [, , min]) => s + min, 0)]),
    );
    expect(sums).toEqual(BLOCK_TARGETS[r.duration]);
    expect(r.items.filter(([, , min]) => min % 5 !== 0)).toEqual([]);
  });
});
