import type { Variant } from './exercises';

/**
 * Optional animations for exercise diagrams, played on the detail page with "Afspelen".
 *
 * An animation uses the same 320 × 200 field as the diagram (Pitch.tsx draws the field, zones and goals;
 * the animation draws the players and the ball on top). It runs through a list of beats: in each beat the
 * listed players move to a new spot, and the ball either goes to a player (a pass, or a dribble when that
 * player already had it) or to a fixed spot (e.g. into the goal). After the last beat it pauses and loops.
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
};
