import type { Variant } from './exercises';
import { LINEUPS, type Lineup } from './lineups';

/**
 * Optional animations for exercise diagrams, played on the detail page with "Afspelen".
 *
 * An animation uses the same 320 × 200 field as the diagram (Pitch.tsx draws the field, zones and goals;
 * the animation draws the players and the ball on top). It starts from the diagram's lineup (lineups.ts:
 * the players with their ids, and who has the ball) and runs through a list of beats: in each beat the
 * listed players move to a new spot, and the ball either goes to a player (a pass, or a dribble when that
 * player already had it) or to a fixed spot (e.g. into the goal); `newBall` starts a beat with a fresh ball
 * at a player, like a trainer playing in a new one. After the last beat it pauses and loops.
 */
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

export interface PitchAnimationDef extends Lineup {
  beats: AnimBeat[];
}

const BEATS: Partial<Record<Variant, { beats: AnimBeat[] }>> = {
  // 3 tegen 3 + neutrale kaatser: recht van de aanval
  omright: {
    beats: [
      { label: 'Recht van de aanval: paars speelt eerst de kaatser aan', ms: 1100, ball: 'n', moves: { o1: [86, 112], p2: [104, 74] } },
      { label: 'De kaatser legt terug', ms: 1000, ball: 'p2', moves: { p2: [116, 66], o2: [144, 82] } },
      { label: 'Paars mag nu scoren en dribbelt op', ms: 1400, ball: 'p2', moves: { p2: [196, 72], o2: [182, 86], p3: [236, 112], o3: [226, 124], o1: [140, 104] } },
      { label: 'Oranje onderschept de pass', ms: 800, ball: 'o3', moves: { o3: [226, 121] } },
      { label: 'Oranje moet eerst terug naar de kaatser', ms: 1500, ball: 'o3', moves: { o3: [150, 130], p3: [172, 124], p2: [150, 88], o1: [104, 98] } },
      { label: 'Pass op de kaatser: recht van de aanval voor oranje', ms: 900, ball: 'n', moves: { p3: [130, 122] } },
      { label: 'De kaatser legt terug', ms: 900, ball: 'o1' },
      { label: 'Oranje dribbelt op', ms: 1500, ball: 'o1', moves: { o1: [236, 96], p2: [216, 84], o2: [250, 70] } },
      { label: 'Doelpunt', ms: 600, ball: [298, 100], moves: { k: [290, 94] } },
    ],
  },
  // Omschakel-waves 2 tegen 2 met kaatsers
  omwave2k: {
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
    beats: [
      { label: 'Pass naar de volgende kegel en volg je pass', ms: 900, ball: 'b1', moves: { a1: [160, 57] } },
      { label: 'Aannemen in de loop en doorspelen', ms: 900, ball: 'c1', moves: { a1: [250, 50], b2: [234, 57], b1: [234, 102], a2: [86, 57] } },
      { label: 'De bal gaat rond, iedereen volgt zijn pass', ms: 900, ball: 'd1', moves: { b1: [250, 153], c2: [234, 146], c1: [160, 146] } },
      { label: 'Terug naar de eerste kegel', ms: 900, ball: 'a2', moves: { c1: [70, 153], d2: [86, 146], d1: [86, 102] } },
      { label: 'Aansluiten achteraan in de nieuwe rij', ms: 700, ball: 'a2', moves: { d1: [70, 50] } },
    ],
  },
  // Rondo 4 tegen 1
  rondo: {
    beats: [
      { label: 'Pass naar een vrije zijde', ms: 800, ball: 'r', moves: { o: [185, 84] } },
      { label: 'Verder rond: de middenspeler jaagt, links schuift mee', ms: 800, ball: 'b', moves: { o: [177, 124], l: [105, 117] } },
      { label: 'Splitpass door het midden', ms: 900, ball: 't', moves: { o: [173, 106] } },
      { label: 'Snel naar de andere kant', ms: 900, ball: 'l', moves: { o: [140, 96] } },
      { label: 'Onderschept!', ms: 700, ball: 'o', moves: { o: [132, 135] } },
      { label: 'Wissel: wie de bal verliest, gaat in het midden', ms: 1200, ball: 'o', moves: { l: [160, 100], o: [105, 100] } },
    ],
  },
  // Rondo 5 tegen 2: na elke pass naar een andere zijde, maximaal twee per zijde
  rondo52: {
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
    beats: [
      { label: 'A speelt in op B en volgt zijn pass', ms: 1100, ball: 'b', moves: { a: [240, 116], q: [160, 145] } },
      { label: 'B speelt door naar C en volgt', ms: 1100, ball: 'c', moves: { b: [174, 50], a: [250, 100] } },
      { label: 'C speelt naar D en volgt', ms: 1100, ball: 'd', moves: { c: [80, 88], b: [160, 55] } },
      { label: 'D speelt terug naar de rij en sluit achteraan aan', ms: 1300, ball: 'q', moves: { d: [160, 163], c: [70, 100] } },
    ],
  },
  // Variant 2: kaatsen via de zijkant
  diamondpoles2: {
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
    beats: [
      { label: 'Binnenkantpass naar de overkant; de passer sprint achter zijn pass aan', ms: 1000, ball: 'r1', moves: { l1: [160, 135], l2: [80, 100], l3: [62, 100] } },
      { label: 'Aannemen en terugpassen; de eerste passer sluit achteraan aan', ms: 1000, ball: 'l2', moves: { r1: [160, 65], l1: [258, 100], r2: [240, 100] } },
      { label: 'Pass en volg: iedereen schuift één plek op', ms: 1000, ball: 'r2', moves: { l2: [160, 135], r1: [62, 100], l3: [80, 100] } },
      { label: 'En opnieuw: wie past, loopt naar de andere rij', ms: 1000, ball: 'l3', moves: { r2: [160, 65], l2: [258, 100], l1: [240, 100] } },
    ],
  },
  // 1 tegen 1 op kleine doeltjes
  duel: {
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
    beats: [
      { label: 'A speelt in op B, die kort aankomt', ms: 700, ball: 'b', moves: { b: [142, 100] } },
      { label: 'B kaatst in één keer terug; C vertrekt', ms: 600, ball: 'a1', moves: { c: [240, 60] } },
      { label: 'A speelt diep in de loop van C', ms: 900, ball: 'c', moves: { c: [262, 56] } },
      {
        label: 'C dribbelt de slalom in; iedereen schuift door: A naar B, B naar C',
        ms: 1000,
        ball: 'c',
        moves: { c: [196, 48], a1: [150, 100], b: [230, 62], a2: [70, 100], a3: [52, 100] },
      },
      { label: 'C dribbelt in slalom langs de kegels', ms: 700, ball: 'c', moves: { c: [160, 78] } },
      { label: 'Nog een kegel', ms: 700, ball: 'c', moves: { c: [124, 48] } },
      { label: 'C sluit achteraan aan bij de rij', ms: 800, ball: 'c', moves: { c: [34, 100] } },
      { label: 'De volgende beurt gaat naar rechts (D)', ms: 500, ball: 'a2', newBall: 'a2' },
    ],
  },
  // Handbalvoetbal op balbezit: tien worpen na elkaar is een punt
  whandpos: {
    beats: [
      { label: 'Worp 1: A gooit naar B', ms: 800, ball: 'p2', moves: { p3: [206, 62], o1: [138, 100] } },
      { label: 'Worp 2: B gooit naar C, die vrijgelopen is', ms: 900, ball: 'p3', moves: { p2: [150, 126], o2: [190, 88] } },
      { label: 'Worp 3: C gooit naar D', ms: 800, ball: 'p4', moves: { p1: [96, 96], o3: [222, 94] } },
      { label: 'Zo gaat het door: worp 4 tot en met 9, zonder dat de bal de grond raakt', ms: 1400, ball: 'p1', moves: { p1: [104, 84], p3: [212, 70], o1: [122, 94], o2: [170, 96] } },
      { label: 'Worp 10: een punt voor paars', ms: 800, ball: 'p2', moves: { p2: [148, 112] } },
      { label: 'Nu begint oranje met de bal en telt opnieuw vanaf nul', ms: 800, ball: 'o1', newBall: 'o1', moves: { o1: [128, 92] } },
    ],
  },
  // Voetbaltennis: Around the world
  wtennisworld: {
    beats: [
      { label: 'De eerste speler speelt de bal over het net', ms: 800, ball: 'r1' },
      { label: 'Hij loopt rond het net; de overkant speelt terug', ms: 1100, ball: 'l2', moves: { l1: [160, 144], l2: [104, 86], r1: [160, 58] } },
      { label: 'Ook die speler loopt rond het net; de bal gaat weer over', ms: 1100, ball: 'r2', moves: { l1: [232, 112], l2: [160, 144], r1: [96, 76], r2: [212, 100], r3: [248, 130] } },
      { label: 'Zo gaat de rally door: tel hardop mee en probeer het record te breken', ms: 1200, ball: 'l3', moves: { r2: [160, 58], l3: [104, 86], l2: [236, 128], l1: [224, 98] } },
    ],
  },
  // Samen hoog houden in de kring
  wcircleup: {
    beats: [
      { label: 'De bal gaat hoog naar de buurman', ms: 800, ball: 'p2' },
      { label: 'Over de kring naar de overkant', ms: 900, ball: 'p4' },
      { label: 'Weer door naar de volgende', ms: 800, ball: 'p5' },
      { label: 'Iedereen blijft in beweging onder de bal', ms: 900, ball: 'p1', moves: { p1: [160, 63], p5: [124, 87] } },
      { label: 'Tel hardop mee: de bal mag de grond niet raken', ms: 900, ball: 'p3' },
    ],
  },
  // Lange bal: punten in het vak
  longpoints: {
    beats: [
      { label: 'A speelt lang naar het vak van B', ms: 1100, ball: 'b1' },
      { label: 'B neemt aan en houdt de bal in zijn vak: een punt voor het duo', ms: 700, ball: 'b1', moves: { b1: [250, 84] } },
      { label: 'B speelt lang terug naar A', ms: 1100, ball: 'a1', moves: { b1: [256, 79] } },
      { label: 'Het tweede duo speelt tegelijk: wie haalt de meeste punten?', ms: 1000, ball: 'b2', newBall: 'a2' },
    ],
  },
  // Hoekschoppen: aanvallen en verdedigen
  fcorner: {
    beats: [
      { label: 'De aanvallers starten hun loopacties in een boog', ms: 1000, moves: { a1: [262, 82], a2: [258, 102], a3: [266, 118], d1: [272, 76], d2: [276, 96], d3: [276, 118] } },
      { label: 'Hoekschop op de loopactie naar de eerste paal', ms: 800, ball: 'a1' },
      { label: 'Kopbal of volley op doel', ms: 600, ball: [306, 94], moves: { k: [298, 92] } },
      { label: 'Daarna wisselen aanvallers en verdedigers van rol', ms: 800, ball: 't', newBall: 't', moves: { a1: [238, 70], a2: [240, 102], a3: [238, 130], d1: [276, 70], d2: [282, 94], d3: [280, 122], k: [296, 100] } },
    ],
  },
  // Aannemen en draaien: de spits met de rug naar doel
  fturn: {
    beats: [
      { label: 'Lage pass op de voet van de spits', ms: 900, ball: 's', moves: { v: [204, 100] } },
      { label: 'De spits neemt aan weg van de verdediger en draait', ms: 900, ball: 's', moves: { s: [214, 124], v: [212, 108] } },
      { label: 'Afwerken op doel', ms: 600, ball: [306, 108], moves: { k: [298, 106] } },
      { label: 'De volgende beurt: iedereen wisselt van rol', ms: 800, ball: 'p2', newBall: 'p2', moves: { s: [192, 100], v: [208, 98], k: [296, 100], p1: [98, 124], p2: [114, 100], p3: [98, 76] } },
    ],
  },
  // Verdedigen als lijn: samen opschuiven en uitstappen
  defline: {
    beats: [
      { label: 'De bal wisselt naar de andere kant: de lijn schuift mee', ms: 1000, ball: 'o3', moves: { d1: [222, 70], d2: [222, 96], d3: [222, 122], d4: [222, 148] } },
      { label: 'De bal gaat zijwaarts: de leider roept “nu” en de lijn stapt samen uit', ms: 900, ball: 'o3', moves: { d1: [206, 70], d2: [206, 96], d3: [206, 122], d4: [206, 148], o2: [196, 104] } },
      { label: 'De aanvaller die al was weggelopen staat buitenspel', ms: 900, ball: 'o3', moves: { o3: [160, 124] } },
      { label: 'Vrije trap voor de verdedigers: de lijn zakt weer terug', ms: 900, ball: 'd2', newBall: 'd2', moves: { d1: [222, 62], d2: [222, 88], d3: [222, 114], d4: [222, 140], o2: [104, 100], o3: [150, 128] } },
    ],
  },
  // Ruitpassen met derde man
  diamond: {
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
    beats: [
      { label: 'Pass naar rechts; de speler zonder bal loopt naar de vrije zijde', ms: 1000, ball: 'r', moves: { l: [160, 155], o: [188, 92] } },
      { label: 'Pass naar onder; boven schuift door naar links', ms: 1000, ball: 'l', moves: { t: [105, 100], o: [180, 128] } },
      { label: 'Weer links en rechts een aanspeelpunt: rechts loopt naar boven', ms: 1000, ball: 't', moves: { r: [160, 45], o: [140, 122] } },
      { label: 'En opnieuw: de vrije speler vult de open zijde', ms: 1000, ball: 'r', moves: { l: [215, 100], o: [132, 78] } },
    ],
  },
  // Kringrondo 7 tegen 2
  rcircle: {
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
    beats: [
      { label: 'Pass naar een andere zijde; het duo stapt in op de ontvanger', ms: 1000, ball: 'r', moves: { o1: [165, 95], o2: [198, 104] } },
      { label: 'Snel door voor de druk er is', ms: 1000, ball: 'b', moves: { o1: [150, 115], o2: [180, 138] } },
      { label: 'Het duo schuift mee: de een zet druk, de ander dekt', ms: 1000, ball: 'l', moves: { o1: [122, 110], o2: [150, 122] } },
      { label: 'Pass weg van de druk', ms: 1000, ball: 't', moves: { o1: [140, 70], o2: [160, 98] } },
    ],
  },
  // Kleurenrondo 6 tegen 3: altijd naar de andere kleur
  rcolor: {
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
    beats: [
      { label: 'De buitenspelers houden de bal', ms: 1000, ball: 'r', moves: { o1: [165, 95], o2: [198, 106] } },
      { label: 'Onderschept: de verdediger wint de bal', ms: 700, ball: 'o2', moves: { o2: [188, 128] } },
      { label: 'Binnen 5 seconden in een doeltje trappen: punt voor de verdedigers', ms: 800, ball: [228, 136], moves: { o2: [200, 132] } },
    ],
  },
  // Rondo 5 tegen 2 met diepe pass naar de spits
  rdeep: {
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
    beats: [
      { label: 'Bal één pas voor je leggen', ms: 500, ball: 'a', moves: { a: [66, 100] } },
      { label: 'Lange bal met de wreef naar het andere vakje', ms: 1300, ball: 'b' },
      { label: 'Aannemen in het vakje', ms: 500, ball: 'b', moves: { b: [254, 100] } },
      { label: 'En lang terugspelen', ms: 1300, ball: 'a', moves: { a: [60, 100] } },
    ],
  },
  // Steekpass in de loop
  through: {
    beats: [
      { label: 'Eerst een kleine beweging weg van het poortje', ms: 600, ball: 'p', moves: { r: [128, 150] } },
      { label: 'Dan diep starten', ms: 700, ball: 'p', moves: { r: [186, 130] } },
      { label: 'Steekpass door het poortje in de loop', ms: 800, ball: 'r', moves: { r: [232, 106] } },
      { label: 'Aannemen en afwerken', ms: 700, ball: [306, 90], moves: { r: [250, 100], k: [296, 94] } },
    ],
  },
  // Passestafette (één ploeg)
  relay: {
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
    beats: [
      { label: 'De flankspeler dribbelt op', ms: 1100, ball: 'w', moves: { w: [230, 52] } },
      { label: 'De spitsen lopen in: naar de eerste en de tweede paal', ms: 900, ball: 'w', moves: { w: [240, 56], a: [238, 90], b: [234, 124] } },
      { label: 'Voorzet voor doel', ms: 800, ball: 'a', moves: { a: [266, 86], b: [272, 116], k: [294, 88] } },
      { label: 'In één keer afwerken', ms: 500, ball: [306, 92] },
    ],
  },
  // Terugleggen vanaf de achterlijn
  fcutback: {
    beats: [
      { label: 'Dribbel langs de zijlijn tot bijna aan de achterlijn', ms: 1300, ball: 'w', moves: { w: [284, 62], s: [214, 100] } },
      { label: 'De spits loopt richting eerste paal en remt af rond de penaltystip', ms: 700, ball: 'w', moves: { s: [250, 100], k: [294, 88] } },
      { label: 'Lage bal terug', ms: 700, ball: 's' },
      { label: 'Schot in één keer', ms: 500, ball: [306, 112] },
    ],
  },
  // Schieten en opvolgen
  frebound: {
    beats: [
      { label: 'Eerste schot op doel', ms: 700, ball: [296, 90], moves: { k: [294, 92] } },
      { label: 'Meteen opvolgen: de schutter sprint mee', ms: 900, ball: [296, 90], moves: { s: [238, 112] } },
      { label: 'De trainer speelt een tweede bal in', ms: 700, ball: 's', newBall: 't', moves: { s: [252, 112] } },
      { label: 'Binnenleggen in één keer', ms: 500, ball: [306, 108], moves: { k: [292, 96] } },
    ],
  },
  // Schietcarrousel rond de zestien
  fcircuit: {
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
    beats: [
      { label: 'Bal met een boog; de kopper loopt aan', ms: 1000, ball: 'h', moves: { h: [238, 100] } },
      { label: 'Afzetten op één been en naar beneden in de hoek koppen', ms: 500, ball: [306, 84], moves: { k: [294, 96] } },
      { label: 'Terug naar de rij', ms: 1100, ball: [306, 84], moves: { h: [170, 100], k: [292, 100] } },
    ],
  },
  // 3 tegen 2 afwerken na omschakeling
  fcounter: {
    beats: [
      { label: 'Op het signaal: de middelste speler dribbelt op, de buitenspelers lopen breed mee', ms: 1300, ball: 'm', moves: { m: [166, 100], t: [160, 52], b: [160, 148], d1: [194, 90], d2: [196, 114] } },
      { label: 'Een verdediger stapt in: pass naar de vrije man', ms: 800, ball: 't', moves: { t: [212, 60], m: [176, 100], d1: [188, 92], d2: [204, 110] } },
      { label: 'Afwerken binnen 10 seconden', ms: 600, ball: [306, 92], moves: { t: [222, 64], k: [296, 90] } },
    ],
  },
  // Schietspel 2 tegen 2 met kaatsers
  fgame: {
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
    beats: [
      { label: 'Bal klaarleggen en kijken', ms: 700, ball: 's', moves: { s: [204, 100] } },
      { label: 'Plaatsen met de binnenkant in een hoekvak', ms: 700, ball: [306, 84], moves: { k: [286, 96] } },
      { label: 'Nu in de andere hoek', ms: 800, ball: [306, 116], newBall: 's', moves: { k: [286, 104] } },
    ],
  },
  // Herhaalde sprints met afwerking
  krepeat: {
    beats: [
      { label: 'Sprint naar de kegel', ms: 1000, ball: 't', moves: { p1: [166, 100] } },
      { label: 'De trainer speelt de bal in', ms: 600, ball: 'p1', moves: { p1: [178, 102] } },
      { label: 'Binnen twee balcontacten op doel', ms: 600, ball: [306, 96], moves: { p1: [188, 100], k: [296, 98] } },
    ],
  },
  // Vangen in W-vorm / Lage ballen opscheppen
  gkserve: {
    beats: [
      { label: 'De trainer speelt de bal aan; de keeper stapt in achter de bal', ms: 900, ball: 'g', moves: { g: [270, 100] } },
      { label: 'Teruggooien en opnieuw in startpositie', ms: 1000, ball: 't', moves: { g: [290, 100] } },
      { label: 'Nu een pas naast de keeper: bijschuiven en inpakken', ms: 900, ball: 'g', moves: { g: [284, 82] } },
      { label: 'Teruggooien en opnieuw in startpositie', ms: 1000, ball: 't', moves: { g: [290, 100] } },
    ],
  },
  // Schotstoppen vanuit de startpositie
  gkshot: {
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
    beats: [
      { label: 'Pass naar de andere kant; de keeper schuift bij met kleine passen', ms: 1000, ball: 'a2', moves: { g: [282, 112] } },
      { label: 'En terug: weer op de lijn bal–midden doel', ms: 1000, ball: 'a1', moves: { g: [282, 88] } },
      { label: 'Nog eens naar de andere kant', ms: 1000, ball: 'a2', moves: { g: [282, 112] } },
      { label: 'Schot: de keeper staat al in startpositie', ms: 600, ball: 'g', moves: { g: [278, 116] } },
    ],
  },
  // 1 tegen 1: uitkomen en blokken
  gk1v1: {
    beats: [
      { label: 'De aanvaller dribbelt op de keeper af', ms: 1200, ball: 'a1', moves: { a1: [196, 100], g: [274, 100] } },
      { label: 'Bal van de voet: de keeper komt uit en remt af op 2 à 3 meter', ms: 700, ball: 'a1', moves: { a1: [214, 100], g: [236, 100] } },
      { label: 'Breed maken en blokken', ms: 500, ball: 'g', moves: { g: [230, 100] } },
    ],
  },
  // Hoge ballen: voorzetten klemmen
  gkcross: {
    beats: [
      { label: 'Voorzet in de zestien; de keeper roept “keeper” en komt uit', ms: 1000, ball: 'g', moves: { g: [268, 86] } },
      { label: 'Vangen op het hoogste punt en terug in doel', ms: 900, ball: 'g', moves: { g: [292, 100] } },
      { label: 'Nu vanaf de andere kant', ms: 1000, ball: 'g', newBall: 'o2', moves: { g: [268, 114] } },
      { label: 'Vangen op het hoogste punt en terug in doel', ms: 900, ball: 'g', moves: { g: [292, 100] } },
    ],
  },
  // Uitworp en uittrap naar doeltjes
  gkdist: {
    beats: [
      { label: 'Uitrollen naar het dichte doeltje', ms: 1000, ball: [140, 136] },
      { label: 'Werpen of uittrappen naar het verre doeltje', ms: 1500, ball: [252, 60], newBall: 'g' },
    ],
  },
  // Terugspeelbal onder druk
  gkback: {
    beats: [
      { label: 'De verdediger speelt terug; de aanvaller zet meteen druk op de keeper', ms: 900, ball: 'g', moves: { a: [70, 104] } },
      { label: 'Aannemen naar de kant weg van de aanvaller', ms: 500, ball: 'g', moves: { g: [36, 86], a: [56, 100] } },
      { label: 'Doorspelen naar de vrije man op de flank', ms: 900, ball: 'w', moves: { w: [114, 60], a: [48, 94] } },
      { label: 'De flankspeler dribbelt op, de verdediger loopt mee', ms: 1300, ball: 'w', moves: { w: [224, 56], d: [224, 132], a: [150, 86] } },
      { label: 'Scoren in een doeltje', ms: 700, ball: [282, 68] },
    ],
  },
  // Dubbele redding: opstaan en opnieuw
  gkrebound: {
    beats: [
      { label: 'Laag schot naast de keeper: duiken en verwerken', ms: 600, ball: [292, 134], moves: { g: [286, 122] } },
      { label: 'Meteen rechtstaan en positie kiezen tegenover de tweede schutter', ms: 700, ball: [292, 134], moves: { g: [282, 88] } },
      { label: 'Tweede schot binnen 2 seconden', ms: 500, ball: 'g', newBall: 's2', moves: { g: [280, 84] } },
    ],
  },
  // Leren vallen: van knielend naar staand
  gkdive: {
    beats: [
      { label: 'Bal net naast de keeper: zijwaarts vallen en vangen', ms: 800, ball: 'g', moves: { g: [288, 80] } },
      { label: 'Teruggooien en opnieuw in kniezit', ms: 1000, ball: 't', moves: { g: [288, 100] } },
      { label: 'Nu naar de andere kant', ms: 800, ball: 'g', moves: { g: [288, 120] } },
      { label: 'Teruggooien en opnieuw in kniezit', ms: 1000, ball: 't', moves: { g: [288, 100] } },
    ],
  },
  // Draaibewegingen aan de kegel (één rij)
  dturns: {
    beats: [
      { label: 'Dribbelen naar de draaikegel', ms: 1100, ball: 'p', moves: { p: [204, 110] } },
      { label: 'Draaien aan de kegel', ms: 500, ball: 'p', moves: { p: [214, 118] } },
      { label: 'Versnellen terug naar de start', ms: 1000, ball: 'p', moves: { p: [64, 110] } },
    ],
  },
  // Schijnbewegingen: passeren en versnellen
  dfeint: {
    beats: [
      { label: 'Dribbel op de verdediger af', ms: 900, ball: 'p', moves: { p: [148, 100] } },
      { label: 'Op 2 meter: schijnbeweging naar de ene kant', ms: 400, ball: 'p', moves: { p: [154, 112] } },
      { label: 'Versnellen langs de andere kant', ms: 400, ball: 'p', moves: { p: [160, 80] } },
      { label: 'Door het poortje', ms: 700, ball: 'p', moves: { p: [232, 66] } },
    ],
  },
  // Poortjesspel 1 tegen 1 (één duo)
  dgates: {
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
    beats: [
      { label: 'Op het signaal: de aanvaller dribbelt op snelheid naar doel', ms: 1100, ball: 'a', moves: { a: [170, 92], d: [138, 106] } },
      { label: 'De verdediger zet de achtervolging in', ms: 900, ball: 'a', moves: { a: [234, 96], d: [214, 106] } },
      { label: 'Schot voor de verdediger aansluit', ms: 500, ball: [306, 90], moves: { d: [226, 108], k: [296, 92] } },
    ],
  },
  // 2 tegen 1 naar doel
  d2v1: {
    beats: [
      { label: 'De balbezitter dribbelt op de verdediger af', ms: 1100, ball: 'a1', moves: { a1: [164, 92], a2: [158, 138], d: [186, 98] } },
      { label: 'De verdediger stapt in: pass naar de vrije man', ms: 800, ball: 'a2', moves: { a2: [212, 132], d: [178, 96] } },
      { label: 'Schot op doel', ms: 600, ball: [306, 108], moves: { k: [296, 106] } },
    ],
  },
  // 1 tegen 1 met de rug naar doel
  dback: {
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
    beats: [
      { label: 'De trainer speelt de bal het veld in', ms: 800, ball: [160, 104] },
      { label: 'Rechtspringen en sprinten: wie is eerst aan de bal?', ms: 800, moves: { p: [154, 100], o: [144, 112] } },
      { label: 'Paars is eerst en valt aan, oranje verdedigt', ms: 1000, ball: 'p', moves: { p: [222, 80], o: [206, 94] } },
      { label: 'Afwerken op een doeltje', ms: 500, ball: [274, 71], moves: { o: [212, 92] } },
    ],
  },
  // Reactiestart op signaal
  wreact: {
    beats: [
      { label: 'De trainer roept een kleur: sprinten naar die kegel', ms: 800, moves: { p: [108, 52], o: [120, 62] } },
      { label: 'Terug naar het midden', ms: 900, moves: { p: [152, 106], o: [168, 110] } },
      { label: 'Nieuwe kleur: wie is er eerst?', ms: 800, moves: { o: [212, 128], p: [200, 120] } },
      { label: 'Terug naar het midden', ms: 900, moves: { p: [152, 106], o: [168, 110] } },
    ],
  },
  // Wendbaarheid: T-parcours
  cagility: {
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
    beats: [
      { label: 'Rustig oplopen in de aanloopzone', ms: 1500, moves: { p1: [146, 100] } },
      { label: 'Topsnelheid vasthouden door de sprintzone', ms: 700, moves: { p1: [262, 100] } },
      { label: 'Rustig uitlopen', ms: 900, moves: { p1: [292, 100] } },
    ],
  },
  // Hindernisestafette met bal (één ploeg)
  crelay: {
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
    beats: [
      { label: 'De bal gaat naar de andere aanvaller', ms: 800, ball: 'a2', moves: { d: [154, 100] } },
      { label: 'Druk zetten in een boog: de pass terug is dicht', ms: 700, ball: 'a2', moves: { d: [184, 74] } },
      { label: 'De aanvaller moet naar buiten', ms: 700, ball: 'a2', moves: { a2: [218, 82], d: [202, 84] } },
      { label: 'Balwinst: punt voor de verdediger', ms: 500, ball: 'd', moves: { d: [210, 88], a2: [222, 76] } },
    ],
  },
  // 2 tegen 2: druk en dekking
  pr2v2: {
    beats: [
      { label: 'De eerste verdediger stapt in', ms: 800, ball: 'o1', moves: { p1: [142, 74], o1: [124, 72] } },
      { label: 'De tweede dekt schuin achter hem', ms: 600, ball: 'o1', moves: { p2: [166, 98] } },
      { label: 'Bal naar de andere aanvaller: de rollen draaien om', ms: 900, ball: 'o2', moves: { p2: [144, 126], p1: [166, 102] } },
      { label: 'De tweede zet nu druk, de eerste dekt', ms: 700, ball: 'o2', moves: { o2: [126, 126], p2: [140, 124] } },
    ],
  },
  // Tegendruk: voorkom 3 passes na balverlies
  prcp: {
    beats: [
      { label: 'Oranje heeft de bal verloren: twee spelers sluiten de balbezitter in', ms: 700, ball: 'o1', moves: { p1: [150, 96], p2: [170, 80], o1: [164, 92] } },
      { label: 'De anderen sluiten de passlijnen af', ms: 700, ball: 'o1', moves: { p3: [206, 110], p4: [106, 120] } },
      { label: 'Oranje wint de bal terug voor de derde pass: geen punt voor paars', ms: 500, ball: 'p1', moves: { p1: [150, 100] } },
    ],
  },
  // Pressing op de trigger: terugspeelbal
  prtrig: {
    beats: [
      { label: 'Compact wachten rond de middenlijn: nog niet instappen', ms: 900, ball: 'o3', moves: { p1: [162, 76], p3: [146, 96] } },
      { label: 'De opbouwers spelen rond', ms: 900, ball: 'o4', moves: { p1: [166, 84], p2: [162, 124], p3: [148, 106] } },
      { label: 'Trigger: terugspeelbal naar de keeper', ms: 800, ball: 'k' },
      { label: 'De hele ploeg stapt samen in', ms: 900, ball: 'k', moves: { p1: [84, 64], p3: [58, 98], p2: [84, 136], p4: [124, 92] } },
      { label: 'De keeper moet snel inspelen: onderschept', ms: 700, ball: 'p4', moves: { p4: [92, 86] } },
      { label: 'Binnen 8 seconden gescoord: telt dubbel', ms: 600, ball: [14, 104], moves: { k: [24, 102] } },
    ],
  },
  // Onderaantal verdedigen: 2 tegen 3
  prunder: {
    beats: [
      { label: 'Vertragen: niet te diep zakken en dicht bij elkaar blijven', ms: 900, ball: 'a2', moves: { a2: [132, 100], a1: [124, 62], a3: [124, 140], d1: [190, 92], d2: [190, 112] } },
      { label: 'De bal gaat naar de flank', ms: 800, ball: 'a1', moves: { a1: [138, 64] } },
      { label: 'Nu zet één verdediger druk, de ander dekt het midden', ms: 800, ball: 'a1', moves: { a1: [148, 68], d1: [168, 72], d2: [188, 96], a2: [150, 100], a3: [148, 138] } },
      { label: 'Na 6 seconden sprint een derde verdediger terug: 3 tegen 3', ms: 1200, ball: 'a1', moves: { d3: [186, 128], a3: [160, 136] } },
    ],
  },
  // Druk zetten op de opbouw: 3 tegen 2 + K
  prbuild: {
    beats: [
      { label: 'De keeper speelt in', ms: 900, ball: 'o1', moves: { p1: [92, 106] } },
      { label: 'Boog van de spits: de pass terug is dicht; de buitenste stapt in', ms: 800, ball: 'o1', moves: { p1: [56, 86], p2: [84, 58], o1: [72, 62] } },
      { label: 'De derde drukzetter dekt het midden', ms: 700, ball: 'o1', moves: { p3: [110, 106] } },
      { label: 'Balwinst', ms: 500, ball: 'p2', moves: { p2: [78, 62], o1: [64, 56] } },
      { label: 'Afwerken op het grote doel', ms: 600, ball: [14, 90], moves: { k: [24, 92] } },
    ],
  },
  // Verschuiven als blok: over de rivier
  prshift: {
    beats: [
      { label: 'De aanvallers spelen de bal breed; één verdediger zet druk', ms: 1000, ball: 't1', moves: { d3: [176, 44], d1: [100, 100], d2: [138, 100], d4: [206, 100] } },
      { label: 'De rest schuift mee in de rivier', ms: 1000, ball: 't2', moves: { d3: [128, 40], d1: [94, 100], d2: [118, 100], d4: [170, 100] } },
      { label: 'Pass door het gat naar de overkant: een punt', ms: 1000, ball: 'b4', moves: { d2: [128, 100], d4: [162, 100] } },
      { label: 'Nu probeert die groep terug te spelen; een andere verdediger stapt in hun vak', ms: 1100, ball: 'b3', moves: { d4: [196, 136], d3: [180, 100], d2: [140, 100], d1: [104, 100] } },
    ],
  },
  // Druk zetten in blok 6 tegen 4
  pressing: {
    beats: [
      { label: 'De keeper start de opbouw', ms: 800, ball: 'o3' },
      { label: 'Pass naar de zijkant: de trigger', ms: 800, ball: 'o1' },
      { label: 'Het blok stapt in en sluit de balkant af', ms: 800, ball: 'o1', moves: { p1: [74, 56], p3: [76, 80], p4: [102, 70], p6: [130, 94], p5: [112, 112], p2: [94, 138] } },
      { label: 'Balwinst', ms: 500, ball: 'p1', moves: { p1: [68, 64], o1: [54, 52] } },
      { label: 'Binnen 10 seconden afwerken op het grote doel', ms: 700, ball: [12, 96], moves: { k: [20, 96] } },
    ],
  },
  // Omschakelen 4 tegen 4 op vier doeltjes
  transition: {
    beats: [
      { label: 'Oranje speelt in; paars onderschept', ms: 800, ball: 'p1', moves: { p1: [124, 128] } },
      { label: 'Balwinst: eerst vooruit kijken', ms: 700, ball: 'p2', moves: { p2: [172, 92] } },
      { label: 'Snelle actie naar het vrije doeltje', ms: 1000, ball: 'p2', moves: { p2: [250, 62], o3: [258, 116], o2: [222, 92], o1: [178, 72] } },
      { label: 'Binnen 6 seconden gescoord: telt dubbel', ms: 400, ball: [290, 61] },
    ],
  },
  // Omschakelduel 1 tegen 1
  omduel: {
    beats: [
      { label: 'Paars dribbelt naar het doeltje', ms: 800, ball: 'p', moves: { p: [186, 118], o: [196, 108] } },
      { label: 'Oranje wint de bal', ms: 500, ball: 'o', moves: { o: [198, 112] } },
      { label: 'Oranje valt meteen aan; wie de bal verliest, verdedigt meteen', ms: 1100, ball: 'o', moves: { o: [108, 104], p: [124, 114] } },
      { label: 'Doelpunt', ms: 500, ball: [76, 100], moves: { o: [98, 102] } },
    ],
  },
  // Golfaanvallen 2 tegen 1
  omwaves: {
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
    beats: [
      { label: 'De schutter schiet; de keeper vangt', ms: 600, ball: 'g' },
      { label: 'De flankspelers lopen breed vrij', ms: 900, ball: 'g', moves: { w1: [168, 48], w2: [168, 152], d: [170, 88] } },
      { label: 'Snelle uitworp naar de vrije flankspeler', ms: 900, ball: 'w1', moves: { w1: [174, 52] } },
      { label: 'Twee tegen één naar de doeltjes', ms: 1000, ball: 'w1', moves: { w1: [220, 62], w2: [220, 138], d: [224, 92] } },
      { label: 'De verdediger stapt in: pass naar de vrije man', ms: 800, ball: 'w2', moves: { d: [228, 76], w2: [242, 132] } },
      { label: 'Scoren op een doeltje', ms: 500, ball: [278, 129] },
    ],
  },
  // Van rondo naar counter
  omrondo: {
    beats: [
      { label: 'Rondo: de vijf houden de bal', ms: 800, ball: 'p2', moves: { o1: [206, 88], o2: [188, 106] } },
      { label: 'Oranje onderschept', ms: 600, ball: 'o2', moves: { o2: [174, 104] } },
      { label: 'Meteen counteren: uit het vak en naar doel; twee paarse spelers sprinten mee', ms: 1200, ball: 'o2', moves: { o2: [84, 102], o1: [106, 134], p3: [98, 118], p2: [114, 92] } },
      { label: 'Schot op doel', ms: 500, ball: [14, 96], moves: { g: [24, 96] } },
    ],
  },
  // Nummerspel: 1 tegen 1 tot 3 tegen 3
  sgnum: {
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
    beats: [
      { label: 'Doeltrap: de verdedigers splitsen breed', ms: 900, ball: 'g', moves: { c1: [74, 56], c2: [74, 144] } },
      { label: 'De aanvaller kiest een kant', ms: 600, ball: 'g', moves: { a: [88, 76] } },
      { label: 'De keeper speelt de vrije verdediger aan', ms: 800, ball: 'c2' },
      { label: 'Dribbel door het poortje', ms: 1000, ball: 'c2', moves: { c2: [152, 139], a: [120, 112] } },
    ],
  },
  // Vrijlopen van de zes: opbouw 3 + K tegen 2
  obsix: {
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
    beats: [
      { label: 'Uittrap op de spits', ms: 1300, ball: 's', moves: { o1: [196, 104] } },
      { label: 'De spits legt af', ms: 600, ball: 'm2', moves: { m2: [168, 132], o2: [176, 120] } },
      { label: 'Met de tweede bal naar de eindlijn', ms: 1100, ball: 'm2', moves: { m2: [254, 132], o2: [230, 128], o3: [240, 108] } },
    ],
  },
  // Van kant wisselen via de keeper: 4 + K tegen 3
  obswitch: {
    beats: [
      { label: 'Druk op de flank: bal terug naar de keeper', ms: 1000, ball: 'g', moves: { o1: [104, 62], o2: [60, 88] } },
      { label: 'De keeper speelt de andere centrale verdediger aan', ms: 800, ball: 'c2', moves: { o2: [58, 108] } },
      { label: 'Door naar de vrije back', ms: 800, ball: 'b2', moves: { o3: [136, 128] } },
      { label: 'Pass door het poortje: na een wissel via de keeper telt het dubbel', ms: 800, ball: [206, 152], moves: { b2: [124, 150] } },
    ],
  },
  // Verticale pass op de spits en de kaatsbal
  obwall: {
    beats: [
      { label: 'Verticale pass op de spits; de zes sluit aan', ms: 900, ball: 'f', moves: { s: [140, 122] } },
      { label: 'De spits kaatst in één keer naar de zes', ms: 600, ball: 's', moves: { d: [202, 106], m: [126, 92] } },
      { label: 'Pass door het poortje naar de flankspeler', ms: 1000, ball: 'w' },
    ],
  },
  // Kort of lang: de keeper beslist
  obkeeper: {
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
    beats: [
      { label: 'Loskomen: de 3 en de 10 bewegen diagonaal van elkaar weg, richting keeper', ms: 900, ball: 'g', moves: { t: [70, 138], ten: [152, 70], d3: [94, 128], d10: [172, 86] } },
      { label: 'De keeper speelt diep op de 10', ms: 1000, ball: 'ten' },
      { label: 'De 10 draait open', ms: 400, ball: 'ten', moves: { ten: [168, 70] } },
      { label: 'Door het midden de 9 aanspelen', ms: 900, ball: 'n', moves: { ten: [234, 62], d10: [212, 78] } },
      { label: 'De 9 kaatst in de loop van de 10', ms: 600, ball: 'ten', moves: { ten: [248, 64] } },
      { label: 'Scoren op een doeltje', ms: 400, ball: [282, 66] },
    ],
  },
  // Terugspeelbal en uitbouwen: 3 + K tegen 2
  obback: {
    beats: [
      { label: 'De centrale verdediger speelt terug: de ene aanvaller zet druk op de keeper, de andere sluit de centrale verdediger af', ms: 1000, ball: 'g', moves: { a1: [56, 110], a2: [114, 88], lb: [76, 36], rb: [76, 164] } },
      { label: 'De keeper neemt aan weg van de druk', ms: 600, ball: 'g', moves: { g: [34, 90], a1: [44, 104] } },
      { label: 'en speelt de vrije back aan', ms: 800, ball: 'lb', moves: { a2: [98, 52] } },
      { label: 'Indribbelen voorbij de aanvaller', ms: 1100, ball: 'lb', moves: { lb: [170, 44], a2: [136, 52], cv: [150, 104], rb: [150, 160] } },
      { label: 'Scoren in een doeltje', ms: 700, ball: [272, 62] },
    ],
  },
  // Rustig uitspelen: 3 + K tegen 2 met terugtreklijn
  obline: {
    beats: [
      { label: 'De keeper heeft de bal: de aanvallers wachten achter de terugtreklijn', ms: 900, ball: 'g' },
      { label: 'De keeper speelt een vrije verdediger aan: nu mogen ze druk zetten', ms: 800, ball: 'd2', moves: { a2: [86, 132] } },
      { label: 'Dribbel naar voren', ms: 1100, ball: 'd2', moves: { d2: [170, 138], a2: [140, 134] } },
      { label: 'Scoren in een doeltje', ms: 700, ball: [272, 128] },
    ],
  },
  // Opbouwen tegen druk: 4 + K tegen 2
  psbuild: {
    beats: [
      { label: 'De keeper speelt in', ms: 800, ball: 'c2', moves: { a1: [84, 118] } },
      { label: 'Druk: naar de andere centrale verdediger', ms: 900, ball: 'c1', moves: { a1: [82, 86], a2: [120, 82] } },
      { label: 'De centrale verdediger speelt de back aan', ms: 800, ball: 'b1' },
      { label: 'De back dribbelt over de lijn', ms: 1300, ball: 'b1', moves: { b1: [236, 52], a2: [190, 72] } },
    ],
  },
  // Schaduwopbouw: patronen zonder tegenstander
  psshadow: {
    beats: [
      { label: 'De keeper speelt in', ms: 700, ball: 'c1' },
      { label: 'Via de centrale verdediger naar de back', ms: 800, ball: 'b1', moves: { b1: [96, 46], m1: [128, 96], m2: [158, 66] } },
      { label: 'De back speelt de middenvelder aan; iedereen schuift mee', ms: 800, ball: 'm2', moves: { c1: [80, 78], c2: [76, 114], b2: [100, 148], m3: [166, 124] } },
      { label: 'De middenvelder vindt de spits', ms: 900, ball: 'st', moves: { st: [244, 96], m1: [150, 100], w1: [236, 54], w2: [232, 142] } },
    ],
  },
  // Driehoek op de flank: back, flankspeler en middenvelder
  psflank: {
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
    beats: [
      { label: 'De kaatser speelt in', ms: 800, ball: 'p1', moves: { o1: [80, 66] } },
      { label: 'Via de middenzone', ms: 900, ball: 'p3', moves: { o5: [148, 76], o3: [180, 64] } },
      { label: 'Doorspelen naar de andere kant', ms: 900, ball: 'p5', moves: { o3: [200, 82], o4: [222, 122] } },
      { label: 'De bal bereikt de verre kaatser: punt', ms: 600, ball: 'n2' },
    ],
  },
  // Positiespel 4 tegen 4 + 3 jokers
  ps43: {
    beats: [
      { label: 'De zijjoker speelt in', ms: 800, ball: 'p1', moves: { o1: [114, 92] } },
      { label: 'Pass naar de middenjoker', ms: 800, ball: 'j2', moves: { o2: [176, 84] } },
      { label: 'De middenjoker speelt door', ms: 800, ball: 'p4', moves: { o3: [196, 140], o4: [230, 108] } },
      { label: 'De bal bereikt de andere zijjoker: punt', ms: 600, ball: 'j3' },
    ],
  },
  // Overspelen in drie vakken
  ps3z: {
    beats: [
      { label: 'De bal gaat rond in het buitenvak', ms: 700, ball: 'l2', moves: { ol: [74, 84] } },
      { label: 'Nog eens rond: de verdediger schuift mee', ms: 800, ball: 'l3', moves: { ol: [76, 124] } },
      { label: 'Pass door de linie naar de middenspeler', ms: 900, ball: 'm', moves: { m: [160, 114], om: [154, 94] } },
      { label: 'De middenspeler speelt door naar de overkant: 2 punten', ms: 900, ball: 'r3', moves: { or: [254, 112] } },
    ],
  },
  // Positiespel 6 tegen 4 met vaste posities
  psshape: {
    beats: [
      { label: 'De keeper speelt in op een centrale verdediger', ms: 800, ball: 'c1', moves: { o3: [86, 88] } },
      { label: 'Bal naar de brede back', ms: 800, ball: 'b1', moves: { o1: [138, 52] } },
      { label: 'De back speelt de middenvelder aan', ms: 700, ball: 'm1', moves: { m1: [130, 80], o4: [170, 96] } },
      { label: 'De middenvelder dribbelt over de middenlijn', ms: 1200, ball: 'm1', moves: { m1: [216, 70], o4: [188, 88] } },
    ],
  },
  // Van kant wisselen: 4 tegen 4 + 2 op vier doeltjes
  psswitch: {
    beats: [
      { label: 'Lokken: korte pass aan de kant van de bal', ms: 700, ball: 'p2', moves: { o1: [196, 80], o2: [232, 72], o3: [176, 70], o4: [158, 106] } },
      { label: 'Kantwissel: pass naar de vrije verre kant', ms: 900, ball: 'p4' },
      { label: 'Opdribbelen naar het vrije doeltje', ms: 600, ball: 'p4', moves: { p4: [254, 140] } },
      { label: 'Scoren na een kantwissel: telt dubbel', ms: 400, ball: [274, 140] },
    ],
  },
  // Kwadrantenspel: maximaal twee per vak
  psquad: {
    beats: [
      { label: 'Pass naar een ander kwadrant', ms: 900, ball: 'p4', moves: { o3: [212, 78] } },
      { label: 'Een speler loopt naar een vrij kwadrant: nooit drie van één ploeg in hetzelfde vak', ms: 900, ball: 'p4', moves: { p3: [196, 128], o2: [182, 118] } },
      { label: 'Pass in de vrije ruimte', ms: 800, ball: 'p3' },
    ],
  },
  // Spelen tussen de linies: middenzone
  psline: {
    beats: [
      { label: 'Pass naar de middenspeler', ms: 900, ball: 'pm', moves: { o1: [96, 86], om: [160, 114] } },
      { label: 'De middenspeler draait open', ms: 500, ball: 'pm', moves: { pm: [166, 92] } },
      { label: 'Pass naar de overkant: punt', ms: 900, ball: 'p3', moves: { o4: [240, 72] } },
    ],
  },
  // Tienpassenspel 5 tegen 5
  tenpass: {
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
    beats: [
      { label: 'Pass naar een vrije ploegmaat', ms: 700, ball: 'p3', moves: { o1: [206, 110] } },
      { label: 'Dribbel naar het vrije doeltje, tot in de scoringszone', ms: 900, ball: 'p3', moves: { p3: [242, 74], o2: [262, 100], o3: [200, 66] } },
      { label: 'Afwerken vanuit de scoringszone', ms: 500, ball: [282, 62] },
    ],
  },
  // Poortjesspel 4 tegen 4
  sggates: {
    beats: [
      { label: 'Pass door een poortje naar een ploegmaat: punt', ms: 800, ball: 'p2', moves: { o2: [172, 74] } },
      { label: 'De passer zoekt het volgende poortje', ms: 900, ball: 'p2', moves: { p1: [234, 126], o1: [204, 116], o3: [222, 146] } },
      { label: 'Aan de andere kant van dat poortje gaan staan', ms: 700, ball: 'p2', moves: { p2: [266, 126] } },
      { label: 'Weer door een ander poortje: punt', ms: 600, ball: 'p1' },
    ],
  },
  // Eindzonespel 4 tegen 4
  sgend: {
    beats: [
      { label: 'Niemand wacht in de eindzone', ms: 500, ball: 'p2', moves: { p2: [194, 118] } },
      { label: 'De aanvaller loopt de eindzone in zodra de pass vertrekt', ms: 900, ball: 'p4', moves: { p4: [262, 80], o1: [246, 92] } },
      { label: 'Punt; de ploeg houdt de bal en valt aan op de andere eindzone', ms: 900, ball: 'p1', moves: { p4: [238, 80], o2: [168, 84] } },
      { label: 'Nieuwe diepe loop, pass in de loop: weer een punt', ms: 1100, ball: 'p3', moves: { p3: [58, 122], o3: [96, 118], o4: [80, 96] } },
    ],
  },
  // Partijvorm 4 tegen 4 + 2 flankjokers
  sgwing: {
    beats: [
      { label: 'Pass naar de joker op de flank', ms: 800, ball: 'j1' },
      { label: 'Een verdediger stapt de flankzone in: de joker moet snel beslissen', ms: 800, ball: 'j1', moves: { j1: [222, 50], o2: [230, 62], p2: [226, 112] } },
      { label: 'Voorzet naar de inlopende spits', ms: 800, ball: 'p3', moves: { p3: [256, 92] } },
      { label: 'Doelpunt na een voorzet van een joker: telt dubbel', ms: 500, ball: [310, 98], moves: { ko: [300, 98] } },
    ],
  },
  // Werpen en terugspelen in duo's (één duo)
  wthrow: {
    beats: [
      { label: 'De werper gooit de bal onderhands', ms: 800, ball: 'p2' },
      { label: 'In één keer terug in de handen, met de binnenkant', ms: 700, ball: 'p1' },
      { label: 'Opnieuw gooien', ms: 800, ball: 'p2' },
      { label: 'Nu met de wreef als halve volley', ms: 700, ball: 'p1' },
    ],
  },
  // Vallende bal: reageren voor de tweede stuit (één duo)
  cdrop: {
    beats: [
      { label: 'De bal wordt zonder aankondiging losgelaten', ms: 300, ball: [202, 104] },
      { label: 'Sprinten en aannemen voor de tweede stuit', ms: 600, moves: { p: [196, 100] } },
      { label: 'Terugspelen', ms: 500, ball: 'n' },
      { label: 'Terug naar de startpositie', ms: 900, moves: { p: [120, 100] } },
    ],
  },
  // Aanval tegen verdediging: 6 tegen 4 + K
  sgavv: {
    beats: [
      { label: 'De bal naar de centrale middenvelder', ms: 900, ball: 'a5', moves: { d1: [204, 88] } },
      { label: 'De flankspeler loopt achter de verdediging', ms: 800, ball: 'a5', moves: { a3: [226, 56] } },
      { label: 'Pass in de loop', ms: 800, ball: 'a3', moves: { a3: [264, 78], d3: [256, 94] } },
      { label: 'Afwerken binnen 20 seconden', ms: 500, ball: [306, 94], moves: { k: [298, 94] } },
    ],
  },
  // Balwinst op eigen helft en counteren: 6 tegen 6
  omcounter: {
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
  // Vrij rondpassen en de bal volgen
  pfollow: {
    beats: [
      { label: 'Pass naar een ploegmaat en sprint je bal achterna', ms: 1000, ball: 'b', moves: { a: [180, 72], e: [118, 110] } },
      { label: 'Speel een andere ploegmaat aan, niet wie je de bal gaf', ms: 1100, ball: 'e', moves: { b: [146, 98], a: [188, 126], c: [210, 80], d: [150, 146] } },
      { label: 'Kies vrij: kijk wie vrij staat', ms: 1100, ball: 'c', moves: { e: [192, 86], b: [126, 70] } },
      { label: 'Blijf bewegen en bied je aan', ms: 1100, ball: 'd', moves: { c: [162, 134], e: [206, 110], a: [196, 60] } },
      { label: 'Pass en volg', ms: 1100, ball: 'b', moves: { d: [142, 92], c: [176, 140] } },
    ],
  },
  // Kegelbowling
  pbowl: {
    beats: [
      { label: 'Paars mikt laag over de grond op een kegel', ms: 800, ball: [158, 80] },
      { label: 'Kegel om: punt voor paars. De bal rolt door naar oranje', ms: 900, ball: 'o1' },
      { label: 'Oranje neemt aan en mikt meteen terug', ms: 900, ball: [162, 104] },
      { label: 'Ook raak: punt voor oranje. Paars neemt de bal aan', ms: 900, ball: 'p2' },
      { label: 'Paars mikt op de volgende kegel', ms: 900, ball: [158, 126] },
      { label: 'Mis: oranje neemt de bal aan en mikt opnieuw', ms: 900, ball: 'o2' },
    ],
  },
  // Schietduel vanaf de eigen helft
  fhalves: {
    beats: [
      { label: 'Paars legt de bal klaar op de eigen helft', ms: 700, ball: 'p1', moves: { p1: [140, 116] } },
      { label: 'Schot laag in de hoek, naast de keeper', ms: 600, ball: [262, 122], moves: { ok: [248, 110] } },
      { label: 'Oranje neemt een nieuwe bal en legt klaar', ms: 900, ball: 'o1', newBall: 'o1', moves: { o1: [190, 90], ok: [246, 100] } },
      { label: 'Oranje schiet terug; de paarse keeper redt', ms: 700, ball: 'pk', moves: { pk: [72, 94] } },
      { label: 'De keeper rolt naar de ploegmaat: paars mag weer schieten', ms: 800, ball: 'p1', moves: { pk: [74, 100] } },
    ],
  },
  // Wereldbeker
  fworld: {
    beats: [
      { label: 'Paars speelt de duomaat aan', ms: 800, ball: 'p2', moves: { o1: [186, 82] } },
      { label: 'Paars dribbelt op, oranje zet druk', ms: 1000, ball: 'p2', moves: { p2: [236, 118], o2: [228, 102], p1: [196, 94] } },
      { label: 'Doelpunt: paars is door naar de volgende ronde', ms: 600, ball: [304, 112], moves: { k: [290, 108] } },
      {
        label: 'Paars wacht naast het veld; de trainer gooit een nieuwe bal in',
        ms: 1300,
        ball: 'o1',
        newBall: 'o1',
        moves: { p1: [140, 164], p2: [156, 164], k: [292, 100] },
      },
      { label: 'Oranje dribbelt naar doel', ms: 900, ball: 'o1', moves: { o1: [240, 86], o2: [250, 118] } },
      { label: 'Schot: de keeper redt, oranje moet opnieuw proberen', ms: 600, ball: 'k', moves: { k: [290, 92] } },
    ],
  },
  // Kleurdoeltjes 3 tegen 3
  sgcolor: {
    beats: [
      { label: 'De trainer roept een kleur: het doeltje rechts telt', ms: 900, ball: 'p1', moves: { p3: [204, 76], o3: [238, 92] } },
      { label: 'Pass naar de vrije ploegmaat', ms: 700, ball: 'p3' },
      { label: 'Opdribbelen naar het doeltje dat telt', ms: 1000, ball: 'p3', moves: { p3: [240, 82], o3: [236, 104], o2: [218, 120] } },
      { label: 'Doelpunt', ms: 500, ball: [262, 96] },
      { label: 'Nieuwe kleur: het doeltje onderaan. De trainer speelt in bij oranje', ms: 1000, ball: 'o1', newBall: 't' },
      { label: 'Oranje dribbelt naar het doeltje onderaan', ms: 1000, ball: 'o1', moves: { o1: [160, 136], p2: [138, 138], p1: [146, 116] } },
      { label: 'Doelpunt voor oranje', ms: 500, ball: [160, 154] },
    ],
  },
  // Kasteelvoetbal 3 tegen 3
  sgcastle: {
    beats: [
      { label: 'Paars speelt de vrije ploegmaat aan', ms: 800, ball: 'p3', moves: { o1: [168, 106] } },
      { label: 'Oranje zakt terug voor het kasteel; niemand mag erin', ms: 900, ball: 'p3', moves: { o2: [212, 80], o3: [214, 118], p3: [190, 94] } },
      { label: 'Schot tussen de verdedigers door: kegel om, punt', ms: 600, ball: [238, 100] },
      { label: 'Oranje zet de kegel recht en speelt meteen verder', ms: 900, ball: 'o3', newBall: 'o3' },
      { label: 'Oranje speelt naar voren', ms: 900, ball: 'o1', moves: { o1: [140, 96], p1: [128, 112] } },
      { label: 'Schot op het paarse kasteel: net naast', ms: 700, ball: [78, 128] },
    ],
  },
};

/** Every animation, with the lineup it starts from. */
export const ANIMATIONS: Partial<Record<Variant, PitchAnimationDef>> = Object.fromEntries(
  Object.entries(BEATS).map(([variant, { beats }]) => [variant, { ...LINEUPS[variant as Variant]!, beats }]),
);
