import { useId, type ReactNode } from 'react';
import type { Variant } from '../data/exercises';

const PURPLE = '#5B2BC4';
const ORANGE = '#F2A541';
const INK = '#1A1033';
const ZONE = '#C7B6EF';
const CONE = '#A98BE8';

interface Props {
  variant: Variant;
  /**
   * Reveal only the arrows whose `at` step is ≤ this value (0 = organisation only).
   * Shows everything when omitted.
   */
  step?: number;
}

/** Tactical diagram on a striped pitch. Fills its parent; the parent sets the size. */
export function Pitch({ variant, step = Infinity }: Props) {
  const id = useId().replace(/:/g, '');
  const arP = `arP${id}`;
  const arK = `arK${id}`;

  // Primitives
  const P = (x: number, y: number) => <circle key={`p${x}-${y}`} cx={x} cy={y} r={8} fill={PURPLE} stroke="#fff" strokeWidth={2} />;
  const O = (x: number, y: number) => <circle key={`o${x}-${y}`} cx={x} cy={y} r={8} fill={ORANGE} stroke="#fff" strokeWidth={2} />;
  const N = (x: number, y: number) => <circle key={`n${x}-${y}`} cx={x} cy={y} r={7} fill="#fff" stroke={PURPLE} strokeWidth={2.5} />;
  const Ball = (x: number, y: number) => <circle key={`b${x}-${y}`} cx={x} cy={y} r={4} fill="#fff" stroke={INK} strokeWidth={1.5} />;
  const Cone = (x: number, y: number) => (
    <polygon key={`c${x}-${y}`} points={`${x},${y} ${x + 5},${y + 10} ${x - 5},${y + 10}`} fill={CONE} />
  );
  const Goal = (x: number, y: number, w: number, h: number) => (
    <rect key={`g${x}-${y}`} x={x} y={y} width={w} height={h} fill="#fff" stroke={INK} strokeWidth={1.5} />
  );
  const Box = (x: number, y: number, w: number, h: number, color = '#fff') => (
    <rect key={`r${x}-${y}-${w}`} x={x} y={y} width={w} height={h} fill="none" stroke={color} strokeWidth={color === '#fff' ? 2 : 1.5} />
  );
  const Line = (x1: number, y1: number, x2: number, y2: number, dashed = false) => (
    <line
      key={`l${x1}-${y1}-${x2}-${y2}`}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={dashed ? ZONE : '#fff'}
      strokeWidth={dashed ? 1.5 : 2}
      strokeDasharray={dashed ? '5 4' : undefined}
    />
  );
  // Arrows take an optional `at`: the diagram step from which they're shown (passes 1, runs 2 by default).
  const Pass = (x1: number, y1: number, x2: number, y2: number, at = 1) =>
    step >= at && (
      <line
        key={`pa${x1}-${y1}-${x2}-${y2}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={INK}
        strokeWidth={1.5}
        strokeDasharray="4 4"
        markerEnd={`url(#${arK})`}
      />
    );
  const Run = (d: string, at = 2) =>
    step >= at && (
      <path key={`ru${d}`} d={d} fill="none" stroke={PURPLE} strokeWidth={2} strokeLinecap="round" markerEnd={`url(#${arP})`} />
    );

  const content: Record<Variant, ReactNode[]> = {
    rondo: [
      Box(90, 30, 140, 140, ZONE),
      Pass(160, 30, 230, 100),
      Pass(230, 100, 160, 170),
      P(160, 30), P(230, 100), P(160, 170), P(90, 100),
      O(155, 92),
      Ball(170, 36),
      Cone(90, 24), Cone(230, 24), Cone(230, 164), Cone(90, 164),
    ],
    positional: [
      Box(30, 20, 260, 160, ZONE),
      Line(117, 20, 117, 180, true),
      Line(203, 20, 203, 180, true),
      Pass(60, 50, 160, 40),
      Pass(160, 40, 250, 100),
      P(60, 50), P(60, 150), P(160, 40), P(160, 160), P(250, 100),
      O(95, 85), O(95, 125), O(185, 72), O(185, 130), O(140, 105),
      N(30, 100), N(290, 100), N(160, 180),
      Ball(166, 46),
    ],
    finishing: [
      Box(250, 50, 60, 100),
      Goal(304, 78, 10, 44),
      Cone(120, 54), Cone(120, 134),
      Pass(60, 100, 148, 62),
      Pass(152, 62, 222, 108),
      Run('M150 140 Q190 135 224 114'),
      Run('M232 108 L300 92'),
      P(60, 100), P(150, 60), P(150, 140),
      O(292, 100),
      Ball(66, 96),
    ],
    transition: [
      Box(34, 20, 252, 160, ZONE),
      Goal(24, 48, 10, 26), Goal(24, 126, 10, 26), Goal(286, 48, 10, 26), Goal(286, 126, 10, 26),
      Run('M165 95 Q205 70 250 62'),
      Pass(120, 120, 165, 95),
      P(120, 120), P(165, 95), P(90, 60), P(210, 140),
      O(140, 70), O(195, 110), O(230, 80), O(80, 140),
      Ball(171, 90),
    ],
    coordination: [
      Box(40, 85, 100, 30),
      Line(60, 85, 60, 115), Line(80, 85, 80, 115), Line(100, 85, 100, 115), Line(120, 85, 120, 115),
      Run('M26 100 L150 100 L170 70 L195 130 L220 70 L245 130 L286 100'),
      Cone(170, 64), Cone(195, 124), Cone(220, 64), Cone(245, 124),
      P(22, 100), P(22, 140), P(22, 60),
      Ball(30, 96),
    ],
    pressing: [
      Line(20, 10, 20, 190),
      <circle key="cc" cx={20} cy={100} r={28} fill="none" stroke="#fff" strokeWidth={2} />,
      Box(250, 50, 60, 100),
      Goal(304, 80, 10, 40),
      Line(180, 14, 180, 186, true),
      Run('M200 50 L250 56'),
      Run('M216 100 L240 97'),
      Pass(262, 60, 262, 140),
      P(200, 50), P(200, 150), P(216, 100), P(170, 75), P(170, 125), P(140, 100),
      O(262, 54), O(262, 146), O(252, 98), O(284, 120), O(298, 100),
      Ball(256, 104),
    ],
    game: [
      Line(160, 10, 160, 190),
      <circle key="cc" cx={160} cy={100} r={22} fill="none" stroke="#fff" strokeWidth={2} />,
      Box(10, 60, 36, 80), Box(274, 60, 36, 80),
      Goal(4, 84, 8, 32), Goal(308, 84, 8, 32),
      Line(108, 14, 108, 186, true),
      Line(212, 14, 212, 186, true),
      P(24, 100), P(65, 100), P(70, 50), P(70, 150), P(120, 80), P(125, 135), P(180, 60), P(190, 120),
      O(296, 100), O(255, 100), O(250, 50), O(250, 150), O(205, 90), O(150, 160), O(230, 125), O(145, 40),
      Ball(186, 114),
    ],
    passing: [
      Pass(100, 40, 214, 40),
      Pass(220, 46, 220, 154),
      Run('M110 50 Q160 70 210 50'),
      Cone(100, 34), Cone(220, 34), Cone(220, 154), Cone(100, 154),
      P(90, 34), P(106, 26), P(230, 34), P(230, 166), P(90, 166), P(106, 176), P(212, 28), P(236, 150),
      Ball(108, 44),
    ],
    duel: [
      Box(70, 50, 180, 100, ZONE),
      Cone(70, 44), Cone(250, 44), Cone(70, 146), Cone(250, 146),
      Goal(60, 85, 10, 30), Goal(250, 85, 10, 30),
      Pass(101, 79, 217, 116),
      Run('M225 120 Q160 128 80 104'),
      Run('M101 80 Q125 100 150 112'),
      P(40, 90), P(40, 110), P(95, 75),
      O(280, 90), O(280, 110), O(225, 120),
      Ball(101, 80),
    ],
    smallgame: [
      Line(160, 10, 160, 190),
      <circle key="cc" cx={160} cy={100} r={18} fill="none" stroke="#fff" strokeWidth={2} />,
      Box(10, 65, 30, 70), Box(280, 65, 30, 70),
      Goal(4, 84, 8, 32), Goal(308, 84, 8, 32),
      Pass(32, 100, 62, 100),
      Pass(75, 95, 118, 58),
      Run('M131 50 Q185 38 232 56'),
      Run('M191 100 Q228 108 262 96'),
      P(24, 100), P(70, 100), P(125, 50), P(125, 150), P(185, 100),
      O(296, 100), O(250, 100), O(200, 64), O(200, 136), O(140, 100),
      Ball(31, 104),
    ],
  };

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 320 200"
      preserveAspectRatio="xMidYMid slice"
      style={{ display: 'block', background: '#F1ECFB' }}
      aria-hidden="true"
    >
      <rect x={0} y={0} width={320} height={200} fill="#F1ECFB" />
      <rect x={0} y={0} width={53} height={200} fill="#EBE3F9" />
      <rect x={107} y={0} width={53} height={200} fill="#EBE3F9" />
      <rect x={213} y={0} width={53} height={200} fill="#EBE3F9" />
      <rect x={10} y={10} width={300} height={180} rx={2} fill="none" stroke="#fff" strokeWidth={2} />
      <defs>
        <marker id={arP} viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
          <path d="M0 0L10 5L0 10z" fill={PURPLE} />
        </marker>
        <marker id={arK} viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
          <path d="M0 0L10 5L0 10z" fill={INK} />
        </marker>
      </defs>
      {content[variant]}
    </svg>
  );
}
