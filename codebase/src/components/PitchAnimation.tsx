import { useEffect, useMemo, useRef, useState } from 'react';
import type { Variant } from '../data/exercises';
import type { PitchAnimationDef } from '../data/animations';
import { INK, ORANGE, PURPLE, Pitch } from './Pitch';

type Point = [number, number];

/** Pause after the last beat before the animation starts over. */
const LOOP_PAUSE_MS = 1400;
/** Where the ball sits relative to the player who has it (same as in the static diagrams). */
const BALL_OFFSET: Point = [6, 4];

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const lerp = (a: Point, b: Point, t: number): Point => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

interface Frame {
  positions: Record<string, Point>;
  ball: Point;
  /** Actor id holding the ball, or null when it's lying loose (e.g. in the goal). */
  holder: string | null;
  labels: Record<string, string | undefined>;
}

/** Positions at the start of each beat, plus the end state after the last one. */
function keyframes(def: PitchAnimationDef): Frame[] {
  const positions = Object.fromEntries(def.actors.map((a) => [a.id, [a.x, a.y] as Point]));
  const labels: Record<string, string | undefined> = Object.fromEntries(def.actors.map((a) => [a.id, a.label]));
  const at = (id: string): Point => [positions[id][0] + BALL_OFFSET[0], positions[id][1] + BALL_OFFSET[1]];
  let holder: string | null = def.ballStart ?? null;
  let ball: Point = holder ? at(holder) : [0, 0];
  const frames: Frame[] = [{ positions: { ...positions }, ball, holder, labels: { ...labels } }];
  for (const beat of def.beats) {
    Object.assign(positions, beat.moves ?? {});
    Object.assign(labels, beat.labels ?? {});
    // Without a `ball` the ball stays with its holder, or where it lies.
    if (beat.ball !== undefined) holder = typeof beat.ball === 'string' ? beat.ball : null;
    ball = holder ? at(holder) : typeof beat.ball === 'object' ? beat.ball : ball;
    frames.push({ positions: { ...positions }, ball, holder, labels: { ...labels } });
  }
  return frames;
}

/**
 * Plays an exercise animation: the variant's field (without its players and arrows) with the players and
 * the ball moving over it, beat by beat, in a loop. Reports the current beat label for the caption.
 */
export function PitchAnimation({ variant, def, onBeat }: { variant: Variant; def: PitchAnimationDef; onBeat: (label: string) => void }) {
  const frames = useMemo(() => keyframes(def), [def]);
  const total = useMemo(() => def.beats.reduce((s, b) => s + b.ms, 0) + LOOP_PAUSE_MS, [def]);
  const [elapsed, setElapsed] = useState(0);
  const lastLabel = useRef('');

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setElapsed((now - start) % total);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [total]);

  // Which beat we're in, and how far along it (the loop pause holds the end state).
  let i = 0;
  let t = 1;
  let rest = elapsed;
  for (; i < def.beats.length; i++) {
    if (rest < def.beats[i].ms) {
      t = ease(rest / def.beats[i].ms);
      break;
    }
    rest -= def.beats[i].ms;
  }
  const from = frames[Math.min(i, frames.length - 1)];
  const to = frames[Math.min(i + 1, frames.length - 1)];
  const positions = Object.fromEntries(def.actors.map((a) => [a.id, lerp(from.positions[a.id], to.positions[a.id], t)]));
  // A beat can start with a fresh ball at a player (e.g. the trainer plays in a new one).
  const fresh = def.beats[i]?.newBall;
  const fromHolder = fresh ?? from.holder;
  const fromBall: Point = fresh ? [from.positions[fresh][0] + BALL_OFFSET[0], from.positions[fresh][1] + BALL_OFFSET[1]] : from.ball;
  // A dribble keeps the ball at the player's feet; anything else is a pass or a shot.
  const ball: Point =
    to.holder && to.holder === fromHolder
      ? [positions[to.holder][0] + BALL_OFFSET[0], positions[to.holder][1] + BALL_OFFSET[1]]
      : lerp(fromBall, to.ball, t);

  const label = def.beats[Math.min(i, def.beats.length - 1)].label;
  useEffect(() => {
    if (label !== lastLabel.current) {
      lastLabel.current = label;
      onBeat(label);
    }
  }, [label, onBeat]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Pitch variant={variant} step={0} hideActors />
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 200"
        preserveAspectRatio="xMidYMid slice"
        className="pitch"
        style={{ position: 'absolute', inset: 0, display: 'block' }}
        aria-hidden="true"
      >
        {def.actors.map((a) => {
          const [x, y] = positions[a.id];
          // Labels change only once a beat is done (from the frame at its start), e.g. after a rotation.
          const tag = from.labels[a.id];
          const fill = a.team === 'P' ? PURPLE : a.team === 'O' ? ORANGE : '#fff';
          const text = a.team === 'P' ? '#fff' : a.team === 'O' ? INK : PURPLE;
          return (
            <g key={a.id}>
              {a.team === 'N' ? (
                <circle cx={x} cy={y} r={7} fill="#fff" stroke={PURPLE} strokeWidth={2.5} />
              ) : (
                <circle cx={x} cy={y} r={8} fill={fill} stroke="#fff" strokeWidth={2} />
              )}
              {tag && (
                <text x={x} y={y} dy="0.35em" textAnchor="middle" fontSize={tag.length > 1 ? 7.5 : 9} fontWeight={700} fill={text} fontFamily="Figtree, system-ui, sans-serif">
                  {tag}
                </text>
              )}
            </g>
          );
        })}
        {def.ballStart && <circle cx={ball[0]} cy={ball[1]} r={4} fill="#fff" stroke={INK} strokeWidth={1.5} />}
      </svg>
    </div>
  );
}
