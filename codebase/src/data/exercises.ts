export type Variant =
  | 'rondo'
  | 'positional'
  | 'finishing'
  | 'transition'
  | 'coordination'
  | 'pressing'
  | 'game'
  | 'passing'
  | 'duel'
  | 'smallgame';

export type ExerciseType = 'Warming-up' | 'Technisch' | 'Tactisch' | 'Fysiek' | 'Partijvorm';

export type Phase =
  | 'Aanvallen'
  | 'Verdedigen'
  | 'Omschakelen → aanval'
  | 'Omschakelen → verdediging'
  | 'Algemeen';

export type AgeGroup = 'U6–9' | 'U10–13' | 'U14–15' | 'U16–21';

export interface Exercise {
  id: string;
  title: string;
  variant: Variant;
  type: ExerciseType;
  phase: Phase;
  ages: AgeGroup[];
  ageLabel: string;
  /** 1 = Basis, 2 = Gemiddeld, 3 = Gevorderd */
  diff: 1 | 2 | 3;
  /** Minimum number of players needed, used by the player filter. */
  pmin: number;
  players: string;
  playersDetail?: string;
  min: number;
  /** 1–5 */
  intensity: number;
  field: string;
  summary: string;
  steps: { title: string; text: string }[];
  easier: string;
  harder: string;
  objectives: string[];
  coaching: string[];
  materials: { name: string; qty: string }[];
  /**
   * Optional `[label, hint]` stages for the detail-page diagram. With two or more, the page shows a
   * button per stage and stage `i` reveals the arrows whose `at` is ≤ i (the last stage shows everything).
   * With one, only its hint is shown; with none, just the full diagram.
   */
  diagramSteps?: [string, string][];
  related: { id: string; fit: string }[];
}

export const AGES: AgeGroup[] = ['U6–9', 'U10–13', 'U14–15', 'U16–21'];

export const TYPES: { name: ExerciseType; color: string }[] = [
  { name: 'Warming-up', color: '#F2A541' },
  { name: 'Technisch', color: '#3B8FD9' },
  { name: 'Tactisch', color: '#5B2BC4' },
  { name: 'Fysiek', color: '#E0527A' },
  { name: 'Partijvorm', color: '#1A1033' },
];

export const TYPE_COLOR: Record<ExerciseType, string> = Object.fromEntries(
  TYPES.map((t) => [t.name, t.color]),
) as Record<ExerciseType, string>;

export const PHASES: Phase[] = ['Aanvallen', 'Verdedigen', 'Omschakelen → aanval', 'Omschakelen → verdediging'];

export const DIFFICULTY = ['Alle', 'Basis', 'Gemiddeld', 'Gevorderd'] as const;

export const INTENSITY = ['', 'Laag', 'Licht', 'Gemiddeld', 'Hoog', 'Maximaal'] as const;

