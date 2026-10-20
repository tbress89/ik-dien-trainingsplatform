import type { Variant } from './exercises';

/**
 * Starting positions of the players and the ball in diagrams that have an animation (animations.ts).
 *
 * This is the one place for them: Pitch.tsx draws a lineup where its diagram says `LINEUP`, and the
 * animation starts from it, so the still diagram and the first frame of "Afspelen" always agree. The
 * field is the diagram's 320 × 200. Diagrams without an animation draw their players in Pitch.tsx itself,
 * and so does a diagram for anything its animation leaves out (e.g. a second group doing the same drill).
 * This module is small on purpose: the animations load separately, the diagrams with the page.
 */
export interface LineupActor {
  /** Name the animation's beats use for this player. */
  id: string;
  team: 'P' | 'O' | 'N';
  label?: string;
  x: number;
  y: number;
  /** Drawn as a waiting player (hollow, dashed outline) everywhere, e.g. a queue that doesn't take part. */
  waiting?: boolean;
  /** The diagram step from which this player takes part (see `joinsAt` in Pitch.tsx); the animation ignores it. */
  joinsAt?: number;
}

export interface Lineup {
  actors: LineupActor[];
  /** Actor id that has the ball at the start; left out for drills without a ball (e.g. sprints). */
  ballStart?: string;
  /**
   * Where the diagram draws the ball: at `ballStart`, `offset` [6, 4] from the player like in the animation,
   * unless set here. `at` names another actor, for a diagram that shows a later moment than the animation's
   * first frame (e.g. just after the ball is won).
   */
  diagramBall?: { at?: string; offset?: [number, number] };
}

