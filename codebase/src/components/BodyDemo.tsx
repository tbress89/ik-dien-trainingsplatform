import { useEffect, useMemo, useRef, useState } from 'react';
import type { BodyDemoDef, DemoScene, Joint, Point, Pose } from '../data/demos';
import { ORANGE, PURPLE } from './Pitch';

/** Pause at the end of each scene before the next one (or the loop) starts. */
const SCENE_PAUSE_MS = 900;
/** Colours for the near and the far limbs, so the figure reads as a body seen from the side. */
const COLORS = {
  P: { near: PURPLE, far: '#A58BE6' },
  O: { near: ORANGE, far: '#F7CC8F' },
};

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const lerp = (a: Point, b: Point, t: number): Point => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

interface Segment {
  scene: number;
  label: string;
  ms: number;
  from: Record<string, Pose>;
  to: Record<string, Pose>;
  linear: boolean;
}

/** All steps of all scenes in a row, each with its start and end poses, plus a pause after each scene. */
function timeline(def: BodyDemoDef): Segment[] {
  return def.scenes.flatMap((scene: DemoScene, s) => {
    let current = scene.start;
    const segments = scene.steps.map((step) => {
      const to = { ...current, ...step.poses };
      const seg = {
        scene: s,
        label: step.label,
        ms: step.ms,
        from: current,
        to,
        linear: step.ease === 'linear',
      };
      current = to;
      return seg;
    });
    const last = segments[segments.length - 1];
    return [...segments, { ...last, ms: SCENE_PAUSE_MS, from: current, to: current }];
  });
}

function Figure({ pose, team }: { pose: Pose; team: 'P' | 'O' }) {
  const c = COLORS[team];
  const limb = (a: Joint, b: Joint, color: string, width: number) => (
    <line x1={pose[a][0]} y1={pose[a][1]} x2={pose[b][0]} y2={pose[b][1]} stroke={color} strokeWidth={width} strokeLinecap="round" />
  );
  return (
    <g>
      {limb('shoulder', 'elbow2', c.far, 6)}
      {limb('elbow2', 'hand2', c.far, 5)}
      {limb('hip', 'knee2', c.far, 8)}
      {limb('knee2', 'ankle2', c.far, 7)}
      {limb('ankle2', 'toe2', c.far, 5)}
      {limb('shoulder', 'hip', c.near, 12)}
      {limb('hip', 'knee1', c.near, 9)}
      {limb('knee1', 'ankle1', c.near, 8)}
      {limb('ankle1', 'toe1', c.near, 5)}
      {limb('shoulder', 'elbow1', c.near, 6.5)}
      {limb('elbow1', 'hand1', c.near, 5.5)}
      <circle cx={pose.head[0]} cy={pose.head[1]} r={9} fill={c.near} stroke="#fff" strokeWidth={1.5} />
    </g>
  );
}

/**
 * Plays an exercise's instruction animation: side-view figures moving from pose to pose, scene by scene,
 * in a loop. Reports the current step label for the caption.
 */
export function BodyDemo({ def, onBeat }: { def: BodyDemoDef; onBeat: (label: string) => void }) {
  const segments = useMemo(() => timeline(def), [def]);
  const total = useMemo(() => segments.reduce((s, seg) => s + seg.ms, 0), [segments]);
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

  let i = 0;
  let rest = elapsed;
  while (i < segments.length - 1 && rest >= segments[i].ms) rest -= segments[i++].ms;
  const seg = segments[i];
  const raw = Math.min(1, rest / seg.ms);
  const t = seg.linear ? raw : ease(raw);
  const scene = def.scenes[seg.scene];

  useEffect(() => {
    if (seg.label !== lastLabel.current) {
      lastLabel.current = seg.label;
      onBeat(seg.label);
    }
  }, [seg.label, onBeat]);

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 320 188"
      preserveAspectRatio="xMidYMid meet"
      className="pitch"
      style={{ display: 'block', background: 'var(--demo-bg)' }}
      aria-hidden="true"
    >
      <rect x={0} y={170} width={320} height={18} style={{ fill: 'var(--demo-ground)' }} />
      <rect x={24} y={166} width={272} height={5} rx={2.5} style={{ fill: 'var(--demo-mat)' }} />
      <text x={16} y={24} fontSize={11} fontWeight={700} fontFamily="Figtree, system-ui, sans-serif" style={{ fill: 'var(--ink)' }}>
        {scene.title}
      </text>
      <text x={16} y={38} fontSize={8} fontFamily="Figtree, system-ui, sans-serif" style={{ fill: 'var(--muted)' }}>
        {seg.scene + 1} / {def.scenes.length}
      </text>
      {scene.figures.map((f) => {
        const from = seg.from[f.id];
        const to = seg.to[f.id];
        const pose = Object.fromEntries(Object.keys(from).map((j) => [j, lerp(from[j as Joint], to[j as Joint], t)])) as Pose;
        return <Figure key={f.id} pose={pose} team={f.team} />;
      })}
    </svg>
  );
}
