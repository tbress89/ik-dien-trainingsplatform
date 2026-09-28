import type { Variant } from './exercises';

/**
 * Optional animations for exercise diagrams, played on the detail page with "Afspelen".
 *
 * An animation uses the same 320 × 200 field as the diagram (Pitch.tsx draws the field, zones and goals;
 * the animation draws the players and the ball on top). It runs through a list of beats: in each beat the
 * listed players move to a new spot, and the ball either goes to a player (a pass, or a dribble when that
 * player already had it) or to a fixed spot (e.g. into the goal); `newBall` starts a beat with a fresh ball
 * at a player, like a trainer playing in a new one. After the last beat it pauses and loops.
 */
export interface AnimActor {
  id: string;
  team: 'P' | 'O' | 'N';
  label?: string;
  x: number;
  y: number;
}

export interface AnimBeat {
  /** Shown under the diagram while this beat plays. */
  label: string;
  ms: number;
  /** New positions for the players that move in this beat. */
  moves?: Record<string, [number, number]>;
  /** Who has the ball at the end of the beat (an actor id), or where it ends up. */
  ball: string | [number, number];
  /** A new ball appears at this actor at the start of the beat (e.g. the trainer plays in a fresh one). */
  newBall?: string;
}

export interface PitchAnimationDef {
  actors: AnimActor[];
  /** Actor id that has the ball at the start. */
  ballStart: string;
  beats: AnimBeat[];
}

