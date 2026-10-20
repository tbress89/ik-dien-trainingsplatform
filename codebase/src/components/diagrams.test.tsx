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
const stageCount = (variant: string) =>
  Math.max(
    1,
    ...EXERCISES.filter((e) => e.variant === variant).map((e) => EXERCISE_DETAILS[e.id]?.diagramSteps?.length ?? 1),
    ...versionStages(variant),
  );

interface Spot {
  x: number;
  y: number;
}
const dist = (a: Spot, b: Spot) => Math.hypot(a.x - b.x, a.y - b.y);
const at = (p: Spot) => `(${p.x}, ${p.y})`;

/** The players, balls, goals, cones and arrows a rendered diagram draws, with their coordinates. */
function parseDiagram(svg: string) {
  const players = [
    ...svg.matchAll(/<g><circle cx="([\d.-]+)" cy="([\d.-]+)" r="([78])"([^>]*)><\/circle>(?:<text[^>]*font-size="([\d.]+)"[^>]*>([^<]*)<\/text>)?<\/g>/g),
  ].map((m) => ({ x: +m[1], y: +m[2], r: +m[3], waiting: m[4].includes('stroke-dasharray'), fontSize: m[5] ? +m[5] : 0, label: m[6] ?? '' }));
  const balls = [...svg.matchAll(/<circle cx="([\d.-]+)" cy="([\d.-]+)" r="4"/g)].map((m) => ({ x: +m[1], y: +m[2] }));
  const goals = [...svg.matchAll(/<rect x="([\d.-]+)" y="([\d.-]+)" width="([\d.]+)" height="([\d.]+)" fill="#fff" stroke="#1A1033"/g)].map(
    (m) => ({ x: +m[1], y: +m[2], w: +m[3], h: +m[4] }),
  );
  // A cone is a triangle with its tip at (x, y); its middle is 6 lower.
  const cones = [...svg.matchAll(/<polygon points="([\d.-]+),([\d.-]+) /g)].map((m) => ({ x: +m[1], y: +m[2] + 6 }));
  const passes = [...svg.matchAll(/<line x1="([\d.-]+)" y1="([\d.-]+)" x2="([\d.-]+)" y2="([\d.-]+)" stroke="#1A1033"/g)].map((m) => ({
    from: { x: +m[1], y: +m[2] },
    to: { x: +m[3], y: +m[4] },
  }));
  const runs = [...svg.matchAll(/<path d="([^"]+)" fill="none" stroke="#(?:5B2BC4|F2A541)"/g)].map((m) => {
    const n = m[1].match(/-?[\d.]+/g)!.map(Number);
    return { d: m[1], from: { x: n[0], y: n[1] }, to: { x: n[n.length - 2], y: n[n.length - 1] } };
  });
  return { players, balls, goals, cones, passes, runs };
}

