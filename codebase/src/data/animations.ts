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
  /** New labels for actors, shown once the beat is done (e.g. position letters after a rotation). */
  labels?: Record<string, string>;
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
    beats: [
      { label: 'Pass naar rechts; de passer verhuist meteen naar een andere zijde', ms: 1100, ball: 'p3', moves: { p1: [105, 70], o1: [165, 80], o2: [195, 100] } },
      { label: 'Pass naar onder; ook deze passer verhuist, naar boven', ms: 1200, ball: 'p4', moves: { p3: [160, 45], o1: [140, 128], o2: [182, 132] } },
      { label: 'Splitpass tussen de verdedigers door; de passer vult de lege zijde rechts', ms: 1200, ball: 'p3', moves: { p4: [215, 125], o1: [145, 95], o2: [175, 100] } },
      { label: 'Pass naar links; daar staan er al twee, dus de passer gaat naar rechts', ms: 1200, ball: 'p1', moves: { p3: [215, 75], o1: [130, 85], o2: [170, 95] } },
      { label: 'Pass naar boven; de passer vult de lege onderkant', ms: 1200, ball: 'p2', moves: { p1: [130, 155], o1: [145, 78], o2: [180, 80] } },
    ],
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
    beats: [
      { label: 'Binnenkantpass naar de overkant; de passer sprint achter zijn pass aan', ms: 1000, ball: 'r1', moves: { l1: [160, 135], l2: [80, 100], l3: [62, 100] } },
      { label: 'Aannemen en terugpassen; de eerste passer sluit achteraan aan', ms: 1000, ball: 'l2', moves: { r1: [160, 65], l1: [258, 100], r2: [240, 100] } },
      { label: 'Pass en volg: iedereen schuift één plek op', ms: 1000, ball: 'r2', moves: { l2: [160, 135], r1: [62, 100], l3: [80, 100] } },
      { label: 'En opnieuw: wie past, loopt naar de andere rij', ms: 1000, ball: 'l3', moves: { r2: [160, 65], l2: [258, 100], l1: [240, 100] } },
    ],
  },
  // 1 tegen 1 op kleine doeltjes
  duel: {
    actors: [
      { id: 'p1', team: 'P', x: 95, y: 75 },
      { id: 'p2', team: 'P', x: 40, y: 90 },
      { id: 'p3', team: 'P', x: 40, y: 110 },
      { id: 'o1', team: 'O', x: 225, y: 120 },
      { id: 'o2', team: 'O', x: 280, y: 90 },
      { id: 'o3', team: 'O', x: 280, y: 110 },
    ],
    ballStart: 'p1',
    beats: [
      { label: 'Paars speelt diep in bij oranje en loopt in', ms: 900, ball: 'o1', moves: { p1: [132, 96] } },
      { label: 'Oranje neemt aan in de loop', ms: 600, ball: 'o1', moves: { o1: [200, 116], p1: [150, 104] } },
      { label: 'Duel: oranje gaat de verdediger voorbij', ms: 1100, ball: 'o1', moves: { o1: [128, 126], p1: [142, 110] } },
      { label: 'Scoren in het doeltje van paars', ms: 500, ball: [66, 100], moves: { o1: [104, 116] } },
      {
        label: 'Beide spelers sluiten achteraan aan bij de andere rij',
        ms: 1400,
        ball: [66, 100],
        moves: { p1: [280, 130], o1: [40, 130], p2: [95, 75], p3: [40, 90], o2: [225, 120], o3: [280, 90] },
      },
      { label: 'Het volgende duel begint', ms: 500, ball: 'p2', newBall: 'p2' },
    ],
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
    beats: [
      { label: 'De schutter speelt in op de aangever', ms: 700, ball: 'a' },
      { label: 'De schutter loopt meteen in', ms: 700, ball: 'a', moves: { s1: [150, 112] } },
      { label: 'De aangever kaatst terug in de loop', ms: 700, ball: 's1', moves: { s1: [184, 106] } },
      { label: 'Aannemen naar voren, richting doel', ms: 500, ball: 's1', moves: { s1: [206, 102] } },
      { label: 'Schot laag in de hoek', ms: 500, ball: [300, 116], moves: { k: [292, 108] } },
      { label: 'Volg je schot; de volgende schutter maakt zich klaar', ms: 1100, ball: [300, 116], moves: { s1: [262, 112], s2: [110, 120], k: [292, 100] } },
      { label: 'De volgende schutter start met een nieuwe bal', ms: 400, ball: 's2', newBall: 's2' },
    ],
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
    beats: [
      { label: 'A speelt in op B, die kort aankomt', ms: 700, ball: 'b', moves: { b: [142, 100] } },
      { label: 'B kaatst in één keer terug; C vertrekt', ms: 600, ball: 'a1', moves: { c: [240, 60] } },
      { label: 'A speelt diep in de loop van C', ms: 900, ball: 'c', moves: { c: [262, 56] } },
      {
        label: 'C dribbelt terug naar de rij, iedereen schuift door: A naar B, B naar C',
        ms: 1600,
        ball: 'c',
        moves: { c: [34, 100], a1: [150, 100], b: [230, 62], a2: [70, 100], a3: [52, 100] },
      },
      { label: 'De volgende beurt gaat naar rechts (D)', ms: 500, ball: 'a2', newBall: 'a2' },
    ],
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
    beats: [
      { label: 'A speelt in op B; tegelijk loopt C naar het midden', ms: 900, ball: 'b', moves: { c: [156, 108] } },
      { label: 'B legt in één keer terug op de derde man', ms: 600, ball: 'c' },
      { label: 'C speelt diep door naar D; B loopt in', ms: 800, ball: 'd', moves: { b: [200, 62] } },
      { label: 'D legt af in de loop van B', ms: 600, ball: 'b', moves: { b: [228, 76] } },
      { label: 'B schiet op het doeltje', ms: 500, ball: [286, 72] },
      {
        label: 'Iedereen schuift door: A naar C, C naar D, D naar B, B achteraan in de rij',
        ms: 1700,
        ball: [286, 72],
        moves: { a1: [160, 145], c: [250, 100], d: [160, 55], b: [52, 100], a2: [70, 100] },
        labels: { a1: 'C', c: 'D', d: 'B', b: 'A' },
      },
      { label: 'De volgende beurt begint', ms: 500, ball: 'a2', newBall: 'a2' },
    ],
  },
};
