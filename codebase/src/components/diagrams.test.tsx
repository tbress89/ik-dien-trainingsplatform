import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ANIMATIONS } from '../data/animations';
import { DEMOS, type Joint } from '../data/demos';
import { EXERCISES } from '../data/exercises';
import { EXERCISE_DETAILS } from '../data/exerciseDetails';
import { LINEUPS } from '../data/lineups';
import { BodyDemo } from './BodyDemo';
import { ORANGE, Pitch, QUEUE_VARIANTS } from './Pitch';
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

  // The legend calls purple the team in B+ and orange the team in B−, so orange may not start with the ball.
  // omrondo shows the ball just after orange wins it, so the counter is visible.
  it.each(variants.filter((v) => v !== 'omrondo'))('%s starts with the ball at purple or a neutral player', (variant) => {
    const svg = renderToStaticMarkup(<Pitch variant={variant} />);
    const circles = [...svg.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="(\d+)" fill="([^"]+)"/g)].map((m) => ({
      x: +m[1],
      y: +m[2],
      r: +m[3],
      fill: m[4],
    }));
    const players = circles.filter((c) => c.r === 8 || c.r === 7).filter((c) => c.fill !== '#fff' || c.r === 7);
    const balls = circles.filter((c) => c.r === 4);
    if (!balls.length || !players.some((c) => c.fill === ORANGE)) return;
    const holder = (b: (typeof balls)[number]) =>
      players.reduce((best, c) => (Math.hypot(c.x - b.x, c.y - b.y) < Math.hypot(best.x - b.x, best.y - b.y) ? c : best));
    expect(balls.some((b) => holder(b).fill !== ORANGE)).toBe(true);
  });

  // The team in B+ attacks from left to right: a big goal kept by purple is on the left, one kept by orange on the
  // right. gkserve and gkdive only have a keeper and a trainer, so there's no team in B+ to point.
  it.each(variants.filter((v) => v !== 'gkserve' && v !== 'gkdive'))('%s has purple attacking to the right', (variant) => {
    const svg = renderToStaticMarkup(<Pitch variant={variant} />);
    const keepers = [...svg.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="8" fill="(#5B2BC4|#F2A541)"/g)].map((m) => ({
      x: +m[1],
      y: +m[2],
      fill: m[3],
    }));
    const goals = [...svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" fill="#fff" stroke="#1A1033"/g)]
      .map((m) => ({ x: +m[1] + +m[3] / 2, y: +m[2] + +m[4] / 2, h: +m[4] }))
      .filter((g) => g.h >= 30);
    for (const g of goals) {
      const keeper = keepers.find((k) => Math.hypot(k.x - g.x, k.y - g.y) < 30);
      if (keeper) expect({ goal: g.x < 160 ? 'links' : 'rechts', keeper: keeper.fill === ORANGE ? 'oranje' : 'paars' }).toEqual({
        goal: keeper.fill === ORANGE ? 'rechts' : 'links',
        keeper: keeper.fill === ORANGE ? 'oranje' : 'paars',
      });
    }
  });

  // Only players who wait in every stage stay hollow in the full diagram; the legend's "Wachtrij" follows this list.
  it.each(variants)('%s is in QUEUE_VARIANTS only if it shows a queue', (variant) => {
    expect(renderToStaticMarkup(<Pitch variant={variant} />).includes('stroke-dasharray="2.5 2"')).toBe(QUEUE_VARIANTS.has(variant));
  });
});

describe('pitch animations', () => {
  const entries = Object.entries(ANIMATIONS);

  it('belong to a diagram that an exercise uses', () => {
    expect(entries.map(([v]) => v).filter((v) => !variants.includes(v as never))).toEqual([]);
  });

  it('start from a lineup, and every lineup has an animation', () => {
    expect(entries.filter(([v]) => !LINEUPS[v as never]).map(([v]) => v)).toEqual([]);
    expect(Object.keys(LINEUPS).filter((v) => !ANIMATIONS[v as never])).toEqual([]);
  });

  it.each(entries)('%s only refers to its own players', (_, def) => {
    const ids = new Set(def.actors.map((a) => a.id));
    expect(ids.size).toBe(def.actors.length);
    const refs = [
      def.ballStart,
      def.diagramBall?.at,
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

  // Purple is the team in B+: orange may only start with the ball in transition animations that open just
  // before purple wins it (their diagrams show purple on the ball).
  it.each(entries.filter(([v]) => v !== 'transition' && v !== 'omcounter'))('%s starts with the ball at purple or a neutral player', (_, def) => {
    expect(def.actors.find((a) => a.id === def.ballStart)?.team).not.toBe('O');
  });

  // The diagram is the animation's first frame: the same players (team, spot, label, waiting) and the ball at the
  // same player, unless the diagram shows a later moment (`diagramBall.at`). The diagram may show more, e.g. a
  // second group doing the same drill.
  it.each(entries)('%s starts from the players and ball in its diagram', (variant, def) => {
    const svg = renderToStaticMarkup(<Pitch variant={variant as never} />);
    const drawn = [
      ...svg.matchAll(
        /<g><circle cx="([\d.-]+)" cy="([\d.-]+)" r="([78])" fill="([^"]+)" stroke="([^"]+)"[^>]*?( stroke-dasharray="2.5 2")?><\/circle>(?:<text[^>]*>([^<]*)<\/text>)?<\/g>/g,
      ),
    ].map((m) => ({
      team: m[3] === '7' ? 'N' : (m[6] ? m[5] : m[4]) === ORANGE ? 'O' : 'P',
      x: +m[1],
      y: +m[2],
      label: m[7],
      waiting: !!m[6],
    }));
    const key = (p: { team: string; x: number; y: number; label?: string; waiting?: boolean }) =>
      `${p.team} ${p.x},${p.y}${p.label ? ` '${p.label}'` : ''}${p.waiting ? ' wachtend' : ''}`;
    const keys = drawn.map(key);
    expect(def.actors.map(key).filter((k) => !keys.includes(k))).toEqual([]);

    const balls = [...svg.matchAll(/<circle cx="([\d.-]+)" cy="([\d.-]+)" r="4" fill="#fff"/g)].map((m) => ({ x: +m[1], y: +m[2] }));
    const nearest = (b: { x: number; y: number }) =>
      key(drawn.reduce((best, p) => (Math.hypot(p.x - b.x, p.y - b.y) < Math.hypot(best.x - b.x, best.y - b.y) ? p : best)));
    const holder = def.actors.find((a) => a.id === (def.diagramBall?.at ?? def.ballStart));
    if (holder) expect(balls.map(nearest)).toContain(key(holder));
    else expect(balls).toEqual([]);
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
