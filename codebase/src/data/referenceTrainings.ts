import type { Theme } from './exercises';
import type { BlockId, Duration } from './training';

/**
 * Worked-out example trainings per age group, shown on the Trainingen page. Opening one starts a new
 * training in the builder with this plan, which the trainer can adjust and save as their own.
 *
 * Each block's minutes add up exactly to BLOCK_TARGETS for the duration, and every exercise suits the
 * age group. scripts/sync-design.py checks that every exercise id here exists.
 */
export interface ReferenceTraining {
  id: string;
  name: string;
  /** Age group label, used to group the trainings on the page. */
  ages: string;
  duration: Duration;
  theme: Theme;
  /** [block, exercise id, minutes] */
  items: [BlockId, string, number][];
}

export const REFERENCE_TRAININGS: ReferenceTraining[] = [
  {
    id: 'ref-u8-dribbel',
    name: 'Dribbelen en scoren',
    ages: 'U8 – U9',
    duration: 60,
    theme: 'Dribbelen',
    items: [
      ['wu', 'dbox', 10], // Dribbelvak met opdrachten
      ['kern', 'dgates', 10], // Poortjesspel 1 tegen 1
      ['kern', 'dfeint', 10], // Schijnbewegingen: passeren en versnellen
      ['kern', 'duel', 10], // 1 tegen 1 op kleine doeltjes
      ['pv', 'funino', 20], // Funino: 3 tegen 3 op vier doeltjes
    ],
  },
  {
    id: 'ref-u8-pass',
    name: 'Samenspelen en passen',
    ages: 'U8 – U9',
    duration: 60,
    theme: 'Passing & aanname',
    items: [
      ['wu', 'rondo', 10], // Rondo 4 tegen 1
      ['kern', 'pass', 10], // Passvierkant met doorbewegen
      ['kern', 'pwall', 10], // Kaatsen: één-twee-race naar het doeltje
      ['kern', 'pgates', 10], // Passen door poortjes
      ['pv', 'sggates', 20], // Poortjesspel 4 tegen 4
    ],
  },
  {
    id: 'ref-u10-opbouw',
    name: 'Opbouwen van achteruit',
    ages: 'U10 – U13',
    duration: 75,
    theme: 'Opbouw van achteruit',
    items: [
      ['wu', 'rondo', 5], // Rondo 4 tegen 1
      ['wu', 'pscan', 10], // Aannemen met schouderblik
      ['kern', 'obfree', 15], // Loskomen van de 3 en de 10: K + 2 tegen 2
      ['kern', 'obzones', 10], // Positiespel in twee vakken: opbouw via de keeper
      ['kern', 'obwave', 15], // K + 5 tegen K + 4: opbouwen in golven
      ['pv', 'sgbuild', 20], // Partijvorm 6 tegen 6 met opbouwzone
    ],
  },
  {
    id: 'ref-u10-omschakelen',
    name: 'Omschakelen na balwinst en balverlies',
    ages: 'U10 – U13',
    duration: 75,
    theme: 'Omschakelen',
    items: [
      ['wu', 'r52', 10], // Rondo 5 tegen 2
      ['wu', 'omduel', 5], // Omschakelduel 1 tegen 1
      ['kern', 'trans', 20], // Omschakelen 4 tegen 4 op vier doeltjes
      ['kern', 'prcp', 20], // Tegendruk: 5 seconden om terug te winnen
      ['pv', 'game5', 20], // Partijvorm 5 tegen 5 op grote doelen
    ],
  },
  {
    id: 'ref-u14-positie',
    name: 'Positiespel en de vrije man',
    ages: 'U14 – U16',
    duration: 75,
    theme: 'Positiespel',
    items: [
      ['wu', 'gs11', 15], // Preventie-opwarming voor groeiende spelers
      ['kern', 'r412', 10], // Rondo 4 + 1 tegen 2 met middenspeler
      ['kern', 'ps43', 15], // Positiespel 4 tegen 4 + 3 jokers
      ['kern', 'psswitch', 15], // Van kant wisselen: 4 tegen 4 + 2 op vier doeltjes
      ['pv', 'sgblock', 20], // Partijvorm 5 tegen 5: doorschuiven als blok
    ],
  },
  {
    id: 'ref-u14-druk',
    name: 'Samen druk zetten',
    ages: 'U14 – U16',
    duration: 75,
    theme: 'Druk zetten',
    items: [
      ['wu', 'gs11', 15], // Preventie-opwarming voor groeiende spelers
      ['kern', 'pr2v2', 10], // 2 tegen 2: druk en dekking
      ['kern', 'prtrig', 15], // Pressing op de trigger: terugspeelbal
      ['kern', 'prshift', 15], // Verschuiven als blok: over de rivier
      ['pv', 'przone', 20], // Partijvorm met pressingzone
    ],
  },
  {
    id: 'ref-u17-afwerken',
    name: 'Afwerken via de flank',
    ages: 'U17 – U21',
    duration: 90,
    theme: 'Afwerken',
    items: [
      ['wu', 'wmatch', 15], // Wedstrijdopwarming in vier delen
      ['kern', 'fcross', 15], // Afwerken na voorzet
      ['kern', 'fcutback', 15], // Terugleggen vanaf de achterlijn
      ['kern', 'fcounter', 20], // 3 tegen 2 afwerken na omschakeling
      ['pv', 'sgwing', 25], // Partijvorm 4 tegen 4 + 2 flankjokers
    ],
  },
  {
    id: 'ref-u17-omschakelen',
    name: 'Omschakelen op wedstrijdtempo',
    ages: 'U17 – U21',
    duration: 90,
    theme: 'Omschakelen',
    items: [
      ['wu', 'rcolor', 15], // Kleurenrondo 6 tegen 3
      ['kern', 'rtrans', 15], // Omschakelrondo in twee vakken
      ['kern', 'om32', 15], // Overtal heen, ondertal terug
      ['kern', 'omrecover', 20], // Terugsprinten achter de bal: 3 tegen 2 + 1
      ['pv', 'game', 25], // Partijvorm 8 tegen 8 met zones
    ],
  },
];