export const ANIMATIONS: Partial<Record<Variant, PitchAnimationDef>> = {
  // 3 tegen 3 + neutrale kaatser: recht van de aanval
  omright: {
    actors: [
      { id: 'p1', team: 'P', x: 100, y: 130 },
      { id: 'p2', team: 'P', x: 110, y: 70 },
      { id: 'p3', team: 'P', x: 200, y: 110 },
      { id: 'o1', team: 'O', x: 130, y: 100 },
      { id: 'o2', team: 'O', x: 165, y: 94 },
      { id: 'o3', team: 'O', x: 230, y: 130 },
      { id: 'n', team: 'N', x: 33, y: 100 },
      { id: 'k', team: 'N', label: 'K', x: 288, y: 100 },
    ],
    ballStart: 'p1',
    beats: [
      { label: 'Recht van de aanval: paars speelt eerst de kaatser aan', ms: 1100, ball: 'n', moves: { o1: [86, 112], p2: [104, 74] } },
      { label: 'De kaatser legt terug', ms: 1000, ball: 'p2', moves: { p2: [116, 66], o2: [144, 82] } },
      { label: 'Paars mag nu scoren en dribbelt op', ms: 1400, ball: 'p2', moves: { p2: [196, 72], o2: [182, 86], p3: [236, 112], o3: [226, 124], o1: [140, 104] } },
      { label: 'Oranje onderschept de pass', ms: 800, ball: 'o3', moves: { o3: [230, 116] } },
      { label: 'Oranje moet eerst terug naar de kaatser', ms: 1500, ball: 'o3', moves: { o3: [150, 130], p3: [172, 124], p2: [150, 88], o1: [104, 98] } },
      { label: 'Pass op de kaatser: recht van de aanval voor oranje', ms: 900, ball: 'n', moves: { p3: [130, 122] } },
      { label: 'De kaatser legt terug', ms: 900, ball: 'o1' },
      { label: 'Oranje dribbelt op', ms: 1500, ball: 'o1', moves: { o1: [236, 96], p2: [216, 84], o2: [250, 70] } },
      { label: 'Doelpunt', ms: 600, ball: [298, 100], moves: { k: [290, 94] } },
    ],
  },
  // Omschakel-waves 2 tegen 2 met kaatsers
  omwave2k: {
    actors: [
      { id: 'p1', team: 'P', x: 120, y: 70 },
      { id: 'p2', team: 'P', x: 120, y: 130 },
      { id: 'o1', team: 'O', x: 196, y: 84 },
      { id: 'o2', team: 'O', x: 196, y: 126 },
      { id: 'pk', team: 'P', label: 'Ka', x: 264, y: 100 },
      { id: 'ok', team: 'O', label: 'Ka', x: 56, y: 100 },
      { id: 'pw1', team: 'P', x: 40, y: 44 },
      { id: 'pw2', team: 'P', x: 40, y: 156 },
      { id: 'ow1', team: 'O', x: 280, y: 44 },
      { id: 'ow2', team: 'O', x: 280, y: 156 },
      { id: 't', team: 'N', label: 'T', x: 160, y: 168 },
    ],
    ballStart: 't',
    beats: [
      { label: 'De trainer speelt in bij paars', ms: 900, ball: 'p2' },
      { label: 'Pass op de eigen kaatser: 3 tegen 2', ms: 1000, ball: 'pk', moves: { p1: [176, 74], o1: [206, 90], o2: [214, 112] } },
      { label: 'De kaatser legt terug in de loop', ms: 900, ball: 'p1', moves: { p1: [214, 80] } },
      { label: 'In één keer afgewerkt: 2 punten', ms: 600, ball: [256, 68] },
      {
        label: 'Vliegende wissel: nieuwe duo’s sprinten erin, de kaatsers blijven staan',
        ms: 1600,
        ball: [256, 68],
        moves: {
          p1: [40, 44], p2: [40, 156], o1: [280, 44], o2: [280, 156],
          pw1: [120, 70], pw2: [120, 130], ow1: [196, 84], ow2: [196, 126],
        },
      },
      { label: 'Nieuwe bal voor paars, dat net scoorde', ms: 900, ball: 'pw2', newBall: 't' },
    ],
  },
  // Omschakel-waves 2 tegen 2 op vier doeltjes
  omwave2: {
    actors: [
      { id: 'p1', team: 'P', x: 120, y: 70 },
      { id: 'p2', team: 'P', x: 120, y: 130 },
      { id: 'o1', team: 'O', x: 196, y: 84 },
      { id: 'o2', team: 'O', x: 196, y: 126 },
      { id: 'pw1', team: 'P', x: 40, y: 96 },
      { id: 'pw2', team: 'P', x: 40, y: 116 },
      { id: 'ow1', team: 'O', x: 280, y: 96 },
      { id: 'ow2', team: 'O', x: 280, y: 116 },
      { id: 't', team: 'N', label: 'T', x: 160, y: 168 },
    ],
    ballStart: 't',
    beats: [
      { label: 'De trainer speelt in bij paars', ms: 900, ball: 'p2' },
      { label: 'Pass naar de duomaat', ms: 900, ball: 'p1', moves: { p1: [130, 70] } },
      { label: 'Opdribbelen naar het vrije doeltje', ms: 1300, ball: 'p1', moves: { p1: [226, 66], o1: [212, 78], p2: [170, 120], o2: [206, 118] } },
      { label: 'Doelpunt: 1 punt', ms: 600, ball: [254, 68] },
      {
        label: 'Vliegende wissel: de vier spelers sprinten eruit, nieuwe duo’s erin',
        ms: 1600,
        ball: [254, 68],
        moves: {
          p1: [40, 96], p2: [40, 116], o1: [280, 96], o2: [280, 116],
          pw1: [120, 70], pw2: [120, 130], ow1: [196, 84], ow2: [196, 126],
        },
      },
      { label: 'Nieuwe bal voor paars, dat net scoorde', ms: 900, ball: 'pw2', newBall: 't' },
    ],
  },
  // Passvierkant met doorbewegen: one round of the square, after which it looks like the start again.
  passing: {
    actors: [
      { id: 'a1', team: 'P', x: 86, y: 46 },
      { id: 'a2', team: 'P', x: 70, y: 38 },
      { id: 'b1', team: 'P', x: 234, y: 46 },
      { id: 'b2', team: 'P', x: 250, y: 38 },
      { id: 'c1', team: 'P', x: 234, y: 158 },
      { id: 'c2', team: 'P', x: 250, y: 166 },
      { id: 'd1', team: 'P', x: 86, y: 158 },
      { id: 'd2', team: 'P', x: 70, y: 166 },
    ],
    ballStart: 'a1',
    beats: [
      { label: 'Pass naar de volgende kegel en volg je pass', ms: 900, ball: 'b1', moves: { a1: [160, 46] } },
      { label: 'Aannemen in de loop en doorspelen', ms: 900, ball: 'c1', moves: { a1: [250, 38], b2: [234, 46], b1: [234, 102], a2: [86, 46] } },
      { label: 'De bal gaat rond, iedereen volgt zijn pass', ms: 900, ball: 'd1', moves: { b1: [250, 166], c2: [234, 158], c1: [160, 158] } },
      { label: 'Terug naar de eerste kegel', ms: 900, ball: 'a2', moves: { c1: [70, 166], d2: [86, 158], d1: [86, 102] } },
      { label: 'Aansluiten achteraan in de nieuwe rij', ms: 700, ball: 'a2', moves: { d1: [70, 38] } },
    ],
  },
  // Rondo 4 tegen 1
  rondo: {
    actors: [
      { id: 't', team: 'P', x: 160, y: 30 },
      { id: 'r', team: 'P', x: 230, y: 100 },
      { id: 'b', team: 'P', x: 160, y: 170 },
      { id: 'l', team: 'P', x: 90, y: 100 },
      { id: 'o', team: 'O', x: 155, y: 92 },
    ],
    ballStart: 't',
    beats: [
      { label: 'Pass naar een vrije zijde', ms: 800, ball: 'r', moves: { o: [192, 80] } },
      { label: 'Verder rond: de middenspeler jaagt, links schuift mee', ms: 800, ball: 'b', moves: { o: [182, 130], l: [90, 122] } },
      { label: 'Splitpass door het midden', ms: 900, ball: 't', moves: { o: [176, 108] } },
      { label: 'Snel naar de andere kant', ms: 900, ball: 'l', moves: { o: [135, 95] } },
      { label: 'Onderschept!', ms: 700, ball: 'o', moves: { o: [125, 145] } },
      { label: 'Wissel: wie de bal verliest, gaat in het midden', ms: 1200, ball: 'o', moves: { l: [160, 100], o: [90, 100] } },
    ],
  },
};
