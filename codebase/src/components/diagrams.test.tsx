import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ANIMATIONS } from '../data/animations';
import { DEMOS, type Joint } from '../data/demos';
import { EXERCISES } from '../data/exercises';
import { EXERCISE_DETAILS } from '../data/exerciseDetails';
import { BodyDemo } from './BodyDemo';
import { Pitch } from './Pitch';
import { PitchAnimation } from './PitchAnimation';

// Every diagram an exercise shows: its own, plus those of its versions.
const variants = [...new Set(EXERCISES.flatMap((e) => [e.variant, ...(EXERCISE_DETAILS[e.id]?.versions ?? []).map((v) => v.variant)]))];
const versionStages = (variant: string) =>
  Object.values(EXERCISE_DETAILS).flatMap((d) => (d.versions ?? []).filter((v) => v.variant === variant).map((v) => v.diagramSteps?.length ?? 1));
const noop = () => {};

describe('diagrams', () => {
  it.each(variants)('%s renders every stage', (variant) => {
    const stages = Math.max(
      1,
      ...EXERCISES.filter((e) => e.variant === variant).map((e) => EXERCISE_DETAILS[e.id]?.diagramSteps?.length ?? 1),
      ...versionStages(variant),
    );
    for (let step = 0; step < stages; step++) {
      const svg = renderToStaticMarkup(<Pitch variant={variant} step={step} />);
      expect(svg).toContain('<svg');
      expect(svg).not.toContain('NaN');
    }
    // The full diagram has at least one player, cone or goal on the field.
    expect(renderToStaticMarkup(<Pitch variant={variant} />)).toMatch(/<(circle|polygon|rect)[^>]*(r="[78]"|points=|stroke="#1A1033")/);
  });
});

describe('pitch animations', () => {
  const entries = Object.entries(ANIMATIONS);

  it('belong to a diagram that an exercise uses', () => {
    expect(entries.map(([v]) => v).filter((v) => !variants.includes(v as never))).toEqual([]);
  });

  it.each(entries)('%s only refers to its own players', (_, def) => {
    const ids = new Set(def.actors.map((a) => a.id));
    expect(ids.size).toBe(def.actors.length);
    const refs = [
      def.ballStart,
      ...def.beats.flatMap((b) => [
        ...Object.keys(b.moves ?? {}),
        ...Object.keys(b.labels ?? {}),
        typeof b.ball === 'string' ? b.ball : undefined,
        b.newBall,
      ]),
    ].filter((r): r is string => r !== undefined);
    expect(refs.filter((r) => !ids.has(r))).toEqual([]);
    expect(def.beats.length).toBeGreaterThan(0);
    expect(def.beats.filter((b) => !(b.ms > 0) || !b.label.trim())).toEqual([]);
  });

  it.each(entries)('%s renders', (variant, def) => {
    const svg = renderToStaticMarkup(<PitchAnimation variant={variant as never} def={def} onBeat={noop} />);
    expect(svg).not.toContain('NaN');
  });
});

describe('instruction demos', () => {
  const joints: Joint[] = [
    'head',
    'shoulder',
    'hip',
    'elbow1',
    'hand1',
    'elbow2',
    'hand2',
    'knee1',
    'ankle1',
    'toe1',
    'knee2',
    'ankle2',
    'toe2',
  ];

  it.each(Object.entries(DEMOS))('%s has complete, finite poses for its figures', (_, def) => {
    for (const scene of def.scenes) {
      const poses = [scene.start, ...scene.steps.map((s) => s.poses)];
      for (const set of poses) {
        for (const [figure, pose] of Object.entries(set)) {
          expect(scene.figures.map((f) => f.id)).toContain(figure);
          for (const j of joints) expect(pose[j].every(Number.isFinite), `${scene.title} ${figure} ${j}`).toBe(true);
        }
      }
      expect(scene.figures.every((f) => f.id in scene.start)).toBe(true);
    }
  });

  it.each(Object.entries(DEMOS))('%s renders', (_, def) => {
    expect(renderToStaticMarkup(<BodyDemo def={def} onBeat={noop} />)).not.toContain('NaN');
  });
});
