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
  /** Who has the ball at the end of the beat (an actor id), or where it ends up. Left out, it stays put. */
  ball?: string | [number, number];
  /** A new ball appears at this actor at the start of the beat (e.g. the trainer plays in a fresh one). */
  newBall?: string;
  /** New labels for actors, shown once the beat is done (e.g. position letters after a rotation). */
  labels?: Record<string, string>;
}

export interface PitchAnimationDef {
  actors: AnimActor[];
  /** Actor id that has the ball at the start; left out for drills without a ball (e.g. sprints). */
  ballStart?: string;
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
  // Ruitpassen rond de palen: pass en volg rond drie passieve palen
  diamondpoles: {
    actors: [
      { id: 'a', team: 'P', x: 160, y: 145 },
      { id: 'q', team: 'P', x: 160, y: 163 },
      { id: 'b', team: 'P', x: 250, y: 100 },
      { id: 'c', team: 'P', x: 160, y: 55 },
      { id: 'd', team: 'P', x: 70, y: 100 },
    ],
    ballStart: 'a',
    beats: [
      { label: 'A speelt in op B en volgt zijn pass', ms: 1100, ball: 'b', moves: { a: [240, 116], q: [160, 145] } },
      { label: 'B speelt door naar C en volgt', ms: 1100, ball: 'c', moves: { b: [174, 50], a: [250, 100] } },
      { label: 'C speelt naar D en volgt', ms: 1100, ball: 'd', moves: { c: [80, 88], b: [160, 55] } },
      { label: 'D speelt terug naar de rij en sluit achteraan aan', ms: 1300, ball: 'q', moves: { d: [160, 163], c: [70, 100] } },
    ],
  },
  // Variant 2: kaatsen via de zijkant
  diamondpoles2: {
    actors: [
      { id: 'a', team: 'P', x: 160, y: 145 },
      { id: 'q', team: 'P', x: 160, y: 163 },
      { id: 'b', team: 'P', x: 250, y: 100 },
      { id: 'c', team: 'P', x: 160, y: 55 },
      { id: 'd', team: 'P', x: 70, y: 100 },
    ],
    ballStart: 'a',
    beats: [
      { label: 'A speelt in op B en komt naar binnen', ms: 1100, ball: 'b', moves: { a: [200, 128], q: [160, 145] } },
      { label: 'B kaatst terug op A', ms: 800, ball: 'a' },
      { label: 'A speelt tussen de palen door naar C', ms: 900, ball: 'c' },
      { label: 'Doorschuiven: A naar de plaats van B, B naar C', ms: 1100, ball: 'c', moves: { a: [250, 100], b: [176, 46] } },
      { label: 'Aan de andere kant: C speelt in op D en komt naar binnen', ms: 1100, ball: 'd', moves: { c: [120, 80] } },
      { label: 'D kaatst terug op C', ms: 800, ball: 'c' },
      { label: 'C speelt naar de rij', ms: 900, ball: 'q' },
      { label: 'Doorschuiven: C naar de plaats van D, D sluit aan bij de rij', ms: 1200, ball: 'q', moves: { c: [70, 100], d: [160, 163], b: [160, 55] } },
    ],
  },
  // Variant 3: één-twee rond de paal
  diamondpoles3: {
    actors: [
      { id: 'a', team: 'P', x: 160, y: 145 },
      { id: 'q', team: 'P', x: 160, y: 163 },
      { id: 'b', team: 'P', x: 250, y: 100 },
      { id: 'c', team: 'P', x: 160, y: 55 },
      { id: 'd', team: 'P', x: 70, y: 100 },
    ],
    ballStart: 'a',
    beats: [
      { label: 'A speelt in op B en komt naar binnen', ms: 1100, ball: 'b', moves: { a: [200, 128], q: [160, 145] } },
      { label: 'B kaatst terug op A', ms: 800, ball: 'a' },
      { label: 'B draait rond de paal; A speelt de bal in zijn loop', ms: 1200, ball: 'b', moves: { b: [234, 64] } },
      { label: 'B speelt naar C; A neemt de plaats van B in', ms: 1100, ball: 'c', moves: { a: [250, 100], b: [176, 46] } },
      { label: 'Aan de andere kant: C speelt in op D en komt naar binnen', ms: 1100, ball: 'd', moves: { c: [120, 80] } },
      { label: 'D kaatst terug op C', ms: 800, ball: 'c' },
      { label: 'D draait rond de paal; C speelt de bal in zijn loop', ms: 1200, ball: 'd', moves: { d: [86, 136] } },
      { label: 'D speelt naar de rij; C neemt de plaats van D in', ms: 1200, ball: 'q', moves: { c: [70, 100], d: [160, 163], b: [160, 55] } },
    ],
  },
  // Variant 4: derde man
  diamondpoles4: {
    actors: [
      { id: 'a', team: 'P', x: 160, y: 145 },
      { id: 'q', team: 'P', x: 160, y: 163 },
      { id: 'b', team: 'P', x: 250, y: 100 },
      { id: 'c', team: 'P', x: 160, y: 55 },
      { id: 'd', team: 'P', x: 70, y: 100 },
    ],
    ballStart: 'c',
    beats: [
      { label: 'C speelt in op D en komt naar binnen', ms: 1100, ball: 'd', moves: { c: [124, 78] } },
      { label: 'D kaatst terug op C', ms: 800, ball: 'c' },
      { label: 'C speelt diep op A; D loopt rond zijn paal naar beneden', ms: 1200, ball: 'a', moves: { d: [106, 150] } },
      { label: 'A legt af op D, de derde man', ms: 800, ball: 'd', moves: { c: [160, 55] } },
      { label: 'D speelt diagonaal door naar B', ms: 1200, ball: 'b' },
      { label: 'B speelt naar C en de volgende beurt begint', ms: 1100, ball: 'c' },
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
  // Rondo 3 tegen 1: de speler zonder bal loopt telkens naar de vrije zijde
  rondo31: {
    actors: [
      { id: 't', team: 'P', x: 160, y: 45 },
      { id: 'r', team: 'P', x: 215, y: 100 },
      { id: 'l', team: 'P', x: 105, y: 100 },
      { id: 'o', team: 'O', x: 160, y: 110 },
    ],
    ballStart: 't',
    beats: [
      { label: 'Pass naar rechts; de speler zonder bal loopt naar de vrije zijde', ms: 1000, ball: 'r', moves: { l: [160, 155], o: [188, 92] } },
      { label: 'Pass naar onder; boven schuift door naar links', ms: 1000, ball: 'l', moves: { t: [105, 100], o: [180, 128] } },
      { label: 'Weer links en rechts een aanspeelpunt: rechts loopt naar boven', ms: 1000, ball: 't', moves: { r: [160, 45], o: [140, 122] } },
      { label: 'En opnieuw: de vrije speler vult de open zijde', ms: 1000, ball: 'r', moves: { l: [215, 100], o: [132, 78] } },
    ],
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
    beats: [
      { label: 'Korte pass naar een buur op de cirkel', ms: 800, ball: 'p2', moves: { o1: [190, 78], o2: [162, 110] } },
      { label: 'Verder rond; de verdedigers schuiven mee', ms: 800, ball: 'p3', moves: { o1: [208, 90], o2: [178, 138] } },
      { label: 'Splitpass dwars door het midden', ms: 1000, ball: 'p7', moves: { o1: [178, 86], o2: [160, 118] } },
      { label: 'Korte pass naar de buur', ms: 800, ball: 'p1', moves: { o1: [142, 62], o2: [140, 100] } },
      { label: 'En weer door het gat tussen de twee verdedigers', ms: 1000, ball: 'p4', moves: { o1: [150, 80], o2: [165, 130] } },
    ],
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
    beats: [
      { label: 'Pass naar de middenspeler tussen de verdedigers', ms: 900, ball: 'm', moves: { o1: [146, 82], o2: [178, 114] } },
      { label: 'De middenspeler draait open en speelt door naar een andere zijde: punt', ms: 900, ball: 'r', moves: { o1: [150, 112], o2: [198, 112] } },
      { label: 'Rond de buitenkant; de middenspeler zoekt een nieuw gat', ms: 1000, ball: 'b', moves: { m: [135, 112], o1: [168, 130], o2: [192, 140] } },
      { label: 'Weer via het midden', ms: 800, ball: 'm', moves: { o1: [150, 124] } },
      { label: 'Draaien en doorspelen: weer een punt', ms: 900, ball: 't', moves: { o1: [146, 100], o2: [170, 120] } },
    ],
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
    beats: [
      { label: 'Pass naar een kaatser', ms: 700, ball: 'n4', moves: { o1: [128, 104], o2: [166, 102] } },
      { label: 'De ploegmaat loopt zich vrij', ms: 700, ball: 'n4', moves: { p2: [198, 60], o2: [176, 90] } },
      { label: 'De kaatser speelt de vrije man aan', ms: 900, ball: 'p2', moves: { p1: [140, 132], o1: [140, 104] } },
      { label: 'Kaatsen via de andere kaatser', ms: 800, ball: 'n2', moves: { o1: [180, 76], o2: [180, 110] } },
      { label: 'Terug naar de vrijgelopen ploegmaat', ms: 900, ball: 'p1', moves: { p1: [134, 136], o2: [170, 96] } },
    ],
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
    beats: [
      { label: 'Pass naar een andere zijde; het duo stapt in op de ontvanger', ms: 1000, ball: 'r', moves: { o1: [165, 95], o2: [198, 104] } },
      { label: 'Snel door voor de druk er is', ms: 1000, ball: 'b', moves: { o1: [150, 115], o2: [180, 138] } },
      { label: 'Het duo schuift mee: de een zet druk, de ander dekt', ms: 1000, ball: 'l', moves: { o1: [122, 110], o2: [150, 122] } },
      { label: 'Pass weg van de druk', ms: 1000, ball: 't', moves: { o1: [140, 70], o2: [160, 98] } },
    ],
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
    beats: [
      { label: 'Pass naar de andere kleur', ms: 900, ball: 'n2', moves: { o1: [118, 105], o2: [150, 90], o3: [145, 128] } },
      { label: 'En weer naar de andere kleur', ms: 900, ball: 'p3', moves: { o1: [130, 120], o2: [160, 105], o3: [150, 125] } },
      { label: 'De verdedigers schuiven als ploeg mee', ms: 900, ball: 'n3', moves: { o1: [160, 115], o2: [185, 100], o3: [198, 128] } },
      { label: 'Kleurwissel langs de zijkant', ms: 800, ball: 'p2', moves: { o1: [170, 100], o2: [200, 85], o3: [190, 120] } },
      { label: 'Van kant wisselen voor de druk er is', ms: 900, ball: 'n1', moves: { o1: [160, 85], o2: [185, 65], o3: [175, 110] } },
    ],
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
    beats: [
      { label: 'De buitenspelers houden de bal', ms: 1000, ball: 'r', moves: { o1: [165, 95], o2: [198, 106] } },
      { label: 'Onderschept: de verdediger wint de bal', ms: 700, ball: 'o2', moves: { o2: [188, 128] } },
      { label: 'Binnen 5 seconden in een doeltje trappen: punt voor de verdedigers', ms: 800, ball: [228, 136], moves: { o2: [200, 132] } },
    ],
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
    beats: [
      { label: 'De bal gaat rond in het vierkant', ms: 800, ball: 'p5', moves: { o1: [82, 88], o2: [100, 112] } },
      { label: 'Verder rond', ms: 800, ball: 'p4', moves: { o1: [100, 118], o2: [122, 120] } },
      { label: 'En naar de rechterkant', ms: 800, ball: 'p3', moves: { o1: [118, 122], o2: [130, 108] } },
      { label: 'Na minstens vijf passes: diepe pass naar de spits', ms: 1000, ball: 's', moves: { o1: [135, 118], o2: [128, 100] } },
      { label: 'De passer sprint mee', ms: 700, ball: 's', moves: { p3: [225, 112] } },
      { label: 'Kaatsbal van de spits', ms: 600, ball: 'p3', moves: { p3: [242, 114] } },
      { label: 'De passer wordt de nieuwe spits; de spits neemt zijn plaats in het vierkant in', ms: 1400, ball: 'p3', moves: { p3: [260, 100], s: [150, 125] } },
    ],
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
    beats: [
      { label: 'Paars houdt de bal in vak A', ms: 900, ball: 'b', moves: { o1: [108, 85], o2: [118, 108] } },
      { label: 'Oranje onderschept', ms: 700, ball: 'o2', moves: { o2: [116, 122], o1: [105, 108] } },
      { label: 'Balwinst: meteen naar de ploegmaats in vak B', ms: 900, ball: 'o4' },
      {
        label: 'Omschakelen: oranje sprint naar vak B, twee paarse spelers sprinten mee als verdedigers',
        ms: 1500,
        ball: 'o4',
        moves: { o1: [180, 100], o2: [230, 145], o3: [230, 55], o4: [280, 100], a: [218, 88], b: [244, 112] },
      },
      { label: 'Nu houdt oranje de bal in vak B', ms: 900, ball: 'o3', moves: { a: [236, 72], b: [236, 110] } },
    ],
  },
  // Passen door poortjes (één duo)
  pgates: {
    actors: [
      { id: 'a', team: 'P', x: 149, y: 74 },
      { id: 'b', team: 'P', x: 149, y: 112 },
    ],
    ballStart: 'a',
    beats: [
      { label: 'Pass door een poortje', ms: 700, ball: 'b' },
      { label: 'De ontvanger dribbelt naar een ander poortje; zijn ploegmaat loopt mee naar de overkant', ms: 1300, ball: 'b', moves: { b: [214, 100], a: [214, 136] } },
      { label: 'Pass door het volgende poortje', ms: 700, ball: 'a' },
      { label: 'Weer naar een ander poortje: niet twee keer door hetzelfde', ms: 1300, ball: 'a', moves: { a: [189, 72], b: [189, 38] } },
      { label: 'Pass: nog een poortje erbij', ms: 700, ball: 'b' },
    ],
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
    beats: [
      { label: 'Op het signaal: dribbel op de kegel af', ms: 1000, ball: 'p1', moves: { p1: [138, 82] } },
      { label: 'Pass naar de kaatser vóór de kegel', ms: 500, ball: 'k' },
      { label: 'Sprint langs de kegel; de kaatser speelt in één keer terug in je loop', ms: 800, ball: 'p1', moves: { p1: [214, 82] } },
      { label: 'Afwerken in het doeltje: wie eerst scoort, wint het punt', ms: 500, ball: [285, 78] },
      {
        label: 'De schutter wordt kaatser, de kaatser sluit achteraan aan',
        ms: 1500,
        ball: [285, 78],
        moves: { p1: [160, 46], k: [24, 82], p2: [60, 82], p3: [42, 82] },
      },
    ],
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
    beats: [
      { label: 'Inspelen; terwijl de bal onderweg is, kijkt de middenspeler naar de trainer', ms: 900, ball: 'm' },
      { label: 'Hand omhoog: opendraaien', ms: 600, ball: 'm', moves: { m: [172, 104] } },
      { label: 'Doorspelen naar de andere kant', ms: 800, ball: 'c', moves: { m: [160, 100] } },
      { label: 'De buitenspeler speelt meteen opnieuw in', ms: 800, ball: 'm' },
      { label: 'Geen hand: in één keer terugkaatsen', ms: 700, ball: 'c' },
    ],
  },
  // Lange pass: van kant wisselen
  longpass: {
    actors: [
      { id: 'a', team: 'P', x: 60, y: 100 },
      { id: 'b', team: 'P', x: 260, y: 100 },
    ],
    ballStart: 'a',
    beats: [
      { label: 'Bal één pas voor je leggen', ms: 500, ball: 'a', moves: { a: [66, 100] } },
      { label: 'Lange bal met de wreef naar het andere vakje', ms: 1300, ball: 'b' },
      { label: 'Aannemen in het vakje', ms: 500, ball: 'b', moves: { b: [254, 100] } },
      { label: 'En lang terugspelen', ms: 1300, ball: 'a', moves: { a: [60, 100] } },
    ],
  },
  // Steekpass in de loop
  through: {
    actors: [
      { id: 'p', team: 'P', x: 110, y: 100 },
      { id: 'r', team: 'P', x: 140, y: 140 },
      { id: 'k', team: 'O', x: 292, y: 100 },
    ],
    ballStart: 'p',
    beats: [
      { label: 'Eerst een kleine beweging weg van het poortje', ms: 600, ball: 'p', moves: { r: [128, 150] } },
      { label: 'Dan diep starten', ms: 700, ball: 'p', moves: { r: [186, 130] } },
      { label: 'Steekpass door het poortje in de loop', ms: 800, ball: 'r', moves: { r: [232, 106] } },
      { label: 'Aannemen en afwerken', ms: 700, ball: [306, 90], moves: { r: [250, 100], k: [296, 94] } },
    ],
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
    beats: [
      { label: 'De race begint: door het eerste poortje', ms: 600, ball: 'p2' },
      { label: 'Aannemen, draaien en door het volgende poortje', ms: 700, ball: 'p3' },
      { label: 'En door naar de laatste', ms: 700, ball: 'p4' },
      { label: 'De laatste speler dribbelt rond de keerkegel', ms: 500, ball: 'p4', moves: { p4: [276, 50] } },
      { label: 'De laatste speler dribbelt rond de keerkegel', ms: 500, ball: 'p4', moves: { p4: [294, 76] } },
      { label: 'De laatste speler dribbelt rond de keerkegel', ms: 500, ball: 'p4', moves: { p4: [240, 75] } },
      { label: 'De bal gaat door de poortjes terug', ms: 600, ball: 'p3' },
      { label: 'De bal gaat door de poortjes terug', ms: 600, ball: 'p2' },
      { label: 'Terug bij de eerste: één keer heen en terug', ms: 600, ball: 'p1' },
    ],
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
    beats: [
      { label: 'A speelt in op B en loopt mee', ms: 800, ball: 'b', moves: { a: [96, 96] } },
      { label: 'B kaatst terug', ms: 600, ball: 'a', moves: { a: [108, 96] } },
      { label: 'A speelt diep op de lopende C', ms: 900, ball: 'c', moves: { c: [224, 112] } },
      { label: 'C trapt op doel', ms: 500, ball: [305, 90], moves: { k: [296, 92] } },
      {
        label: 'Doordraaien: A wordt B, B wordt C, C haalt de bal en sluit aan bij de start',
        ms: 1700,
        ball: [305, 90],
        moves: { a: [150, 60], b: [150, 140], c: [60, 100], k: [292, 100] },
        labels: { a: 'B', b: 'C', c: 'A' },
      },
    ],
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
    beats: [
      { label: 'De trainer gooit de bal zacht op', ms: 900, ball: 's1' },
      { label: 'Halve volley: net na de stuit raken met de wreef', ms: 600, ball: [306, 96], moves: { k: [296, 94] } },
      { label: 'Achteraan aansluiten; de volgende schutter', ms: 1000, ball: [306, 96], moves: { s1: [122, 138], s2: [160, 110], k: [292, 100] } },
      { label: 'Nu een volley: rechtstreeks uit de lucht', ms: 900, ball: 's2', newBall: 't' },
      { label: 'Afwerken in één keer', ms: 600, ball: [306, 108], moves: { k: [296, 104] } },
    ],
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
    beats: [
      { label: 'De flankspeler dribbelt op', ms: 1100, ball: 'w', moves: { w: [230, 52] } },
      { label: 'De spitsen lopen in: naar de eerste en de tweede paal', ms: 900, ball: 'w', moves: { w: [240, 56], a: [238, 90], b: [234, 124] } },
      { label: 'Voorzet voor doel', ms: 800, ball: 'a', moves: { a: [266, 86], b: [272, 116], k: [294, 88] } },
      { label: 'In één keer afwerken', ms: 500, ball: [306, 92] },
    ],
  },
  // Terugleggen vanaf de achterlijn
  fcutback: {
    actors: [
      { id: 'w', team: 'P', x: 170, y: 48 },
      { id: 's', team: 'P', x: 160, y: 110 },
      { id: 'k', team: 'O', x: 292, y: 100 },
    ],
    ballStart: 'w',
    beats: [
      { label: 'Dribbel langs de zijlijn tot bijna aan de achterlijn', ms: 1300, ball: 'w', moves: { w: [284, 62], s: [214, 100] } },
      { label: 'De spits loopt richting eerste paal en remt af rond de penaltystip', ms: 700, ball: 'w', moves: { s: [250, 100], k: [294, 88] } },
      { label: 'Lage bal terug', ms: 700, ball: 's' },
      { label: 'Schot in één keer', ms: 500, ball: [306, 112] },
    ],
  },
  // Schieten en opvolgen
  frebound: {
    actors: [
      { id: 's', team: 'P', x: 150, y: 100 },
      { id: 't', team: 'N', label: 'T', x: 226, y: 146 },
      { id: 'k', team: 'O', x: 292, y: 100 },
    ],
    ballStart: 's',
    beats: [
      { label: 'Eerste schot op doel', ms: 700, ball: [296, 90], moves: { k: [294, 92] } },
      { label: 'Meteen opvolgen: de schutter sprint mee', ms: 900, ball: [296, 90], moves: { s: [238, 112] } },
      { label: 'De trainer speelt een tweede bal in', ms: 700, ball: 's', newBall: 't', moves: { s: [252, 112] } },
      { label: 'Binnenleggen in één keer', ms: 500, ball: [306, 108], moves: { k: [292, 96] } },
    ],
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
    beats: [
      { label: 'De centrale speler drijft op', ms: 1000, ball: 'c1', moves: { c1: [156, 100] } },
      { label: 'Hij trapt op doel en blijft staan als aflegger', ms: 600, ball: [306, 100], moves: { k: [296, 100] } },
      { label: 'Links speelt de aflegger aan en loopt door', ms: 700, ball: 'c1', newBall: 'l1', moves: { l1: [176, 58] } },
      { label: 'Afleggen in één keer in de loop', ms: 500, ball: 'l1', moves: { l1: [198, 78] } },
      { label: 'Links trapt meteen', ms: 500, ball: [306, 88], moves: { k: [296, 92] } },
      { label: 'Dezelfde combinatie vanaf rechts', ms: 700, ball: 'c1', newBall: 'r1', moves: { r1: [176, 142] } },
      { label: 'Afleggen in de loop', ms: 500, ball: 'r1', moves: { r1: [198, 122] } },
      { label: 'Rechts trapt meteen', ms: 500, ball: [306, 112], moves: { k: [296, 106] } },
    ],
  },
  // Koppen op doel
  fheader: {
    actors: [
      { id: 'a', team: 'N', x: 256, y: 148 },
      { id: 'h', team: 'P', x: 170, y: 100 },
      { id: 'k', team: 'O', x: 292, y: 100 },
    ],
    ballStart: 'a',
    beats: [
      { label: 'Bal met een boog; de kopper loopt aan', ms: 1000, ball: 'h', moves: { h: [238, 100] } },
      { label: 'Afzetten op één been en naar beneden in de hoek koppen', ms: 500, ball: [306, 84], moves: { k: [294, 96] } },
      { label: 'Terug naar de rij', ms: 1100, ball: [306, 84], moves: { h: [170, 100], k: [292, 100] } },
    ],
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
    beats: [
      { label: 'Op het signaal: de middelste speler dribbelt op, de buitenspelers lopen breed mee', ms: 1300, ball: 'm', moves: { m: [166, 100], t: [160, 52], b: [160, 148], d1: [194, 90], d2: [196, 114] } },
      { label: 'Een verdediger stapt in: pass naar de vrije man', ms: 800, ball: 't', moves: { t: [212, 60], m: [176, 100], d1: [188, 92], d2: [204, 110] } },
      { label: 'Afwerken binnen 10 seconden', ms: 600, ball: [306, 92], moves: { t: [222, 64], k: [296, 90] } },
    ],
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
    beats: [
      { label: 'Pass naar een kaatser', ms: 700, ball: 'n1', moves: { o1: [162, 66], p2: [206, 112] } },
      { label: 'De kaatser speelt de vrije man aan', ms: 900, ball: 'p2', moves: { p2: [212, 106], o2: [178, 116] } },
      { label: 'Schieten zo snel mogelijk', ms: 600, ball: [284, 96], moves: { k2: [276, 96] } },
      { label: 'Na een doelpunt start de keeper meteen opnieuw', ms: 900, ball: 'o1', newBall: 'k2', moves: { k2: [274, 100], o1: [190, 72], p1: [150, 80] } },
      { label: 'Oranje speelt via een kaatser', ms: 800, ball: 'n3', moves: { o2: [120, 112], p1: [130, 66], p2: [170, 110] } },
      { label: 'De kaatser speelt de vrije man aan', ms: 800, ball: 'o2', moves: { o2: [104, 108] } },
      { label: 'Schot op het andere doel', ms: 600, ball: [36, 104], moves: { k1: [44, 104] } },
    ],
  },
  // Plaatsen in de hoeken
  fplace: {
    actors: [
      { id: 's', team: 'P', x: 200, y: 100 },
      { id: 'k', team: 'O', x: 284, y: 100 },
    ],
    ballStart: 's',
    beats: [
      { label: 'Bal klaarleggen en kijken', ms: 700, ball: 's', moves: { s: [204, 100] } },
      { label: 'Plaatsen met de binnenkant in een hoekvak', ms: 700, ball: [306, 84], moves: { k: [286, 96] } },
      { label: 'Nu in de andere hoek', ms: 800, ball: [306, 116], newBall: 's', moves: { k: [286, 104] } },
    ],
  },
  // Herhaalde sprints met afwerking
  krepeat: {
    actors: [
      { id: 'p1', team: 'P', x: 56, y: 100 },
      { id: 'p2', team: 'P', x: 38, y: 100 },
      { id: 'p3', team: 'P', x: 56, y: 124 },
      { id: 'p4', team: 'P', x: 38, y: 124 },
      { id: 't', team: 'N', label: 'T', x: 172, y: 144 },
      { id: 'k', team: 'O', x: 292, y: 100 },
    ],
    ballStart: 't',
    beats: [
      { label: 'Sprint naar de kegel', ms: 1000, ball: 't', moves: { p1: [166, 100] } },
      { label: 'De trainer speelt de bal in', ms: 600, ball: 'p1', moves: { p1: [178, 102] } },
      { label: 'Binnen twee balcontacten op doel', ms: 600, ball: [306, 96], moves: { p1: [188, 100], k: [296, 98] } },
    ],
  },
  // Vangen in W-vorm / Lage ballen opscheppen
  gkserve: {
    actors: [
      { id: 't', team: 'N', label: 'T', x: 180, y: 100 },
      { id: 'g', team: 'P', x: 290, y: 100 },
    ],
    ballStart: 't',
    beats: [
      { label: 'De trainer speelt de bal aan; de keeper stapt in achter de bal', ms: 900, ball: 'g', moves: { g: [270, 100] } },
      { label: 'Teruggooien en opnieuw in startpositie', ms: 1000, ball: 't', moves: { g: [290, 100] } },
      { label: 'Nu een pas naast de keeper: bijschuiven en inpakken', ms: 900, ball: 'g', moves: { g: [284, 82] } },
      { label: 'Teruggooien en opnieuw in startpositie', ms: 1000, ball: 't', moves: { g: [290, 100] } },
    ],
  },
  // Schotstoppen vanuit de startpositie
  gkshot: {
    actors: [
      { id: 's1', team: 'O', x: 195, y: 60 },
      { id: 's2', team: 'O', x: 185, y: 100 },
      { id: 's3', team: 'O', x: 195, y: 140 },
      { id: 'g', team: 'P', x: 286, y: 100 },
    ],
    ballStart: 's1',
    beats: [
      { label: 'De keeper schuift bij tot op de lijn bal–midden doel', ms: 700, ball: 's1', moves: { g: [284, 92] } },
      { label: 'Schot vanaf links', ms: 600, ball: 'g', moves: { g: [280, 88] } },
      { label: 'Bijschuiven naar het midden', ms: 700, ball: 's2', newBall: 's2', moves: { g: [284, 100] } },
      { label: 'Schot vanuit het midden', ms: 600, ball: 'g', moves: { g: [280, 100] } },
      { label: 'Bijschuiven naar rechts', ms: 700, ball: 's3', newBall: 's3', moves: { g: [284, 108] } },
      { label: 'Schot vanaf rechts', ms: 600, ball: 'g', moves: { g: [280, 112] } },
    ],
  },
  // Positie kiezen: de hoek verkleinen
  gkangle: {
    actors: [
      { id: 'a1', team: 'O', x: 176, y: 62 },
      { id: 'a2', team: 'O', x: 176, y: 136 },
      { id: 'g', team: 'P', x: 282, y: 88 },
    ],
    ballStart: 'a1',
    beats: [
      { label: 'Pass naar de andere kant; de keeper schuift bij met kleine passen', ms: 1000, ball: 'a2', moves: { g: [282, 112] } },
      { label: 'En terug: weer op de lijn bal–midden doel', ms: 1000, ball: 'a1', moves: { g: [282, 88] } },
      { label: 'Nog eens naar de andere kant', ms: 1000, ball: 'a2', moves: { g: [282, 112] } },
      { label: 'Schot: de keeper staat al in startpositie', ms: 600, ball: 'g', moves: { g: [278, 116] } },
    ],
  },
  // 1 tegen 1: uitkomen en blokken
  gk1v1: {
    actors: [
      { id: 'a1', team: 'O', x: 112, y: 100 },
      { id: 'a2', team: 'O', x: 60, y: 90 },
      { id: 'a3', team: 'O', x: 60, y: 110 },
      { id: 'g', team: 'P', x: 286, y: 100 },
    ],
    ballStart: 'a1',
    beats: [
      { label: 'De aanvaller dribbelt op de keeper af', ms: 1200, ball: 'a1', moves: { a1: [196, 100], g: [274, 100] } },
      { label: 'Bal van de voet: de keeper komt uit en remt af op 2 à 3 meter', ms: 700, ball: 'a1', moves: { a1: [214, 100], g: [236, 100] } },
      { label: 'Breed maken en blokken', ms: 500, ball: 'g', moves: { g: [230, 100] } },
    ],
  },
  // Hoge ballen: voorzetten klemmen
  gkcross: {
    actors: [
      { id: 'o1', team: 'O', x: 225, y: 50 },
      { id: 'o2', team: 'O', x: 225, y: 150 },
      { id: 'g', team: 'P', x: 292, y: 100 },
    ],
    ballStart: 'o1',
    beats: [
      { label: 'Voorzet in de zestien; de keeper roept “keeper” en komt uit', ms: 1000, ball: 'g', moves: { g: [268, 86] } },
      { label: 'Vangen op het hoogste punt en terug in doel', ms: 900, ball: 'g', moves: { g: [292, 100] } },
      { label: 'Nu vanaf de andere kant', ms: 1000, ball: 'g', newBall: 'o2', moves: { g: [268, 114] } },
      { label: 'Vangen op het hoogste punt en terug in doel', ms: 900, ball: 'g', moves: { g: [292, 100] } },
    ],
  },
  // Uitworp en uittrap naar doeltjes
  gkdist: {
    actors: [{ id: 'g', team: 'P', x: 286, y: 100 }],
    ballStart: 'g',
    beats: [
      { label: 'Uitrollen naar het dichte doeltje', ms: 1000, ball: [180, 136] },
      { label: 'Werpen of uittrappen naar het verre doeltje', ms: 1500, ball: [68, 60], newBall: 'g' },
    ],
  },
  // Terugspeelbal onder druk
  gkback: {
    actors: [
      { id: 'd', team: 'P', x: 180, y: 140 },
      { id: 'w', team: 'P', x: 200, y: 50 },
      { id: 'a', team: 'O', x: 210, y: 106 },
      { id: 'g', team: 'P', x: 286, y: 100 },
    ],
    ballStart: 'd',
    beats: [
      { label: 'De verdediger speelt terug; de aanvaller zet meteen druk op de keeper', ms: 900, ball: 'g', moves: { a: [250, 104] } },
      { label: 'Aannemen naar de kant weg van de aanvaller', ms: 500, ball: 'g', moves: { g: [284, 86], a: [264, 100] } },
      { label: 'Doorspelen naar de vrije man op de flank', ms: 900, ball: 'w', moves: { w: [206, 56], a: [272, 94] } },
    ],
  },
  // Dubbele redding: opstaan en opnieuw
  gkrebound: {
    actors: [
      { id: 's1', team: 'O', x: 180, y: 100 },
      { id: 's2', team: 'O', x: 235, y: 54 },
      { id: 'g', team: 'P', x: 286, y: 100 },
    ],
    ballStart: 's1',
    beats: [
      { label: 'Laag schot naast de keeper: duiken en verwerken', ms: 600, ball: [292, 134], moves: { g: [286, 122] } },
      { label: 'Meteen rechtstaan en positie kiezen tegenover de tweede schutter', ms: 700, ball: [292, 134], moves: { g: [282, 88] } },
      { label: 'Tweede schot binnen 2 seconden', ms: 500, ball: 'g', newBall: 's2', moves: { g: [280, 84] } },
    ],
  },
  // Leren vallen: van knielend naar staand
  gkdive: {
    actors: [
      { id: 't', team: 'N', label: 'T', x: 190, y: 100 },
      { id: 'g', team: 'P', x: 288, y: 100 },
    ],
    ballStart: 't',
    beats: [
      { label: 'Bal net naast de keeper: zijwaarts vallen en vangen', ms: 800, ball: 'g', moves: { g: [288, 80] } },
      { label: 'Teruggooien en opnieuw in kniezit', ms: 1000, ball: 't', moves: { g: [288, 100] } },
      { label: 'Nu naar de andere kant', ms: 800, ball: 'g', moves: { g: [288, 120] } },
      { label: 'Teruggooien en opnieuw in kniezit', ms: 1000, ball: 't', moves: { g: [288, 100] } },
    ],
  },
  // Draaibewegingen aan de kegel (één rij)
  dturns: {
    actors: [{ id: 'p', team: 'P', x: 64, y: 110 }],
    ballStart: 'p',
    beats: [
      { label: 'Dribbelen naar de draaikegel', ms: 1100, ball: 'p', moves: { p: [204, 110] } },
      { label: 'Draaien aan de kegel', ms: 500, ball: 'p', moves: { p: [214, 118] } },
      { label: 'Versnellen terug naar de start', ms: 1000, ball: 'p', moves: { p: [64, 110] } },
    ],
  },
  // Schijnbewegingen: passeren en versnellen
  dfeint: {
    actors: [
      { id: 'p', team: 'P', x: 60, y: 100 },
      { id: 'd', team: 'O', x: 170, y: 100 },
    ],
    ballStart: 'p',
    beats: [
      { label: 'Dribbel op de verdediger af', ms: 900, ball: 'p', moves: { p: [148, 100] } },
      { label: 'Op 2 meter: schijnbeweging naar de ene kant', ms: 400, ball: 'p', moves: { p: [154, 112] } },
      { label: 'Versnellen langs de andere kant', ms: 400, ball: 'p', moves: { p: [160, 80] } },
      { label: 'Door het poortje', ms: 700, ball: 'p', moves: { p: [232, 66] } },
    ],
  },
  // Poortjesspel 1 tegen 1 (één duo)
  dgates: {
    actors: [
      { id: 'a', team: 'P', x: 125, y: 86 },
      { id: 'd', team: 'O', x: 150, y: 100 },
    ],
    ballStart: 'a',
    beats: [
      { label: 'De aanvaller dribbelt naar een vrij poortje', ms: 900, ball: 'a', moves: { a: [192, 72], d: [172, 86] } },
      { label: 'Door het poortje: punt', ms: 600, ball: 'a', moves: { a: [199, 38], d: [190, 66] } },
      { label: 'De verdediger jaagt erachteraan en verovert de bal', ms: 600, ball: 'd', moves: { d: [192, 44], a: [204, 34] } },
      { label: 'Balwinst: nu scoort hij zelf via een ander poortje', ms: 1100, ball: 'd', moves: { d: [209, 110], a: [196, 88] } },
      { label: 'Door het poortje: punt voor oranje', ms: 600, ball: 'd', moves: { d: [209, 140], a: [202, 118] } },
    ],
  },
  // 1 tegen 1 met achtervolger
  dchase: {
    actors: [
      { id: 'a', team: 'P', x: 80, y: 90 },
      { id: 'd', team: 'O', x: 60, y: 104 },
      { id: 'k', team: 'O', x: 292, y: 100 },
    ],
    ballStart: 'a',
    beats: [
      { label: 'Op het signaal: de aanvaller dribbelt op snelheid naar doel', ms: 1100, ball: 'a', moves: { a: [170, 92], d: [138, 106] } },
      { label: 'De verdediger zet de achtervolging in', ms: 900, ball: 'a', moves: { a: [234, 96], d: [214, 106] } },
      { label: 'Schot voor de verdediger aansluit', ms: 500, ball: [306, 90], moves: { d: [226, 108], k: [296, 92] } },
    ],
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
    beats: [
      { label: 'De balbezitter dribbelt op de verdediger af', ms: 1100, ball: 'a1', moves: { a1: [164, 92], a2: [158, 138], d: [186, 98] } },
      { label: 'De verdediger stapt in: pass naar de vrije man', ms: 800, ball: 'a2', moves: { a2: [212, 132], d: [178, 96] } },
      { label: 'Schot op doel', ms: 600, ball: [306, 108], moves: { k: [296, 106] } },
    ],
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
    beats: [
      { label: 'De aangever speelt in; de aanvaller komt kort', ms: 800, ball: 'a', moves: { a: [156, 100], d: [174, 100] } },
      { label: 'Aannemen en afschermen', ms: 500, ball: 'a', moves: { d: [170, 92] } },
      { label: 'Wegdraaien van de verdediger', ms: 800, ball: 'a', moves: { a: [200, 124], d: [184, 108] } },
      { label: 'Doorgaan richting doel', ms: 600, ball: 'a', moves: { a: [236, 116], d: [216, 110] } },
      { label: 'Afwerken binnen 8 seconden', ms: 500, ball: [306, 104], moves: { k: [296, 104] } },
    ],
  },
  // Wie is eerst aan de bal?
  wduel: {
    actors: [
      { id: 'p', team: 'P', x: 80, y: 90 },
      { id: 'o', team: 'O', x: 80, y: 116 },
      { id: 't', team: 'N', label: 'T', x: 80, y: 150 },
    ],
    ballStart: 't',
    beats: [
      { label: 'De trainer speelt de bal het veld in', ms: 800, ball: [160, 104] },
      { label: 'Rechtspringen en sprinten: wie is eerst aan de bal?', ms: 800, moves: { p: [154, 100], o: [144, 112] } },
      { label: 'Paars is eerst en valt aan, oranje verdedigt', ms: 1000, ball: 'p', moves: { p: [222, 80], o: [206, 94] } },
      { label: 'Afwerken op een doeltje', ms: 500, ball: [274, 71], moves: { o: [212, 92] } },
    ],
  },
  // Reactiestart op signaal
  wreact: {
    actors: [
      { id: 'p', team: 'P', x: 152, y: 106 },
      { id: 'o', team: 'O', x: 168, y: 110 },
      { id: 't', team: 'N', label: 'T', x: 160, y: 150 },
    ],
    beats: [
      { label: 'De trainer roept een kleur: sprinten naar die kegel', ms: 800, moves: { p: [108, 52], o: [120, 62] } },
      { label: 'Terug naar het midden', ms: 900, moves: { p: [152, 106], o: [168, 110] } },
      { label: 'Nieuwe kleur: wie is er eerst?', ms: 800, moves: { o: [212, 128], p: [200, 120] } },
      { label: 'Terug naar het midden', ms: 900, moves: { p: [152, 106], o: [168, 110] } },
    ],
  },
  // Wendbaarheid: T-parcours
  cagility: {
    actors: [
      { id: 'p1', team: 'P', x: 160, y: 152 },
      { id: 'p2', team: 'P', x: 184, y: 152 },
    ],
    beats: [
      { label: 'Vooruit sprinten naar de middelste kegel', ms: 800, moves: { p1: [160, 62] } },
      { label: 'Zijwaarts naar links: kegel aantikken', ms: 700, moves: { p1: [108, 60] } },
      { label: 'Zijwaarts naar rechts: kegel aantikken', ms: 1000, moves: { p1: [212, 60] } },
      { label: 'Terug naar het midden', ms: 600, moves: { p1: [160, 62] } },
      { label: 'Achterwaarts terug naar de start', ms: 1100, moves: { p1: [160, 152] } },
    ],
  },
  // Sterloop met kleurkegels
  cstar: {
    actors: [
      { id: 'p', team: 'P', x: 160, y: 100 },
      { id: 'n', team: 'N', x: 250, y: 110 },
    ],
    beats: [
      { label: 'De partner roept een kleur: tik die kegel aan', ms: 500, moves: { p: [160, 56] } },
      { label: 'Meteen terug naar het midden', ms: 500, moves: { p: [160, 100] } },
      { label: 'Volgende kleur', ms: 500, moves: { p: [188, 128] } },
      { label: 'Terug naar het midden', ms: 500, moves: { p: [160, 100] } },
      { label: 'Volgende kleur', ms: 500, moves: { p: [116, 82] } },
      { label: 'Terug naar het midden', ms: 500, moves: { p: [160, 100] } },
    ],
  },
  // Maximale sprintsnelheid: vliegende sprints
  ksprint: {
    actors: [
      { id: 'p1', team: 'P', x: 32, y: 100 },
      { id: 'p2', team: 'P', x: 32, y: 128 },
      { id: 'p3', team: 'P', x: 32, y: 72 },
    ],
    beats: [
      { label: 'Rustig oplopen in de aanloopzone', ms: 1500, moves: { p1: [146, 100] } },
      { label: 'Topsnelheid vasthouden door de sprintzone', ms: 700, moves: { p1: [262, 100] } },
      { label: 'Rustig uitlopen', ms: 900, moves: { p1: [292, 100] } },
    ],
  },
  // Hindernisestafette met bal (één ploeg)
  crelay: {
    actors: [
      { id: 'p1', team: 'P', x: 40, y: 70 },
      { id: 'p2', team: 'P', x: 22, y: 70 },
    ],
    ballStart: 'p1',
    beats: [
      { label: 'Dribbel door de slalom', ms: 450, ball: 'p1', moves: { p1: [90, 46] } },
      { label: 'Dribbel door de slalom', ms: 350, ball: 'p1', moves: { p1: [115, 72] } },
      { label: 'Dribbel door de slalom', ms: 350, ball: 'p1', moves: { p1: [140, 46] } },
      { label: 'Tik de bal langs de liggende kegels en spring er zelf over', ms: 900, ball: 'p1', moves: { p1: [236, 56] } },
      { label: 'Rond de keerkegel', ms: 350, ball: 'p1', moves: { p1: [256, 44] } },
      { label: 'Rond de keerkegel', ms: 350, ball: 'p1', moves: { p1: [266, 66] } },
      { label: 'Rechtdoor terug dribbelen', ms: 1100, ball: 'p1', moves: { p1: [70, 86], p2: [40, 70] } },
      { label: 'Pass naar de volgende speler van je rij', ms: 500, ball: 'p2' },
      { label: 'Achteraan aansluiten; de volgende vertrekt', ms: 700, ball: 'p2', moves: { p1: [22, 70], p2: [70, 56] } },
    ],
  },
  // 1 tegen 1 verdedigen: aansluiten en afremmen
  pr1v1: {
    actors: [
      { id: 'd', team: 'P', x: 95, y: 100 },
      { id: 'a', team: 'O', x: 225, y: 100 },
    ],
    ballStart: 'd',
    beats: [
      { label: 'De verdediger speelt de bal naar de aanvaller', ms: 800, ball: 'a' },
      { label: 'Meteen sprinten en op 2 meter afremmen', ms: 800, ball: 'a', moves: { d: [194, 104], a: [218, 100] } },
      { label: 'Zijdelings staan en de aanvaller naar buiten sturen', ms: 700, ball: 'a', moves: { a: [206, 124], d: [190, 116] } },
      { label: 'De verdediger wint de bal', ms: 500, ball: 'd', moves: { d: [198, 124], a: [214, 132] } },
      { label: 'Balwinst: scoren door over de andere lijn te dribbelen', ms: 800, ball: 'd', moves: { d: [248, 112], a: [230, 124] } },
    ],
  },
  // Druk zetten in een boog: 1 tegen 2
  prcurve: {
    actors: [
      { id: 'a1', team: 'O', x: 130, y: 60 },
      { id: 'a2', team: 'O', x: 200, y: 60 },
      { id: 'd', team: 'P', x: 165, y: 130 },
    ],
    ballStart: 'a1',
    beats: [
      { label: 'De bal gaat naar de andere aanvaller', ms: 800, ball: 'a2', moves: { d: [154, 100] } },
      { label: 'Druk zetten in een boog: de pass terug is dicht', ms: 700, ball: 'a2', moves: { d: [184, 74] } },
      { label: 'De aanvaller moet naar buiten', ms: 700, ball: 'a2', moves: { a2: [218, 82], d: [202, 84] } },
      { label: 'Balwinst: punt voor de verdediger', ms: 500, ball: 'd', moves: { d: [210, 88], a2: [222, 76] } },
    ],
  },
  // 2 tegen 2: druk en dekking
  pr2v2: {
    actors: [
      { id: 'o1', team: 'O', x: 120, y: 70 },
      { id: 'o2', team: 'O', x: 120, y: 130 },
      { id: 'p1', team: 'P', x: 180, y: 85 },
      { id: 'p2', team: 'P', x: 200, y: 120 },
    ],
    ballStart: 'o1',
    beats: [
      { label: 'De eerste verdediger stapt in', ms: 800, ball: 'o1', moves: { p1: [142, 74], o1: [124, 72] } },
      { label: 'De tweede dekt schuin achter hem', ms: 600, ball: 'o1', moves: { p2: [166, 98] } },
      { label: 'Bal naar de andere aanvaller: de rollen draaien om', ms: 900, ball: 'o2', moves: { p2: [144, 126], p1: [166, 102] } },
      { label: 'De tweede zet nu druk, de eerste dekt', ms: 700, ball: 'o2', moves: { o2: [126, 126], p2: [140, 124] } },
    ],
  },
  // Tegendruk: 5 seconden om terug te winnen
  prcp: {
    actors: [
      { id: 'o1', team: 'O', x: 160, y: 90 },
      { id: 'o2', team: 'O', x: 215, y: 95 },
      { id: 'o3', team: 'O', x: 110, y: 132 },
      { id: 'o4', team: 'O', x: 230, y: 140 },
      { id: 'p1', team: 'P', x: 130, y: 100 },
      { id: 'p2', team: 'P', x: 185, y: 66 },
      { id: 'p3', team: 'P', x: 195, y: 128 },
      { id: 'p4', team: 'P', x: 90, y: 70 },
    ],
    ballStart: 'o1',
    beats: [
      { label: 'Balverlies: de trainer telt tot vijf, twee spelers sluiten de balbezitter in', ms: 700, ball: 'o1', moves: { p1: [150, 96], p2: [170, 80], o1: [164, 92] } },
      { label: 'De anderen sluiten de passlijnen af', ms: 700, ball: 'o1', moves: { p3: [206, 110], p4: [106, 120] } },
      { label: 'Binnen 5 seconden teruggewonnen: 1 punt', ms: 500, ball: 'p1', moves: { p1: [150, 100] } },
    ],
  },
  // Pressing op de trigger: terugspeelbal
  prtrig: {
    actors: [
      { id: 'o1', team: 'O', x: 250, y: 60 },
      { id: 'o2', team: 'O', x: 250, y: 140 },
      { id: 'o3', team: 'O', x: 210, y: 80 },
      { id: 'o4', team: 'O', x: 210, y: 120 },
      { id: 'k', team: 'O', x: 292, y: 100 },
      { id: 'p1', team: 'P', x: 150, y: 70 },
      { id: 'p2', team: 'P', x: 150, y: 130 },
      { id: 'p3', team: 'P', x: 170, y: 100 },
      { id: 'p4', team: 'P', x: 130, y: 100 },
    ],
    ballStart: 'o1',
    beats: [
      { label: 'Compact wachten rond de middenlijn: nog niet instappen', ms: 900, ball: 'o3', moves: { p1: [158, 76], p3: [174, 96] } },
      { label: 'De opbouwers spelen rond', ms: 900, ball: 'o4', moves: { p1: [154, 84], p2: [158, 124], p3: [172, 106] } },
      { label: 'Trigger: terugspeelbal naar de keeper', ms: 800, ball: 'k' },
      { label: 'De hele ploeg stapt samen in', ms: 900, ball: 'k', moves: { p1: [236, 64], p3: [262, 98], p2: [236, 136], p4: [196, 92] } },
      { label: 'De keeper moet snel inspelen: onderschept', ms: 700, ball: 'p4', moves: { p4: [228, 86] } },
      { label: 'Binnen 8 seconden gescoord: telt dubbel', ms: 600, ball: [306, 104], moves: { k: [296, 102] } },
    ],
  },
  // Onderaantal verdedigen: 2 tegen 3
  prunder: {
    actors: [
      { id: 'a1', team: 'O', x: 100, y: 60 },
      { id: 'a2', team: 'O', x: 100, y: 100 },
      { id: 'a3', team: 'O', x: 100, y: 140 },
      { id: 'd1', team: 'P', x: 200, y: 85 },
      { id: 'd2', team: 'P', x: 200, y: 118 },
      { id: 'd3', team: 'P', x: 50, y: 150 },
      { id: 'k', team: 'P', x: 292, y: 100 },
    ],
    ballStart: 'a2',
    beats: [
      { label: 'Vertragen: niet te diep zakken en dicht bij elkaar blijven', ms: 900, ball: 'a2', moves: { a2: [132, 100], a1: [124, 62], a3: [124, 140], d1: [190, 92], d2: [190, 112] } },
      { label: 'De bal gaat naar de flank', ms: 800, ball: 'a1', moves: { a1: [138, 64] } },
      { label: 'Nu zet één verdediger druk, de ander dekt het midden', ms: 800, ball: 'a1', moves: { a1: [148, 68], d1: [168, 72], d2: [188, 96], a2: [150, 100], a3: [148, 138] } },
      { label: 'Na 6 seconden sprint een derde verdediger terug: 3 tegen 3', ms: 1200, ball: 'a1', moves: { d3: [186, 128], a3: [160, 136] } },
    ],
  },
  // Druk zetten op de opbouw: 3 tegen 2 + K
  prbuild: {
    actors: [
      { id: 'k', team: 'O', x: 292, y: 100 },
      { id: 'o1', team: 'O', x: 250, y: 60 },
      { id: 'o2', team: 'O', x: 250, y: 140 },
      { id: 'p1', team: 'P', x: 190, y: 100 },
      { id: 'p2', team: 'P', x: 180, y: 60 },
      { id: 'p3', team: 'P', x: 180, y: 140 },
    ],
    ballStart: 'k',
    beats: [
      { label: 'De keeper speelt in', ms: 900, ball: 'o1', moves: { p1: [228, 106] } },
      { label: 'Boog van de spits: de pass terug is dicht; de buitenste stapt in', ms: 800, ball: 'o1', moves: { p1: [264, 86], p2: [236, 58], o1: [248, 62] } },
      { label: 'De derde drukzetter dekt het midden', ms: 700, ball: 'o1', moves: { p3: [210, 106] } },
      { label: 'Balwinst', ms: 500, ball: 'p2', moves: { p2: [242, 62], o1: [256, 56] } },
      { label: 'Afwerken op het grote doel', ms: 600, ball: [306, 90], moves: { k: [296, 92] } },
    ],
  },
  // Verschuiven als blok: over de rivier
  prshift: {
    actors: [
      { id: 't1', team: 'O', x: 160, y: 26 },
      { id: 't2', team: 'O', x: 104, y: 52 },
      { id: 't3', team: 'O', x: 216, y: 52 },
      { id: 't4', team: 'O', x: 160, y: 72 },
      { id: 'b1', team: 'O', x: 160, y: 174 },
      { id: 'b2', team: 'O', x: 104, y: 148 },
      { id: 'b3', team: 'O', x: 216, y: 148 },
      { id: 'b4', team: 'O', x: 166, y: 128 },
      { id: 'd1', team: 'P', x: 92, y: 100 },
      { id: 'd2', team: 'P', x: 130, y: 100 },
      { id: 'd3', team: 'P', x: 190, y: 100 },
      { id: 'd4', team: 'P', x: 228, y: 100 },
    ],
    ballStart: 't3',
    beats: [
      { label: 'De aanvallers spelen de bal breed; één verdediger zet druk', ms: 1000, ball: 't1', moves: { d3: [176, 44], d1: [100, 100], d2: [138, 100], d4: [206, 100] } },
      { label: 'De rest schuift mee in de rivier', ms: 1000, ball: 't2', moves: { d3: [128, 40], d1: [94, 100], d2: [118, 100], d4: [170, 100] } },
      { label: 'Pass door het gat naar de overkant: een punt', ms: 1000, ball: 'b4', moves: { d2: [128, 100], d4: [162, 100] } },
      { label: 'Nu probeert die groep terug te spelen; een andere verdediger stapt in hun vak', ms: 1100, ball: 'b3', moves: { d4: [196, 136], d3: [180, 100], d2: [140, 100], d1: [104, 100] } },
    ],
  },
  // Druk zetten in blok 6 tegen 4
  pressing: {
    actors: [
      { id: 'o1', team: 'O', x: 262, y: 54 },
      { id: 'o2', team: 'O', x: 262, y: 146 },
      { id: 'o3', team: 'O', x: 252, y: 98 },
      { id: 'o4', team: 'O', x: 284, y: 120 },
      { id: 'k', team: 'O', x: 298, y: 100 },
      { id: 'p1', team: 'P', x: 200, y: 50 },
      { id: 'p2', team: 'P', x: 200, y: 150 },
      { id: 'p3', team: 'P', x: 216, y: 100 },
      { id: 'p4', team: 'P', x: 170, y: 75 },
      { id: 'p5', team: 'P', x: 170, y: 125 },
      { id: 'p6', team: 'P', x: 140, y: 100 },
    ],
    ballStart: 'k',
    beats: [
      { label: 'De keeper start de opbouw', ms: 800, ball: 'o3' },
      { label: 'Pass naar de zijkant: de trigger', ms: 800, ball: 'o1' },
      { label: 'Het blok stapt in en sluit de balkant af', ms: 800, ball: 'o1', moves: { p1: [246, 56], p3: [244, 80], p4: [218, 70], p6: [190, 94], p5: [208, 112], p2: [226, 138] } },
      { label: 'Balwinst', ms: 500, ball: 'p1', moves: { p1: [252, 64], o1: [266, 52] } },
      { label: 'Binnen 10 seconden afwerken op het grote doel', ms: 700, ball: [308, 96], moves: { k: [300, 96] } },
    ],
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
    beats: [
      { label: 'Oranje speelt in; paars onderschept', ms: 800, ball: 'p1', moves: { p1: [124, 128] } },
      { label: 'Balwinst: eerst vooruit kijken', ms: 700, ball: 'p2', moves: { p2: [172, 92] } },
      { label: 'Snelle actie naar het vrije doeltje', ms: 1000, ball: 'p2', moves: { p2: [250, 62], o3: [258, 116], o2: [222, 92], o1: [178, 72] } },
      { label: 'Binnen 6 seconden gescoord: telt dubbel', ms: 400, ball: [290, 61] },
    ],
  },
  // Omschakelduel 1 tegen 1
  omduel: {
    actors: [
      { id: 'p', team: 'P', x: 140, y: 100 },
      { id: 'o', team: 'O', x: 185, y: 100 },
    ],
    ballStart: 'p',
    beats: [
      { label: 'Paars dribbelt naar het doeltje', ms: 800, ball: 'p', moves: { p: [186, 118], o: [196, 108] } },
      { label: 'Oranje wint de bal', ms: 500, ball: 'o', moves: { o: [198, 112] } },
      { label: 'Oranje valt meteen aan; wie de bal verliest, verdedigt meteen', ms: 1100, ball: 'o', moves: { o: [108, 104], p: [124, 114] } },
      { label: 'Doelpunt', ms: 500, ball: [76, 100], moves: { o: [98, 102] } },
    ],
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
    beats: [
      { label: 'Twee tegen één: pass naar de vrije ploegmaat', ms: 900, ball: 'p2', moves: { p2: [176, 126], p1: [150, 80], o: [178, 96] } },
      { label: 'Schot op een doeltje', ms: 500, ball: [284, 116] },
      {
        label: 'Golf terug: de verdediger valt meteen aan met een ploegmaat van de achterlijn; de laatste paarse aanvaller verdedigt',
        ms: 1300,
        ball: 'o2',
        newBall: 'o2',
        moves: { o2: [176, 60], o: [128, 92], p1: [108, 76] },
      },
      { label: 'Pass naar de vrije man', ms: 800, ball: 'o', moves: { o: [86, 96], o2: [120, 62], p1: [100, 70] } },
      { label: 'Afwerken op een doeltje', ms: 500, ball: [36, 116] },
    ],
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
    beats: [
      { label: '3 tegen 2: de middelste aanvaller dribbelt op', ms: 1000, ball: 'a2', moves: { a2: [184, 100], a1: [180, 58], a3: [180, 142], d1: [212, 90], d2: [212, 112] } },
      { label: 'Een verdediger stapt in: pass naar de vrije man', ms: 800, ball: 'a3', moves: { a3: [230, 136], d1: [198, 96], d2: [214, 116] } },
      { label: 'Schot op doel', ms: 500, ball: [306, 108], moves: { ko: [298, 106] } },
      {
        label: 'Terug: oranje valt meteen aan op het andere doel; de afwerker verdedigt alleen',
        ms: 1400,
        ball: 'd2',
        newBall: 'd2',
        moves: { d2: [110, 116], d1: [104, 78], a3: [120, 102], ko: [296, 100] },
      },
      { label: '2 tegen 1: pass naar de vrije man', ms: 800, ball: 'd1', moves: { d1: [76, 84], a3: [104, 106] } },
      { label: 'Afwerken', ms: 500, ball: [6, 94], moves: { kp: [20, 96] } },
    ],
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
    beats: [
      { label: 'Paars scoort', ms: 800, ball: [252, 72] },
      {
        label: 'Het andere duo gaat eruit; een nieuw duo komt meteen in met een bal',
        ms: 1200,
        ball: 'n1',
        newBall: 'n1',
        moves: { o1: [272, 40], o2: [292, 40], n1: [196, 74], n2: [210, 110], p1: [150, 84], p2: [150, 120] },
      },
      { label: 'Het nieuwe duo valt aan op de doeltjes van het duo dat bleef', ms: 900, ball: 'n1', moves: { n1: [160, 70], n2: [170, 118], p1: [134, 76], p2: [128, 116] } },
      { label: 'Pass naar de vrije ploegmaat', ms: 700, ball: 'n2', moves: { n2: [150, 128], p2: [124, 122] } },
      { label: 'Schot op een doeltje', ms: 500, ball: [64, 128] },
    ],
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
    beats: [
      { label: 'Op het signaal: de aanvallers vallen aan, de derde verdediger sprint terug', ms: 1000, ball: 'p2', moves: { p2: [160, 100], p1: [166, 62], p3: [166, 138], d3: [130, 152] } },
      { label: 'De kortste weg naar het eigen doel, tussen bal en doel', ms: 1000, ball: 'p2', moves: { p2: [186, 100], p1: [196, 64], p3: [196, 140], d3: [216, 126], d1: [204, 90], d2: [206, 112] } },
      { label: 'Samen de balbezitter afstoppen', ms: 700, ball: 'p2', moves: { p2: [194, 102], d2: [202, 110], d1: [204, 94] } },
      { label: 'Balwinst', ms: 400, ball: 'd1', moves: { d1: [204, 90] } },
      { label: 'Over de middenlijn dribbelen', ms: 1200, ball: 'd1', moves: { d1: [70, 92], p2: [100, 98] } },
    ],
  },
  // Snelle counter via de keeper
  omkeeper: {
    actors: [
      { id: 'g', team: 'P', x: 292, y: 100 },
      { id: 'w1', team: 'P', x: 230, y: 48 },
      { id: 'w2', team: 'P', x: 230, y: 152 },
      { id: 's', team: 'N', x: 190, y: 100 },
      { id: 'd', team: 'O', x: 170, y: 72 },
    ],
    ballStart: 's',
    beats: [
      { label: 'De schutter schiet; de keeper vangt', ms: 600, ball: 'g' },
      { label: 'De flankspelers lopen breed vrij', ms: 900, ball: 'g', moves: { w1: [152, 48], w2: [152, 152], d: [150, 88] } },
      { label: 'Snelle uitworp naar de vrije flankspeler', ms: 900, ball: 'w1', moves: { w1: [146, 52] } },
      { label: 'Twee tegen één naar de doeltjes', ms: 1000, ball: 'w1', moves: { w1: [100, 62], w2: [100, 138], d: [96, 92] } },
      { label: 'De verdediger stapt in: pass naar de vrije man', ms: 800, ball: 'w2', moves: { d: [92, 76], w2: [78, 132] } },
      { label: 'Scoren op een doeltje', ms: 500, ball: [42, 129] },
    ],
  },
  // Van rondo naar counter
  omrondo: {
    actors: [
      { id: 'p1', team: 'P', x: 105, y: 55 },
      { id: 'p2', team: 'P', x: 150, y: 85 },
      { id: 'p3', team: 'P', x: 150, y: 125 },
      { id: 'p4', team: 'P', x: 105, y: 145 },
      { id: 'p5', team: 'P', x: 60, y: 100 },
      { id: 'g', team: 'P', x: 292, y: 100 },
      { id: 'o1', team: 'O', x: 95, y: 95 },
      { id: 'o2', team: 'O', x: 122, y: 110 },
    ],
    ballStart: 'p1',
    beats: [
      { label: 'Rondo: de vijf houden de bal', ms: 800, ball: 'p2', moves: { o1: [114, 88], o2: [132, 106] } },
      { label: 'Oranje onderschept', ms: 600, ball: 'o2', moves: { o2: [146, 104] } },
      { label: 'Meteen counteren: uit het vak en naar doel; twee paarse spelers sprinten mee', ms: 1200, ball: 'o2', moves: { o2: [236, 102], o1: [214, 134], p3: [222, 118], p2: [206, 92] } },
      { label: 'Schot op doel', ms: 500, ball: [306, 96], moves: { g: [296, 96] } },
    ],
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
    beats: [
      { label: 'De trainer roept een nummer en speelt de bal in', ms: 1000, ball: [128, 100], moves: { p3: [150, 76], o3: [158, 128] } },
      { label: 'Wie is eerst aan de bal?', ms: 600, moves: { p3: [122, 96], o3: [150, 112] } },
      { label: 'Dribbel naar het doeltje', ms: 1000, ball: 'p3', moves: { p3: [224, 104], o3: [206, 114] } },
      { label: 'Doelpunt', ms: 400, ball: [252, 100] },
      { label: 'Terug naar de zijlijn', ms: 1100, moves: { p3: [165, 46], o3: [155, 154] } },
    ],
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
    beats: [
      { label: 'Doeltrap: de verdedigers splitsen breed', ms: 900, ball: 'g', moves: { c1: [74, 56], c2: [74, 144] } },
      { label: 'De aanvaller kiest een kant', ms: 600, ball: 'g', moves: { a: [88, 76] } },
      { label: 'De keeper speelt de vrije verdediger aan', ms: 800, ball: 'c2' },
      { label: 'Dribbel door het poortje', ms: 1000, ball: 'c2', moves: { c2: [152, 139], a: [120, 112] } },
    ],
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
    beats: [
      { label: 'Elke actie start bij de keeper', ms: 800, ball: 'c1', moves: { a1: [92, 76] } },
      { label: 'De zes zoekt de open ruimte tussen de aanvallers', ms: 700, ball: 'c1', moves: { s: [146, 100], a2: [110, 124] } },
      { label: 'Pass tussen de aanvallers door in de zes', ms: 900, ball: 's' },
      { label: 'Opendraaien', ms: 500, ball: 's', moves: { s: [160, 100] } },
      { label: 'De kaatser aanspelen: punt', ms: 900, ball: 'k' },
    ],
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
    beats: [
      { label: 'Beide spitsen zetten druk op de centrale verdedigers', ms: 700, ball: 'g', moves: { f1: [84, 76], f2: [84, 124] } },
      {
        label: 'De zes zakt uit tussen hen; de centrale verdedigers schuiven breed, de backs hoog op',
        ms: 1100,
        ball: 'g',
        moves: { s: [66, 100], c1: [80, 56], c2: [80, 144], b1: [176, 44], b2: [176, 156], f1: [92, 80], f2: [92, 120], m: [132, 100] },
      },
      { label: 'Overtal: de keeper speelt de vrije centrale verdediger aan', ms: 800, ball: 'c2', moves: { f2: [94, 130] } },
      { label: 'Pass naar de hoge back', ms: 900, ball: 'b2', moves: { m: [150, 122] } },
      { label: 'Door het poortje: punt', ms: 900, ball: 'b2', moves: { b2: [256, 143] } },
    ],
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
    beats: [
      { label: 'De verdedigers spelen de bal rond', ms: 800, ball: 'c2', moves: { s: [84, 114] } },
      { label: 'Terug naar de vrije verdediger', ms: 800, ball: 'c1', moves: { s: [86, 92] } },
      { label: 'Hij dribbelt het middenvak in: twee tegen één', ms: 1100, ball: 'c1', moves: { c1: [166, 72], o: [194, 80], m: [212, 118] } },
      { label: 'Pass naar de vrije middenvelder', ms: 700, ball: 'm' },
      { label: 'Pass naar de kaatser: punt', ms: 700, ball: 'k' },
    ],
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
    beats: [
      { label: 'Uittrap op de spits', ms: 1300, ball: 's', moves: { o1: [196, 104] } },
      { label: 'De spits legt af', ms: 600, ball: 'm2', moves: { m2: [168, 132], o2: [176, 120] } },
      { label: 'Met de tweede bal naar de eindlijn', ms: 1100, ball: 'm2', moves: { m2: [254, 132], o2: [230, 128], o3: [240, 108] } },
    ],
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
    beats: [
      { label: 'Druk op de flank: bal terug naar de keeper', ms: 1000, ball: 'g', moves: { o1: [104, 62], o2: [60, 88] } },
      { label: 'De keeper speelt de andere centrale verdediger aan', ms: 800, ball: 'c2', moves: { o2: [58, 108] } },
      { label: 'Door naar de vrije back', ms: 800, ball: 'b2', moves: { o3: [136, 128] } },
      { label: 'Pass door het poortje: na een wissel via de keeper telt het dubbel', ms: 800, ball: [206, 152], moves: { b2: [124, 150] } },
    ],
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
    beats: [
      { label: 'Verticale pass op de spits; de zes sluit aan', ms: 900, ball: 'f', moves: { s: [140, 122] } },
      { label: 'De spits kaatst in één keer naar de zes', ms: 600, ball: 's', moves: { d: [202, 106], m: [126, 92] } },
      { label: 'Pass door het poortje naar de flankspeler', ms: 1000, ball: 'w' },
    ],
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
    beats: [
      { label: 'De drukzetters zakken terug naar het midden', ms: 900, ball: 'g', moves: { d1: [130, 70], d2: [130, 130], d3: [150, 100] } },
      { label: 'Dan kort op de verdediger', ms: 700, ball: 'c1' },
      { label: 'Over de middenlijn dribbelen: punt', ms: 1000, ball: 'c1', moves: { c1: [160, 50], d1: [142, 60] } },
      {
        label: 'Nu zetten ze hoog druk',
        ms: 1200,
        ball: 'g',
        newBall: 'g',
        moves: { c1: [62, 68], d1: [68, 80], d2: [68, 122], d3: [46, 100] },
      },
      { label: 'Over de druk: lang op de spits', ms: 1300, ball: 'f' },
      { label: 'De spits controleert in zijn vak: punt', ms: 400, ball: 'f', moves: { f: [240, 74] } },
    ],
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
    beats: [
      { label: 'Loskomen: de 3 en de 10 bewegen diagonaal van elkaar weg, richting keeper', ms: 900, ball: 'g', moves: { t: [70, 138], ten: [152, 70], d3: [94, 128], d10: [172, 86] } },
      { label: 'De keeper speelt diep op de 10', ms: 1000, ball: 'ten' },
      { label: 'De 10 draait open', ms: 400, ball: 'ten', moves: { ten: [168, 70] } },
      { label: 'Door het midden de 9 aanspelen', ms: 900, ball: 'n', moves: { ten: [234, 62], d10: [212, 78] } },
      { label: 'De 9 kaatst in de loop van de 10', ms: 600, ball: 'ten', moves: { ten: [248, 64] } },
      { label: 'Scoren op een doeltje', ms: 400, ball: [282, 66] },
    ],
  },
  // Rustig uitspelen: 3 + K tegen 2 met terugtreklijn
  obline: {
    actors: [
      { id: 'g', team: 'P', x: 32, y: 100 },
      { id: 'd1', team: 'P', x: 60, y: 60 },
      { id: 'd2', team: 'P', x: 60, y: 140 },
      { id: 'd3', team: 'P', x: 70, y: 100 },
      { id: 'a1', team: 'O', x: 76, y: 78 },
      { id: 'a2', team: 'O', x: 78, y: 124 },
    ],
    ballStart: 'g',
    beats: [
      { label: 'De keeper heeft de bal: de aanvallers lopen terug achter de terugtreklijn', ms: 900, ball: 'g', moves: { a1: [104, 80], a2: [104, 122] } },
      { label: 'De keeper speelt een vrije verdediger aan: nu mogen ze druk zetten', ms: 800, ball: 'd2', moves: { a2: [86, 132] } },
      { label: 'Dribbel naar voren', ms: 1100, ball: 'd2', moves: { d2: [170, 138], a2: [140, 134] } },
      { label: 'Scoren in een doeltje', ms: 700, ball: [272, 128] },
    ],
  },
  // Opbouwen tegen druk: 4 + K tegen 2
  psbuild: {
    actors: [
      { id: 'g', team: 'P', x: 292, y: 100 },
      { id: 'c1', team: 'P', x: 250, y: 70 },
      { id: 'c2', team: 'P', x: 250, y: 130 },
      { id: 'b1', team: 'P', x: 200, y: 50 },
      { id: 'b2', team: 'P', x: 200, y: 150 },
      { id: 'a1', team: 'O', x: 228, y: 100 },
      { id: 'a2', team: 'O', x: 190, y: 100 },
    ],
    ballStart: 'g',
    beats: [
      { label: 'De keeper speelt in', ms: 800, ball: 'c2', moves: { a1: [236, 118] } },
      { label: 'Druk: naar de andere centrale verdediger', ms: 900, ball: 'c1', moves: { a1: [238, 86], a2: [200, 82] } },
      { label: 'De centrale verdediger speelt de back aan', ms: 800, ball: 'b1' },
      { label: 'De back dribbelt over de lijn', ms: 1300, ball: 'b1', moves: { b1: [84, 52], a2: [130, 72] } },
    ],
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
    beats: [
      { label: 'De keeper speelt in', ms: 700, ball: 'c1' },
      { label: 'Via de centrale verdediger naar de back', ms: 800, ball: 'b1', moves: { b1: [96, 46], m1: [128, 96], m2: [158, 66] } },
      { label: 'De back speelt de middenvelder aan; iedereen schuift mee', ms: 800, ball: 'm2', moves: { c1: [80, 78], c2: [76, 114], b2: [100, 148], m3: [166, 124] } },
      { label: 'De middenvelder vindt de spits', ms: 900, ball: 'st', moves: { st: [244, 96], m1: [150, 100], w1: [236, 54], w2: [232, 142] } },
    ],
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
    beats: [
      { label: 'De back speelt de flankspeler aan', ms: 800, ball: 'w', moves: { d2: [204, 58] } },
      { label: 'Kaatsen via de middenvelder', ms: 700, ball: 'm', moves: { m: [166, 90], d1: [178, 78] } },
      { label: 'De back overlapt en krijgt de bal achter de verdedigers', ms: 1100, ball: 'b', moves: { b: [234, 52], w: [196, 94], d1: [182, 106], d2: [214, 72] } },
      { label: 'Voorzet voor de spits', ms: 800, ball: 's', moves: { s: [266, 104] } },
      { label: 'Afwerken', ms: 500, ball: [306, 98], moves: { k: [296, 98] } },
    ],
  },
  // Positiespel 5 tegen 5 + 3
  positional: {
    actors: [
      { id: 'n1', team: 'N', x: 30, y: 100 },
      { id: 'n2', team: 'N', x: 290, y: 100 },
      { id: 'n3', team: 'N', x: 160, y: 180 },
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
    ],
    ballStart: 'n1',
    beats: [
      { label: 'De kaatser speelt in', ms: 800, ball: 'p1', moves: { o1: [80, 66] } },
      { label: 'Via de middenzone', ms: 900, ball: 'p3', moves: { o5: [148, 76], o3: [180, 64] } },
      { label: 'Doorspelen naar de andere kant', ms: 900, ball: 'p5', moves: { o3: [200, 82], o4: [222, 122] } },
      { label: 'De bal bereikt de verre kaatser: punt', ms: 600, ball: 'n2' },
    ],
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
    beats: [
      { label: 'De zijjoker speelt in', ms: 800, ball: 'p1', moves: { o1: [114, 92] } },
      { label: 'Pass naar de middenjoker', ms: 800, ball: 'j2', moves: { o2: [176, 84] } },
      { label: 'De middenjoker speelt door', ms: 800, ball: 'p4', moves: { o3: [196, 140], o4: [230, 108] } },
      { label: 'De bal bereikt de andere zijjoker: punt', ms: 600, ball: 'j3' },
    ],
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
    beats: [
      { label: 'De bal gaat rond in het buitenvak', ms: 700, ball: 'l2', moves: { ol: [74, 84] } },
      { label: 'Nog eens rond: de verdediger schuift mee', ms: 800, ball: 'l3', moves: { ol: [76, 124] } },
      { label: 'Pass door de linie naar de middenspeler', ms: 900, ball: 'm', moves: { m: [160, 114], om: [154, 94] } },
      { label: 'De middenspeler speelt door naar de overkant: 2 punten', ms: 900, ball: 'r3', moves: { or: [254, 112] } },
    ],
  },
  // Positiespel 6 tegen 4 met vaste posities
  psshape: {
    actors: [
      { id: 'g', team: 'P', x: 292, y: 100 },
      { id: 'c1', team: 'P', x: 250, y: 70 },
      { id: 'c2', team: 'P', x: 250, y: 130 },
      { id: 'b1', team: 'P', x: 210, y: 48 },
      { id: 'b2', team: 'P', x: 210, y: 152 },
      { id: 'm1', team: 'P', x: 185, y: 85 },
      { id: 'm2', team: 'P', x: 185, y: 120 },
      { id: 'o1', team: 'O', x: 165, y: 60 },
      { id: 'o2', team: 'O', x: 160, y: 140 },
      { id: 'o3', team: 'O', x: 215, y: 100 },
      { id: 'o4', team: 'O', x: 140, y: 100 },
    ],
    ballStart: 'g',
    beats: [
      { label: 'De keeper speelt in op een centrale verdediger', ms: 800, ball: 'c1', moves: { o3: [234, 88] } },
      { label: 'Bal naar de brede back', ms: 800, ball: 'b1', moves: { o1: [182, 52] } },
      { label: 'De back speelt de middenvelder aan', ms: 700, ball: 'm1', moves: { m1: [190, 80], o4: [150, 96] } },
      { label: 'De middenvelder dribbelt over de middenlijn', ms: 1200, ball: 'm1', moves: { m1: [104, 70], o4: [132, 88] } },
    ],
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
    beats: [
      { label: 'Lokken: korte pass aan de kant van de bal', ms: 700, ball: 'p2', moves: { o1: [196, 80], o2: [232, 72], o3: [176, 70], o4: [158, 106] } },
      { label: 'Kantwissel: pass naar de vrije verre kant', ms: 900, ball: 'p4' },
      { label: 'Opdribbelen naar het vrije doeltje', ms: 600, ball: 'p4', moves: { p4: [254, 140] } },
      { label: 'Scoren na een kantwissel: telt dubbel', ms: 400, ball: [274, 140] },
    ],
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
    beats: [
      { label: 'Pass naar een ander kwadrant', ms: 900, ball: 'p4', moves: { o3: [212, 78] } },
      { label: 'Een speler loopt naar een vrij kwadrant: nooit drie van één ploeg in hetzelfde vak', ms: 900, ball: 'p4', moves: { p3: [196, 128], o2: [182, 118] } },
      { label: 'Pass in de vrije ruimte', ms: 800, ball: 'p3' },
    ],
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
    beats: [
      { label: 'Pass naar de middenspeler', ms: 900, ball: 'pm', moves: { o1: [96, 86], om: [160, 114] } },
      { label: 'De middenspeler draait open', ms: 500, ball: 'pm', moves: { pm: [166, 92] } },
      { label: 'Pass naar de overkant: punt', ms: 900, ball: 'p3', moves: { o4: [240, 72] } },
    ],
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
    beats: [
      { label: 'Eén: de ploeg telt luidop de passes', ms: 700, ball: 'p2', moves: { o1: [140, 76] } },
      { label: 'Twee', ms: 700, ball: 'p3', moves: { o2: [202, 100] } },
      { label: 'Een speler loopt zich vrij', ms: 700, ball: 'p3', moves: { p4: [158, 108] } },
      { label: 'Drie', ms: 800, ball: 'p4', moves: { o5: [170, 126] } },
      { label: 'Vier: niet terug naar wie je de bal gaf', ms: 800, ball: 'p1', moves: { o3: [98, 92] } },
    ],
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
    beats: [
      { label: 'Elke aanval start bij de keeper, die kort inspeelt', ms: 700, ball: 'd', moves: { os: [112, 100] } },
      { label: 'Via de verdediger naar een flankspeler', ms: 800, ball: 'l', moves: { l: [130, 50], os: [100, 86] } },
      { label: 'De flankspeler gaat diep, de spits loopt in voor doel', ms: 1100, ball: 'l', moves: { l: [228, 56], s: [258, 96], ol: [214, 70], od: [246, 114] } },
      { label: 'Voorzet voor de spits', ms: 700, ball: 's' },
      { label: 'Afwerken', ms: 500, ball: [310, 96], moves: { ko: [300, 96] } },
    ],
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
    beats: [
      { label: 'Pass naar een vrije ploegmaat', ms: 700, ball: 'p3', moves: { o1: [206, 110] } },
      { label: 'Dribbel naar het vrije doeltje, tot in de scoringszone', ms: 900, ball: 'p3', moves: { p3: [242, 74], o2: [262, 100], o3: [200, 66] } },
      { label: 'Afwerken vanuit de scoringszone', ms: 500, ball: [282, 62] },
    ],
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
    beats: [
      { label: 'Pass door een poortje naar een ploegmaat: punt', ms: 800, ball: 'p2', moves: { o2: [172, 74] } },
      { label: 'De passer zoekt het volgende poortje', ms: 900, ball: 'p2', moves: { p1: [234, 126], o1: [204, 116], o3: [222, 146] } },
      { label: 'Aan de andere kant van dat poortje gaan staan', ms: 700, ball: 'p2', moves: { p2: [266, 126] } },
      { label: 'Weer door een ander poortje: punt', ms: 600, ball: 'p1' },
    ],
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
    beats: [
      { label: 'Niemand wacht in de eindzone', ms: 500, ball: 'p2', moves: { p2: [194, 118] } },
      { label: 'De aanvaller loopt de eindzone in zodra de pass vertrekt', ms: 900, ball: 'p4', moves: { p4: [262, 80], o1: [246, 92] } },
      { label: 'Punt; de ploeg houdt de bal en valt aan op de andere eindzone', ms: 900, ball: 'p1', moves: { p4: [238, 80], o2: [168, 84] } },
      { label: 'Nieuwe diepe loop, pass in de loop: weer een punt', ms: 1100, ball: 'p3', moves: { p3: [58, 122], o3: [96, 118], o4: [80, 96] } },
    ],
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
    beats: [
      { label: 'Pass naar de joker op de flank', ms: 800, ball: 'j1' },
      { label: 'Een verdediger stapt de flankzone in: de joker moet snel beslissen', ms: 800, ball: 'j1', moves: { j1: [222, 50], o2: [230, 62], p2: [226, 112] } },
      { label: 'Voorzet naar de inlopende spits', ms: 800, ball: 'p3', moves: { p3: [256, 92] } },
      { label: 'Doelpunt na een voorzet van een joker: telt dubbel', ms: 500, ball: [310, 98], moves: { ko: [300, 98] } },
    ],
  },
  // Werpen en terugspelen in duo's (één duo)
  wthrow: {
    actors: [
      { id: 'p1', team: 'P', x: 110, y: 100 },
      { id: 'p2', team: 'P', x: 200, y: 100 },
    ],
    ballStart: 'p1',
    beats: [
      { label: 'De werper gooit de bal onderhands', ms: 800, ball: 'p2' },
      { label: 'In één keer terug in de handen, met de binnenkant', ms: 700, ball: 'p1' },
      { label: 'Opnieuw gooien', ms: 800, ball: 'p2' },
      { label: 'Nu met de wreef als halve volley', ms: 700, ball: 'p1' },
    ],
  },
  // Vallende bal: reageren voor de tweede stuit (één duo)
  cdrop: {
    actors: [
      { id: 'p', team: 'P', x: 120, y: 100 },
      { id: 'n', team: 'N', x: 210, y: 100 },
    ],
    ballStart: 'n',
    beats: [
      { label: 'De bal wordt zonder aankondiging losgelaten', ms: 300, ball: [202, 104] },
      { label: 'Sprinten en aannemen voor de tweede stuit', ms: 600, moves: { p: [196, 100] } },
      { label: 'Terugspelen', ms: 500, ball: 'n' },
      { label: 'Terug naar de startpositie', ms: 900, moves: { p: [120, 100] } },
    ],
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
    beats: [
      { label: 'De bal naar de centrale middenvelder', ms: 900, ball: 'a5', moves: { d1: [204, 88] } },
      { label: 'De flankspeler loopt achter de verdediging', ms: 800, ball: 'a5', moves: { a3: [226, 56] } },
      { label: 'Pass in de loop', ms: 800, ball: 'a3', moves: { a3: [264, 78], d3: [256, 94] } },
      { label: 'Afwerken binnen 20 seconden', ms: 500, ball: [306, 94], moves: { k: [298, 94] } },
    ],
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
    beats: [
      { label: 'Paars wint de bal op eigen helft', ms: 500, ball: 'p1', moves: { p1: [104, 114] } },
      { label: 'Eerste pass vooruit: meteen diep naar de spits', ms: 900, ball: 'p5', moves: { p4: [180, 134] } },
      { label: 'Een tweede speler loopt mee in de diepte', ms: 800, ball: 'p5', moves: { p4: [246, 112], o3: [220, 126], o4: [212, 72] } },
      { label: 'De spits legt de bal op de loper', ms: 700, ball: 'p4' },
      { label: 'Schot binnen 8 seconden: 2 punten', ms: 500, ball: [310, 98], moves: { k: [300, 98] } },
    ],
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
    beats: [
      { label: 'Loskomen: de 3 en de 10 bewegen diagonaal van elkaar weg', ms: 900, ball: 'g', moves: { t: [76, 88], ten: [128, 126], o9: [98, 100], o10: [150, 118] } },
      { label: 'Ruimte maken: de 2 en de 5 schuiven hoger, de 9 biedt zich aan', ms: 900, ball: 'g', moves: { f5: [144, 22], f2: [144, 178], n: [170, 74] } },
      { label: 'De keeper speelt de 3 aan', ms: 700, ball: 't' },
      { label: 'De 3 speelt de hoge 5 aan', ms: 900, ball: 'f5' },
      { label: 'De 5 zoekt de 9', ms: 800, ball: 'n', moves: { o10: [172, 94] } },
      { label: 'De 9 draait open en werkt af', ms: 800, ball: 'n', moves: { n: [238, 86] } },
      { label: 'Doelpunt: de volgende golf start weer bij de keeper', ms: 500, ball: [310, 94], moves: { ko: [300, 94] } },
    ],
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
    beats: [
      { label: 'Loskomen: de 3 en de 10 bewegen diagonaal van elkaar weg, richting keeper', ms: 900, ball: 'g', moves: { t: [72, 138], ten: [160, 80], o9: [100, 116], o2: [172, 58] } },
      { label: 'De keeper speelt de 3 aan', ms: 700, ball: 't', moves: { o9: [88, 128] } },
      { label: 'De 3 mag de aanvalszone in', ms: 1200, ball: 't', moves: { t: [194, 138], o9: [150, 134], o5: [214, 156] } },
      { label: 'Pass naar de 10', ms: 700, ball: 'ten', moves: { o2: [180, 66] } },
      { label: 'Afwerken', ms: 500, ball: [310, 94], moves: { ko: [300, 94] } },
    ],
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
    beats: [
      { label: 'Paars scoort', ms: 600, ball: [284, 96], moves: { ko: [272, 96] } },
      { label: 'De keeper start meteen een nieuwe bal', ms: 800, ball: 'o3', newBall: 'ko', moves: { ko: [268, 100] } },
      { label: 'Oranje valt meteen aan', ms: 1100, ball: 'o3', moves: { o3: [120, 112], p3: [140, 104], p4: [176, 80], o1: [100, 62], o2: [96, 142] } },
      { label: 'Pass naar de vrije man', ms: 600, ball: 'o2', moves: { o2: [86, 134] } },
      { label: 'Afwerken', ms: 500, ball: [34, 106], moves: { kp: [46, 104] } },
    ],
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
    beats: [
      { label: 'De keeper speelt een brede verdediger aan', ms: 800, ball: 'c1' },
      { label: 'Nu mag de tegenstander de zone in; pass naar de afzakkende middenvelder', ms: 800, ball: 'm', moves: { m: [130, 98], o1: [92, 64] } },
      { label: 'De bal gaat naar de vrije man', ms: 900, ball: 'p5' },
      { label: 'Opdribbelen', ms: 900, ball: 'p5', moves: { p5: [244, 116], o5: [258, 130], o3: [238, 100] } },
      { label: 'Doelpunt na een opbouw zonder balverlies: telt dubbel', ms: 600, ball: [310, 100], moves: { ko: [300, 100] } },
    ],
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
    beats: [
      { label: 'Eerst weglopen van je man', ms: 800, ball: 'w', moves: { a: [90, 82], b: [200, 78], o1: [108, 98], o2: [198, 94] } },
      { label: 'Dan kort komen: de werper gooit naar de voet', ms: 900, ball: 'a', moves: { a: [96, 124], o1: [110, 110] } },
      { label: 'De werper stapt meteen in als extra man', ms: 600, ball: 'a', moves: { w: [130, 134], o1: [110, 118] } },
      { label: 'Terugkaatsen naar de vrije werper', ms: 500, ball: 'w' },
      { label: 'Doorspelen naar de diepe man', ms: 700, ball: 'b', moves: { b: [208, 82], o2: [196, 104] } },
      { label: 'Gescoord op het doeltje: punt', ms: 600, ball: [236, 98], moves: { b: [214, 88] } },
      {
        label: 'Nieuwe inworp',
        ms: 1300,
        ball: 'w',
        newBall: 'w',
        moves: { w: [100, 157], a: [110, 104], b: [176, 92], o1: [126, 118], o2: [190, 106] },
      },
      { label: 'Nu onderschept een verdediger de worp', ms: 800, ball: 'o1', moves: { o1: [106, 126] } },
      { label: 'Balwinst: meteen naar het doeltje aan de andere kant', ms: 900, ball: 'o1', moves: { o1: [62, 106], a: [80, 96] } },
      { label: 'Punt voor de verdedigers', ms: 400, ball: [34, 100] },
    ],
  },
};
