import type { Variant } from './exercises';

/**
 * Instruction animations for exercises where the body movement matters more than positions on the pitch
 * (strength and prevention work). They play on the detail page with "Afspelen", in place of a pitch
 * animation: side-view figures that move from pose to pose, one scene per movement.
 *
 * Coordinates use a 320 × 188 box with the ground at y 170. Poses are built from joint angles and limb
 * lengths below, so limbs keep their length while the figure moves.
 */
export type Point = [number, number];

/** 1 is the near arm or leg (drawn on top), 2 the far one (drawn behind, lighter). */
export type Joint =
  'head' | 'shoulder' | 'hip' | 'elbow1' | 'hand1' | 'elbow2' | 'hand2' | 'knee1' | 'ankle1' | 'toe1' | 'knee2' | 'ankle2' | 'toe2';

export type Pose = Record<Joint, Point>;

export interface DemoStep {
  /** Shown under the drawing while this step plays. */
  label: string;
  ms: number;
  /** Poses at the end of the step, per figure id. Figures left out keep their pose. */
  poses: Record<string, Pose>;
  /** 'linear' for the middle parts of a long, even movement split into several steps. */
  ease?: 'linear';
}

export interface DemoScene {
  title: string;
  figures: { id: string; team: 'P' | 'O' }[];
  start: Record<string, Pose>;
  steps: DemoStep[];
}

export interface BodyDemoDef {
  scenes: DemoScene[];
}

// ---------- Geometry helpers ----------

const rad = (deg: number) => (deg * Math.PI) / 180;
/** The point `len` away from `from`, at `deg` degrees from straight up (clockwise, so 90 points right). */
const along = (from: Point, deg: number, len: number): Point => [from[0] + len * Math.sin(rad(deg)), from[1] - len * Math.cos(rad(deg))];
const dist = (a: Point, b: Point) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const round = (p: Point): Point => [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10];

/** Middle joint (elbow, knee) between `a` and `c` for limb parts `la` and `lb`; `bend` picks the side. */
function ik(a: Point, c: Point, la: number, lb: number, bend: 1 | -1): Point {
  const d = Math.min(dist(a, c), la + lb - 0.01);
  const ux = (c[0] - a[0]) / dist(a, c);
  const uy = (c[1] - a[1]) / dist(a, c);
  const x = (la * la - lb * lb + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, la * la - x * x));
  return [a[0] + ux * x - uy * h * bend, a[1] + uy * x + ux * h * bend];
}

const pose = (p: Pose): Pose => Object.fromEntries(Object.entries(p).map(([k, v]) => [k, round(v)])) as Pose;

// Limb lengths.
const TORSO = 52;
const THIGH = 40;
const SHIN = 38;
const UPPER_ARM = 26;
const FOREARM = 24;
const GROUND = 170;

// ---------- Nordic hamstring curl ----------

const N_KNEE: Point = [130, GROUND];

/** The player kneels facing right and leans forward `deg` degrees, body straight from knee to head. */
function nordic(deg: number, arms: 'chest' | 'catch' | 'push'): Pose {
  const hip = along(N_KNEE, deg, THIGH);
  const shoulder = along(N_KNEE, deg, THIGH + TORSO);
  const head = along(N_KNEE, deg, THIGH + TORSO + 14);
  let elbow: Point;
  let hand: Point;
  if (arms === 'chest') {
    // Hands ready in front of the chest.
    elbow = along(shoulder, deg + 150, UPPER_ARM);
    hand = along(elbow, deg + 30, FOREARM - 6);
  } else {
    // Hands on the ground under the shoulders; 'push' has the arms straighter, pushing off.
    hand = [shoulder[0] + (arms === 'push' ? 2 : 8), GROUND];
    elbow = ik(shoulder, hand, UPPER_ARM, FOREARM, 1);
  }
  const ankle: Point = [N_KNEE[0] - SHIN, GROUND - 4];
  const toe: Point = [ankle[0] - 9, GROUND];
  const far = (p: Point): Point => [p[0] - 3, p[1] - 2];
  return pose({
    head,
    shoulder,
    hip,
    elbow1: elbow,
    hand1: hand,
    elbow2: far(elbow),
    hand2: far(hand),
    knee1: N_KNEE,
    ankle1: ankle,
    toe1: toe,
    knee2: far(N_KNEE),
    ankle2: far(ankle),
    toe2: far(toe),
  });
}