describe('diagrams', () => {
  it.each(variants)('%s renders every stage', (variant) => {
    for (let step = 0; step < stageCount(variant); step++) {
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

// Geometry checks, so a moved player or a new diagram can't leave dots on top of each other, a ball on a label or
// an arrow hanging in the air. Each lists what's wrong with its coordinates.
describe('diagram layout', () => {
  // Stages only hide arrows and draw late players hollow, so the full diagram has every spot and arrow to check
  // (the 'renders every stage' test above renders the stages themselves).
  const issuesIn = (variant: string, check: (d: ReturnType<typeof parseDiagram>) => string[]) =>
    check(parseDiagram(renderToStaticMarkup(<Pitch variant={variant as never} />)));

  it.each(variants)('%s has no players on top of each other', (variant) => {
    expect(
      issuesIn(variant, ({ players }) =>
        players.flatMap((a, i) =>
          players
            .slice(i + 1)
            // Two dots may touch with their outlines (2 px); closer than that and one hides part of the other.
            .filter((b) => dist(a, b) < a.r + b.r - 2)
            .map((b) => `${at(a)} and ${at(b)}`),
        ),
      ),
    ).toEqual([]);
  });

  it.each(variants)("%s has no ball over a player's label", (variant) => {
    expect(
      issuesIn(variant, ({ players, balls }) =>
        players
          .filter((p) => p.label)
          .flatMap((p) => {
            // A label is about 0.6 em per bold character wide and 0.7 em tall: half of the larger one is its reach.
            const reach = Math.max(0.3 * p.fontSize * p.label.length, 0.35 * p.fontSize);
            return (
              balls
                // The ball (r 4) may graze the label by 1 px, as with the default offset [6, 4]; any closer covers it.
                .filter((b) => dist(b, p) < reach + 3)
                .map((b) => `ball ${at(b)} on '${p.label}' ${at(p)}`)
            );
          }),
      ),
    ).toEqual([]);
  });

  // dking and dshark: the arrow kicks someone's ball out of the square, to no one. pclean: balls are kicked into
  // the other team's half, not to a player.
  const PASS_INTO_NOWHERE = new Set(['dking', 'dshark', 'pclean']);
  it.each(variants)('%s has passes from the ball to a player', (variant) => {
    expect(
      issuesIn(variant, ({ players, balls, goals, cones, passes, runs }) =>
        passes.flatMap(({ from, to }) => {
          // A pass starts within a dot's width (16) of the ball or a player, or of the spot where a run or an
          // earlier pass arrives (a player who runs onto the ball, a first-time pass).
          const starts = [...balls, ...players, ...runs.map((r) => r.to), ...passes.map((p) => p.to)].some((s) => dist(s, from) < 16);
          // It ends at a player, a cone, a goal or an empty spot a run goes to (a pass into space). Arrows stop short
          // so the head stays visible: the end may be 10 px from the dot's edge (8 + 10).
          const ends =
            PASS_INTO_NOWHERE.has(variant) ||
            [...players, ...cones, ...runs.map((r) => r.to)].some((s) => dist(s, to) < 18) ||
            goals.some((g) => to.x > g.x - 18 && to.x < g.x + g.w + 18 && to.y > g.y - 18 && to.y < g.y + g.h + 18);
          return [
            ...(starts ? [] : [`pass ${at(from)} → ${at(to)} starts away from the ball`]),
            ...(ends ? [] : [`pass ${at(from)} → ${at(to)} ends at no one`]),
          ];
        }),
      ),
    ).toEqual([]);
  });

  it.each(variants)('%s stays on the pitch', (variant) => {
    expect(
      issuesIn(variant, ({ players, balls, goals }) => [
        // The outline runs 10–310 × 10–190: players and balls stand on it or inside.
        ...[...players, ...balls].filter((p) => p.x < 10 || p.x > 310 || p.y < 10 || p.y > 190).map((p) => `${at(p)} off the pitch`),
        // Goals sit on the line, so half of one may stick out, but they stay in the 320 × 200 picture.
        ...goals.filter((g) => g.x < 0 || g.y < 0 || g.x + g.w > 320 || g.y + g.h > 200).map((g) => `goal ${at(g)} out of the picture`),
      ]),
    ).toEqual([]);
  });

  // Diagrams that need the whole pitch: positional, prshift and game11 are games on (nearly) the full field, and
  // obzones and obwave have substitutes waiting on the side lines until they come in.
  const FULL_PITCH = new Set(['positional', 'prshift', 'game11', 'obzones', 'obwave']);
  it.each(variants.filter((v) => !FULL_PITCH.has(v)))('%s keeps its players in the middle that is never cropped', (variant) => {
    expect(
      issuesIn(variant, ({ players, balls }) =>
        // The wide, short plan cards show only about x 30–290, y 45–155: a dot entirely outside that is lost there.
        // A queue (hollow dots) waits aside on purpose.
        [...players.filter((p) => !p.waiting), ...balls.map((b) => ({ ...b, r: 4 }))]
          .filter((p) => p.x + p.r < 30 || p.x - p.r > 290 || p.y + p.r < 45 || p.y - p.r > 155)
          .map((p) => `${at(p)} cropped away`),
      ),
    ).toEqual([]);
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

  it.each(entries)('%s never moves a player onto another', (_, def) => {
    const spots = new Map(def.actors.map((a) => [a.id, { x: a.x, y: a.y }]));
    const clashes: string[] = [];
    def.beats.forEach((beat, i) => {
      for (const [id, [x, y]] of Object.entries(beat.moves ?? {})) spots.set(id, { x, y });
      for (const id of Object.keys(beat.moves ?? {})) {
        for (const [other, spot] of spots) {
          // Closer than 10, one dot covers half of the other. (Less strict than the diagram's 14: in a duel the
          // defender stands shoulder to shoulder with the attacker.)
          if (other !== id && (!(other in (beat.moves ?? {})) || other > id) && dist(spot, spots.get(id)!) < 10)
            clashes.push(`beat ${i + 1}: ${id} ${at(spots.get(id)!)} on ${other} ${at(spot)}`);
        }
      }
    });
    expect(clashes).toEqual([]);
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
