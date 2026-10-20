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
    id: 'ref-u6-spel',
    name: 'Spelen, dribbelen en scoren',
    ages: 'U6 – U7',
    duration: 60,
    theme: 'Dribbelen',
    items: [
      ['wu', 'dtag', 10], // Dribbeltikkertje
      ['kern', 'fgoals', 10], // Doeltjesjacht
      ['kern', 'dshark', 10], // Haaien en visjes
      ['kern', 'fhalves', 10], // Schietduel vanaf de eigen helft
      ['pv', 'sg2v2j', 20], // 2 tegen 2 voor de jongsten
    ],
  },
  {
    id: 'ref-u6-pass',
    name: 'Passen en mikken',
    ages: 'U6 – U7',
    duration: 60,
    theme: 'Passing & aanname',
    items: [
      ['wu', 'pclean', 10], // Ruim je tuin op
      ['kern', 'pbowl', 10], // Kegelbowling
      ['kern', 'prelay', 10], // Passestafette
      ['kern', 'pline', 10], // Passen in lijnen: pass en volg
      ['pv', 'sgcastle', 20], // Kasteelvoetbal 3 tegen 3
    ],
  },
  {
    id: 'ref-u6-schieten',
    name: 'Schieten op doeltjes',
    ages: 'U6 – U7',
    duration: 60,
    theme: 'Afwerken',
    items: [
      ['wu', 'dtail', 10], // Staartjesroof met bal
      ['kern', 'fplace', 10], // Plaatsen in de hoeken
      ['kern', 'fhalves', 10], // Schietduel vanaf de eigen helft
      ['kern', 'sgnum', 10], // Nummerspel: 1 tegen 1 tot 3 tegen 3
      ['pv', 'fworld', 20], // Wereldbeker
    ],
  },
  {
    id: 'ref-u6-bewegen',
    name: 'Bewegen, springen en spelen',
    ages: 'U6 – U7',
    duration: 60,
    theme: 'Fysiek',
    items: [
      ['wu', 'crelay', 10], // Hindernisestafette met bal
      ['kern', 'coord', 10], // Coördinatieparcours met bal
      ['kern', 'cbalance', 10], // Evenwichtsduels in duo’s
      ['kern', 'dking', 10], // Koning van het vak
      ['pv', 'sgcolor', 20], // Kleurdoeltjes 3 tegen 3
    ],
  },
  {
    id: 'ref-u6-afpakken',
    name: 'Bal afpakken en terugwinnen',
    ages: 'U6 – U7',
    duration: 60,
    theme: 'Druk zetten',
    items: [
      ['wu', 'wchain', 10], // Kettingtikkertje
      ['kern', 'prhunt', 10], // Jagers en dribbelaars
      ['kern', 'dpirate', 10], // Schatten roven: vier kampen
      ['kern', 'r31', 10], // Rondo 3 tegen 1
      ['pv', 'funino', 20], // Funino: 3 tegen 3 op vier doeltjes
    ],
  },
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
      ['wu', 'whandpos', 10], // Handbalvoetbal op balbezit
      ['kern', 'prelay', 10], // Passestafette
      ['kern', 'pwall', 10], // Kaatsen: één-twee-race naar het doeltje
      ['kern', 'pgates', 10], // Passen door poortjes
      ['pv', 'game5', 20], // Partijvorm 5 tegen 5 op grote doelen
    ],
  },
  {
    id: 'ref-u8-afwerken',
    name: 'Schieten en opvolgen',
    ages: 'U8 – U9',
    duration: 60,
    theme: 'Afwerken',
    items: [
      ['wu', 'pfollow', 10], // Vrij rondpassen en de bal volgen
      ['kern', 'fshot', 10], // Aannemen en schieten vanaf de zestien
      ['kern', 'frebound', 10], // Schieten en opvolgen
      ['kern', 'd2v1', 10], // 2 tegen 1 naar doel
      ['pv', 'sgnum', 20], // Nummerspel: 1 tegen 1 tot 3 tegen 3
    ],
  },
  {
    id: 'ref-u8-omschakelen',
    name: 'Snel vooruit, snel terug',
    ages: 'U8 – U9',
    duration: 60,
    theme: 'Omschakelen',
    items: [
      ['wu', 'whand', 10], // Handbalvoetbal
      ['kern', 'omduel', 10], // Omschakelduel 1 tegen 1
      ['kern', 'omwinner', 10], // Winnaar blijft: 2 tegen 2 met wisselende duo’s
      ['kern', 'dchase', 10], // 1 tegen 1 met achtervolger
      ['pv', 'omwave2', 20], // Omschakel-waves 2 tegen 2 op vier doeltjes
    ],
  },
  {
    id: 'ref-u8-opbouw',
    name: 'Rustig uitspelen vanaf de keeper',
    ages: 'U8 – U9',
    duration: 60,
    theme: 'Opbouw van achteruit',
    items: [
      ['wu', 'pline', 10], // Passen in lijnen: pass en volg
      ['kern', 'obsplit', 15], // Doeltrap: splitsen en uitspelen 2 + K tegen 1
      ['kern', 'obline', 15], // Rustig uitspelen: 3 + K tegen 2 met terugtreklijn
      ['pv', 'sggates', 20], // Poortjesspel 4 tegen 4
    ],
  },
  {
    id: 'ref-u8-afpakken',
    name: '1 tegen 1 verdedigen',
    ages: 'U8 – U9',
    duration: 60,
    theme: 'Druk zetten',
    items: [
      ['wu', 'prhunt', 10], // Jagers en dribbelaars
      ['kern', 'pr1v1', 10], // 1 tegen 1 verdedigen: aansluiten en afremmen
      ['kern', 'dshield', 10], // Bal afschermen 1 tegen 1
      ['kern', 'dking', 10], // Koning van het vak
      ['pv', 'dline', 20], // Dribbelvoetbal 3 tegen 3 over de lijn
    ],
  },
  {
    id: 'ref-u10-opbouw',
    name: 'Opbouwen van achteruit',
    ages: 'U10 – U13',
    duration: 75,
    theme: 'Opbouw van achteruit',
    items: [
      ['wu', 'ppoles', 15], // Ruitpassen rond de palen
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
      ['wu', 'whand', 10], // Handbalvoetbal
      ['wu', 'rondo', 5], // Rondo 4 tegen 1
      ['kern', 'trans', 20], // Omschakelen 4 tegen 4 op vier doeltjes
      ['kern', 'prcp', 20], // Tegendruk: voorkom 3 passes na balverlies
      ['pv', 'omwave2', 20], // Omschakel-waves 2 tegen 2 op vier doeltjes
    ],
  },
  {
    id: 'ref-u10-dribbel',
    name: 'Dribbelen en de 1 tegen 1 winnen',
    ages: 'U10 – U13',
    duration: 75,
    theme: 'Dribbelen',
    items: [
      ['wu', 'dbox', 15], // Dribbelvak met opdrachten
      ['kern', 'dfeint', 10], // Schijnbewegingen: passeren en versnellen
      ['kern', 'dgates', 10], // Poortjesspel 1 tegen 1
      ['kern', 'dback', 10], // 1 tegen 1 met de rug naar doel
      ['kern', 'd2v1', 10], // 2 tegen 1 naar doel
      ['pv', 'dline', 20], // Dribbelvoetbal 3 tegen 3 over de lijn
    ],
  },
  {
    id: 'ref-u10-pass',
    name: 'Aannemen, kijken en doorspelen',
    ages: 'U10 – U13',
    duration: 75,
    theme: 'Passing & aanname',
    items: [
      ['wu', 'pfollow', 10], // Vrij rondpassen en de bal volgen
      ['wu', 'rondo', 5], // Rondo 4 tegen 1
      ['kern', 'py', 15], // Passvorm in Y met kaatsbal
      ['kern', 'pscan', 10], // Aannemen met schouderblik
      ['kern', 'pthrough', 15], // Steekpass in de loop
      ['pv', 'sgend', 20], // Eindzonespel 4 tegen 4
    ],
  },
  {
    id: 'ref-u10-afwerken',
    name: 'Afwerken in en rond de zestien',
    ages: 'U10 – U13',
    duration: 75,
    theme: 'Afwerken',
    items: [
      ['wu', 'wworld', 15], // Voetbaltennis: Around the world
      ['kern', 'fcircuit', 15], // Schietcarrousel rond de zestien
      ['kern', 'fturn', 15], // Aannemen en draaien: de spits met de rug naar doel
      ['kern', 'fgame', 10], // Schietspel 2 tegen 2 met kaatsers
      ['pv', 'sgwing', 20], // Partijvorm 4 tegen 4 + 2 flankjokers
    ],
  },
  {
    id: 'ref-u10-druk',
    name: 'Samen de bal afpakken',
    ages: 'U10 – U13',
    duration: 75,
    theme: 'Druk zetten',
    items: [
      ['wu', 'wchain', 10], // Kettingtikkertje
      ['wu', 'rondo', 5], // Rondo 4 tegen 1
      ['kern', 'prcurve', 10], // Druk zetten in een boog: 1 tegen 2
      ['kern', 'pr2v2', 10], // 2 tegen 2: druk en dekking
      ['kern', 'prunder', 10], // Onderaantal verdedigen: 2 tegen 3
      ['kern', 'prbuild', 10], // Druk zetten op de opbouw: 3 tegen 2 + K
      ['pv', 'sgman', 20], // Mandekking 4 tegen 4
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
    id: 'ref-u14-opbouw',
    name: 'Opbouwen met drie achteraan',
    ages: 'U14 – U16',
    duration: 75,
    theme: 'Opbouw van achteruit',
    items: [
      ['wu', 'ppoles', 15], // Ruitpassen rond de palen
      ['kern', 'obsix', 10], // Vrijlopen van de zes: opbouw 3 + K tegen 2
      ['kern', 'obdrop', 15], // Uitzakkende zes: opbouwen met drie achteraan
      ['kern', 'obwall', 15], // Verticale pass op de spits en de kaatsbal
      ['pv', 'obgame', 20], // Opbouwspel 6 + K tegen 6 op drie doeltjes
    ],
  },
  {
    id: 'ref-u14-omschakelen',
    name: 'Na balverlies meteen terug',
    ages: 'U14 – U16',
    duration: 75,
    theme: 'Omschakelen',
    items: [
      ['wu', 'gs11', 15], // Preventie-opwarming voor groeiende spelers
      ['kern', 'rtrans', 10], // Omschakelrondo in twee vakken
      ['kern', 'omrecover', 15], // Terugsprinten achter de bal: 3 tegen 2 + 1
      ['kern', 'omright', 15], // 3 tegen 3 + neutrale kaatser: recht van de aanval
      ['pv', 'omback', 20], // Na balverlies achter de bal: 5 tegen 5
    ],
  },
  {
    id: 'ref-u14-afwerken',
    name: 'Afwerken via combinaties',
    ages: 'U14 – U16',
    duration: 75,
    theme: 'Afwerken',
    items: [
      ['wu', 'r52', 10], // Rondo 5 tegen 2
      ['wu', 'rondo', 5], // Rondo 4 tegen 1
      ['kern', 'psflank', 15], // Driehoek op de flank: back, flankspeler en middenvelder
      ['kern', 'fcutback', 15], // Terugleggen vanaf de achterlijn
      ['kern', 'fheader', 10], // Koppen op doel
      ['pv', 'sgavv', 20], // Aanval tegen verdediging: 6 tegen 4 + K
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
  {
    id: 'ref-u17-opbouw',
    name: 'Opbouwen onder druk',
    ages: 'U17 – U21',
    duration: 90,
    theme: 'Opbouw van achteruit',
    items: [
      ['wu', 'ppoles', 15], // Ruitpassen rond de palen
      ['kern', 'psbuild', 15], // Opbouwen tegen druk: 4 + K tegen 2
      ['kern', 'obkeeper', 15], // Kort of lang: de keeper beslist
      ['kern', 'oblong', 20], // Lange bal op de spits en de tweede bal
      ['pv', 'obgame', 25], // Opbouwspel 6 + K tegen 6 op drie doeltjes
    ],
  },
  {
    id: 'ref-u17-positie',
    name: 'Spelen tussen de linies',
    ages: 'U17 – U21',
    duration: 90,
    theme: 'Positiespel',
    items: [
      ['wu', 'r52', 10], // Rondo 5 tegen 2
      ['wu', 'rondo', 5], // Rondo 4 tegen 1
      ['kern', 'pdiamond', 15], // Ruitpassen met derde man
      ['kern', 'psline', 15], // Spelen tussen de linies: middenzone
      ['kern', 'psshape', 20], // Positiespel 6 tegen 4 met vaste posities
      ['pv', 'sgblock', 25], // Partijvorm 5 tegen 5: doorschuiven als blok
    ],
  },
  {
    id: 'ref-u17-druk',
    name: 'Hoog druk zetten als team',
    ages: 'U17 – U21',
    duration: 90,
    theme: 'Druk zetten',
    items: [
      ['wu', 'rpress', 15], // Rondo 4 tegen 2 met uitweg voor de verdedigers
      ['kern', 'prline', 15], // Verdedigen als lijn: samen opschuiven
      ['kern', 'prtrig', 15], // Pressing op de trigger: terugspeelbal
      ['kern', 'press', 20], // Druk zetten in blok 6 tegen 4
      ['pv', 'przone', 25], // Partijvorm met pressingzone
    ],
  },
  {
    id: 'ref-u17-fysiek',
    name: 'Snelheid en herhaalde sprints',
    ages: 'U17 – U21',
    duration: 90,
    theme: 'Fysiek',
    items: [
      ['wu', 'wprev', 15], // Loopscholing en blessurepreventie
      ['kern', 'ksprint', 15], // Maximale sprintsnelheid: vliegende sprints
      ['kern', 'krepeat', 15], // Herhaalde sprints met afwerking
      ['kern', 'sg2v2', 20], // Intervalpartijtjes 2 tegen 2
      ['pv', 'omcounter', 25], // Balwinst op eigen helft en counteren: 6 tegen 6
    ],
  },
];