/** The partner kneels just behind the player's feet, sits back and presses both ankles to the ground. */
function nordicPartner(): Pose {
  const knee: Point = [72, GROUND];
  const hip: Point = [58, 146];
  const shoulder = along(hip, 45, TORSO);
  const head = along(hip, 45, TORSO + 14);
  const hand1: Point = [100, 160];
  const hand2: Point = [96, 161];
  return pose({
    head,
    shoulder,
    hip,
    elbow1: ik(shoulder, hand1, UPPER_ARM, FOREARM, 1),
    hand1,
    elbow2: ik(shoulder, hand2, UPPER_ARM, FOREARM, 1),
    hand2,
    knee1: knee,
    ankle1: [knee[0] - SHIN, GROUND - 4],
    toe1: [knee[0] - SHIN - 9, GROUND],
    knee2: [knee[0] - 3, GROUND - 2],
    ankle2: [knee[0] - SHIN - 3, GROUND - 6],
    toe2: [knee[0] - SHIN - 12, GROUND - 2],
  });
}

/** Splits an even movement into short linear steps, so the body turns around the knee instead of cutting across. */
function sweep(
  label: string,
  ms: number,
  from: number,
  to: number,
  parts: number,
  make: (deg: number) => Record<string, Pose>,
): DemoStep[] {
  return Array.from({ length: parts }, (_, i) => ({
    label,
    ms: ms / parts,
    poses: make(from + ((to - from) * (i + 1)) / parts),
    ease: i === 0 || i === parts - 1 ? undefined : ('linear' as const),
  }));
}

const nordicScene: DemoScene = {
  title: 'Nordic hamstring curl',
  figures: [
    { id: 'partner', team: 'O' },
    { id: 'player', team: 'P' },
  ],
  start: { player: nordic(0, 'chest'), partner: nordicPartner() },
  steps: [
    {
      label: 'Rechtop op de knieën; de partner houdt beide enkels tegen de grond',
      ms: 1200,
      poses: { player: nordic(0, 'chest') },
    },
    ...sweep('Zo traag mogelijk naar voren zakken, romp en heupen in één rechte lijn', 3600, 0, 62, 8, (deg) => ({
      player: nordic(deg, 'chest'),
    })),
    {
      label: 'Pas op het laatst opvangen met de handen',
      ms: 600,
      poses: { player: nordic(74, 'catch') },
    },
    {
      label: 'Kort afduwen met de handen',
      ms: 600,
      poses: { player: nordic(58, 'push') },
    },
    ...sweep('Met de hamstrings terug omhoog, niet in de heup knikken', 1400, 58, 0, 4, (deg) => ({ player: nordic(deg, 'chest') })),
    {
      label: 'Rechtop, en opnieuw',
      ms: 700,
      poses: { player: nordic(0, 'chest') },
    },
  ],
};

// ---------- Copenhagen adductor ----------

const C_ELBOW: Point = [64, GROUND];
/** Where the partner holds the top leg, at the knee. */
const C_KNEE: Point = [155, 130];