export const EXERCISES: Exercise[] = [
  {
    id: 'rondo',
    title: 'Rondo 4 tegen 1',
    variant: 'rondo',
    type: 'Warming-up',
    phase: 'Aanvallen',
    ages: ['U10–13', 'U14–15', 'U16–21'],
    ageLabel: 'U10 – U21',
    diff: 1,
    pmin: 5,
    players: '5',
    playersDetail: '(4 + 1)',
    min: 5,
    intensity: 2,
    field: '12 × 12 m',
    summary:
      'Vier spelers houden de bal in een vierkant, één speler in het midden probeert hem te onderscheppen. Een ideale opwarming om balcirculatie en aanspeelbaarheid te trainen.',
    steps: [
      { title: 'Opstelling.', text: 'Zet een vierkant van 12 × 12 m uit. Vier spelers staan op de zijden, één speler in het midden.' },
      { title: 'Spelen.', text: 'De buitenspelers spelen de bal rond met maximaal twee balcontacten. De middenspeler jaagt op de bal.' },
      { title: 'Wisselen.', text: 'Wie de bal verliest of buiten het vierkant speelt, wisselt met de middenspeler.' },
      { title: 'Ritme.', text: 'Speel 2 reeksen van 2 minuten met 1 minuut rust. Tel het aantal passes op rij als uitdaging.' },
    ],
    easier: 'Speel 5 tegen 1 of laat vrij aantal balcontacten toe. Vergroot het vierkant tot 15 × 15 m.',
    harder: 'Speel met één balcontact. Tien passes op rij levert een punt op voor de buitenploeg.',
    objectives: ['Balcirculatie', 'Aanspeelbaar staan', 'Lichaamshouding', 'Snel beslissen'],
    coaching: [
      'Open lichaamshouding: ontvang de bal met de voet die het verst van de druk staat.',
      'Beweeg langs de lijn om een passlijn te openen.',
      'Speel de bal in de loop, niet in de voeten.',
      'Middenspeler: loop schuin in en sluit de passlijn door het midden af.',
    ],
    materials: [
      { name: 'Kegels', qty: '4' },
      { name: 'Ballen', qty: '3' },
      { name: 'Hesjes', qty: '1' },
    ],
    diagramSteps: [
      ['Organisatie', 'Vier buitenspelers, één in het midden'],
      ['Circulatie', 'De bal gaat rond langs de zijden'],
      ['Onderscheppen', 'De middenspeler sluit de passlijn af'],
    ],
    related: [
      { id: 'pass', fit: 'Zelfde thema' },
      { id: 'pos', fit: 'Als vervolg' },
      { id: 'trans', fit: 'Kern' },
      { id: 'game', fit: 'Als afsluiter' },
    ],
  },
  {
    id: 'trans',
    title: 'Omschakelen 4 tegen 4 op vier doeltjes',
    variant: 'transition',
    type: 'Tactisch',
    phase: 'Omschakelen → aanval',
    ages: ['U10–13', 'U14–15'],
    ageLabel: 'U11 – U15',
    diff: 2,
    pmin: 8,
    players: '8',
    playersDetail: '(4 × 2)',
    min: 20,
    intensity: 4,
    field: '30 × 25 m',
    summary:
      'Twee ploegen van vier spelen op vier kleine doeltjes. Bij balverovering schakelt de ploeg meteen om en speelt naar de verre kant: wie snel denkt en de diepte zoekt, scoort.',
    steps: [
      { title: 'Opstelling.', text: 'Zet een veld van 30 × 25 m uit met twee doeltjes op elke korte zijde. Elke ploeg verdedigt twee doeltjes en valt er twee aan.' },
      { title: 'Spelen.', text: 'De trainer speelt de bal in. Ploegen spelen vrij 4 tegen 4 en mogen op beide doeltjes van de tegenstander scoren.' },
      { title: 'Omschakelen.', text: 'Een goal binnen 6 seconden na balverovering telt dubbel. Zo leren spelers bij balwinst eerst vooruit te kijken.' },
      { title: 'Ritme.', text: 'Speel 4 reeksen van 4 minuten met 1 minuut actieve rust. Wissel na elke reeks de ploegen of de speelrichting.' },
    ],
    easier: 'Voeg een joker toe die altijd met de balbezittende ploeg meespeelt (5 tegen 4). Vergroot het veld tot 35 × 30 m.',
    harder: 'Maximaal drie balcontacten per speler. Na balverlies moet de ploeg binnen 5 seconden de bal terugwinnen.',
    objectives: ['Snel omschakelen na balwinst', 'Diepte zoeken', 'Speelwijdte', 'Communicatie'],
    coaching: [
      '“Eerst kijken, dan spelen”: scan het veld vóór je de bal krijgt.',
      'Bij balwinst: eerste pass vooruit, naar het doeltje waar de minste tegenstanders staan.',
      'Spelers zonder bal maken het veld meteen breed en diep.',
      'Bij balverlies: dichtstbijzijnde speler zet direct druk.',
    ],
    materials: [
      { name: 'Doeltjes', qty: '4' },
      { name: 'Ballen', qty: '6' },
      { name: 'Hesjes', qty: '2 × 4' },
      { name: 'Kegels', qty: '8' },
    ],
    diagramSteps: [
      ['Organisatie', 'Beginsituatie: trainer speelt in'],
      ['Balwinst', 'Paars wint de bal en kijkt vooruit'],
      ['Afwerken', 'Snelle actie naar het vrije doeltje'],
    ],
    related: [
      { id: 'rondo', fit: 'Als warming-up' },
      { id: 'press', fit: 'Zelfde thema' },
      { id: 'fin', fit: 'Kern' },
      { id: 'game', fit: 'Als afsluiter' },
    ],
  },
  {
    id: 'pos',
    title: 'Positiespel 5 tegen 5 + 3',
    variant: 'positional',
    type: 'Tactisch',
    phase: 'Aanvallen',
    ages: ['U14–15', 'U16–21'],
    ageLabel: 'U14 – U21',
    diff: 3,
    pmin: 13,
    players: '13',
    playersDetail: '(5 × 2 + 3)',
    min: 20,
    intensity: 3,
    field: '40 × 30 m',
    summary:
      'Twee ploegen van vijf met drie neutrale kaatsers die altijd met de balbezitter meespelen. Het veld is verdeeld in drie zones: vind de vrije man tussen de linies.',
    steps: [
      { title: 'Opstelling.', text: 'Zet een veld van 40 × 30 m uit, verdeeld in drie gelijke zones. Twee kaatsers staan op de korte zijden, één op de lange zijde.' },
      { title: 'Spelen.', text: 'De balbezittende ploeg speelt met de drie kaatsers 8 tegen 5. Doel: de bal van de ene kaatser naar de andere krijgen via de middenzone.' },
      { title: 'Punten.', text: 'Een pass van kaatser naar kaatser via minstens één speler in de middenzone levert een punt op.' },
      { title: 'Ritme.', text: 'Speel 4 reeksen van 4 minuten. Wissel de kaatsers na elke reeks.' },
    ],
    easier: 'Laat de kaatsers vrij bewegen langs de volledige zijlijn en schrap de zoneregel.',
    harder: 'Kaatsers spelen met één balcontact en de middenzone mag maar door twee aanvallers tegelijk betreden worden.',
    objectives: ['Tussen de linies spelen', 'Driehoeken vormen', 'Vrije man vinden', 'Geduld in balbezit'],
    coaching: [
      'Sta nooit op één lijn met je ploegmaat: vorm driehoeken.',
      'Draai open naar het veld als je in de middenzone de bal krijgt.',
      'Speel via de kaatser om van kant te wisselen.',
      'Verdedigers: sluit de middenzone compact af.',
    ],
    materials: [
      { name: 'Kegels', qty: '12' },
      { name: 'Ballen', qty: '8' },
      { name: 'Hesjes', qty: '2 × 5 + 3' },
    ],
    diagramSteps: [
      ['Organisatie', 'Drie zones, drie kaatsers'],
      ['Opbouw', 'Paars speelt via de middenzone'],
      ['Doorspelen', 'Bal bereikt de verre kaatser'],
    ],
    related: [
      { id: 'rondo', fit: 'Als warming-up' },
      { id: 'press', fit: 'Tegenhanger' },
      { id: 'trans', fit: 'Kern' },
      { id: 'game', fit: 'Als afsluiter' },
    ],
  },
  {
    id: 'fin',
    title: 'Afwerken na combinatie',
    variant: 'finishing',
    type: 'Technisch',
    phase: 'Aanvallen',
    ages: ['U10–13', 'U14–15'],
    ageLabel: 'U12 – U15',
    diff: 2,
    pmin: 8,
    players: '8–12',
    min: 15,
    intensity: 3,
    field: 'Halve veld',
    summary:
      'Een korte combinatie via een muurpass eindigt in een afwerking op groot doel met keeper. Veel herhalingen, veel doelpogingen.',
    steps: [
      { title: 'Opstelling.', text: 'Speler A start met bal aan de middenlijn. B en C staan ter hoogte van de rand van de zestien, elk naast een kegel.' },
      { title: 'Combinatie.', text: 'A speelt in op B, B kaatst terug. A speelt diep op de lopende C, die op doel trapt.' },
      { title: 'Doordraaien.', text: 'A wordt B, B wordt C, C haalt de bal en sluit aan bij de startrij.' },
      { title: 'Ritme.', text: 'Speel 3 reeksen van 4 minuten, wissel na elke reeks de kant (links en rechts voetig afwerken).' },
    ],
    easier: 'Schrap de muurpass: A speelt meteen diep op C. Zonder keeper voor jongere groepen.',
    harder: 'Voeg een verdediger toe die vanaf de zestien meeloopt. Afwerken binnen 8 seconden.',
    objectives: ['Afwerken', 'Timing van de loopactie', 'Balvaardigheid onder tempo', 'Muurpass'],
    coaching: [
      'Kijk naar de keeper vóór je trapt: kies de hoek.',
      'Standbeen naast de bal, knie over de bal.',
      'De diepe loper vertrekt pas op het moment van de kaatsbal.',
      'Na het schot: volg altijd op voor de terugspringende bal.',
    ],
    materials: [
      { name: 'Groot doel', qty: '1' },
      { name: 'Kegels', qty: '4' },
      { name: 'Ballen', qty: '12' },
    ],
    diagramSteps: [
      ['Organisatie', 'Startrij aan de middenlijn'],
      ['Combinatie', 'Muurpass via B'],
      ['Afwerken', 'C loopt diep en trapt op doel'],
    ],
    related: [
      { id: 'pass', fit: 'Als warming-up' },
      { id: 'press', fit: 'Kern' },
      { id: 'trans', fit: 'Kern' },
      { id: 'game', fit: 'Als afsluiter' },
    ],
  },
  {
    id: 'press',
    title: 'Druk zetten in blok 6 tegen 4',
    variant: 'pressing',
    type: 'Tactisch',
    phase: 'Verdedigen',
    ages: ['U14–15', 'U16–21'],
    ageLabel: 'U14 – U21',
    diff: 3,
    pmin: 11,
    players: '10 + K',
    min: 18,
    intensity: 4,
    field: '45 × 40 m',
    summary:
      'Zes spelers zetten als blok druk op een opbouw van vier plus keeper. Doel: samen verschuiven, de bal naar de zijkant dwingen en daar winnen.',
    steps: [
      { title: 'Opstelling.', text: 'Speel op een half veld met groot doel en keeper. Vier opbouwers plus keeper tegen zes drukzetters.' },
      { title: 'Opbouw.', text: 'De keeper start. De opbouwploeg scoort door over de middenlijn te dribbelen.' },
      { title: 'Druk.', text: 'De drukzetters winnen de bal en werken binnen 10 seconden af op groot doel.' },
      { title: 'Ritme.', text: 'Speel 3 reeksen van 5 minuten met 1 minuut rust. Tel balwinsten per reeks.' },
    ],
    easier: 'Speel 6 tegen 3 zodat de drukzetters vaker de bal winnen. Geen tijdslimiet om af te werken.',
    harder: 'Speel 6 tegen 5 en laat de opbouwploeg ook via een lange bal naar een doeltje scoren.',
    objectives: ['Druk zetten als blok', 'Verschuiven', 'Pressing-triggers herkennen', 'Balwinst op helft tegenstander'],
    coaching: [
      'Druk zetten begint bij de voorste speler: loop in een boog om de passlijn af te sluiten.',
      'Achterliggende linies schuiven mee: max. 10 m tussen de linies.',
      'Trigger: slechte aanname of pass terug → iedereen stapt in.',
      'Dwing de bal naar de zijlijn en maak het veld klein.',
    ],
    materials: [
      { name: 'Groot doel', qty: '1' },
      { name: 'Hesjes', qty: '6 + 4' },
      { name: 'Kegels', qty: '8' },
      { name: 'Ballen', qty: '8' },
    ],
    diagramSteps: [
      ['Organisatie', 'Blok van zes tegenover opbouw van vier'],
      ['Trigger', 'Pass naar de zijkant: stap in'],
      ['Balwinst', 'Druk zetten en afwerken'],
    ],
    related: [
      { id: 'trans', fit: 'Zelfde thema' },
      { id: 'pos', fit: 'Tegenhanger' },
      { id: 'rondo', fit: 'Als warming-up' },
      { id: 'game', fit: 'Als afsluiter' },
    ],
  },
  {
    id: 'game',
    title: 'Partijvorm 8 tegen 8 met zones',
    variant: 'game',
    type: 'Partijvorm',
    phase: 'Omschakelen → verdediging',
    ages: ['U14–15', 'U16–21'],
    ageLabel: 'U14 – U21',
    diff: 2,
    pmin: 16,
    players: '16',
    playersDetail: '(8 × 2)',
    min: 25,
    intensity: 5,
    field: '60 × 40 m',
    summary:
      'Een wedstrijdvorm 8 tegen 8 op twee doelen, met drie zones. Na balverlies moet de ploeg zo snel en hoog mogelijk druk zetten.',
    steps: [
      { title: 'Opstelling.', text: 'Speel op 60 × 40 m met twee grote doelen en keepers. Verdeel het veld in drie zones met kegels.' },
      { title: 'Spelen.', text: 'Vrij spel 8 tegen 8. Een doelpunt telt enkel als alle veldspelers van de scorende ploeg over de eerste zonelijn staan.' },
      { title: 'Ritme.', text: 'Speel 3 reeksen van 7 minuten met 2 minuten rust. Coach vooral tijdens de pauzes.' },
    ],
    easier: 'Schrap de zoneregel en speel vrij. Voeg eventueel een joker toe.',
    harder: 'Beperk het aantal balcontacten tot drie. Een doelpunt na balwinst in de diepste zone telt dubbel.',
    objectives: ['Wedstrijdecht spelen', 'Compact omschakelen', 'Linies bewaken', 'Teamorganisatie'],
    coaching: [
      'Na balverlies: dichtsbijzijnde speler direct druk zetten op de baldrager.',
      'Spreek elkaar aan: “ik neem hem”, “druk”, “terug”.',
      'In balbezit: gebruik de volle breedte van het veld.',
      'Laat het spel vloeien en onderbreek alleen voor een sleutelmoment.',
    ],
    materials: [
      { name: 'Grote doelen', qty: '2' },
      { name: 'Hesjes', qty: '2 × 8' },
      { name: 'Kegels', qty: '10' },
      { name: 'Ballen', qty: '10' },
    ],
    diagramSteps: [
      ['Organisatie', 'Twee ploegen, drie zones'],
      ['Balverlies', 'Oranje wint de bal centraal'],
      ['Dichtzetten', 'Paars zet de middenzone dicht'],
    ],
    related: [
      { id: 'trans', fit: 'Zelfde thema' },
      { id: 'press', fit: 'Kern' },
      { id: 'rondo', fit: 'Als warming-up' },
      { id: 'pos', fit: 'Kern' },
    ],
  },
  {
    id: 'pass',
    title: 'Passvierkant met doorbewegen',
    variant: 'passing',
    type: 'Technisch',
    phase: 'Aanvallen',
    ages: ['U6–9', 'U10–13'],
    ageLabel: 'U8 – U13',
    diff: 1,
    pmin: 8,
    players: '8',
    playersDetail: '(2 per kegel)',
    min: 12,
    intensity: 2,
    field: '15 × 15 m',
    summary:
      'Spelers passen rond in een vierkant en volgen hun bal naar de volgende kegel. Eenvoudig, veel balcontacten en ideaal om de passtechniek aan te scherpen.',
    steps: [
      { title: 'Opstelling.', text: 'Zet een vierkant van 15 × 15 m uit. Aan elke kegel staan twee spelers, de eerste rij heeft een bal.' },
      { title: 'Passen.', text: 'Speel de bal naar de volgende kegel en volg je pass. De ontvanger neemt aan in de loop en speelt door.' },
      { title: 'Richting.', text: 'Wissel na 2 minuten van richting zodat beide voeten aan bod komen.' },
      { title: 'Ritme.', text: 'Speel 4 reeksen van 2 minuten. Voeg een tweede bal toe als het vlot loopt.' },
    ],
    easier: 'Laat spelers de bal eerst stilleggen voor ze passen. Verklein het vierkant tot 10 × 10 m.',
    harder: 'Speel met één balcontact en voeg een muurpass toe vóór de kegel.',
    objectives: ['Passtechniek', 'Aanname in de loop', 'Tweevoetigheid', 'Doorbewegen'],
    coaching: [
      'Pass met de binnenkant van de voet, enkel strak.',
      'Kijk naar je ploegmaat voor je speelt.',
      'Neem aan naar de richting waar je naartoe wil spelen.',
      'Volg je pass meteen: niet blijven kijken.',
    ],
    materials: [
      { name: 'Kegels', qty: '4' },
      { name: 'Ballen', qty: '2' },
    ],
    diagramSteps: [
      ['Organisatie', 'Twee spelers per kegel'],
      ['Passen', 'Bal naar de volgende kegel'],
      ['Doorbewegen', 'Volg je pass naar de nieuwe rij'],
    ],
    related: [
      { id: 'rondo', fit: 'Zelfde thema' },
      { id: 'coord', fit: 'Als warming-up' },
      { id: 'fin', fit: 'Kern' },
      { id: 'game', fit: 'Als afsluiter' },
    ],
  },
  {
    id: 'coord',
    title: 'Coördinatieparcours met bal',
    variant: 'coordination',
    type: 'Fysiek',
    phase: 'Algemeen',
    ages: ['U6–9', 'U10–13'],
    ageLabel: 'U7 – U11',
    diff: 1,
    pmin: 4,
    players: '4–12',
    min: 10,
    intensity: 3,
    field: '25 × 10 m',
    summary:
      'Een parcours met loopladder en slalom rond kegels, afgesloten met een pass naar een ploegmaat. Speels werken aan voetenwerk en balcontrole.',
    steps: [
      { title: 'Opstelling.', text: 'Leg een loopladder neer, gevolgd door vier kegels in zigzag. Spelers starten in één of meerdere rijen.' },
      { title: 'Ladder.', text: 'Loop door de ladder met telkens één voet per vak. De bal wordt door de trainer toegespeeld aan het einde.' },
      { title: 'Slalom.', text: 'Dribbel in slalom rond de kegels en speel de bal naar de volgende speler in de rij.' },
      { title: 'Ritme.', text: 'Laat elke speler 6 tot 8 keer het parcours afleggen. Wissel de laddervorm om de 2 minuten.' },
    ],
    easier: 'Schrap de bal in de slalom en laat de kinderen eerst zonder bal het parcours lopen.',
    harder: 'Twee voeten per vak, zijwaarts door de ladder. Dribbel alleen met de buitenkant van de voet.',
    objectives: ['Voetenwerk', 'Balcontrole', 'Ritme', 'Evenwicht'],
    coaching: [
      'Op de voorvoeten lopen, armen actief mee.',
      'Kleine balcontacten in de slalom: bal dicht bij de voet.',
      'Hoofd omhoog na de laatste kegel.',
      'Kwaliteit vóór snelheid.',
    ],
    materials: [
      { name: 'Loopladder', qty: '1' },
      { name: 'Kegels', qty: '6' },
      { name: 'Ballen', qty: '6' },
    ],
    diagramSteps: [
      ['Organisatie', 'Ladder gevolgd door slalom'],
      ['Ladder', 'Snel voetenwerk door de vakken'],
      ['Slalom', 'Dribbel rond de kegels'],
    ],
    related: [
      { id: 'pass', fit: 'Als vervolg' },
      { id: 'rondo', fit: 'Als warming-up' },
      { id: 'fin', fit: 'Kern' },
      { id: 'game', fit: 'Als afsluiter' },
    ],
  },
  {
    id: 'duel',
    title: '1 tegen 1 op kleine doeltjes',
    variant: 'duel',
    type: 'Technisch',
    phase: 'Aanvallen',
    ages: ['U6–9', 'U10–13'],
    ageLabel: 'U8 – U11',
    diff: 1,
    pmin: 4,
    players: '4–12',
    playersDetail: '(2 rijen)',
    min: 12,
    intensity: 4,
    field: '20 × 12 m',
    summary:
      'Twee rijen staan elk bij een eigen doeltje. De ene speler speelt in, de andere neemt aan en gaat het duel aan: wie durft te dribbelen en de verdediger voorbij te gaan, scoort.',
    steps: [
      { title: 'Opstelling.', text: 'Zet een veld van 20 × 12 m uit met een doeltje op elke korte zijde. Achter elk doeltje staat een rij spelers, elke rij in een eigen kleur hesje.' },
      { title: 'Inspelen.', text: 'De eerste speler van paars speelt de bal diep naar de eerste speler van oranje en loopt meteen in om zijn doeltje te verdedigen.' },
      { title: 'Duel.', text: 'Oranje neemt aan en probeert in het doeltje van paars te scoren. Wint paars de bal, dan mag hij meteen op het andere doeltje scoren.' },
      { title: 'Ritme.', text: 'Speel 3 reeksen van 3 minuten met 1 minuut rust. Na elk duel sluiten beide spelers achteraan bij de andere rij aan.' },
    ],
    easier: 'Laat de verdediger pas vertrekken als de aanvaller de bal aangenomen heeft. Maak de doeltjes breder of het veld korter.',
    harder: 'Scoren mag alleen door over de doellijn te dribbelen. Elk duel moet binnen 6 seconden afgerond zijn.',
    objectives: ['Durven dribbelen', 'Aanname in de loop', 'Duelkracht', 'Omschakelen bij balverlies'],
    coaching: [
      'Neem de bal aan in de richting van het doel, niet stilleggen.',
      'Maak een schijnbeweging en versnel meteen voorbij de verdediger.',
      'Verdediger: loop snel in, rem af en sta zijdelings om de aanvaller naar buiten te sturen.',
      'Bal verloren? Meteen terug druk zetten.',
    ],
    materials: [
      { name: 'Doeltjes', qty: '2' },
      { name: 'Kegels', qty: '4' },
      { name: 'Ballen', qty: '10' },
      { name: 'Hesjes', qty: '2 × 6' },
    ],
    diagramSteps: [
      ['Organisatie', 'Twee rijen, elk bij een eigen doeltje'],
      ['Inspelen', 'Paars speelt diep in op oranje'],
      ['Duel', 'Oranje valt aan, paars loopt in om te verdedigen'],
    ],
    related: [
      { id: 'coord', fit: 'Als warming-up' },
      { id: 'rondo', fit: 'Kern' },
      { id: 'fin', fit: 'Als vervolg' },
      { id: 'game', fit: 'Als afsluiter' },
    ],
  },
  {
    id: 'game5',
    title: 'Partijvorm 5 tegen 5 op grote doelen',
    variant: 'smallgame',
    type: 'Partijvorm',
    phase: 'Algemeen',
    ages: ['U6–9', 'U10–13'],
    ageLabel: 'U8 – U13',
    diff: 1,
    pmin: 10,
    players: '10',
    playersDetail: '(2 × 4 + K)',
    min: 20,
    intensity: 4,
    field: '35 × 25 m',
    summary:
      'Twee ploegen spelen in een ruit, met keeper, verdediger, linker- en rechterflankspeler en een spits, op grote doelen. Spelers leren hun positie in de ruit houden en samen opbouwen, met veel balcontacten en doelkansen.',
    steps: [
      { title: 'Opstelling.', text: 'Zet een veld van 35 × 25 m uit met een groot doel op elke korte zijde. Elke ploeg speelt in een ruit: een keeper, één verdediger, een linker- en rechterflankspeler en een spits.' },
      { title: 'Spelen.', text: 'Vrij spel 5 tegen 5. Elke aanval start bij de keeper, die kort inspeelt: via de verdediger naar een flankspeler, die de spits zoekt. Geen lange trap.' },
      { title: 'Regels.', text: 'Gaat de bal over de zijlijn, dan wordt hij ingedribbeld of ingepast. Na een doelpunt start de andere keeper meteen opnieuw.' },
      { title: 'Ritme.', text: 'Speel 4 reeksen van 4 minuten met 1 minuut actieve rust. Wissel na elke reeks van keeper en draai de posities in de ruit door.' },
    ],
    easier: 'Voeg een joker toe die altijd met de balbezittende ploeg meespeelt (5 tegen 4 in het veld). Vergroot het veld tot 40 × 30 m.',
    harder: 'Maximaal drie balcontacten per speler.',
    objectives: ['Positie houden in de ruit', 'Opbouwen van achteruit', 'Spelen via de flanken', 'Afwerken op groot doel'],
    coaching: [
      'Keeper: speel kort in op de verdediger of een flankspeler.',
      'Flankspelers: blijf breed tegen de zijlijn, zo maak je het veld groot.',
      'Spits: bied je diep aan en loop in voor doel bij een voorzet.',
      'Balverlies? Iedereen snel terug naar zijn plaats in de ruit.',
    ],
    materials: [
      { name: 'Grote doelen', qty: '2' },
      { name: 'Hesjes', qty: '2 × 5' },
      { name: 'Kegels', qty: '8' },
      { name: 'Ballen', qty: '6' },
    ],
    diagramSteps: [
      ['Organisatie', 'Twee ploegen in ruit: keeper, verdediger, twee flankspelers en spits'],
      ['Opbouw', 'Keeper speelt via de verdediger naar de linkerflank'],
      ['Aanval', 'Flankspeler gaat diep, spits loopt in voor doel'],
    ],
    related: [
      { id: 'pass', fit: 'Als warming-up' },
      { id: 'duel', fit: 'Kern' },
      { id: 'fin', fit: 'Kern' },
      { id: 'game', fit: 'Als vervolg' },
    ],
  },
];

export const EXERCISE_BY_ID: Record<string, Exercise> = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/** Compact age label used in dense lists, e.g. "U10 – U13" → "U10–13". */
export function shortAgeLabel(label: string): string {
  return label.replace(/ – U/, '–');
}

/** Short material names used in the training builder summary. */
export function materialNames(e: Exercise): string[] {
  return e.materials.map((m) => (/^Grote? doel/.test(m.name) && m.qty !== '1' ? `${m.qty} doelen` : m.name === 'Doeltjes' ? `${m.qty} doeltjes` : m.name));
}