export const LINEUPS: Partial<Record<Variant, Lineup>> = {
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
      { id: 'pw1', team: 'P', x: 40, y: 44, joinsAt: 4 },
      { id: 'pw2', team: 'P', x: 40, y: 156, joinsAt: 4 },
      { id: 'ow1', team: 'O', x: 280, y: 44, joinsAt: 4 },
      { id: 'ow2', team: 'O', x: 280, y: 156, joinsAt: 4 },
      { id: 't', team: 'N', label: 'T', x: 160, y: 160 },
    ],
    ballStart: 't',
    diagramBall: { offset: [0, -8] },
  },
  // Omschakel-waves 2 tegen 2 op vier doeltjes
  omwave2: {
    actors: [
      { id: 'p1', team: 'P', x: 120, y: 70 },
      { id: 'p2', team: 'P', x: 120, y: 130 },
      { id: 'o1', team: 'O', x: 196, y: 84 },
      { id: 'o2', team: 'O', x: 196, y: 126 },
      { id: 'pw1', team: 'P', x: 40, y: 96, joinsAt: 4 },
      { id: 'pw2', team: 'P', x: 40, y: 116, joinsAt: 4 },
      { id: 'ow1', team: 'O', x: 280, y: 96, joinsAt: 4 },
      { id: 'ow2', team: 'O', x: 280, y: 116, joinsAt: 4 },
      { id: 't', team: 'N', label: 'T', x: 160, y: 160 },
    ],
    ballStart: 't',
    diagramBall: { offset: [0, -8] },
  },
  // Passvierkant met doorbewegen: one round of the square, after which it looks like the start again.
  passing: {
    actors: [
      { id: 'a1', team: 'P', x: 86, y: 57 },
      { id: 'a2', team: 'P', x: 70, y: 50 },
      { id: 'b1', team: 'P', x: 234, y: 57 },
      { id: 'b2', team: 'P', x: 250, y: 50 },
      { id: 'c1', team: 'P', x: 234, y: 146 },
      { id: 'c2', team: 'P', x: 250, y: 153 },
      { id: 'd1', team: 'P', x: 86, y: 146 },
      { id: 'd2', team: 'P', x: 70, y: 153 },
    ],
    ballStart: 'a1',
  },
  // Rondo 4 tegen 1
  rondo: {
    actors: [
      { id: 't', team: 'P', x: 160, y: 45 },
      { id: 'r', team: 'P', x: 215, y: 100 },
      { id: 'b', team: 'P', x: 160, y: 155 },
      { id: 'l', team: 'P', x: 105, y: 100 },
      { id: 'o', team: 'O', x: 156, y: 94 },
    ],
    ballStart: 't',
    diagramBall: { offset: [10, 6] },
  },
  // Rondo 5 tegen 2: na elke pass naar een andere zijde, maximaal twee per zijde
  rondo52: {
    actors: [
      { id: 'p1', team: 'P', x: 135, y: 45 },
      { id: 'p2', team: 'P', x: 190, y: 45 },
      { id: 'p3', team: 'P', x: 215, y: 110 },
      { id: 'p4', team: 'P', x: 160, y: 155 },
      { id: 'p5', team: 'P', x: 105, y: 100 },
      { id: 'o1', team: 'O', x: 150, y: 92 },
      { id: 'o2', team: 'O', x: 178, y: 112 },
    ],
    ballStart: 'p1',
  },
  // Ruitpassen rond de palen: pass en volg rond drie passieve palen
  diamondpoles: {
    actors: [
      { id: 'a', team: 'P', label: 'A', x: 160, y: 145 },
      { id: 'q', team: 'P', x: 160, y: 163 },
      { id: 'b', team: 'P', label: 'B', x: 250, y: 100 },
      { id: 'c', team: 'P', label: 'C', x: 160, y: 55 },
      { id: 'd', team: 'P', label: 'D', x: 70, y: 100 },
    ],
    ballStart: 'a',
    diagramBall: { offset: [7, 4] },
  },
  // Variant 2: kaatsen via de zijkant
  diamondpoles2: {
    actors: [
      { id: 'a', team: 'P', label: 'A', x: 160, y: 145 },
      { id: 'q', team: 'P', x: 160, y: 163 },
      { id: 'b', team: 'P', label: 'B', x: 250, y: 100 },
      { id: 'c', team: 'P', label: 'C', x: 160, y: 55 },
      { id: 'd', team: 'P', label: 'D', x: 70, y: 100 },
    ],
    ballStart: 'a',
    diagramBall: { offset: [7, 4] },
  },
  // Variant 3: één-twee rond de paal
  diamondpoles3: {
    actors: [
      { id: 'a', team: 'P', label: 'A', x: 160, y: 145 },
      { id: 'q', team: 'P', x: 160, y: 163 },
      { id: 'b', team: 'P', label: 'B', x: 250, y: 100 },
      { id: 'c', team: 'P', label: 'C', x: 160, y: 55 },
      { id: 'd', team: 'P', label: 'D', x: 70, y: 100 },
    ],
    ballStart: 'a',
    diagramBall: { offset: [7, 4] },
  },
  // Variant 4: derde man
  diamondpoles4: {
    actors: [
      { id: 'a', team: 'P', label: 'A', x: 160, y: 145 },
      { id: 'q', team: 'P', x: 160, y: 163 },
      { id: 'b', team: 'P', label: 'B', x: 250, y: 100 },
      { id: 'c', team: 'P', label: 'C', x: 160, y: 55 },
      { id: 'd', team: 'P', label: 'D', x: 70, y: 100 },
    ],
    ballStart: 'c',
    diagramBall: { offset: [-5, 5] },
  },
  // Passen in lijnen: pass en volg (wie van links komt loopt onderlangs, wie van rechts komt bovenlangs)
  pline: {
    actors: [
      { id: 'l1', team: 'P', x: 80, y: 100 },
      { id: 'l2', team: 'P', x: 62, y: 100 },
      { id: 'l3', team: 'P', x: 44, y: 100 },
      { id: 'r1', team: 'P', x: 240, y: 100 },
      { id: 'r2', team: 'P', x: 258, y: 100 },
    ],
    ballStart: 'l1',
    diagramBall: { offset: [7, 5] },
  },
  // 1 tegen 1 op kleine doeltjes
  duel: {
    actors: [
      { id: 'p2', team: 'P', x: 40, y: 90 },
      { id: 'p3', team: 'P', x: 40, y: 110 },
      { id: 'p1', team: 'P', x: 95, y: 75 },
      { id: 'o2', team: 'O', x: 280, y: 90 },
      { id: 'o3', team: 'O', x: 280, y: 110 },
      { id: 'o1', team: 'O', x: 225, y: 120 },
    ],
    ballStart: 'p1',
    diagramBall: { offset: [6, 5] },
  },
  // Aannemen en schieten vanaf de zestien
  fshot: {
    actors: [
      { id: 'a', team: 'N', x: 170, y: 60 },
      { id: 's1', team: 'P', x: 110, y: 120 },
      { id: 's2', team: 'P', x: 92, y: 132 },
      { id: 'k', team: 'O', x: 292, y: 100 },
    ],
    ballStart: 's1',
    diagramBall: { offset: [7, 4] },
  },
  // Passvorm in Y met kaatsbal
  passy: {
    actors: [
      { id: 'a1', team: 'P', x: 70, y: 100 },
      { id: 'a2', team: 'P', x: 52, y: 100 },
      { id: 'a3', team: 'P', x: 34, y: 100 },
      { id: 'b', team: 'P', x: 150, y: 100 },
      { id: 'c', team: 'P', x: 230, y: 62 },
      { id: 'd', team: 'P', x: 230, y: 138 },
    ],
    ballStart: 'a1',
    diagramBall: { offset: [7, 5] },
  },
  // Handbalvoetbal op balbezit: tien worpen na elkaar is een punt
  whandpos: {
    actors: [
      { id: 'p1', team: 'P', label: 'A', x: 100, y: 70 },
      { id: 'p2', team: 'P', label: 'B', x: 148, y: 112 },
      { id: 'p3', team: 'P', label: 'C', x: 206, y: 80 },
      { id: 'p4', team: 'P', label: 'D', x: 236, y: 118 },
      { id: 'o1', team: 'O', x: 128, y: 92 },
      { id: 'o2', team: 'O', x: 178, y: 100 },
      { id: 'o3', team: 'O', x: 215, y: 100 },
    ],
    ballStart: 'p1',
  },
  // Voetbaltennis: Around the world
  wtennisworld: {
    actors: [
      { id: 'l1', team: 'P', x: 100, y: 80 },
      { id: 'l2', team: 'P', x: 72, y: 112 },
      { id: 'l3', team: 'P', x: 62, y: 78 },
      { id: 'r1', team: 'P', x: 212, y: 100 },
      { id: 'r2', team: 'P', x: 246, y: 78 },
      { id: 'r3', team: 'P', x: 244, y: 124 },
    ],
    ballStart: 'l1',
  },
  // Samen hoog houden in de kring
  wcircleup: {
    actors: [
      { id: 'p1', team: 'P', x: 160, y: 58 },
      { id: 'p2', team: 'P', x: 200, y: 87 },
      { id: 'p3', team: 'P', x: 185, y: 134 },
      { id: 'p4', team: 'P', x: 135, y: 134 },
      { id: 'p5', team: 'P', x: 120, y: 87 },
    ],
    ballStart: 'p1',
    diagramBall: { offset: [20, 6] },
  },
  // Lange bal: punten in het vak
  longpoints: {
    actors: [
      { id: 'a1', team: 'P', x: 64, y: 79 },
      { id: 'b1', team: 'P', x: 256, y: 79 },
      { id: 'a2', team: 'P', x: 64, y: 125 },
      { id: 'b2', team: 'P', x: 256, y: 125 },
    ],
    ballStart: 'a1',
    diagramBall: { offset: [7, 4] },
  },
  // Hoekschoppen: aanvallen en verdedigen
  fcorner: {
    actors: [
      { id: 'a1', team: 'P', x: 238, y: 70 },
      { id: 'a2', team: 'P', x: 240, y: 102 },
      { id: 'a3', team: 'P', x: 238, y: 130 },
      { id: 't', team: 'P', x: 294, y: 52 },
      { id: 'd1', team: 'O', x: 276, y: 70 },
      { id: 'd2', team: 'O', x: 282, y: 94 },
      { id: 'd3', team: 'O', x: 280, y: 122 },
      { id: 'k', team: 'O', x: 296, y: 100 },
    ],
    ballStart: 't',
    diagramBall: { offset: [-6, 6] },
  },
  // Aannemen en draaien: de spits met de rug naar doel
  fturn: {
    actors: [
      { id: 'p1', team: 'P', x: 114, y: 100 },
      { id: 'p2', team: 'P', x: 98, y: 76 },
      { id: 'p3', team: 'P', x: 98, y: 124 },
      { id: 's', team: 'P', label: 'S', x: 192, y: 100 },
      { id: 'v', team: 'O', x: 208, y: 98 },
      { id: 'k', team: 'N', label: 'K', x: 296, y: 100 },
    ],
    ballStart: 'p1',
    diagramBall: { offset: [7, 4] },
  },
  // Verdedigen als lijn: samen opschuiven en uitstappen
  defline: {
    actors: [
      { id: 'd1', team: 'O', x: 222, y: 62 },
      { id: 'd2', team: 'O', x: 222, y: 88 },
      { id: 'd3', team: 'O', x: 222, y: 114 },
      { id: 'd4', team: 'O', x: 222, y: 140 },
      { id: 'o1', team: 'P', x: 130, y: 70 },
      { id: 'o2', team: 'P', x: 104, y: 100 },
      { id: 'o3', team: 'P', x: 150, y: 128 },
      { id: 'k', team: 'N', label: 'K', x: 296, y: 100 },
    ],
    ballStart: 'o1',
    diagramBall: { offset: [7, 4] },
  },
  // Ruitpassen met derde man
  diamond: {
    actors: [
      { id: 'a1', team: 'P', label: 'A', x: 70, y: 100 },
      { id: 'a2', team: 'P', label: 'A', x: 52, y: 100 },
      { id: 'b', team: 'P', label: 'B', x: 160, y: 55 },
      { id: 'c', team: 'P', label: 'C', x: 160, y: 145 },
      { id: 'd', team: 'P', label: 'D', x: 250, y: 100 },
    ],
    ballStart: 'a1',
    diagramBall: { offset: [7, 5] },
  },
  // Rondo 3 tegen 1: de speler zonder bal loopt telkens naar de vrije zijde
  rondo31: {
    actors: [
      { id: 't', team: 'P', x: 160, y: 45 },
      { id: 'r', team: 'P', x: 215, y: 100 },
      { id: 'l', team: 'P', x: 105, y: 100 },
      { id: 'o', team: 'O', x: 160, y: 110 },
    ],
    ballStart: 't',
  },
  // Kringrondo 7 tegen 2
  rcircle: {
    actors: [
      { id: 'p1', team: 'P', x: 160, y: 45 },
      { id: 'p2', team: 'P', x: 203, y: 66 },
      { id: 'p3', team: 'P', x: 214, y: 112 },
      { id: 'p4', team: 'P', x: 184, y: 150 },
      { id: 'p5', team: 'P', x: 136, y: 150 },
      { id: 'p6', team: 'P', x: 106, y: 112 },
      { id: 'p7', team: 'P', x: 117, y: 66 },
      { id: 'o1', team: 'O', x: 176, y: 74 },
      { id: 'o2', team: 'O', x: 148, y: 122 },
    ],
    ballStart: 'p1',
  },
  // Rondo 4 + 1 tegen 2 met middenspeler
  rondo412: {
    actors: [
      { id: 't', team: 'P', x: 160, y: 45 },
      { id: 'r', team: 'P', x: 215, y: 100 },
      { id: 'b', team: 'P', x: 160, y: 155 },
      { id: 'l', team: 'P', x: 105, y: 100 },
      { id: 'm', team: 'P', x: 160, y: 98 },
      { id: 'o1', team: 'O', x: 135, y: 80 },
      { id: 'o2', team: 'O', x: 188, y: 126 },
    ],
    ballStart: 't',
  },
  // Rondo 2 tegen 2 met vier kaatsers
  rondo22: {
    actors: [
      { id: 'n1', team: 'N', x: 160, y: 45 },
      { id: 'n2', team: 'N', x: 215, y: 100 },
      { id: 'n3', team: 'N', x: 160, y: 155 },
      { id: 'n4', team: 'N', x: 105, y: 100 },
      { id: 'p1', team: 'P', x: 138, y: 118 },
      { id: 'p2', team: 'P', x: 182, y: 80 },
      { id: 'o1', team: 'O', x: 150, y: 96 },
      { id: 'o2', team: 'O', x: 178, y: 116 },
    ],
    ballStart: 'p1',
    diagramBall: { offset: [-7, 5] },
  },
  // Rondo 4 tegen 2 in duo's
  rondo42: {
    actors: [
      { id: 't', team: 'P', x: 160, y: 45 },
      { id: 'r', team: 'P', x: 215, y: 100 },
      { id: 'b', team: 'P', x: 160, y: 155 },
      { id: 'l', team: 'P', x: 105, y: 100 },
      { id: 'o1', team: 'O', x: 148, y: 90 },
      { id: 'o2', team: 'O', x: 170, y: 110 },
    ],
    ballStart: 't',
  },
  // Kleurenrondo 6 tegen 3: altijd naar de andere kleur
  rcolor: {
    actors: [
      { id: 'p1', team: 'P', x: 130, y: 45 },
      { id: 'p2', team: 'P', x: 225, y: 85 },
      { id: 'p3', team: 'P', x: 165, y: 155 },
      { id: 'n1', team: 'N', x: 190, y: 45 },
      { id: 'n2', team: 'N', x: 95, y: 110 },
      { id: 'n3', team: 'N', x: 225, y: 138 },
      { id: 'o1', team: 'O', x: 140, y: 92 },
      { id: 'o2', team: 'O', x: 175, y: 90 },
      { id: 'o3', team: 'O', x: 160, y: 122 },
    ],
    ballStart: 'p1',
  },
  // Rondo 4 tegen 2 met uitweg voor de verdedigers
  rpress: {
    actors: [
      { id: 't', team: 'P', x: 160, y: 45 },
      { id: 'r', team: 'P', x: 215, y: 100 },
      { id: 'b', team: 'P', x: 160, y: 155 },
      { id: 'l', team: 'P', x: 105, y: 100 },
      { id: 'o1', team: 'O', x: 150, y: 90 },
      { id: 'o2', team: 'O', x: 170, y: 110 },
    ],
    ballStart: 't',
  },
  // Rondo 5 tegen 2 met diepe pass naar de spits
  rdeep: {
    actors: [
      { id: 'p1', team: 'P', x: 105, y: 55 },
      { id: 'p2', team: 'P', x: 150, y: 80 },
      { id: 'p3', team: 'P', x: 150, y: 125 },
      { id: 'p4', team: 'P', x: 105, y: 145 },
      { id: 'p5', team: 'P', x: 60, y: 100 },
      { id: 's', team: 'P', x: 260, y: 100 },
      { id: 'o1', team: 'O', x: 95, y: 95 },
      { id: 'o2', team: 'O', x: 122, y: 108 },
    ],
    ballStart: 'p1',
  },
  // Omschakelrondo in twee vakken
  rtrans: {
    actors: [
      { id: 'a', team: 'P', x: 90, y: 55 },
      { id: 'b', team: 'P', x: 140, y: 100 },
      { id: 'c', team: 'P', x: 90, y: 145 },
      { id: 'd', team: 'P', x: 40, y: 100 },
      { id: 'o1', team: 'O', x: 80, y: 95 },
      { id: 'o2', team: 'O', x: 106, y: 112 },
      { id: 'o3', team: 'O', x: 230, y: 78 },
      { id: 'o4', team: 'O', x: 230, y: 122 },
    ],
    ballStart: 'a',
  },
  // Passen door poortjes (één duo)
  pgates: {
    actors: [
      { id: 'a', team: 'P', x: 120, y: 82 },
      { id: 'b', team: 'P', x: 180, y: 120 },
    ],
    ballStart: 'a',
  },
  // Kaatsen: één-twee-race naar het doeltje (één baan)
  wallpass: {
    actors: [
      { id: 'p1', team: 'P', x: 60, y: 82 },
      { id: 'p2', team: 'P', x: 42, y: 82 },
      { id: 'p3', team: 'P', x: 24, y: 82 },
      { id: 'k', team: 'P', x: 160, y: 46 },
    ],
    ballStart: 'p1',
    diagramBall: { offset: [7, 4] },
  },
  // Aannemen met schouderblik
  scan: {
    actors: [
      { id: 'a', team: 'P', x: 70, y: 100 },
      { id: 'm', team: 'P', x: 160, y: 100 },
      { id: 'c', team: 'P', x: 250, y: 100 },
      { id: 't', team: 'N', label: 'T', x: 184, y: 64 },
    ],
    ballStart: 'a',
    diagramBall: { offset: [7, 4] },
  },
  // Lange pass: van kant wisselen
  longpass: {
    actors: [
      { id: 'a', team: 'P', x: 60, y: 100 },
      { id: 'b', team: 'P', x: 260, y: 100 },
    ],
    ballStart: 'a',
    diagramBall: { offset: [7, 4] },
  },
  // Steekpass in de loop
  through: {
    actors: [
      { id: 'p', team: 'P', x: 110, y: 100 },
      { id: 'r', team: 'P', x: 140, y: 140 },
      { id: 'k', team: 'O', x: 292, y: 100 },
    ],
    ballStart: 'p',
    diagramBall: { offset: [7, 4] },
  },
  // Passestafette (één ploeg)
  relay: {
    actors: [
      { id: 'p1', team: 'P', x: 60, y: 75 },
      { id: 'p2', team: 'P', x: 120, y: 75 },
      { id: 'p3', team: 'P', x: 180, y: 75 },
      { id: 'p4', team: 'P', x: 240, y: 75 },
    ],
    ballStart: 'p1',
    diagramBall: { offset: [7, 5] },
  },
  // Afwerken na combinatie
  finishing: {
    actors: [
      { id: 'a', team: 'P', label: 'A', x: 60, y: 100 },
      { id: 'b', team: 'P', label: 'B', x: 150, y: 60 },
      { id: 'c', team: 'P', label: 'C', x: 150, y: 140 },
      { id: 'k', team: 'O', x: 292, y: 100 },
    ],
    ballStart: 'a',
    diagramBall: { offset: [6, -4] },
  },
  // Volley en halve volley
  fvolley: {
    actors: [
      { id: 't', team: 'N', label: 'T', x: 210, y: 70 },
      { id: 's1', team: 'P', x: 160, y: 110 },
      { id: 's2', team: 'P', x: 140, y: 124 },
      { id: 'k', team: 'O', x: 292, y: 100 },
    ],
    ballStart: 't',
  },
  // Afwerken na voorzet
  fcross: {
    actors: [
      { id: 'w', team: 'P', x: 175, y: 48 },
      { id: 'a', team: 'P', x: 150, y: 95 },
      { id: 'b', team: 'P', x: 150, y: 130 },
      { id: 'k', team: 'O', x: 292, y: 100 },
    ],
    ballStart: 'w',
  },
  // Terugleggen vanaf de achterlijn
  fcutback: {
    actors: [
      { id: 'w', team: 'P', x: 170, y: 48 },
      { id: 's', team: 'P', x: 160, y: 110 },
      { id: 'k', team: 'O', x: 292, y: 100 },
    ],
    ballStart: 'w',
  },
  // Schieten en opvolgen
  frebound: {
    actors: [
      { id: 's', team: 'P', x: 150, y: 100 },
      { id: 't', team: 'N', label: 'T', x: 226, y: 146 },
      { id: 'k', team: 'O', x: 292, y: 100 },
    ],
    ballStart: 's',
    diagramBall: { offset: [7, 4] },
  },
  // Schietcarrousel rond de zestien
  fcircuit: {
    actors: [
      { id: 'l1', team: 'P', x: 110, y: 55 },
      { id: 'l2', team: 'P', x: 92, y: 55 },
      { id: 'c1', team: 'P', x: 70, y: 100 },
      { id: 'c2', team: 'P', x: 52, y: 100 },
      { id: 'r1', team: 'P', x: 110, y: 145 },
      { id: 'r2', team: 'P', x: 92, y: 145 },
      { id: 'k', team: 'O', x: 292, y: 100 },
    ],
    ballStart: 'c1',
    diagramBall: { offset: [7, 4] },
  },
  // Koppen op doel
  fheader: {
    actors: [
      { id: 'a', team: 'N', x: 256, y: 148 },
      { id: 'h', team: 'P', x: 170, y: 100 },
      { id: 'k', team: 'O', x: 292, y: 100 },
    ],
    ballStart: 'a',
    diagramBall: { offset: [-6, -6] },
  },
  // 3 tegen 2 afwerken na omschakeling
  fcounter: {
    actors: [
      { id: 'm', team: 'P', x: 80, y: 100 },
      { id: 't', team: 'P', x: 80, y: 55 },
      { id: 'b', team: 'P', x: 80, y: 145 },
      { id: 'd1', team: 'O', x: 200, y: 84 },
      { id: 'd2', team: 'O', x: 200, y: 118 },
      { id: 'k', team: 'O', x: 292, y: 100 },
    ],
    ballStart: 'm',
    diagramBall: { offset: [7, 4] },
  },
  // Schietspel 2 tegen 2 met kaatsers
  fgame: {
    actors: [
      { id: 'k1', team: 'P', x: 46, y: 100 },
      { id: 'p1', team: 'P', x: 130, y: 85 },
      { id: 'p2', team: 'P', x: 200, y: 120 },
      { id: 'k2', team: 'O', x: 274, y: 100 },
      { id: 'o1', team: 'O', x: 170, y: 80 },
      { id: 'o2', team: 'O', x: 140, y: 120 },
      { id: 'n1', team: 'N', x: 160, y: 45 },
      { id: 'n2', team: 'N', x: 160, y: 155 },
      { id: 'n3', team: 'N', x: 100, y: 45 },
      { id: 'n4', team: 'N', x: 220, y: 155 },
    ],
    ballStart: 'p1',
  },
  // Plaatsen in de hoeken
  fplace: {
    actors: [
      { id: 's', team: 'P', x: 200, y: 100 },
      { id: 'k', team: 'O', x: 284, y: 100 },
    ],
    ballStart: 's',
    diagramBall: { offset: [7, 4] },
  },
  // Herhaalde sprints met afwerking
  krepeat: {
    actors: [
      { id: 'p1', team: 'P', x: 56, y: 100 },
      { id: 'p2', team: 'P', x: 38, y: 100 },
      { id: 'p3', team: 'P', x: 56, y: 124 },
      { id: 'p4', team: 'P', x: 38, y: 124 },
      { id: 'k', team: 'O', x: 292, y: 100 },
      { id: 't', team: 'N', label: 'T', x: 172, y: 144 },
    ],
    ballStart: 't',
    diagramBall: { offset: [0, -8] },
  },
  // Vangen in W-vorm / Lage ballen opscheppen
  gkserve: {
    actors: [
      { id: 't', team: 'N', label: 'T', x: 180, y: 100 },
      { id: 'g', team: 'P', x: 290, y: 100 },
    ],
    ballStart: 't',
    diagramBall: { offset: [7, -6] },
  },
  // Schotstoppen vanuit de startpositie
  gkshot: {
    actors: [
      { id: 's1', team: 'P', x: 195, y: 60 },
      { id: 's2', team: 'P', x: 185, y: 100 },
      { id: 's3', team: 'P', x: 195, y: 140 },
      { id: 'g', team: 'O', x: 286, y: 100 },
    ],
    ballStart: 's1',
    diagramBall: { offset: [6, 6] },
  },
  // Positie kiezen: de hoek verkleinen
  gkangle: {
    actors: [
      { id: 'a1', team: 'P', x: 176, y: 62 },
      { id: 'a2', team: 'P', x: 176, y: 136 },
      { id: 'g', team: 'O', x: 282, y: 88 },
    ],
    ballStart: 'a1',
  },
  // 1 tegen 1: uitkomen en blokken
  gk1v1: {
    actors: [
      { id: 'a2', team: 'P', x: 60, y: 90 },
      { id: 'a3', team: 'P', x: 60, y: 110 },
      { id: 'a1', team: 'P', x: 112, y: 100 },
      { id: 'g', team: 'O', x: 286, y: 100 },
    ],
    ballStart: 'a1',
    diagramBall: { offset: [7, 5] },
  },
  // Hoge ballen: voorzetten klemmen
  gkcross: {
    actors: [
      { id: 'o1', team: 'P', x: 225, y: 50 },
      { id: 'o2', team: 'P', x: 225, y: 150 },
      { id: 'g', team: 'O', x: 292, y: 100 },
    ],
    ballStart: 'o1',
  },
  // Uitworp en uittrap naar doeltjes
  gkdist: {
    actors: [
      { id: 'g', team: 'P', x: 34, y: 100 },
    ],
    ballStart: 'g',
    diagramBall: { offset: [7, 1] },
  },
  // Terugspeelbal onder druk
  gkback: {
    actors: [
      { id: 'd', team: 'P', x: 120, y: 146 },
      { id: 'w', team: 'P', x: 120, y: 54 },
      { id: 'a', team: 'O', x: 120, y: 100 },
      { id: 'g', team: 'P', x: 34, y: 100 },
      { id: 'q1', team: 'P', x: 136, y: 164, waiting: true },
      { id: 'q2', team: 'P', x: 152, y: 174, waiting: true },
    ],
    ballStart: 'd',
    diagramBall: { offset: [-6, -4] },
  },
  // Dubbele redding: opstaan en opnieuw
  gkrebound: {
    actors: [
      { id: 's1', team: 'P', x: 180, y: 100 },
      { id: 's2', team: 'P', x: 235, y: 54 },
      { id: 'g', team: 'O', x: 286, y: 100 },
    ],
    ballStart: 's1',
    diagramBall: { offset: [7, 4] },
  },
  // Leren vallen: van knielend naar staand
  gkdive: {
    actors: [
      { id: 't', team: 'N', label: 'T', x: 190, y: 100 },
      { id: 'g', team: 'P', x: 288, y: 100 },
    ],
    ballStart: 't',
    diagramBall: { offset: [7, -6] },
  },
  // Draaibewegingen aan de kegel (één rij)
  dturns: {
    actors: [
      { id: 'p', team: 'P', x: 64, y: 110 },
    ],
    ballStart: 'p',
    diagramBall: { offset: [7, 4] },
  },
  // Schijnbewegingen: passeren en versnellen
  dfeint: {
    actors: [
      { id: 'p', team: 'P', x: 60, y: 100 },
      { id: 'd', team: 'O', x: 170, y: 100 },
    ],
    ballStart: 'p',
    diagramBall: { offset: [7, 4] },
  },
  // Poortjesspel 1 tegen 1 (één duo)
  dgates: {
    actors: [
      { id: 'a', team: 'P', x: 125, y: 86 },
      { id: 'd', team: 'O', x: 150, y: 100 },
    ],
    ballStart: 'a',
  },
  // 1 tegen 1 met achtervolger
  dchase: {
    actors: [
      { id: 'a', team: 'P', x: 80, y: 90 },
      { id: 'd', team: 'O', x: 60, y: 104 },
      { id: 'k', team: 'O', x: 292, y: 100 },
    ],
    ballStart: 'a',
    diagramBall: { offset: [7, 4] },
  },
  // 2 tegen 1 naar doel
  d2v1: {
    actors: [
      { id: 'a1', team: 'P', x: 90, y: 80 },
      { id: 'a2', team: 'P', x: 90, y: 130 },
      { id: 'd', team: 'O', x: 190, y: 100 },
      { id: 'k', team: 'O', x: 292, y: 100 },
    ],
    ballStart: 'a1',
    diagramBall: { offset: [7, 4] },
  },
  // 1 tegen 1 met de rug naar doel
  dback: {
    actors: [
      { id: 't', team: 'N', x: 110, y: 100 },
      { id: 'a', team: 'P', x: 170, y: 100 },
      { id: 'd', team: 'O', x: 186, y: 100 },
      { id: 'k', team: 'O', x: 292, y: 100 },
    ],
    ballStart: 't',
  },
  // Wie is eerst aan de bal?
  wduel: {
    actors: [
      { id: 'p', team: 'P', x: 80, y: 90 },
      { id: 'o', team: 'O', x: 80, y: 116 },
      { id: 't', team: 'N', label: 'T', x: 80, y: 150 },
    ],
    ballStart: 't',
    diagramBall: { offset: [7, -5] },
  },
  // Reactiestart op signaal
  wreact: {
    actors: [
      { id: 'p', team: 'P', x: 152, y: 106 },
      { id: 'o', team: 'O', x: 168, y: 110 },
      { id: 't', team: 'N', label: 'T', x: 160, y: 150 },
    ],
  },
  // Wendbaarheid: T-parcours
  cagility: {
    actors: [
      { id: 'p1', team: 'P', x: 160, y: 152 },
      { id: 'p2', team: 'P', x: 184, y: 152 },
    ],
  },
  // Sterloop met kleurkegels
  cstar: {
    actors: [
      { id: 'p', team: 'P', x: 160, y: 100 },
      { id: 'n', team: 'N', x: 250, y: 110 },
    ],
  },
  // Maximale sprintsnelheid: vliegende sprints
  ksprint: {
    actors: [
      { id: 'p1', team: 'P', x: 32, y: 100 },
      { id: 'p2', team: 'P', x: 32, y: 128 },
      { id: 'p3', team: 'P', x: 32, y: 72 },
    ],
  },
  // Hindernisestafette met bal (één ploeg)
  crelay: {
    actors: [
      { id: 'p1', team: 'P', x: 40, y: 70 },
      { id: 'p2', team: 'P', x: 22, y: 70 },
    ],
    ballStart: 'p1',
    diagramBall: { offset: [8, 4] },
  },
  // 1 tegen 1 verdedigen: aansluiten en afremmen
  pr1v1: {
    actors: [
      { id: 'd', team: 'P', x: 95, y: 100 },
      { id: 'a', team: 'O', x: 225, y: 100 },
    ],
    ballStart: 'd',
    diagramBall: { offset: [7, 4] },
  },
  // Druk zetten in een boog: 1 tegen 2
  prcurve: {
    actors: [
      { id: 'a1', team: 'P', x: 130, y: 60 },
      { id: 'a2', team: 'P', x: 200, y: 60 },
      { id: 'd', team: 'O', x: 165, y: 130 },
    ],
    ballStart: 'a1',
  },
  // 2 tegen 2: druk en dekking
  pr2v2: {
    actors: [
      { id: 'o1', team: 'P', x: 120, y: 70 },
      { id: 'o2', team: 'P', x: 120, y: 130 },
      { id: 'p1', team: 'O', x: 180, y: 85 },
      { id: 'p2', team: 'O', x: 200, y: 120 },
    ],
    ballStart: 'o1',
  },
  // Tegendruk: voorkom 3 passes na balverlies
  prcp: {
    actors: [
      { id: 'o1', team: 'P', x: 160, y: 90 },
      { id: 'o2', team: 'P', x: 215, y: 95 },
      { id: 'o3', team: 'P', x: 110, y: 132 },
      { id: 'o4', team: 'P', x: 230, y: 140 },
      { id: 'p1', team: 'O', x: 130, y: 100 },
      { id: 'p2', team: 'O', x: 185, y: 66 },
      { id: 'p3', team: 'O', x: 195, y: 128 },
      { id: 'p4', team: 'O', x: 90, y: 70 },
    ],
    ballStart: 'o1',
    diagramBall: { offset: [7, 4] },
  },
  // Pressing op de trigger: terugspeelbal
  prtrig: {
    actors: [
      { id: 'o1', team: 'P', x: 70, y: 60 },
      { id: 'o2', team: 'P', x: 70, y: 140 },
      { id: 'o3', team: 'P', x: 110, y: 80 },
      { id: 'o4', team: 'P', x: 110, y: 120 },
      { id: 'k', team: 'P', x: 28, y: 100 },
      { id: 'p1', team: 'O', x: 170, y: 70 },
      { id: 'p2', team: 'O', x: 170, y: 130 },
      { id: 'p3', team: 'O', x: 150, y: 100 },
      { id: 'p4', team: 'O', x: 190, y: 100 },
    ],
    ballStart: 'o1',
    diagramBall: { offset: [-6, 4] },
  },
  // Onderaantal verdedigen: 2 tegen 3
  prunder: {
    actors: [
      { id: 'a1', team: 'P', x: 100, y: 60 },
      { id: 'a2', team: 'P', x: 100, y: 100 },
      { id: 'a3', team: 'P', x: 100, y: 140 },
      { id: 'd1', team: 'O', x: 200, y: 85 },
      { id: 'd2', team: 'O', x: 200, y: 118 },
      { id: 'd3', team: 'O', x: 50, y: 150 },
      { id: 'k', team: 'O', x: 292, y: 100 },
    ],
    ballStart: 'a2',
    diagramBall: { offset: [7, 4] },
  },
  // Druk zetten op de opbouw: 3 tegen 2 + K
  prbuild: {
    actors: [
      { id: 'k', team: 'P', x: 28, y: 100 },
      { id: 'o1', team: 'P', x: 70, y: 60 },
      { id: 'o2', team: 'P', x: 70, y: 140 },
      { id: 'p1', team: 'O', x: 130, y: 100 },
      { id: 'p2', team: 'O', x: 140, y: 60 },
      { id: 'p3', team: 'O', x: 140, y: 140 },
    ],
    ballStart: 'k',
  },
  // Verschuiven als blok: over de rivier
  prshift: {
    actors: [
      { id: 'd1', team: 'O', x: 92, y: 100 },
      { id: 'd2', team: 'O', x: 130, y: 100 },
      { id: 'd3', team: 'O', x: 190, y: 100 },
      { id: 'd4', team: 'O', x: 228, y: 100 },
      { id: 't1', team: 'P', x: 160, y: 26 },
      { id: 't2', team: 'P', x: 104, y: 52 },
      { id: 't3', team: 'P', x: 216, y: 52 },
      { id: 't4', team: 'P', x: 160, y: 72 },
      { id: 'b1', team: 'P', x: 160, y: 174 },
      { id: 'b2', team: 'P', x: 104, y: 148 },
      { id: 'b3', team: 'P', x: 216, y: 148 },
      { id: 'b4', team: 'P', x: 166, y: 128 },
    ],
    ballStart: 't3',
    diagramBall: { offset: [0, 8] },
  },
  // Druk zetten in blok 6 tegen 4
  pressing: {
    actors: [
      { id: 'p1', team: 'O', x: 120, y: 50 },
      { id: 'p2', team: 'O', x: 120, y: 150 },
      { id: 'p3', team: 'O', x: 104, y: 100 },
      { id: 'p4', team: 'O', x: 150, y: 75 },
      { id: 'p5', team: 'O', x: 150, y: 125 },
      { id: 'p6', team: 'O', x: 180, y: 100 },
      { id: 'o1', team: 'P', x: 58, y: 54 },
      { id: 'o2', team: 'P', x: 58, y: 146 },
      { id: 'o3', team: 'P', x: 68, y: 98 },
      { id: 'o4', team: 'P', x: 36, y: 120 },
      { id: 'k', team: 'P', x: 22, y: 100 },
    ],
    ballStart: 'k',
    diagramBall: { at: 'o3', offset: [-4, 6] },
  },
  // Omschakelen 4 tegen 4 op vier doeltjes
  transition: {
    actors: [
      { id: 'p1', team: 'P', x: 120, y: 120 },
      { id: 'p2', team: 'P', x: 165, y: 95 },
      { id: 'p3', team: 'P', x: 90, y: 60 },
      { id: 'p4', team: 'P', x: 210, y: 140 },
      { id: 'o1', team: 'O', x: 140, y: 70 },
      { id: 'o2', team: 'O', x: 195, y: 110 },
      { id: 'o3', team: 'O', x: 230, y: 80 },
      { id: 'o4', team: 'O', x: 80, y: 140 },
    ],
    ballStart: 'o2',
    diagramBall: { at: 'p2', offset: [6, -5] },
  },
  // Omschakelduel 1 tegen 1
  omduel: {
    actors: [
      { id: 'p', team: 'P', x: 140, y: 100 },
      { id: 'o', team: 'O', x: 185, y: 100 },
    ],
    ballStart: 'p',
    diagramBall: { offset: [7, 4] },
  },
  // Golfaanvallen 2 tegen 1
  omwaves: {
    actors: [
      { id: 'p1', team: 'P', x: 100, y: 70 },
      { id: 'p2', team: 'P', x: 100, y: 130 },
      { id: 'o', team: 'O', x: 200, y: 100 },
      { id: 'o2', team: 'O', x: 268, y: 60 },
    ],
    ballStart: 'p1',
  },
  // Overtal heen, ondertal terug: 3 tegen 2 en 2 tegen 1
  om32: {
    actors: [
      { id: 'kp', team: 'P', x: 24, y: 100 },
      { id: 'a1', team: 'P', x: 120, y: 60 },
      { id: 'a2', team: 'P', x: 120, y: 100 },
      { id: 'a3', team: 'P', x: 120, y: 140 },
      { id: 'ko', team: 'O', x: 296, y: 100 },
      { id: 'd1', team: 'O', x: 220, y: 80 },
      { id: 'd2', team: 'O', x: 220, y: 120 },
    ],
    ballStart: 'a2',
  },
  // Winnaar blijft: 2 tegen 2 met wisselende duo's
  omwinner: {
    actors: [
      { id: 'p1', team: 'P', x: 130, y: 80 },
      { id: 'p2', team: 'P', x: 140, y: 125 },
      { id: 'o1', team: 'O', x: 190, y: 95 },
      { id: 'o2', team: 'O', x: 200, y: 125 },
      { id: 'n1', team: 'N', x: 150, y: 40 },
      { id: 'n2', team: 'N', x: 175, y: 42 },
    ],
    ballStart: 'p1',
    diagramBall: { offset: [16, 4] },
  },
  // Terugsprinten achter de bal: 3 tegen 2 + 1
  omrecover: {
    actors: [
      { id: 'p1', team: 'P', x: 120, y: 60 },
      { id: 'p2', team: 'P', x: 110, y: 100 },
      { id: 'p3', team: 'P', x: 120, y: 140 },
      { id: 'd1', team: 'O', x: 210, y: 85 },
      { id: 'd2', team: 'O', x: 210, y: 118 },
      { id: 'd3', team: 'O', x: 70, y: 100 },
      { id: 'k', team: 'O', x: 292, y: 100 },
    ],
    ballStart: 'p2',
  },
  // Snelle counter via de keeper
  omkeeper: {
    actors: [
      { id: 'g', team: 'P', x: 28, y: 100 },
      { id: 'w1', team: 'P', x: 90, y: 48 },
      { id: 'w2', team: 'P', x: 90, y: 152 },
      { id: 's', team: 'N', x: 130, y: 100 },
      { id: 'd', team: 'O', x: 150, y: 72 },
    ],
    ballStart: 's',
    diagramBall: { offset: [-6, 4] },
  },
  // Van rondo naar counter
  omrondo: {
    actors: [
      { id: 'p1', team: 'P', x: 215, y: 55 },
      { id: 'p2', team: 'P', x: 170, y: 85 },
      { id: 'p3', team: 'P', x: 170, y: 125 },
      { id: 'p4', team: 'P', x: 215, y: 145 },
      { id: 'p5', team: 'P', x: 260, y: 100 },
      { id: 'g', team: 'P', x: 28, y: 100 },
      { id: 'o1', team: 'O', x: 225, y: 95 },
      { id: 'o2', team: 'O', x: 198, y: 110 },
    ],
    ballStart: 'p1',
    diagramBall: { at: 'o2', offset: [-6, 4] },
  },
  // Nummerspel: 1 tegen 1 tot 3 tegen 3
  sgnum: {
    actors: [
      { id: 'p1', team: 'P', x: 115, y: 46 },
      { id: 'p2', team: 'P', x: 140, y: 46 },
      { id: 'p3', team: 'P', x: 165, y: 46 },
      { id: 'p4', team: 'P', x: 190, y: 46 },
      { id: 'p5', team: 'P', x: 215, y: 46 },
      { id: 'o1', team: 'O', x: 105, y: 154 },
      { id: 'o2', team: 'O', x: 130, y: 154 },
      { id: 'o3', team: 'O', x: 155, y: 154 },
      { id: 'o4', team: 'O', x: 180, y: 154 },
      { id: 'o5', team: 'O', x: 205, y: 154 },
      { id: 't', team: 'N', label: 'T', x: 36, y: 64 },
    ],
    ballStart: 't',
    diagramBall: { offset: [6, 6] },
  },
  // Doeltrap: splitsen en uitspelen 2 + K tegen 1
  obsplit: {
    actors: [
      { id: 'g', team: 'P', x: 24, y: 100 },
      { id: 'c1', team: 'P', x: 54, y: 86 },
      { id: 'c2', team: 'P', x: 54, y: 114 },
      { id: 'a', team: 'O', x: 100, y: 100 },
    ],
    ballStart: 'g',
    diagramBall: { offset: [7, 4] },
  },
  // Vrijlopen van de zes: opbouw 3 + K tegen 2
  obsix: {
    actors: [
      { id: 'g', team: 'P', x: 24, y: 100 },
      { id: 'c1', team: 'P', x: 70, y: 60 },
      { id: 'c2', team: 'P', x: 70, y: 140 },
      { id: 's', team: 'P', x: 128, y: 122 },
      { id: 'a1', team: 'O', x: 100, y: 94 },
      { id: 'a2', team: 'O', x: 112, y: 136 },
      { id: 'k', team: 'N', x: 256, y: 100 },
    ],
    ballStart: 'g',
    diagramBall: { at: 'c1', offset: [7, 4] },
  },
  // Uitzakkende zes: opbouwen met drie achteraan
  obdrop: {
    actors: [
      { id: 'g', team: 'P', x: 24, y: 100 },
      { id: 'c1', team: 'P', x: 70, y: 70 },
      { id: 'c2', team: 'P', x: 70, y: 130 },
      { id: 's', team: 'P', x: 116, y: 100 },
      { id: 'b1', team: 'P', x: 118, y: 44 },
      { id: 'b2', team: 'P', x: 118, y: 156 },
      { id: 'f1', team: 'O', x: 104, y: 80 },
      { id: 'f2', team: 'O', x: 104, y: 122 },
      { id: 'm', team: 'O', x: 150, y: 100 },
    ],
    ballStart: 'g',
    diagramBall: { offset: [7, 4] },
  },
  // Indribbelen door de centrale verdediger
  obdrive: {
    actors: [
      { id: 'c1', team: 'P', x: 70, y: 70 },
      { id: 'c2', team: 'P', x: 70, y: 130 },
      { id: 's', team: 'O', x: 98, y: 92 },
      { id: 'm', team: 'P', x: 200, y: 75 },
      { id: 'o', team: 'O', x: 220, y: 92 },
      { id: 'k', team: 'N', x: 280, y: 100 },
    ],
    ballStart: 'c1',
    diagramBall: { offset: [6, 6] },
  },
  // Lange bal op de spits en de tweede bal
  oblong: {
    actors: [
      { id: 'g', team: 'P', x: 24, y: 100 },
      { id: 's', team: 'P', x: 184, y: 96 },
      { id: 'm1', team: 'P', x: 160, y: 62 },
      { id: 'm2', team: 'P', x: 162, y: 138 },
      { id: 'o1', team: 'O', x: 202, y: 100 },
      { id: 'o2', team: 'O', x: 165, y: 112 },
      { id: 'o3', team: 'O', x: 225, y: 70 },
    ],
    ballStart: 'g',
    diagramBall: { offset: [7, 4] },
  },
  // Van kant wisselen via de keeper: 4 + K tegen 3
  obswitch: {
    actors: [
      { id: 'g', team: 'P', x: 24, y: 100 },
      { id: 'c1', team: 'P', x: 68, y: 72 },
      { id: 'c2', team: 'P', x: 68, y: 128 },
      { id: 'b1', team: 'P', x: 116, y: 52 },
      { id: 'b2', team: 'P', x: 116, y: 148 },
      { id: 'o1', team: 'O', x: 128, y: 62 },
      { id: 'o2', team: 'O', x: 88, y: 84 },
      { id: 'o3', team: 'O', x: 140, y: 110 },
    ],
    ballStart: 'b1',
    diagramBall: { offset: [-5, 4] },
  },
  // Verticale pass op de spits en de kaatsbal
  obwall: {
    actors: [
      { id: 'c', team: 'P', x: 50, y: 100 },
      { id: 's', team: 'P', x: 100, y: 120 },
      { id: 'f', team: 'P', x: 190, y: 100 },
      { id: 'w', team: 'P', x: 268, y: 56 },
      { id: 'd', team: 'O', x: 206, y: 100 },
      { id: 'm', team: 'O', x: 120, y: 74 },
    ],
    ballStart: 'c',
    diagramBall: { offset: [7, 4] },
  },
  // Kort of lang: de keeper beslist
  obkeeper: {
    actors: [
      { id: 'g', team: 'P', x: 24, y: 100 },
      { id: 'c1', team: 'P', x: 62, y: 68 },
      { id: 'c2', team: 'P', x: 62, y: 132 },
      { id: 's', team: 'P', x: 106, y: 122 },
      { id: 'f', team: 'P', x: 245, y: 70 },
      { id: 'd1', team: 'O', x: 84, y: 62 },
      { id: 'd2', team: 'O', x: 84, y: 128 },
      { id: 'd3', team: 'O', x: 124, y: 102 },
    ],
    ballStart: 'g',
    diagramBall: { offset: [7, 4] },
  },
  // Loskomen van de 3 en de 10: K + 2 tegen 2
  obfree: {
    actors: [
      { id: 'g', team: 'P', label: 'K', x: 24, y: 100 },
      { id: 't', team: 'P', label: '3', x: 96, y: 122 },
      { id: 'ten', team: 'P', label: '10', x: 176, y: 92 },
      { id: 'n', team: 'P', label: '9', x: 284, y: 100 },
      { id: 'd3', team: 'O', x: 116, y: 112 },
      { id: 'd10', team: 'O', x: 196, y: 100 },
    ],
    ballStart: 'g',
    diagramBall: { offset: [7, 4] },
  },
  // Terugspeelbal en uitbouwen: 3 + K tegen 2
  obback: {
    actors: [
      { id: 'g', team: 'P', x: 32, y: 100 },
      { id: 'lb', team: 'P', x: 70, y: 42 },
      { id: 'cv', team: 'P', x: 110, y: 100 },
      { id: 'rb', team: 'P', x: 70, y: 158 },
      { id: 'a1', team: 'O', x: 110, y: 128 },
      { id: 'a2', team: 'O', x: 110, y: 72 },
    ],
    ballStart: 'cv',
    diagramBall: { offset: [-7, 0] },
  },
  // Rustig uitspelen: 3 + K tegen 2 met terugtreklijn
  obline: {
    actors: [
      { id: 'g', team: 'P', x: 32, y: 100 },
      { id: 'd1', team: 'P', x: 60, y: 60 },
      { id: 'd2', team: 'P', x: 60, y: 140 },
      { id: 'd3', team: 'P', x: 70, y: 100 },
      { id: 'a1', team: 'O', x: 104, y: 80 },
      { id: 'a2', team: 'O', x: 104, y: 122 },
    ],
    ballStart: 'g',
    diagramBall: { offset: [7, 4] },
  },
  // Opbouwen tegen druk: 4 + K tegen 2
  psbuild: {
    actors: [
      { id: 'g', team: 'P', x: 28, y: 100 },
      { id: 'c1', team: 'P', x: 70, y: 70 },
      { id: 'c2', team: 'P', x: 70, y: 130 },
      { id: 'b1', team: 'P', x: 120, y: 50 },
      { id: 'b2', team: 'P', x: 120, y: 150 },
      { id: 'a1', team: 'O', x: 92, y: 100 },
      { id: 'a2', team: 'O', x: 130, y: 100 },
    ],
    ballStart: 'g',
  },
  // Schaduwopbouw: patronen zonder tegenstander
  psshadow: {
    actors: [
      { id: 'g', team: 'P', x: 24, y: 100 },
      { id: 'c1', team: 'P', x: 60, y: 80 },
      { id: 'c2', team: 'P', x: 60, y: 120 },
      { id: 'b1', team: 'P', x: 80, y: 45 },
      { id: 'b2', team: 'P', x: 80, y: 155 },
      { id: 'm1', team: 'P', x: 120, y: 100 },
      { id: 'm2', team: 'P', x: 150, y: 70 },
      { id: 'm3', team: 'P', x: 150, y: 130 },
      { id: 'w1', team: 'P', x: 220, y: 50 },
      { id: 'w2', team: 'P', x: 220, y: 150 },
      { id: 'st', team: 'P', x: 250, y: 100 },
    ],
    ballStart: 'g',
  },
  // Driehoek op de flank: back, flankspeler en middenvelder
  psflank: {
    actors: [
      { id: 'b', team: 'P', x: 120, y: 75 },
      { id: 'w', team: 'P', x: 190, y: 55 },
      { id: 'm', team: 'P', x: 160, y: 98 },
      { id: 's', team: 'P', x: 270, y: 112 },
      { id: 'd1', team: 'O', x: 180, y: 74 },
      { id: 'd2', team: 'O', x: 214, y: 64 },
      { id: 'k', team: 'O', x: 292, y: 100 },
    ],
    ballStart: 'b',
  },
  // Positiespel 5 tegen 5 + 3
  positional: {
    actors: [
      { id: 'p1', team: 'P', x: 60, y: 50 },
      { id: 'p2', team: 'P', x: 60, y: 150 },
      { id: 'p3', team: 'P', x: 160, y: 40 },
      { id: 'p4', team: 'P', x: 160, y: 160 },
      { id: 'p5', team: 'P', x: 250, y: 100 },
      { id: 'o1', team: 'O', x: 95, y: 85 },
      { id: 'o2', team: 'O', x: 95, y: 125 },
      { id: 'o3', team: 'O', x: 185, y: 72 },
      { id: 'o4', team: 'O', x: 185, y: 130 },
      { id: 'o5', team: 'O', x: 140, y: 105 },
      { id: 'n1', team: 'N', x: 30, y: 100 },
      { id: 'n2', team: 'N', x: 290, y: 100 },
      { id: 'n3', team: 'N', x: 160, y: 180 },
    ],
    ballStart: 'n1',
    diagramBall: { at: 'p3', offset: [6, 6] },
  },
  // Positiespel 4 tegen 4 + 3 jokers
  ps43: {
    actors: [
      { id: 'j1', team: 'N', x: 60, y: 100 },
      { id: 'j2', team: 'N', x: 160, y: 100 },
      { id: 'j3', team: 'N', x: 260, y: 100 },
      { id: 'p1', team: 'P', x: 100, y: 65 },
      { id: 'p2', team: 'P', x: 120, y: 135 },
      { id: 'p3', team: 'P', x: 200, y: 60 },
      { id: 'p4', team: 'P', x: 215, y: 130 },
      { id: 'o1', team: 'O', x: 130, y: 112 },
      { id: 'o2', team: 'O', x: 180, y: 72 },
      { id: 'o3', team: 'O', x: 170, y: 140 },
      { id: 'o4', team: 'O', x: 235, y: 90 },
    ],
    ballStart: 'j1',
  },
  // Overspelen in drie vakken
  ps3z: {
    actors: [
      { id: 'l1', team: 'P', x: 40, y: 70 },
      { id: 'l2', team: 'P', x: 90, y: 65 },
      { id: 'l3', team: 'P', x: 60, y: 135 },
      { id: 'ol', team: 'O', x: 70, y: 100 },
      { id: 'm', team: 'P', x: 160, y: 110 },
      { id: 'om', team: 'O', x: 150, y: 80 },
      { id: 'r1', team: 'P', x: 220, y: 70 },
      { id: 'r2', team: 'P', x: 275, y: 80 },
      { id: 'r3', team: 'P', x: 245, y: 135 },
      { id: 'or', team: 'O', x: 250, y: 100 },
    ],
    ballStart: 'l1',
    diagramBall: { offset: [7, 4] },
  },
  // Positiespel 6 tegen 4 met vaste posities
  psshape: {
    actors: [
      { id: 'g', team: 'P', x: 28, y: 100 },
      { id: 'c1', team: 'P', x: 70, y: 70 },
      { id: 'c2', team: 'P', x: 70, y: 130 },
      { id: 'b1', team: 'P', x: 110, y: 48 },
      { id: 'b2', team: 'P', x: 110, y: 152 },
      { id: 'm1', team: 'P', x: 135, y: 85 },
      { id: 'm2', team: 'P', x: 135, y: 120 },
      { id: 'o1', team: 'O', x: 155, y: 60 },
      { id: 'o2', team: 'O', x: 160, y: 140 },
      { id: 'o3', team: 'O', x: 105, y: 100 },
      { id: 'o4', team: 'O', x: 180, y: 100 },
    ],
    ballStart: 'g',
  },
  // Van kant wisselen: 4 tegen 4 + 2 op vier doeltjes
  psswitch: {
    actors: [
      { id: 'p1', team: 'P', x: 200, y: 60 },
      { id: 'p2', team: 'P', x: 170, y: 90 },
      { id: 'p3', team: 'P', x: 130, y: 130 },
      { id: 'p4', team: 'P', x: 230, y: 140 },
      { id: 'o1', team: 'O', x: 215, y: 75 },
      { id: 'o2', team: 'O', x: 240, y: 62 },
      { id: 'o3', team: 'O', x: 185, y: 55 },
      { id: 'o4', team: 'O', x: 150, y: 120 },
      { id: 'j1', team: 'N', x: 120, y: 80 },
      { id: 'j2', team: 'N', x: 250, y: 105 },
    ],
    ballStart: 'p1',
  },
  // Kwadrantenspel: maximaal twee per vak
  psquad: {
    actors: [
      { id: 'p1', team: 'P', x: 90, y: 70 },
      { id: 'p2', team: 'P', x: 140, y: 80 },
      { id: 'p3', team: 'P', x: 125, y: 130 },
      { id: 'p4', team: 'P', x: 195, y: 70 },
      { id: 'p5', team: 'P', x: 235, y: 125 },
      { id: 'o1', team: 'O', x: 110, y: 95 },
      { id: 'o2', team: 'O', x: 180, y: 120 },
      { id: 'o3', team: 'O', x: 210, y: 90 },
      { id: 'o4', team: 'O', x: 80, y: 130 },
      { id: 'o5', team: 'O', x: 250, y: 70 },
    ],
    ballStart: 'p1',
  },
  // Spelen tussen de linies: middenzone
  psline: {
    actors: [
      { id: 'p1', team: 'P', x: 80, y: 70 },
      { id: 'p2', team: 'P', x: 110, y: 130 },
      { id: 'p3', team: 'P', x: 220, y: 60 },
      { id: 'p4', team: 'P', x: 250, y: 130 },
      { id: 'pm', team: 'P', x: 160, y: 95 },
      { id: 'o1', team: 'O', x: 100, y: 100 },
      { id: 'o2', team: 'O', x: 70, y: 120 },
      { id: 'o3', team: 'O', x: 215, y: 105 },
      { id: 'o4', team: 'O', x: 245, y: 80 },
      { id: 'om', team: 'O', x: 160, y: 130 },
    ],
    ballStart: 'p1',
  },
  // Tienpassenspel 5 tegen 5
  tenpass: {
    actors: [
      { id: 'p1', team: 'P', x: 90, y: 70 },
      { id: 'p2', team: 'P', x: 150, y: 60 },
      { id: 'p3', team: 'P', x: 210, y: 80 },
      { id: 'p4', team: 'P', x: 120, y: 130 },
      { id: 'p5', team: 'P', x: 235, y: 135 },
      { id: 'o1', team: 'O', x: 130, y: 92 },
      { id: 'o2', team: 'O', x: 180, y: 100 },
      { id: 'o3', team: 'O', x: 95, y: 105 },
      { id: 'o4', team: 'O', x: 200, y: 125 },
      { id: 'o5', team: 'O', x: 165, y: 142 },
    ],
    ballStart: 'p1',
  },
  // Partijvorm 5 tegen 5 op grote doelen
  smallgame: {
    actors: [
      { id: 'g', team: 'P', x: 24, y: 100 },
      { id: 'd', team: 'P', x: 70, y: 100 },
      { id: 'l', team: 'P', x: 125, y: 50 },
      { id: 'r', team: 'P', x: 125, y: 150 },
      { id: 's', team: 'P', x: 185, y: 100 },
      { id: 'ko', team: 'O', x: 296, y: 100 },
      { id: 'od', team: 'O', x: 250, y: 100 },
      { id: 'ol', team: 'O', x: 200, y: 64 },
      { id: 'or', team: 'O', x: 200, y: 136 },
      { id: 'os', team: 'O', x: 140, y: 100 },
    ],
    ballStart: 'g',
    diagramBall: { offset: [7, 4] },
  },
  // Funino: 3 tegen 3 op vier doeltjes
  sgfunino: {
    actors: [
      { id: 'p1', team: 'P', x: 120, y: 70 },
      { id: 'p2', team: 'P', x: 150, y: 120 },
      { id: 'p3', team: 'P', x: 190, y: 85 },
      { id: 'o1', team: 'O', x: 212, y: 128 },
      { id: 'o2', team: 'O', x: 255, y: 110 },
      { id: 'o3', team: 'O', x: 160, y: 60 },
    ],
    ballStart: 'p2',
    diagramBall: { offset: [7, -5] },
  },
  // Poortjesspel 4 tegen 4
  sggates: {
    actors: [
      { id: 'p1', team: 'P', x: 190, y: 78 },
      { id: 'p2', team: 'P', x: 252, y: 74 },
      { id: 'p3', team: 'P', x: 130, y: 125 },
      { id: 'p4', team: 'P', x: 80, y: 90 },
      { id: 'o1', team: 'O', x: 172, y: 108 },
      { id: 'o2', team: 'O', x: 150, y: 70 },
      { id: 'o3', team: 'O', x: 205, y: 142 },
      { id: 'o4', team: 'O', x: 120, y: 100 },
    ],
    ballStart: 'p1',
    diagramBall: { offset: [7, 4] },
  },
  // Eindzonespel 4 tegen 4
  sgend: {
    actors: [
      { id: 'p1', team: 'P', x: 150, y: 80 },
      { id: 'p2', team: 'P', x: 190, y: 120 },
      { id: 'p3', team: 'P', x: 120, y: 130 },
      { id: 'p4', team: 'P', x: 210, y: 70 },
      { id: 'o1', team: 'O', x: 232, y: 102 },
      { id: 'o2', team: 'O', x: 180, y: 92 },
      { id: 'o3', team: 'O', x: 140, y: 110 },
      { id: 'o4', team: 'O', x: 100, y: 70 },
    ],
    ballStart: 'p2',
    diagramBall: { offset: [6, -4] },
  },
  // Partijvorm 4 tegen 4 + 2 flankjokers
  sgwing: {
    actors: [
      { id: 'k', team: 'P', x: 24, y: 100 },
      { id: 'p1', team: 'P', x: 120, y: 100 },
      { id: 'p2', team: 'P', x: 190, y: 120 },
      { id: 'p3', team: 'P', x: 262, y: 98 },
      { id: 'j1', team: 'N', x: 180, y: 50 },
      { id: 'j2', team: 'N', x: 140, y: 150 },
      { id: 'ko', team: 'O', x: 296, y: 100 },
      { id: 'o1', team: 'O', x: 236, y: 118 },
      { id: 'o2', team: 'O', x: 205, y: 84 },
      { id: 'o3', team: 'O', x: 150, y: 112 },
      { id: 'o4', team: 'O', x: 274, y: 124 },
    ],
    ballStart: 'p1',
    diagramBall: { offset: [7, -5] },
  },
  // Werpen en terugspelen in duo's (één duo)
  wthrow: {
    actors: [
      { id: 'p1', team: 'P', x: 110, y: 100 },
      { id: 'p2', team: 'P', x: 200, y: 100 },
    ],
    ballStart: 'p1',
    diagramBall: { offset: [7, -4] },
  },
  // Vallende bal: reageren voor de tweede stuit (één duo)
  cdrop: {
    actors: [
      { id: 'p', team: 'P', x: 120, y: 100 },
      { id: 'n', team: 'N', x: 210, y: 100 },
    ],
    ballStart: 'n',
    diagramBall: { offset: [-7, -8] },
  },
  // Aanval tegen verdediging: 6 tegen 4 + K
  sgavv: {
    actors: [
      { id: 'a1', team: 'P', x: 90, y: 100 },
      { id: 'a2', team: 'P', x: 95, y: 145 },
      { id: 'a3', team: 'P', x: 150, y: 60 },
      { id: 'a4', team: 'P', x: 150, y: 140 },
      { id: 'a5', team: 'P', x: 190, y: 100 },
      { id: 'a6', team: 'P', x: 230, y: 145 },
      { id: 'k', team: 'O', x: 292, y: 100 },
      { id: 'd1', team: 'O', x: 200, y: 78 },
      { id: 'd2', team: 'O', x: 205, y: 122 },
      { id: 'd3', team: 'O', x: 245, y: 100 },
      { id: 'd4', team: 'O', x: 258, y: 132 },
    ],
    ballStart: 'a1',
    diagramBall: { offset: [7, 4] },
  },
  // Balwinst op eigen helft en counteren: 6 tegen 6
  omcounter: {
    actors: [
      { id: 'g', team: 'P', x: 24, y: 100 },
      { id: 'p1', team: 'P', x: 100, y: 120 },
      { id: 'p2', team: 'P', x: 80, y: 70 },
      { id: 'p3', team: 'P', x: 130, y: 90 },
      { id: 'p4', team: 'P', x: 150, y: 140 },
      { id: 'p5', team: 'P', x: 200, y: 60 },
      { id: 'k', team: 'O', x: 296, y: 100 },
      { id: 'o1', team: 'O', x: 112, y: 100 },
      { id: 'o2', team: 'O', x: 140, y: 60 },
      { id: 'o3', team: 'O', x: 185, y: 120 },
      { id: 'o4', team: 'O', x: 220, y: 90 },
      { id: 'o5', team: 'O', x: 250, y: 150 },
    ],
    ballStart: 'o1',
    diagramBall: { at: 'p1' },
  },
  // K + 5 tegen K + 4: opbouwen in golven
  obwave: {
    actors: [
      { id: 'g', team: 'P', label: 'K', x: 24, y: 100 },
      { id: 'f5', team: 'P', label: '5', x: 100, y: 22 },
      { id: 'f2', team: 'P', label: '2', x: 100, y: 178 },
      { id: 't', team: 'P', label: '3', x: 96, y: 112 },
      { id: 'ten', team: 'P', label: '10', x: 140, y: 94 },
      { id: 'n', team: 'P', label: '9', x: 190, y: 100 },
      { id: 'ko', team: 'O', label: 'K', x: 296, y: 100 },
      { id: 'o7', team: 'O', label: '7', x: 116, y: 36 },
      { id: 'o11', team: 'O', label: '11', x: 116, y: 164 },
      { id: 'o9', team: 'O', label: '9', x: 118, y: 106 },
      { id: 'o10', team: 'O', label: '10', x: 162, y: 108 },
    ],
    ballStart: 'g',
    diagramBall: { offset: [7, 4] },
  },
  // Positiespel in twee vakken: opbouw via de keeper
  obzones: {
    actors: [
      { id: 'g', team: 'P', label: 'K', x: 24, y: 100 },
      { id: 'f5', team: 'P', label: '5', x: 130, y: 18 },
      { id: 'f2', team: 'P', label: '2', x: 130, y: 182 },
      { id: 't', team: 'P', label: '3', x: 98, y: 124 },
      { id: 'ten', team: 'P', label: '10', x: 172, y: 100 },
      { id: 'ko', team: 'O', label: 'K', x: 296, y: 100 },
      { id: 'o9', team: 'O', label: '9', x: 116, y: 114 },
      { id: 'o2', team: 'O', label: '2', x: 180, y: 36 },
      { id: 'o5', team: 'O', label: '5', x: 180, y: 164 },
    ],
    ballStart: 'g',
    diagramBall: { offset: [7, 4] },
  },
  // Doorlopend 4 tegen 4 op grote doelen
  omrestart: {
    actors: [
      { id: 'kp', team: 'P', x: 52, y: 100 },
      { id: 'p1', team: 'P', x: 110, y: 70 },
      { id: 'p2', team: 'P', x: 120, y: 132 },
      { id: 'p3', team: 'P', x: 170, y: 95 },
      { id: 'p4', team: 'P', x: 210, y: 60 },
      { id: 'ko', team: 'O', x: 268, y: 100 },
      { id: 'o1', team: 'O', x: 150, y: 58 },
      { id: 'o2', team: 'O', x: 150, y: 142 },
      { id: 'o3', team: 'O', x: 200, y: 112 },
      { id: 'o4', team: 'O', x: 232, y: 80 },
    ],
    ballStart: 'p4',
  },
  // Partijvorm 6 tegen 6 met opbouwzone
  sgbuild: {
    actors: [
      { id: 'g', team: 'P', x: 24, y: 100 },
      { id: 'c1', team: 'P', x: 60, y: 60 },
      { id: 'c2', team: 'P', x: 60, y: 140 },
      { id: 'm', team: 'P', x: 140, y: 100 },
      { id: 'p5', team: 'P', x: 200, y: 140 },
      { id: 'p6', team: 'P', x: 185, y: 55 },
      { id: 'ko', team: 'O', x: 296, y: 100 },
      { id: 'o1', team: 'O', x: 126, y: 60 },
      { id: 'o2', team: 'O', x: 128, y: 150 },
      { id: 'o3', team: 'O', x: 220, y: 90 },
      { id: 'o4', team: 'O', x: 245, y: 55 },
      { id: 'o5', team: 'O', x: 250, y: 140 },
    ],
    ballStart: 'g',
    diagramBall: { offset: [7, 4] },
  },
  // Inworp: loskomen en doorspelen
  inworp: {
    actors: [
      { id: 'w', team: 'P', x: 100, y: 157 },
      { id: 'a', team: 'P', x: 110, y: 104 },
      { id: 'b', team: 'P', x: 176, y: 92 },
      { id: 'o1', team: 'O', x: 126, y: 118 },
      { id: 'o2', team: 'O', x: 190, y: 106 },
    ],
    ballStart: 'w',
    diagramBall: { offset: [6, -6] },
  },
  // Vrij rondpassen en de bal volgen
  pfollow: {
    actors: [
      { id: 'a', team: 'P', x: 120, y: 66 },
      { id: 'b', team: 'P', x: 200, y: 60 },
      { id: 'c', team: 'P', x: 214, y: 120 },
      { id: 'd', team: 'P', x: 152, y: 142 },
      { id: 'e', team: 'P', x: 112, y: 116 },
    ],
    ballStart: 'a',
  },
  // Kegelbowling
  pbowl: {
    actors: [
      { id: 'p1', team: 'P', x: 76, y: 62 },
      { id: 'p2', team: 'P', x: 76, y: 100 },
      { id: 'p3', team: 'P', x: 76, y: 138 },
      { id: 'o1', team: 'O', x: 244, y: 80 },
      { id: 'o2', team: 'O', x: 244, y: 120 },
    ],
    ballStart: 'p1',
  },
  // Schietduel vanaf de eigen helft
  fhalves: {
    actors: [
      { id: 'pk', team: 'P', x: 74, y: 100 },
      { id: 'p1', team: 'P', x: 130, y: 120 },
      { id: 'o1', team: 'O', x: 196, y: 80 },
      { id: 'ok', team: 'O', x: 246, y: 100 },
    ],
    ballStart: 'p1',
  },
  // Wereldbeker
  fworld: {
    actors: [
      { id: 'p1', team: 'P', x: 170, y: 90 },
      { id: 'p2', team: 'P', x: 200, y: 130 },
      { id: 'o1', team: 'O', x: 190, y: 66 },
      { id: 'o2', team: 'O', x: 214, y: 108 },
      { id: 'k', team: 'O', label: 'K', x: 292, y: 100 },
    ],
    ballStart: 'p1',
  },
  // Kleurdoeltjes 3 tegen 3
  sgcolor: {
    actors: [
      { id: 'p1', team: 'P', x: 120, y: 80 },
      { id: 'p2', team: 'P', x: 110, y: 125 },
      { id: 'p3', team: 'P', x: 190, y: 70 },
      { id: 'o1', team: 'O', x: 150, y: 102 },
      { id: 'o2', team: 'O', x: 200, y: 122 },
      { id: 'o3', team: 'O', x: 230, y: 78 },
      { id: 't', team: 'N', label: 'T', x: 36, y: 146 },
    ],
    ballStart: 'p1',
  },
  // Kasteelvoetbal 3 tegen 3
  sgcastle: {
    actors: [
      { id: 'p1', team: 'P', x: 130, y: 120 },
      { id: 'p2', team: 'P', x: 120, y: 72 },
      { id: 'p3', team: 'P', x: 180, y: 94 },
      { id: 'o1', team: 'O', x: 160, y: 112 },
      { id: 'o2', team: 'O', x: 180, y: 56 },
      { id: 'o3', team: 'O', x: 210, y: 128 },
    ],
    ballStart: 'p1',
  },
};