/** Side plank on the elbow (head left), top leg held at the knee. `lift` 0 is the hips down, 1 is a straight line. */
function copenhagen(lift: number): Pose {
  const shoulder: Point = [C_ELBOW[0] + 12 * (1 - lift), C_ELBOW[1] - 28 + 2 * (1 - lift)];
  const straight: Point = along(shoulder, 90 + (Math.atan2(C_KNEE[1] - shoulder[1], C_KNEE[0] - shoulder[0]) * 180) / Math.PI, TORSO);
  const sag = ik(shoulder, C_KNEE, TORSO, THIGH, 1);
  const hip: Point = [straight[0] + (sag[0] - straight[0]) * (1 - lift), straight[1] + (sag[1] - straight[1]) * (1 - lift)];
  const headDir = Math.atan2(shoulder[1] - hip[1], shoulder[0] - hip[0]);
  const head: Point = [shoulder[0] + 15 * Math.cos(headDir), shoulder[1] + 15 * Math.sin(headDir)];
  const ankle1: Point = [C_KNEE[0] + SHIN, C_KNEE[1] - 2];
  // The bottom leg lies on the ground with the hips down and comes up under the top leg.
  const knee2: Point = [hip[0] + THIGH - 2, Math.min(GROUND - 4, hip[1] + 8 - 10 * lift)];
  const ankle2: Point = [knee2[0] + SHIN - 2, Math.min(GROUND - 3, knee2[1] + 6 - 4 * lift)];
  const hand2: Point = [hip[0] - 4, hip[1] - 8];
  return pose({
    head,
    shoulder,
    hip,
    elbow1: C_ELBOW,
    hand1: [C_ELBOW[0] + FOREARM, GROUND],
    elbow2: ik(shoulder, hand2, UPPER_ARM, FOREARM, -1),
    hand2,
    knee1: C_KNEE,
    ankle1,
    toe1: [ankle1[0] + 6, ankle1[1] - 8],
    knee2,
    ankle2,
    toe2: [ankle2[0] + 6, ankle2[1] - 7],
  });
}

/** The partner stands in a half squat and holds the top leg at the knee. */
function copenhagenPartner(): Pose {
  const ankle1: Point = [196, GROUND - 4];
  const ankle2: Point = [218, GROUND - 4];
  const hip: Point = [206, 126];
  const shoulder = along(hip, -40, TORSO);
  const head = along(hip, -40, TORSO + 14);
  const hand1: Point = [C_KNEE[0] + 4, C_KNEE[1] - 3];
  const hand2: Point = [C_KNEE[0] + 2, C_KNEE[1] + 4];
  return pose({
    head,
    shoulder,
    hip,
    elbow1: ik(shoulder, hand1, UPPER_ARM, FOREARM, -1),
    hand1,
    elbow2: ik(shoulder, hand2, UPPER_ARM, FOREARM, -1),
    hand2,
    knee1: ik(hip, ankle1, THIGH, SHIN, 1),
    ankle1,
    toe1: [ankle1[0] - 9, GROUND],
    knee2: ik(hip, ankle2, THIGH, SHIN, 1),
    ankle2,
    toe2: [ankle2[0] - 9, GROUND],
  });
}

const copenhagenScene: DemoScene = {
  title: 'Copenhagen',
  figures: [
    { id: 'partner', team: 'O' },
    { id: 'player', team: 'P' },
  ],
  start: { player: copenhagen(0), partner: copenhagenPartner() },
  steps: [
    {
      label: 'Zijsteun op de elleboog; de partner houdt het bovenste been vast bij de knie',
      ms: 1300,
      poses: { player: copenhagen(0) },
    },
    {
      label: 'Til de heup op tot het lichaam een rechte lijn vormt',
      ms: 1000,
      poses: { player: copenhagen(1) },
    },
    {
      label: 'Kort vasthouden: heup hoog en recht, niet naar achteren draaien',
      ms: 1000,
      poses: { player: copenhagen(1) },
    },
    {
      label: 'Gecontroleerd zakken',
      ms: 1200,
      poses: { player: copenhagen(0) },
    },
    {
      label: 'En opnieuw omhoog; na de reeks wissel je van kant',
      ms: 1000,
      poses: { player: copenhagen(1) },
    },
    {
      label: 'En opnieuw omhoog; na de reeks wissel je van kant',
      ms: 800,
      poses: { player: copenhagen(1) },
    },
    {
      label: 'Gecontroleerd zakken',
      ms: 1200,
      poses: { player: copenhagen(0) },
    },
  ],
};

export const DEMOS: Partial<Record<Variant, BodyDemoDef>> = {
  // Hamstrings en liezen: Nordic en Copenhagen in duo's
  gsnordic: { scenes: [nordicScene, copenhagenScene] },
};
