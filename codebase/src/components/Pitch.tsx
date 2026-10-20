import { Fragment, useId, type ReactNode } from 'react';
import type { Variant } from '../data/exercises';
import { LINEUPS } from '../data/lineups';

export const PURPLE = '#5B2BC4';
export const ORANGE = '#F2A541';
export const INK = '#1A1033';

/** Diagrams with players who wait in every stage (`joinsAt` Infinity), so the legend can explain them. */
export const QUEUE_VARIANTS: ReadonlySet<Variant> = new Set<Variant>(['gkback']);
const ZONE = '#C7B6EF';
const CONE = '#A98BE8';

interface Props {
  variant: Variant;
  /**
   * Reveal only the arrows whose `at` step is ≤ this value (0 = organisation only).
   * Shows everything when omitted.
   */
  step?: number;
  /** Leave out the players and the ball, e.g. when PitchAnimation draws moving ones on top. */
  hideActors?: boolean;
}

/** Players (P/O/N) and balls are keyed `p…`, `o…`, `n…`, `b…` followed by their coordinates. */
const withoutActors = (nodes: ReactNode[]) =>
  nodes.filter((n) => !(n && typeof n === 'object' && 'key' in n && /^[ponb]\d/.test(String(n.key))));

/** Tactical diagram on a striped pitch. Fills its parent; the parent sets the size. */
export function Pitch({ variant, step = Infinity, hideActors = false }: Props) {
  const id = useId().replace(/:/g, '');
  const arP = `arP${id}`;
  const arK = `arK${id}`;
  const arO = `arO${id}`;

  // Primitives
  // Players take an optional label, e.g. a shirt number or 'K', drawn inside the dot.
  const Label = (x: number, y: number, label: string | undefined, color: string) =>
    label && (
      <text
        x={x}
        y={y}
        dy="0.35em"
        textAnchor="middle"
        fontSize={label.length > 1 ? 7.5 : 9}
        fontWeight={700}
        fill={color}
        fontFamily="Figtree, system-ui, sans-serif"
      >
        {label}
      </text>
    );
  // P and O also take an optional `joinsAt`: the diagram step from which the player takes part. Before
  // that step they are drawn as a waiting player (hollow, dashed outline), e.g. a substitute on the side.
  // Infinity keeps them waiting in every stage and in the full diagram, e.g. a queue of players.
  const Waiting = (x: number, y: number, label: string | undefined, color: string) => (
    <>
      <circle cx={x} cy={y} r={8} fill="#fff" stroke={color} strokeWidth={1.5} strokeDasharray="2.5 2" />
      {Label(x, y, label, color)}
    </>
  );
  const P = (x: number, y: number, label?: string, joinsAt?: number) => (
    <g key={`p${x}-${y}`}>
      {joinsAt !== undefined && (joinsAt === Infinity || step < joinsAt) ? (
        Waiting(x, y, label, PURPLE)
      ) : (
        <>
          <circle cx={x} cy={y} r={8} fill={PURPLE} stroke="#fff" strokeWidth={2} />
          {Label(x, y, label, '#fff')}
        </>
      )}
    </g>
  );
  const O = (x: number, y: number, label?: string, joinsAt?: number) => (
    <g key={`o${x}-${y}`}>
      {joinsAt !== undefined && (joinsAt === Infinity || step < joinsAt) ? (
        Waiting(x, y, label, ORANGE)
      ) : (
        <>
          <circle cx={x} cy={y} r={8} fill={ORANGE} stroke="#fff" strokeWidth={2} />
          {Label(x, y, label, INK)}
        </>
      )}
    </g>
  );
  const N = (x: number, y: number, label?: string) => (
    <g key={`n${x}-${y}`}>
      <circle cx={x} cy={y} r={7} fill="#fff" stroke={PURPLE} strokeWidth={2.5} />
      {Label(x, y, label, PURPLE)}
    </g>
  );
  const Ball = (x: number, y: number) => <circle key={`b${x}-${y}`} cx={x} cy={y} r={4} fill="#fff" stroke={INK} strokeWidth={1.5} />;
  // Stands in for the players and the ball of a diagram that has an animation: they come from its lineup
  // (lineups.ts), so the diagram and the animation can't drift apart.
  const LINEUP = <Fragment key="lineup" />;
  const lineup = (): ReactNode[] => {
    const def = LINEUPS[variant];
    if (!def) return [];
    const players = def.actors.map((a) => {
      const joinsAt = a.waiting ? Infinity : a.joinsAt;
      return a.team === 'N' ? N(a.x, a.y, a.label) : (a.team === 'P' ? P : O)(a.x, a.y, a.label, joinsAt);
    });
    const holder = def.actors.find((a) => a.id === (def.diagramBall?.at ?? def.ballStart));
    const [dx, dy] = def.diagramBall?.offset ?? [6, 4];
    return holder ? [...players, Ball(holder.x + dx, holder.y + dy)] : players;
  };
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
  // An opponent's run: the same solid arrow in orange (no default step; always pass `at`).
  const ORun = (d: string, at: number) =>
    step >= at && (
      <path key={`or${d}`} d={d} fill="none" stroke={ORANGE} strokeWidth={2} strokeLinecap="round" markerEnd={`url(#${arO})`} />
    );

  const content: Record<Variant, ReactNode[]> = {
    rondo: [
      Box(105, 45, 110, 110, ZONE),
      Pass(160, 45, 215, 100),
      Pass(215, 100, 160, 155),
      LINEUP,
      Cone(105, 39), Cone(215, 39), Cone(215, 149), Cone(105, 149),
    ],
    positional: [
      Box(30, 20, 260, 160, ZONE),
      Line(117, 20, 117, 180, true),
      Line(203, 20, 203, 180, true),
      Pass(60, 50, 160, 40),
      Pass(160, 40, 250, 100),
      LINEUP,
    ],
    finishing: [
      Box(250, 50, 60, 100),
      Goal(304, 78, 10, 44),
      Cone(120, 54), Cone(120, 134),
      Pass(60, 100, 148, 62),
      Pass(152, 62, 222, 108),
      Run('M150 140 Q190 135 224 114'),
      Run('M232 108 L300 92'),
      LINEUP,
    ],
    transition: [
      Box(34, 20, 252, 160, ZONE),
      Goal(24, 48, 10, 26), Goal(24, 126, 10, 26), Goal(286, 48, 10, 26), Goal(286, 126, 10, 26),
      Run('M165 95 Q205 70 250 62'),
      Pass(120, 120, 165, 95),
      LINEUP,
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
      Line(300, 10, 300, 190),
      <circle key="cc" cx={300} cy={100} r={28} fill="none" stroke="#fff" strokeWidth={2} />,
      Box(10, 50, 60, 100),
      Goal(6, 80, 10, 40),
      Line(140, 14, 140, 186, true),
      ORun('M120 50 L70 56', 2),
      ORun('M104 100 L80 97', 2),
      Pass(58, 60, 58, 140),
      LINEUP,
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
      Pass(98, 60, 224, 58),
      Pass(240, 63, 240, 140),
      Run('M92 66 Q156 81 218 70'),
      Cone(100, 46), Cone(220, 46), Cone(220, 142), Cone(100, 142),
      LINEUP,
    ],
    duel: [
      Box(70, 50, 180, 100, ZONE),
      Cone(70, 44), Cone(250, 44), Cone(70, 146), Cone(250, 146),
      Goal(60, 85, 10, 30), Goal(250, 85, 10, 30),
      Pass(101, 79, 217, 116),
      Run('M225 120 Q160 128 80 104'),
      Run('M101 80 Q125 100 150 112'),
      LINEUP,
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
      LINEUP,
    ],
    gkserve: [
      Box(250, 50, 60, 100),
      Goal(304, 78, 10, 44),
      Pass(187, 100, 262, 100),
      Run('M282 100 L268 100'),
      LINEUP,
    ],
    gkdive: [
      Box(250, 50, 60, 100),
      Goal(304, 78, 10, 44),
      Pass(196, 97, 276, 76, 1),
      Run('M290 92 Q296 82 288 74', 1),
      Pass(196, 103, 276, 124, 2),
      Run('M290 108 Q296 118 288 126', 2),
      LINEUP,
    ],
    gkshot: [
      Box(250, 50, 60, 100),
      Goal(304, 78, 10, 44),
      Cone(180, 54), Cone(170, 94), Cone(180, 134),
      Pass(201, 62, 276, 88, 1),
      Pass(192, 100, 276, 100, 2),
      Pass(201, 138, 276, 112, 3),
      LINEUP,
      Ball(191, 105), Ball(201, 145),
    ],
    gkangle: [
      Box(250, 50, 60, 100),
      Goal(304, 78, 10, 44),
      Cone(170, 42), Cone(152, 92), Cone(170, 146),
      Pass(176, 70, 176, 128, 1),
      ORun('M280 90 Q285 101 280 112', 2),
      Pass(183, 138, 274, 114, 3),
      LINEUP,
    ],
    gk1v1: [
      Box(250, 50, 60, 100),
      Goal(304, 78, 10, 44),
      Cone(96, 78), Cone(96, 122),
      ORun('M122 100 L205 100', 1),
      ORun('M278 100 L234 100', 2),
      LINEUP,
    ],
    gkcross: [
      Box(250, 50, 60, 100),
      Goal(304, 78, 10, 44),
      Pass(231, 56, 266, 88),
      ORun('M288 96 Q280 90 272 88', 2),
      LINEUP,
      Ball(231, 146),
    ],
    gkdist: [
      Box(10, 50, 60, 100),
      Goal(6, 78, 10, 44),
      Goal(136, 124, 8, 24),
      Goal(248, 48, 8, 24),
      Pass(40, 106, 134, 134, 1),
      Pass(40, 94, 244, 62, 2),
      LINEUP,
    ],
    gkback: [
      Box(10, 50, 60, 100),
      Goal(6, 78, 10, 44),
      Goal(282, 58, 8, 20), Goal(282, 122, 8, 20),
      Pass(114, 142, 44, 106, 1),
      ORun('M112 100 Q80 98 48 100', 1),
      Pass(40, 94, 112, 58, 2),
      Run('M128 52 Q180 44 232 58', 3),
      Run('M128 148 Q200 154 236 134', 3),
      Pass(240, 62, 278, 68, 3),
      LINEUP,
    ],
    gkrebound: [
      Box(250, 50, 60, 100),
      Goal(304, 78, 10, 44),
      Pass(188, 100, 276, 114, 1),
      ORun('M288 106 Q294 118 284 126', 2),
      Pass(241, 60, 282, 84, 3),
      LINEUP,
      Ball(241, 58),
    ],
    rondo31: [
      Box(105, 45, 110, 110, ZONE),
      Cone(105, 39), Cone(215, 39), Cone(215, 149), Cone(105, 149),
      Pass(166, 49, 209, 94, 1),
      Run('M108 108 Q110 145 150 153', 2),
      LINEUP,
    ],
    rcircle: [
      <circle key="ring" cx={160} cy={100} r={55} fill="none" stroke={ZONE} strokeWidth={1.5} strokeDasharray="5 4" />,
      Pass(166, 48, 197, 63, 1),
      Pass(208, 109, 123, 69, 2),
      LINEUP,
    ],
    rondo52: [
      Box(105, 45, 110, 110, ZONE),
      Cone(105, 39), Cone(215, 39), Cone(215, 149), Cone(105, 149),
      Pass(141, 49, 208, 104, 1),
      Run('M128 50 Q110 60 110 80', 1),
      Pass(209, 116, 166, 150, 2),
      Run('M219 102 Q222 70 206 54', 2),
      LINEUP,
    ],
    rondo412: [
      Box(105, 45, 110, 110, ZONE),
      Cone(105, 39), Cone(215, 39), Cone(215, 149), Cone(105, 149),
      Pass(160, 51, 160, 88, 1),
      Pass(168, 100, 208, 100, 2),
      LINEUP,
    ],
    rondo22: [
      Box(105, 45, 110, 110, ZONE),
      Cone(105, 39), Cone(215, 39), Cone(215, 149), Cone(105, 149),
      Pass(132, 114, 111, 104, 1),
      Run('M186 76 Q200 66 202 58', 2),
      Pass(111, 96, 196, 62, 3),
      LINEUP,
    ],
    rondo42: [
      Box(105, 45, 110, 110, ZONE),
      Cone(105, 39), Cone(215, 39), Cone(215, 149), Cone(105, 149),
      Pass(166, 49, 209, 95, 1),
      Run('M178 108 Q196 104 204 102', 2),
      LINEUP,
    ],
    rcolor: [
      Box(95, 45, 130, 110, ZONE),
      Cone(95, 39), Cone(225, 39), Cone(225, 149), Cone(95, 149),
      Pass(130, 51, 100, 104, 1),
      Pass(101, 114, 158, 152, 2),
      LINEUP,
    ],
    rpress: [
      Box(105, 45, 110, 110, ZONE),
      Cone(105, 39), Cone(215, 39), Cone(215, 149), Cone(105, 149),
      Goal(88, 52, 8, 24), Goal(224, 124, 8, 24),
      Pass(166, 49, 209, 95, 1),
      Run('M176 112 Q200 124 220 134', 2),
      LINEUP,
    ],
    rdeep: [
      Box(60, 55, 90, 90, ZONE),
      Cone(60, 49), Cone(150, 49), Cone(150, 139), Cone(60, 139), Cone(270, 108),
      Pass(111, 59, 144, 76, 1),
      Pass(156, 82, 252, 98, 2),
      Run('M152 90 Q192 124 236 114', 3),
      LINEUP,
    ],
    rtrans: [
      Box(40, 55, 100, 90, ZONE), Box(180, 55, 100, 90, ZONE),
      Pass(96, 59, 134, 94, 1),
      Pass(113, 112, 222, 120, 2),
      Run('M84 88 Q150 60 214 72', 3),
      Run('M146 104 Q170 112 200 104', 3),
      LINEUP,
    ],
    dbox: [
      Box(70, 45, 180, 110, ZONE),
      Cone(70, 39), Cone(250, 39), Cone(250, 149), Cone(70, 149),
      Run('M118 70 L162 70', 1),
      Run('M198 70 Q224 80 228 100', 1),
      Run('M158 116 Q176 134 160 146 Q142 150 138 134', 2),
      P(110, 70), P(190, 65), P(150, 110), P(215, 130), P(95, 135),
      Ball(116, 75), Ball(196, 70), Ball(156, 115), Ball(221, 135), Ball(101, 140),
    ],
    dturns: [
      Cone(220, 62), Cone(220, 102), Cone(220, 142),
      Run('M78 70 L204 70', 1),
      Run('M78 110 L204 110', 1),
      Run('M210 106 Q232 110 214 124 Q180 128 150 126', 2),
      P(64, 70), LINEUP, P(64, 150),
      Ball(71, 74), Ball(71, 154),
    ],
    dfeint: [
      Cone(220, 56), Cone(220, 76), Cone(220, 124), Cone(220, 144),
      Run('M72 100 L150 100', 1),
      Run('M152 104 Q158 112 168 76 Q176 62 216 66', 2),
      LINEUP,
    ],
    dking: [
      Box(95, 45, 130, 110, ZONE),
      Cone(95, 39), Cone(225, 39), Cone(225, 149), Cone(95, 149),
      Run('M188 80 Q196 100 202 114', 1),
      Pass(212, 132, 246, 146, 2),
      P(130, 75), P(190, 70), P(150, 125), P(200, 125), P(120, 108),
      Ball(137, 79), Ball(197, 74), Ball(157, 129), Ball(207, 129), Ball(127, 112),
    ],
    dgates: [
      Box(70, 45, 180, 110, ZONE),
      Cone(100, 56), Cone(118, 56), Cone(190, 54), Cone(208, 54), Cone(150, 94), Cone(168, 94),
      Cone(95, 124), Cone(113, 124), Cone(200, 124), Cone(218, 124),
      Run('M134 84 Q170 74 199 62', 1),
      Run('M156 96 Q178 88 190 76', 2),
      LINEUP, P(120, 124), O(142, 132),
      Ball(126, 128),
    ],
    dchase: [
      Box(250, 50, 60, 100),
      Goal(304, 78, 10, 44),
      Run('M92 92 Q170 90 240 96', 1),
      Run('M66 108 Q150 112 226 108', 2),
      Pass(244, 96, 298, 88, 3),
      LINEUP,
    ],
    dshield: [
      Box(80, 60, 70, 70, ZONE), Box(180, 60, 70, 70, ZONE),
      Run('M120 106 Q132 114 138 120', 1),
      Run('M208 86 Q198 76 192 72', 2),
      P(112, 96), O(100, 84), P(214, 94), O(228, 108),
      Ball(121, 101), Ball(207, 89),
    ],
    d2v1: [
      Box(250, 50, 60, 100),
      Goal(304, 78, 10, 44),
      Run('M100 82 Q140 86 172 94', 1),
      Run('M96 132 Q160 142 208 134', 2),
      Pass(176, 98, 212, 128, 2),
      Pass(220, 128, 298, 108, 3),
      LINEUP,
    ],
    dback: [
      Box(250, 50, 60, 100),
      Goal(304, 78, 10, 44),
      Pass(117, 100, 160, 100, 1),
      Run('M172 108 Q196 132 236 116', 2),
      Pass(240, 112, 298, 104, 3),
      LINEUP,
    ],
    dline: [
      Box(60, 45, 200, 110, ZONE),
      Line(60, 45, 60, 155), Line(260, 45, 260, 155),
      Pass(116, 74, 146, 104, 1),
      Run('M160 114 Q206 140 256 128', 2),
      P(110, 70), P(150, 112), P(120, 135), O(200, 72), O(215, 105), O(175, 140),
      Ball(116, 74),
    ],
    pfollow: [
      Box(100, 45, 120, 110, ZONE),
      Cone(100, 39), Cone(220, 39), Cone(220, 149), Cone(100, 149),
      Pass(126, 66, 192, 62, 1),
      Run('M124 74 Q158 82 186 70', 2),
      Pass(204, 68, 212, 112, 3),
      Run('M196 70 Q190 92 202 112', 3),
      LINEUP,
    ],
    dtag: [
      Box(70, 45, 180, 110, ZONE),
      Cone(70, 39), Cone(250, 39), Cone(250, 149), Cone(70, 149),
      ORun('M144 90 Q128 80 118 78', 1),
      Run('M104 72 Q88 86 90 106', 2),
      P(110, 70), P(200, 62), P(115, 130), P(232, 96), P(176, 140),
      O(150, 95), O(200, 118),
      Ball(116, 74), Ball(206, 66), Ball(121, 134), Ball(238, 100), Ball(182, 144), Ball(156, 99), Ball(206, 122),
    ],
    dshark: [
      Box(60, 45, 200, 110, ZONE),
      Line(60, 45, 60, 155), Line(260, 45, 260, 155),
      Run('M58 94 Q150 40 252 72', 1),
      Run('M58 122 L112 126', 1),
      ORun('M168 122 Q148 130 124 128', 2),
      Pass(118, 130, 130, 168, 3),
      P(46, 62), P(46, 90), P(46, 118), P(46, 146),
      O(150, 82), O(175, 122),
      Ball(52, 66), Ball(52, 94), Ball(52, 122), Ball(52, 150),
    ],
    dtail: [
      Box(80, 45, 160, 110, ZONE),
      Cone(80, 39), Cone(240, 39), Cone(240, 149), Cone(80, 149),
      Run('M171 96 Q186 104 194 112', 1),
      Run('M212 112 Q226 96 226 78', 2),
      P(120, 70), P(190, 66), P(140, 122), P(205, 118), P(165, 92),
      Ball(126, 74), Ball(196, 70), Ball(146, 126), Ball(211, 122), Ball(171, 96),
    ],
    dpirate: [
      Box(50, 45, 220, 110, ZONE),
      Box(56, 50, 30, 24), Box(234, 50, 30, 24), Box(56, 126, 30, 24), Box(234, 126, 30, 24),
      Run('M116 86 Q100 78 90 70', 1),
      ORun('M218 78 Q194 90 176 98', 2),
      Run('M104 134 Q170 152 230 142', 3),
      P(132, 84, 'A'), O(224, 70, 'B'), P(96, 130, 'C'), O(224, 130, 'D'),
      Ball(122, 90), Ball(156, 96), Ball(166, 106), Ball(170, 92), Ball(156, 110),
      Ball(66, 58), Ball(76, 66), Ball(244, 58), Ball(66, 140), Ball(246, 138), Ball(254, 144),
    ],
    pclean: [
      Box(50, 45, 220, 110, ZONE),
      Line(160, 45, 160, 155, true),
      Pass(96, 74, 186, 64, 1),
      Pass(236, 129, 100, 100, 2),
      P(90, 70), P(120, 118), P(78, 134),
      O(200, 82), O(230, 125), O(212, 60),
      Ball(96, 74), Ball(110, 94), Ball(140, 60), Ball(126, 122), Ball(186, 110), Ball(250, 74), Ball(236, 129),
    ],
    pbowl: [
      Line(90, 45, 90, 155), Line(230, 45, 230, 155),
      Cone(160, 54), Cone(160, 76), Cone(160, 98), Cone(160, 120), Cone(160, 142),
      Pass(84, 66, 152, 80, 1),
      Pass(238, 122, 168, 106, 2),
      LINEUP,
    ],
    fgoals: [
      Box(60, 45, 200, 110, ZONE),
      Goal(96, 52, 20, 6), Goal(200, 52, 20, 6), Goal(96, 142, 20, 6), Goal(200, 142, 20, 6), Goal(66, 90, 6, 20), Goal(248, 90, 6, 20),
      Pass(126, 100, 110, 64, 1),
      Run('M196 84 Q226 92 238 100', 2),
      ORun('M168 104 Q150 112 138 118', 3),
      P(120, 96), P(190, 80), P(130, 120), P(200, 116),
      O(172, 100, undefined, 3),
      Ball(126, 100), Ball(196, 84), Ball(136, 124), Ball(206, 120),
    ],
    fhalves: [
      Box(60, 45, 200, 110),
      Line(160, 45, 160, 155, true),
      Goal(54, 70, 6, 60), Goal(260, 70, 6, 60),
      Pass(136, 124, 256, 108, 1),
      Pass(202, 84, 66, 90, 2),
      LINEUP,
    ],
    fworld: [
      Box(130, 50, 120, 100, ZONE),
      Box(250, 50, 60, 100),
      Goal(304, 78, 10, 44),
      Pass(176, 94, 194, 126, 1),
      Pass(206, 134, 300, 110, 2),
      LINEUP,
    ],
    sgcolor: [
      Box(60, 45, 200, 110),
      Goal(52, 88, 8, 24), Goal(260, 88, 8, 24), Goal(148, 41, 24, 8), Goal(148, 151, 24, 8),
      Pass(126, 84, 184, 72, 1),
      Run('M196 74 Q234 82 248 96', 2),
      LINEUP,
    ],
    sgcastle: [
      Box(50, 45, 220, 110),
      Box(66, 85, 30, 30, ZONE), Box(224, 85, 30, 30, ZONE),
      Cone(81, 94), Cone(239, 94),
      Pass(136, 124, 174, 98, 1),
      Pass(186, 98, 234, 100, 2),
      ORun('M186 60 Q212 62 212 72', 2),
      LINEUP,
    ],
    sg2ball: [
      Box(50, 45, 220, 110),
      Goal(42, 86, 8, 28), Goal(270, 86, 8, 28),
      Pass(106, 74, 174, 88, 1),
      Run('M188 92 Q236 86 258 96', 2),
      ORun('M154 140 Q100 140 62 112', 3),
      P(100, 70), P(130, 118), P(180, 90), P(220, 130),
      O(150, 70), O(200, 58), O(160, 135), O(244, 124),
      Ball(106, 74), Ball(166, 139),
    ],
    pline: [
      Cone(80, 112), Cone(240, 112),
      Pass(88, 100, 230, 100, 1),
      Run('M86 120 Q160 148 234 122', 2),
      LINEUP,
    ],
    pgates: [
      Box(70, 45, 180, 110, ZONE),
      Cone(100, 56), Cone(118, 56), Cone(180, 54), Cone(198, 54), Cone(140, 92), Cone(158, 92),
      Cone(95, 124), Cone(113, 124), Cone(205, 116), Cone(223, 116),
      Pass(126, 90, 174, 116, 1),
      Run('M186 112 Q206 94 192 72', 2),
      LINEUP, P(215, 80), P(232, 132),
    ],
    passy: [
      Cone(196, 56), Cone(160, 56), Cone(124, 56),
      Cone(196, 134), Cone(160, 134), Cone(124, 134),
      Pass(78, 96, 142, 96, 1),
      Pass(142, 104, 80, 104, 2),
      Pass(80, 98, 222, 66, 3),
      Run('M224 66 Q214 48 196 48 Q178 50 178 64 Q176 78 160 78 Q142 78 142 64 Q142 48 124 48 Q106 48 104 66 Q100 84 80 92', 4),
      Run('M74 112 Q110 124 144 112', 5),
      LINEUP,
    ],
    diamond: [
      Goal(284, 62, 8, 20),
      Pass(76, 94, 152, 61, 1),
      Run('M160 137 Q158 118 156 108', 1),
      Pass(160, 63, 156, 94, 2),
      Pass(164, 100, 242, 100, 3),
      Run('M168 58 Q204 58 226 72', 4),
      Pass(246, 94, 234, 80, 4),
      Pass(238, 74, 282, 72, 5),
      LINEUP,
    ],
    diamondpoles: [
      Cone(110, 94), Cone(160, 94), Cone(210, 94),
      Pass(166, 140, 242, 106, 1),
      Pass(244, 93, 168, 59, 1),
      Pass(152, 59, 77, 93, 1),
      Pass(77, 107, 152, 141, 1),
      Run('M172 150 Q238 146 252 112', 2),
      Run('M258 90 Q248 50 174 47', 2),
      Run('M146 47 Q82 50 64 90', 2),
      Run('M62 112 Q78 162 146 164', 2),
      LINEUP,
    ],
    // Variant 2: B kaatst terug, A speelt tussen de palen door naar C (de andere kant gaat net zo).
    diamondpoles2: [
      Cone(110, 94), Cone(160, 94), Cone(210, 94),
      Pass(166, 140, 242, 106, 1),
      Run('M168 147 Q186 141 195 133', 1),
      Pass(243, 108, 206, 125, 2),
      Pass(198, 122, 166, 62, 3),
      Run('M207 134 Q236 130 246 112', 4),
      Run('M258 90 Q248 50 174 47', 4),
      LINEUP,
    ],
    // Variant 3: na het kaatsen draait B rond de paal en krijgt de bal in de loop.
    diamondpoles3: [
      Cone(110, 94), Cone(160, 94), Cone(210, 94),
      Pass(166, 140, 242, 106, 1),
      Run('M168 147 Q186 141 195 133', 1),
      Pass(243, 108, 206, 125, 2),
      Run('M256 92 Q254 70 236 64', 3),
      Pass(204, 121, 230, 72, 3),
      Pass(228, 62, 168, 56, 4),
      Run('M207 134 Q236 130 246 112', 4),
      LINEUP,
    ],
    // Variant 4: derde man. D kaatst, C speelt diep op A, A legt af op de inlopende D, D speelt diagonaal naar B.
    diamondpoles4: [
      Cone(110, 94), Cone(160, 94), Cone(210, 94),
      Pass(152, 58, 77, 93, 1),
      Run('M154 61 Q136 66 128 73', 1),
      Pass(78, 97, 116, 81, 2),
      Pass(126, 85, 154, 137, 3),
      Run('M66 110 Q70 138 102 150', 3),
      Pass(152, 147, 114, 151, 4),
      Pass(116, 144, 242, 104, 5),
      Pass(244, 93, 168, 59, 5),
      LINEUP,
    ],
    wallpass: [
      Line(20, 105, 300, 105, true),
      Cone(160, 72), Cone(160, 124),
      Goal(282, 68, 8, 20), Goal(282, 122, 8, 20),
      Run('M72 82 L140 82', 1),
      Pass(146, 78, 156, 54, 2),
      Run('M150 90 Q180 98 214 82', 3),
      Pass(166, 52, 214, 76, 3),
      Pass(224, 80, 280, 78, 4),
      LINEUP,
      O(60, 136), O(42, 136), O(24, 136), O(160, 160),
      Ball(67, 140),
    ],
    scan: [
      Pass(78, 100, 150, 100, 1),
      Run('M164 108 Q174 116 182 110', 2),
      Pass(168, 100, 242, 100, 3),
      LINEUP,
    ],
    longpass: [
      Box(40, 80, 40, 40, ZONE), Box(240, 80, 40, 40, ZONE),
      Pass(68, 96, 252, 96, 1),
      Pass(252, 106, 68, 106, 2),
      LINEUP,
    ],
    longpoints: [
      Box(44, 62, 40, 34, ZONE), Box(236, 62, 40, 34, ZONE),
      Box(44, 108, 40, 34, ZONE), Box(236, 108, 40, 34, ZONE),
      Pass(75, 74, 245, 74, 1),
      Pass(245, 84, 75, 84, 2),
      Pass(75, 120, 245, 120, 1),
      Pass(245, 130, 75, 130, 2),
      LINEUP,
      Ball(71, 129),
    ],
    through: [
      Box(250, 50, 60, 100),
      Goal(304, 78, 10, 44),
      Cone(190, 82), Cone(190, 112),
      Run('M146 136 Q190 130 228 110', 1),
      Pass(118, 100, 228, 102, 2),
      Pass(236, 102, 298, 94, 3),
      LINEUP,
    ],
    tenpass: [
      Box(50, 45, 220, 110, ZONE),
      Pass(96, 72, 142, 62, 1),
      Pass(156, 64, 204, 78, 2),
      Run('M122 124 Q140 110 158 108', 2),
      LINEUP,
    ],
    relay: [
      Cone(90, 62), Cone(90, 80), Cone(150, 62), Cone(150, 80), Cone(210, 62), Cone(210, 80),
      Cone(90, 112), Cone(90, 130), Cone(150, 112), Cone(150, 130), Cone(210, 112), Cone(210, 130),
      Cone(276, 70), Cone(276, 120),
      Pass(68, 75, 112, 75, 1),
      Pass(68, 125, 112, 125, 1),
      Pass(128, 75, 172, 75, 2),
      Pass(128, 125, 172, 125, 2),
      Run('M248 70 Q272 46 290 70 Q296 96 250 84', 3),
      Pass(232, 75, 188, 75, 4),
      LINEUP,
      O(60, 125), O(120, 125), O(180, 125), O(240, 125),
      Ball(67, 130),
    ],
    fshot: [
      Box(250, 50, 60, 100),
      Goal(304, 78, 10, 44),
      Pass(118, 116, 164, 68, 1),
      Run('M118 124 Q150 118 186 106', 2),
      Pass(176, 67, 190, 96, 3),
      Pass(198, 102, 298, 110, 4),
      LINEUP,
    ],
    fvolley: [
      Box(250, 50, 60, 100),
      Goal(304, 78, 10, 44),
      Pass(212, 78, 168, 102, 1),
      Pass(168, 104, 298, 100, 2),
      LINEUP,
    ],
    fcross: [
      Box(250, 50, 60, 100),
      Goal(304, 78, 10, 44),
      Run('M182 52 L232 52', 1),
      Run('M158 94 Q220 86 262 88', 2),
      Run('M158 132 Q230 128 270 116', 2),
      Pass(238, 58, 264, 84, 3),
      LINEUP,
    ],
    fcorner: [
      Box(250, 50, 60, 100),
      Goal(304, 78, 10, 44),
      Run('M238 72 Q252 74 266 82', 1),
      Run('M240 102 L262 102', 1),
      Run('M238 130 Q254 128 268 118', 1),
      Pass(286, 60, 266, 82, 2),
      Pass(268, 90, 301, 98, 3),
      LINEUP,
    ],
    fturn: [
      Goal(304, 78, 10, 44),
      Box(250, 50, 60, 100),
      Pass(122, 100, 184, 100, 1),
      Run('M192 108 Q198 128 218 126', 2),
      Pass(226, 122, 300, 108, 3),
      LINEUP,
    ],
    defline: [
      Goal(304, 78, 10, 44),
      Line(214, 48, 214, 152, true),
      Pass(124, 77, 110, 93, 1),
      Pass(112, 106, 144, 122, 1),
      ORun('M236 66 L236 84', 2),
      ORun('M236 92 L236 110', 2),
      ORun('M236 118 L236 136', 2),
      ORun('M212 62 L194 62', 3),
      ORun('M212 88 L194 88', 3),
      ORun('M212 114 L194 114', 3),
      ORun('M212 140 L194 140', 3),
      LINEUP,
    ],
    fcutback: [
      Box(250, 50, 60, 100),
      Goal(304, 78, 10, 44),
      Run('M180 52 Q240 50 284 60', 1),
      Run('M168 108 Q226 100 246 100', 2),
      Pass(284, 66, 252, 98, 3),
      Pass(252, 104, 298, 112, 4),
      LINEUP,
    ],
    frebound: [
      Box(250, 50, 60, 100),
      Goal(304, 78, 10, 44),
      Pass(158, 100, 298, 94, 1),
      Run('M160 108 Q210 116 246 112', 2),
      Pass(230, 140, 252, 118, 3),
      Pass(256, 112, 300, 104, 4),
      LINEUP,
      Ball(232, 142),
    ],
    fcircuit: [
      Box(250, 50, 60, 100),
      Goal(304, 78, 10, 44),
      Run('M80 100 L150 100', 1),
      Pass(168, 100, 284, 100, 2),
      Pass(118, 62, 152, 94, 3),
      Run('M124 52 Q170 48 200 74', 3),
      Pass(168, 96, 192, 84, 3),
      Pass(204, 80, 296, 92, 3),
      Pass(118, 138, 152, 106, 4),
      Run('M124 148 Q170 152 200 126', 4),
      Pass(168, 104, 192, 116, 4),
      Pass(204, 120, 296, 108, 4),
      LINEUP, P(160, 100),
      Ball(116, 59), Ball(116, 141),
    ],
    fheader: [
      Box(250, 50, 60, 100),
      Goal(304, 78, 10, 44),
      Run('M180 100 L230 100', 1),
      Pass(252, 142, 240, 106, 1),
      Pass(240, 98, 300, 86, 2),
      LINEUP,
    ],
    fcounter: [
      Box(250, 50, 60, 100),
      Goal(304, 78, 10, 44),
      Run('M92 100 L168 100', 1),
      Run('M88 55 Q150 52 210 60', 2),
      Run('M88 145 Q150 148 214 140', 2),
      Pass(172, 96, 206, 64, 3),
      Pass(214, 66, 296, 92, 4),
      LINEUP,
    ],
    fgame: [
      Box(40, 45, 240, 110, ZONE),
      Goal(30, 84, 8, 32), Goal(282, 84, 8, 32),
      Pass(134, 84, 154, 52, 1),
      Pass(166, 52, 196, 112, 2),
      Pass(208, 118, 276, 104, 3),
      LINEUP,
    ],
    fplace: [
      Box(250, 50, 60, 100),
      Goal(304, 78, 10, 44),
      Cone(298, 82), Cone(298, 108),
      Pass(208, 98, 300, 84, 1),
      Pass(208, 104, 300, 116, 2),
      LINEUP,
    ],
    pr1v1: [
      Box(80, 55, 160, 90, ZONE),
      Cone(80, 49), Cone(240, 49), Cone(240, 139), Cone(80, 139),
      Pass(103, 100, 217, 100, 1),
      Run('M104 108 Q150 114 196 106', 2),
      LINEUP,
    ],
    prcurve: [
      Box(90, 45, 140, 110, ZONE),
      Cone(90, 39), Cone(230, 39), Cone(230, 149), Cone(90, 149),
      Pass(137, 62, 192, 60, 1),
      ORun('M168 124 Q146 88 186 72', 2),
      LINEUP,
    ],
    pr2v2: [
      Box(60, 45, 200, 110, ZONE),
      Goal(52, 60, 8, 22), Goal(52, 118, 8, 22), Goal(260, 60, 8, 22), Goal(260, 118, 8, 22),
      ORun('M174 82 Q150 74 136 72', 1),
      ORun('M194 116 Q176 104 166 96', 2),
      Pass(124, 80, 122, 120, 3),
      LINEUP,
    ],
    prhunt: [
      Box(70, 45, 180, 110, ZONE),
      Cone(70, 39), Cone(250, 39), Cone(250, 149), Cone(70, 149),
      Cone(105, 62), Cone(105, 82), Cone(215, 62), Cone(215, 82),
      Cone(105, 115), Cone(105, 135), Cone(215, 115), Cone(215, 135),
      Run('M126 70 Q112 76 90 78', 1),
      ORun('M166 90 Q178 78 184 70', 2),
      ORun('M184 108 Q210 96 210 80', 2),
      P(132, 66), P(194, 56), P(150, 135), P(238, 110),
      O(160, 95), O(178, 112),
      Ball(138, 70), Ball(200, 60), Ball(156, 139), Ball(244, 114),
    ],
    prcp: [
      Box(50, 45, 220, 110, ZONE),
      Goal(42, 58, 8, 22), Goal(42, 120, 8, 22), Goal(270, 58, 8, 22), Goal(270, 120, 8, 22),
      ORun('M138 98 Q148 94 152 92', 1),
      ORun('M180 72 Q174 80 170 84', 1),
      ORun('M198 122 Q206 112 208 106', 2),
      ORun('M96 76 Q104 104 104 122', 2),
      LINEUP,
    ],
    prshift: [
      Box(80, 14, 160, 172),
      Box(80, 82, 160, 36, ZONE),
      Pass(210, 50, 166, 30, 1),
      ORun('M186 92 Q176 62 166 40', 2),
      ORun('M92 104 L108 104', 2),
      ORun('M228 104 L208 104', 2),
      Pass(154, 30, 110, 48, 3),
      Pass(106, 60, 162, 122, 4),
      LINEUP,
    ],
    prtrig: [
      Box(10, 50, 60, 100),
      Goal(6, 78, 10, 44),
      Goal(272, 60, 8, 22), Goal(272, 118, 8, 22),
      Pass(76, 64, 36, 94, 1),
      ORun('M164 66 Q120 58 80 60', 2),
      ORun('M144 96 Q106 90 72 92', 2),
      ORun('M164 134 Q120 142 80 140', 2),
      LINEUP,
    ],
    prunder: [
      Box(250, 50, 60, 100),
      Goal(304, 78, 10, 44),
      Pass(106, 96, 104, 68, 1),
      ORun('M204 80 Q180 70 164 66', 2),
      ORun('M204 112 Q198 102 196 96', 2),
      ORun('M58 146 Q140 150 188 132', 3),
      LINEUP,
    ],
    przone: [
      Box(14, 14, 146, 172, ZONE),
      Line(160, 10, 160, 190),
      Goal(308, 84, 8, 32), Goal(4, 84, 8, 32),
      ORun('M114 76 Q90 64 80 62', 1),
      ORun('M114 118 Q98 108 94 104', 1),
      Pass(74, 70, 20, 94, 2),
      P(70, 60), P(70, 140), P(105, 100), P(130, 150), P(130, 50), P(24, 100),
      O(296, 100), O(120, 80), O(120, 120), O(148, 100), O(200, 60), O(200, 140),
      Ball(76, 64),
    ],
    prbuild: [
      Box(10, 50, 60, 100),
      Goal(6, 78, 10, 44),
      Line(220, 30, 220, 170, true),
      Pass(34, 96, 64, 66, 1),
      ORun('M124 98 Q84 106 62 82', 2),
      ORun('M134 56 Q106 52 82 56', 2),
      ORun('M136 136 Q120 118 114 104', 3),
      LINEUP,
    ],
    wprev: [
      Cone(240, 52), Cone(240, 92), Cone(240, 132),
      Run('M82 60 L226 60', 1),
      Run('M82 100 Q118 88 154 100 Q190 112 226 100', 1),
      Run('M226 142 L86 142', 2),
      P(70, 60), P(70, 100), P(70, 140), P(52, 60), P(52, 100),
    ],
    wchain: [
      Box(60, 45, 200, 110, ZONE),
      Cone(60, 39), Cone(260, 39), Cone(260, 149), Cone(60, 149),
      Run('M174 94 Q196 82 210 74', 1),
      Run('M228 64 L250 56', 2),
      P(150, 100), P(166, 100),
      O(100, 60), O(220, 70), O(110, 140), O(230, 135), O(185, 145),
    ],
    wreact: [
      Box(100, 48, 120, 94, ZONE),
      Cone(100, 42), Cone(220, 42), Cone(220, 136), Cone(100, 136),
      Run('M152 98 Q128 76 108 58', 1),
      Run('M170 102 Q140 84 114 64', 2),
      LINEUP,
    ],
    wshadow: [
      Cone(80, 54), Cone(240, 54), Cone(240, 134), Cone(80, 134),
      Line(80, 100, 240, 100, true),
      Run('M146 80 L196 80', 1),
      Run('M146 120 L196 120', 2),
      P(140, 80), O(140, 120),
    ],
    wjuggle: [
      Pass(158, 104, 202, 104, 1),
      P(90, 80), P(150, 110), P(210, 110),
      Ball(90, 64), Ball(157, 102),
    ],
    wcircleup: [
      Pass(169, 64, 191, 81, 1),
      Pass(191, 93, 144, 128, 1),
      Pass(132, 124, 123, 97, 2),
      Pass(129, 81, 151, 64, 2),
      LINEUP,
    ],
    wthrow: [
      Pass(118, 98, 192, 98, 1),
      Pass(192, 106, 118, 106, 2),
      LINEUP, P(110, 145), P(200, 145),
      Ball(117, 141),
    ],
    whand: [
      Box(50, 45, 220, 110, ZONE),
      Goal(42, 84, 8, 32), Goal(270, 84, 8, 32),
      Pass(156, 82, 196, 110, 1),
      Pass(204, 112, 266, 100, 2),
      P(150, 80), P(200, 115), P(110, 120), P(90, 70),
      O(178, 70), O(230, 80), O(130, 60), O(215, 140),
      Ball(156, 84),
    ],
    whandpos: [
      Box(50, 45, 220, 110, ZONE),
      Cone(50, 45), Cone(262, 45), Cone(50, 145), Cone(262, 145),
      Pass(108, 74, 142, 106, 1),
      Pass(152, 108, 200, 84, 1),
      Pass(206, 84, 232, 112, 1),
      Run('M96 82 Q84 104 100 126', 2),
      Run('M214 72 Q236 58 252 64', 2),
      LINEUP,
    ],
    wtennis: [
      Box(60, 55, 200, 90, ZONE),
      Line(160, 55, 160, 145),
      Pass(107, 82, 198, 120, 1),
      Pass(198, 128, 118, 128, 2),
      P(100, 80), P(110, 125), O(215, 80), O(205, 125),
      Ball(106, 84),
    ],
    wtennisworld: [
      Box(52, 48, 216, 104, ZONE),
      Line(160, 64, 160, 136),
      Pass(106, 84, 204, 98, 1),
      Pass(216, 108, 112, 92, 1),
      Run('M104 92 Q122 148 160 144 Q198 148 212 118', 2),
      Run('M218 88 Q198 52 160 56 Q122 52 108 74', 2),
      LINEUP,
    ],
    wduel: [
      Box(60, 45, 220, 110, ZONE),
      Goal(272, 60, 8, 22), Goal(272, 118, 8, 22),
      Pass(88, 146, 160, 104, 1),
      Run('M88 90 Q124 94 152 100', 2),
      Run('M88 116 Q122 112 150 108', 2),
      LINEUP,
    ],
    wmatch: [
      Box(40, 50, 90, 70, ZONE),
      Pass(188, 70, 242, 70, 1),
      Pass(242, 120, 188, 120, 1),
      Pass(90, 55, 124, 80, 2),
      Run('M160 150 L260 150', 3),
      P(40, 85), P(85, 50), P(130, 85), P(85, 120), O(76, 82), O(96, 92),
      P(180, 70), P(250, 70), P(180, 120), P(250, 120), P(150, 150),
      Ball(92, 54), Ball(187, 75), Ball(249, 124),
    ],
    ps43: [
      Box(60, 45, 200, 110, ZONE),
      Cone(60, 39), Cone(260, 39), Cone(260, 149), Cone(60, 149),
      Pass(66, 96, 94, 70, 1),
      Pass(106, 70, 152, 96, 2),
      Pass(168, 104, 208, 126, 3),
      Pass(222, 126, 252, 104, 4),
      LINEUP,
    ],
    ps3z: [
      Box(30, 55, 80, 90, ZONE), Box(120, 55, 80, 90, ZONE), Box(210, 55, 80, 90, ZONE),
      Pass(46, 72, 84, 66, 1),
      Pass(96, 70, 154, 104, 2),
      Pass(166, 108, 238, 132, 3),
      LINEUP,
    ],
    psshape: [
      Box(10, 50, 60, 100),
      Goal(6, 78, 10, 44),
      Line(210, 14, 210, 186, true),
      Pass(34, 96, 64, 74, 1),
      Pass(74, 64, 104, 54, 2),
      Pass(114, 56, 130, 78, 3),
      Run('M140 86 Q170 72 202 70', 4),
      LINEUP,
    ],
    psswitch: [
      Box(40, 45, 240, 110, ZONE),
      Goal(32, 50, 8, 20), Goal(32, 130, 8, 20), Goal(272, 50, 8, 20), Goal(272, 130, 8, 20),
      Pass(196, 66, 176, 84, 1),
      Pass(176, 96, 224, 134, 2),
      Run('M236 138 Q254 142 266 140', 3),
      LINEUP,
    ],
    psquad: [
      Box(40, 45, 240, 110, ZONE),
      Line(160, 45, 160, 155, true), Line(40, 100, 280, 100, true),
      Goal(32, 60, 8, 20), Goal(32, 120, 8, 20), Goal(280, 60, 8, 20), Goal(280, 120, 8, 20),
      Pass(96, 74, 188, 72, 1),
      Run('M132 126 Q170 118 196 126', 2),
      LINEUP,
    ],
    psbuild: [
      Box(10, 50, 60, 100),
      Goal(6, 78, 10, 44),
      Line(230, 14, 230, 186, true),
      Pass(34, 96, 64, 76, 1),
      Pass(74, 66, 114, 54, 2),
      Run('M126 50 Q170 46 220 52', 3),
      LINEUP,
    ],
    psshadow: [
      Line(160, 10, 160, 190),
      Goal(4, 84, 8, 32), Goal(308, 84, 8, 32),
      Pass(30, 98, 54, 84, 1),
      Pass(62, 74, 76, 52, 2),
      Pass(86, 50, 144, 68, 3),
      Pass(156, 72, 244, 98, 4),
      LINEUP,
    ],
    psline: [
      Box(40, 45, 240, 110, ZONE),
      Line(145, 45, 145, 155, true), Line(175, 45, 175, 155, true),
      Pass(88, 74, 152, 93, 1),
      Run('M166 102 Q176 106 178 98', 2),
      Pass(168, 94, 214, 64, 3),
      LINEUP,
    ],
    psflank: [
      Box(250, 50, 60, 100),
      Goal(304, 78, 10, 44),
      Box(110, 40, 140, 44, ZONE),
      Pass(126, 72, 184, 58, 1),
      Pass(186, 62, 166, 90, 2),
      Pass(168, 90, 230, 62, 3),
      Run('M126 64 Q180 36 234 54', 3),
      Pass(240, 62, 264, 104, 4),
      LINEUP,
    ],
    omduel: [
      Box(80, 60, 160, 80, ZONE),
      Goal(72, 88, 8, 24), Goal(240, 88, 8, 24),
      Run('M150 106 Q180 124 206 110', 1),
      Run('M190 106 Q150 126 92 106', 2),
      LINEUP,
    ],
    omwaves: [
      Box(40, 45, 240, 110, ZONE),
      Goal(32, 74, 8, 20), Goal(32, 106, 8, 20), Goal(280, 74, 8, 20), Goal(280, 106, 8, 20),
      Run('M108 132 Q150 138 176 126', 1),
      Pass(106, 76, 176, 120, 1),
      Pass(186, 122, 276, 116, 2),
      Run('M196 94 Q140 72 62 86', 3),
      Run('M262 60 Q200 50 116 62', 3),
      LINEUP,
    ],
    om32: [
      Line(160, 10, 160, 190),
      Goal(4, 84, 8, 32), Goal(308, 84, 8, 32),
      Run('M130 100 L186 100', 1),
      Pass(196, 100, 300, 96, 2),
      Run('M214 76 Q150 60 62 78', 3),
      Run('M214 124 Q150 140 62 120', 3),
      LINEUP,
    ],
    omwinner: [
      Box(70, 50, 180, 100, ZONE),
      Goal(62, 62, 8, 20), Goal(62, 118, 8, 20), Goal(250, 62, 8, 20), Goal(250, 118, 8, 20),
      Pass(146, 80, 244, 72, 1),
      Run('M176 50 Q190 62 198 74', 2),
      LINEUP,
      Ball(182, 46),
    ],
    omrestart: [
      Box(40, 45, 240, 110, ZONE),
      Goal(32, 84, 8, 32), Goal(280, 84, 8, 32),
      Pass(216, 66, 276, 94, 1),
      Pass(262, 104, 208, 114, 2),
      Run('M194 116 Q150 124 112 114', 3),
      LINEUP,
    ],
    omrecover: [
      Box(250, 50, 60, 100),
      Goal(304, 78, 10, 44),
      Run('M122 100 L170 100', 1),
      Run('M76 106 Q150 160 226 124', 2),
      LINEUP,
    ],
    omcounter: [
      Line(160, 10, 160, 190),
      Goal(4, 84, 8, 32), Goal(308, 84, 8, 32),
      Pass(106, 116, 194, 66, 1),
      Run('M156 136 Q210 130 250 112', 2),
      Pass(206, 66, 246, 106, 3),
      Pass(254, 108, 300, 100, 4),
      LINEUP,
    ],
    omkeeper: [
      Box(10, 50, 60, 100),
      Goal(6, 78, 10, 44),
      Goal(272, 60, 8, 22), Goal(272, 118, 8, 22),
      Pass(122, 100, 36, 100, 1),
      Run('M96 52 Q130 44 168 48', 2),
      Run('M96 148 Q130 156 168 152', 2),
      Pass(34, 94, 162, 52, 3),
      Run('M176 54 Q220 60 266 70', 4),
      LINEUP,
    ],
    omback: [
      Line(160, 10, 160, 190),
      Goal(308, 84, 8, 32), Goal(4, 84, 8, 32),
      ORun('M124 64 Q170 58 200 64', 1),
      ORun('M104 126 Q150 140 190 130', 1),
      ORun('M114 104 Q128 98 136 96', 2),
      O(296, 100), O(120, 60), O(100, 130), O(108, 104), O(210, 90), O(230, 140),
      P(24, 100), P(150, 90), P(85, 70), P(75, 118), P(190, 145), P(180, 50),
      Ball(144, 94),
    ],
    omrondo: [
      Box(10, 50, 60, 100),
      Goal(6, 78, 10, 44),
      Box(170, 55, 90, 90, ZONE),
      Pass(209, 59, 176, 82, 1),
      Run('M190 110 Q130 116 80 104', 2),
      Run('M164 128 Q120 142 84 124', 3),
      Pass(76, 104, 34, 100, 4),
      LINEUP,
    ],
    sgfunino: [
      Box(40, 45, 240, 110),
      Line(90, 45, 90, 155, true), Line(230, 45, 230, 155, true),
      Goal(32, 52, 8, 20), Goal(32, 128, 8, 20), Goal(280, 52, 8, 20), Goal(280, 128, 8, 20),
      Pass(156, 114, 184, 92, 1),
      Run('M196 90 Q224 76 242 74', 2),
      Pass(250, 72, 278, 64, 3),
      LINEUP,
    ],
    sgnum: [
      Box(70, 60, 180, 80),
      Goal(62, 88, 8, 24), Goal(250, 88, 8, 24),
      Pass(44, 72, 122, 98, 1),
      Run('M163 56 Q152 74 134 88', 1),
      ORun('M155 144 Q154 124 140 110', 1),
      Run('M134 104 Q190 126 238 106', 2),
      LINEUP,
    ],
    sggates: [
      Box(40, 45, 240, 110),
      Cone(100, 58), Cone(100, 80), Cone(165, 112), Cone(165, 134), Cone(220, 58), Cone(220, 80), Cone(250, 118), Cone(250, 140), Cone(75, 115), Cone(75, 137),
      Pass(198, 78, 242, 74, 1),
      Run('M196 88 Q228 112 240 126', 2),
      LINEUP,
    ],
    sgend: [
      Box(40, 45, 240, 110),
      Line(70, 45, 70, 155, true), Line(250, 45, 250, 155, true),
      Run('M214 72 Q240 62 262 76', 1),
      Pass(198, 114, 258, 84, 2),
      LINEUP,
    ],
    sgwing: [
      Line(10, 62, 310, 62, true), Line(10, 138, 310, 138, true),
      Goal(4, 84, 8, 32), Goal(308, 84, 8, 32),
      Pass(127, 93, 174, 56, 1),
      Run('M188 50 Q208 46 224 50', 2),
      ORun('M212 76 Q222 66 232 60', 2),
      Pass(230, 56, 256, 90, 3),
      LINEUP,
    ],
    sgman: [
      Box(50, 45, 220, 110),
      Goal(42, 88, 8, 24), Goal(270, 88, 8, 24),
      Run('M203 148 Q236 150 246 128', 1),
      Pass(129, 104, 240, 124, 2),
      P(120, 100), P(195, 148), P(170, 65), P(230, 80),
      O(138, 92), O(185, 135), O(186, 72), O(246, 86),
      Ball(127, 104),
    ],
    sgbuild: [
      Line(110, 10, 110, 190, true), Line(210, 10, 210, 190, true),
      Goal(4, 84, 8, 32), Goal(308, 84, 8, 32),
      Pass(32, 98, 54, 68, 1),
      Pass(66, 64, 132, 96, 2),
      Pass(146, 106, 194, 136, 3),
      LINEUP,
    ],
    sgavv: [
      Box(250, 50, 60, 100),
      Goal(304, 78, 10, 44),
      Goal(40, 50, 8, 22), Goal(40, 128, 8, 22),
      Pass(98, 100, 182, 100, 1),
      Run('M158 56 Q220 44 268 78', 2),
      Pass(196, 96, 262, 80, 3),
      LINEUP,
    ],
    sgblock: [
      Line(160, 10, 160, 190),
      Goal(4, 84, 8, 32), Goal(308, 84, 8, 32),
      Run('M118 102 Q142 114 172 110', 1),
      Pass(198, 66, 234, 90, 2),
      Pass(248, 98, 286, 100, 3),
      P(24, 100), P(110, 100), P(190, 60), P(205, 140), P(240, 95), P(255, 45),
      O(296, 100), O(140, 60), O(222, 118), O(270, 70), O(270, 128),
      Ball(196, 64),
    ],
    sg2v2: [
      Box(90, 55, 140, 90),
      Goal(82, 88, 8, 24), Goal(230, 88, 8, 24),
      Pass(137, 86, 146, 116, 1),
      Run('M158 128 Q192 144 224 110', 2),
      P(130, 80), P(150, 125), O(180, 80), O(198, 106),
      Ball(137, 84),
    ],
    cladder: [
      Box(50, 85, 120, 30),
      Line(70, 85, 70, 115), Line(90, 85, 90, 115), Line(110, 85, 110, 115), Line(130, 85, 130, 115), Line(150, 85, 150, 115),
      Run('M36 100 L166 100', 1),
      Pass(230, 100, 188, 100, 2),
      Pass(188, 110, 230, 110, 3),
      P(28, 100), P(28, 130), P(28, 70), P(180, 105),
      N(240, 104),
      Ball(232, 98),
    ],
    cagility: [
      Cone(160, 138), Cone(160, 50), Cone(100, 50), Cone(220, 50),
      Run('M160 134 L160 70', 1),
      Run('M154 58 L114 58', 2),
      Run('M112 66 L206 66', 3),
      Run('M204 74 L168 130', 4),
      LINEUP,
    ],
    cjump: [
      Cone(80, 96), Cone(110, 96), Cone(140, 96), Cone(170, 96), Cone(200, 96), Cone(262, 94),
      Run('M50 100 Q65 74 80 92 Q95 74 110 92 Q125 74 140 92 Q155 74 170 92 Q185 74 200 92 Q208 80 214 98', 1),
      Run('M218 104 L252 104', 2),
      P(36, 100), P(36, 130), P(36, 70),
    ],
    cstar: [
      Cone(160, 44), Cone(212, 80), Cone(194, 136), Cone(126, 136), Cone(108, 80),
      Run('M160 92 L160 60', 1),
      Run('M168 106 L188 128', 2),
      LINEUP,
    ],
    cbalance: [
      Box(60, 45, 200, 110, ZONE),
      Cone(60, 39), Cone(260, 39), Cone(260, 149), Cone(60, 149),
      Run('M104 68 Q122 56 134 68', 1),
      Run('M184 118 Q202 108 212 120', 2),
      P(110, 80), O(134, 80), P(190, 80), O(214, 80), P(110, 130), O(134, 130), P(190, 130), O(214, 130),
      Ball(117, 136),
    ],
    crelay: [
      Cone(90, 60), Cone(115, 60), Cone(140, 60), Cone(175, 60), Cone(200, 60), Cone(250, 60),
      Cone(90, 124), Cone(115, 124), Cone(140, 124), Cone(175, 124), Cone(200, 124), Cone(250, 124),
      Run('M52 66 Q78 50 102 62 Q128 76 152 60 L238 56 Q264 58 258 80', 1),
      Run('M244 86 L66 86', 2),
      Pass(62, 84, 48, 76, 3),
      LINEUP, O(40, 130), O(22, 130),
      Ball(48, 134),
    ],
    cmastery: [
      Box(60, 45, 200, 110, ZONE),
      Run('M98 138 L124 138', 1),
      Run('M238 74 L250 88 L262 70', 2),
      P(90, 70), P(160, 70), P(230, 70), P(90, 130), P(160, 130), P(230, 130),
      N(40, 100, 'T'),
      Ball(97, 76), Ball(167, 76), Ball(237, 76), Ball(97, 136), Ball(167, 136), Ball(237, 136),
    ],
    ctwoball: [
      Box(60, 45, 200, 110, ZONE),
      Cone(60, 39), Cone(260, 39), Cone(260, 149), Cone(60, 149),
      Run('M110 80 Q140 116 180 122', 1),
      Pass(112, 66, 170, 88, 2),
      P(104, 72), P(176, 94), P(220, 64), P(92, 132),
      Ball(111, 78), Ball(183, 98), Ball(227, 68), Ball(99, 136),
    ],
    ccircuit: [
      Box(40, 55, 90, 24),
      Line(58, 55, 58, 79), Line(76, 55, 76, 79), Line(94, 55, 94, 79), Line(112, 55, 112, 79),
      Cone(180, 62), Cone(205, 62), Cone(230, 62), Cone(255, 62),
      Cone(70, 128), Cone(95, 128), Cone(120, 128),
      Cone(180, 126), Cone(270, 126),
      Run('M40 67 L124 67', 1),
      Pass(196, 140, 254, 140, 1),
      Run('M140 64 L162 64', 2),
      Run('M270 80 Q284 104 272 118', 2),
      Run('M176 152 Q150 162 132 150', 2),
      Run('M46 120 Q32 102 42 86', 2),
      P(30, 67), P(168, 72), P(52, 134), P(188, 140), P(262, 140),
      Ball(195, 144),
    ],
    cdrop: [
      Run('M128 100 L188 100', 1),
      Run('M188 112 Q158 126 130 112', 2),
      LINEUP, P(120, 148), N(210, 148),
      Ball(203, 140),
    ],
    obsplit: [
      Box(10, 50, 60, 100),
      Goal(4, 84, 8, 32),
      Cone(140, 40), Cone(140, 62), Cone(140, 128), Cone(140, 150),
      Run('M58 80 Q66 64 74 56', 1),
      Run('M58 120 Q66 136 74 144', 1),
      Pass(32, 106, 68, 138, 2),
      Run('M82 144 L130 144', 3),
      LINEUP,
    ],
    obsix: [
      Box(10, 50, 60, 100),
      Goal(4, 84, 8, 32),
      Box(230, 75, 50, 50, ZONE),
      Run('M134 116 L146 102', 1),
      Pass(76, 66, 140, 96, 2),
      Pass(156, 98, 246, 100, 3),
      LINEUP,
    ],
    obdrop: [
      Box(10, 50, 60, 100),
      Goal(4, 84, 8, 32),
      Line(250, 10, 250, 190),
      Cone(244, 36), Cone(244, 58), Cone(244, 132), Cone(244, 154),
      Run('M110 100 L84 100', 1),
      Run('M126 44 L176 44', 1),
      Run('M126 156 L176 156', 1),
      Pass(28, 106, 64, 128, 2),
      Pass(76, 134, 170, 154, 3),
      LINEUP,
    ],
    obdrive: [
      Box(30, 45, 230, 110),
      Line(145, 45, 145, 155, true),
      Pass(72, 80, 70, 120, 1),
      Run('M78 132 Q120 142 170 128', 2),
      Pass(178, 124, 272, 102, 3),
      LINEUP,
    ],
    oblong: [
      Box(10, 50, 60, 100),
      Goal(4, 84, 8, 32),
      Box(150, 55, 100, 90, ZONE),
      Pass(32, 98, 176, 96, 1),
      Pass(184, 104, 168, 130, 2),
      Run('M170 140 Q210 148 244 130', 3),
      LINEUP,
    ],
    obswitch: [
      Box(10, 50, 60, 100),
      Goal(4, 84, 8, 32),
      Cone(190, 38), Cone(190, 60), Cone(190, 140), Cone(190, 162),
      Pass(110, 58, 32, 94, 1),
      Pass(30, 108, 62, 126, 2),
      Pass(74, 132, 108, 146, 3),
      Pass(124, 153, 204, 156, 4),
      LINEUP,
    ],
    obgame: [
      Box(10, 50, 60, 100),
      Goal(4, 84, 8, 32),
      Goal(280, 44, 8, 20), Goal(280, 90, 8, 20), Goal(280, 136, 8, 20),
      Pass(30, 96, 58, 74, 1),
      Pass(70, 72, 144, 84, 2),
      Run('M156 88 Q200 90 236 100', 3),
      Pass(242, 100, 278, 100, 4),
      P(24, 100), P(64, 70), P(64, 130), P(112, 46), P(112, 154), P(150, 85), P(160, 125),
      O(98, 56), O(96, 112), O(138, 146), O(200, 62), O(212, 132), O(250, 74),
      Ball(31, 104),
    ],
    obline: [
      Box(20, 45, 250, 110),
      Goal(12, 84, 8, 32), Goal(270, 62, 8, 20), Goal(270, 118, 8, 20),
      Line(90, 45, 90, 155, true),
      Pass(38, 106, 56, 134, 1),
      Run('M68 144 Q120 150 170 136', 2),
      Pass(176, 132, 266, 128, 2),
      LINEUP,
    ],
    obwall: [
      Cone(230, 56), Cone(230, 78),
      Pass(58, 100, 182, 100, 1),
      Run('M104 126 Q122 132 138 124', 2),
      Pass(184, 106, 146, 120, 2),
      Pass(152, 116, 262, 58, 3),
      LINEUP,
    ],
    obkeeper: [
      Box(10, 50, 60, 100),
      Goal(4, 84, 8, 32),
      Box(220, 45, 50, 50, ZONE),
      Pass(30, 96, 56, 72, 1),
      Pass(32, 94, 238, 72, 2),
      LINEUP,
    ],
    obzones: [
      Line(160, 10, 160, 190, true),
      Goal(4, 84, 8, 32), Goal(308, 84, 8, 32),
      Run('M92 130 Q80 136 72 138', 1),
      Run('M178 94 Q170 84 160 80', 1),
      Pass(30, 106, 64, 134, 2),
      Pass(32, 96, 154, 82, 3),
      Run('M78 144 Q130 156 196 138', 4),
      ORun('M100 22 Q106 40 104 58', 5),
      ORun('M100 178 Q106 160 104 142', 5),
      LINEUP,
      O(96, 14, '7', 5), O(96, 186, '11', 5),
    ],
    obwave: [
      Line(160, 10, 160, 190),
      Goal(4, 84, 8, 32), Goal(308, 84, 8, 32),
      Run('M90 106 Q80 98 76 88', 1),
      Run('M142 102 Q138 116 128 126', 1),
      Run('M108 22 L144 22', 2),
      Run('M108 178 L144 178', 2),
      Run('M184 94 Q176 82 170 74', 2),
      Pass(30, 96, 70, 88, 3),
      Pass(82, 82, 138, 28, 4),
      LINEUP,
    ],
    obback: [
      Box(20, 35, 250, 130),
      Goal(12, 84, 8, 32), Goal(270, 52, 8, 20), Goal(270, 128, 8, 20),
      Pass(102, 100, 42, 100, 1),
      ORun('M104 124 Q72 118 46 106', 1),
      Pass(38, 92, 64, 50, 2),
      ORun('M112 80 Q104 60 90 48', 2),
      Run('M78 40 Q130 34 176 48', 3),
      Pass(182, 50, 266, 62, 3),
      LINEUP,
    ],
    obfree: [
      Line(150, 10, 150, 190, true),
      Goal(4, 84, 8, 32), Goal(280, 56, 8, 20), Goal(280, 124, 8, 20),
      Run('M90 126 Q80 134 70 138', 1),
      Run('M170 88 Q162 76 152 70', 1),
      Pass(30, 106, 62, 134, 2),
      Pass(32, 96, 144, 72, 3),
      Pass(158, 76, 272, 98, 4),
      Run('M166 70 Q210 56 240 60', 5),
      Pass(278, 90, 248, 66, 5),
      Pass(254, 62, 278, 64, 5),
      LINEUP,
    ],
    gs11: [
      Cone(60, 64), Cone(100, 64), Cone(140, 64), Cone(180, 64), Cone(220, 64), Cone(260, 64),
      Cone(60, 128), Cone(100, 128), Cone(140, 128), Cone(180, 128), Cone(220, 128), Cone(260, 128),
      Run('M50 90 Q150 80 266 92', 1),
      Run('M266 110 Q150 120 50 110', 2),
      P(40, 92), P(40, 110), P(22, 92), P(22, 110),
    ],
    gsnordic: [
      Box(60, 50, 200, 100, ZONE),
      Run('M120 80 Q136 76 144 88', 1),
      Run('M196 116 L196 98', 2),
      P(96, 88), P(114, 88), P(196, 124), P(222, 110),
    ],
    gsland: [
      Box(170, 80, 40, 40, ZONE),
      Cone(46, 90), Cone(170, 74), Cone(210, 74), Cone(210, 114), Cone(170, 114),
      Run('M48 100 L166 100', 1),
      Run('M196 96 Q214 102 212 118 Q208 128 196 128', 2),
      Pass(244, 146, 202, 132, 3),
      Pass(200, 140, 240, 156, 3),
      P(34, 100), P(250, 150),
      Ball(244, 144),
    ],
    gscool: [
      P(215, 100), P(199, 139), P(160, 155), P(121, 139), P(105, 100), P(121, 61), P(160, 45), P(199, 61),
      N(160, 100, 'T'),
    ],
    kcircuit: [
      Cone(100, 52), Cone(160, 38), Cone(220, 52), Cone(220, 136), Cone(160, 150), Cone(100, 136),
      Run('M114 62 Q130 50 146 48', 1),
      Run('M176 48 Q192 50 206 60', 1),
      P(100, 74), P(160, 60), P(220, 74), P(220, 126), P(160, 140), P(100, 126),
    ],
    kplyo: [
      Cone(46, 90), Cone(270, 90),
      Run('M46 100 Q62 74 80 96 Q98 74 116 96 Q134 74 152 96', 1),
      Run('M160 100 L262 100', 2),
      P(30, 100), P(30, 130), P(30, 70),
    ],
    ksprint: [
      Box(150, 70, 110, 60, ZONE),
      Cone(50, 64), Cone(50, 128), Cone(150, 64), Cone(150, 128), Cone(260, 64), Cone(260, 128),
      Run('M48 100 L142 100', 1),
      Run('M156 100 L254 100', 2),
      LINEUP,
    ],
    krepeat: [
      Box(250, 50, 60, 100),
      Goal(304, 78, 10, 44),
      Cone(60, 88), Cone(170, 88),
      Run('M70 100 L164 100', 1),
      Pass(172, 132, 176, 110, 2),
      Pass(186, 100, 284, 100, 3),
      LINEUP,
    ],
    omwave2: [
      Box(70, 50, 180, 100),
      Goal(62, 58, 8, 20), Goal(62, 122, 8, 20), Goal(250, 58, 8, 20), Goal(250, 122, 8, 20),
      Pass(156, 150, 128, 134, 1),
      Pass(124, 122, 124, 78, 2),
      Run('M128 70 Q180 56 232 64', 3),
      Pass(236, 64, 252, 66, 3),
      Run('M50 96 L90 90', 4),
      Run('M50 116 L90 124', 4),
      ORun('M270 96 L230 90', 4),
      ORun('M270 116 L230 124', 4),
      LINEUP,
    ],
    omwave2k: [
      Box(70, 50, 180, 100),
      Goal(62, 58, 8, 20), Goal(62, 122, 8, 20), Goal(250, 58, 8, 20), Goal(250, 122, 8, 20),
      Pass(156, 150, 128, 134, 1),
      Pass(128, 126, 254, 102, 2),
      Run('M128 70 Q180 64 222 80', 2),
      Pass(258, 96, 230, 84, 3),
      Pass(226, 78, 252, 66, 3),
      Run('M48 50 L92 66', 4),
      Run('M48 150 L92 136', 4),
      ORun('M272 50 L230 68', 4),
      ORun('M272 150 L230 134', 4),
      LINEUP,
    ],
    omright: [
      Box(20, 40, 280, 120),
      Box(20, 80, 26, 40, ZONE),
      Goal(300, 82, 8, 36),
      Pass(94, 126, 42, 106, 1),
      Pass(40, 96, 104, 74, 2),
      Run('M118 66 Q180 52 236 80', 3),
      Pass(242, 86, 294, 98, 3),
      ORun('M226 126 Q150 150 60 120', 4),
      LINEUP,
    ],
    game11: [
      Line(160, 10, 160, 190),
      <circle key="cc" cx={160} cy={100} r={22} fill="none" stroke="#fff" strokeWidth={2} />,
      Box(10, 55, 40, 90), Box(270, 55, 40, 90),
      Goal(4, 84, 8, 32), Goal(308, 84, 8, 32),
      Pass(30, 104, 58, 120, 1),
      Pass(70, 120, 104, 104, 1),
      Pass(116, 102, 194, 164, 2),
      Run('M206 172 Q252 182 286 166', 2),
      P(24, 100), P(72, 35), P(64, 78), P(64, 122), P(72, 165),
      P(118, 60), P(110, 100), P(128, 140),
      P(200, 30), P(214, 100), P(200, 170),
      O(296, 100), O(256, 40), O(262, 80), O(262, 120), O(256, 160),
      O(224, 58), O(234, 88), O(226, 136),
      O(170, 50), O(158, 100), O(174, 124),
      Ball(30, 104),
    ],
    inworp: [
      Box(40, 55, 190, 90, ZONE),
      Line(20, 145, 300, 145),
      Cone(40, 45), Cone(230, 45),
      Goal(30, 88, 8, 24), Goal(232, 88, 8, 24),
      Run('M108 100 Q84 84 94 120', 1),
      Run('M180 88 Q196 74 206 76', 1),
      Pass(102, 150, 96, 130, 2),
      Run('M108 152 Q120 146 126 138', 2),
      Pass(102, 126, 124, 134, 3),
      Pass(136, 130, 204, 84, 4),
      Pass(214, 84, 230, 98, 4),
      ORun('M118 126 Q80 132 44 106', 5),
      LINEUP,
    ],
  };

  const nodes = content[variant].flatMap((n): ReactNode[] => (n === LINEUP ? lineup() : [n]));

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 320 200"
      preserveAspectRatio="xMidYMid slice"
      className="pitch"
      style={{ display: 'block', background: 'var(--pitch-bg)' }}
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
        <marker id={arO} viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
          <path d="M0 0L10 5L0 10z" fill={ORANGE} />
        </marker>
      </defs>
      {hideActors ? withoutActors(nodes) : nodes}
    </svg>
  );
}
