/**
 * Order of the "Aanbevolen" sort on the Oefeningen dashboard: the most valuable, essential exercises first.
 *
 * Ranked on four things: how close the exercise is to the real game, how widely it applies (ages, group
 * size, themes), whether it is a proven classic in youth football, and how many ball contacts and
 * decisions it gives per minute. Within each tier the themes are mixed, so the top of the list shows a
 * varied set (rondo, partijvorm, 1 tegen 1, passing, afwerken, …) rather than one kind of exercise.
 *
 * Every exercise id appears exactly once (scripts/sync-design.py checks this). Put a new exercise in the
 * tier that fits it; an id missing from this list sorts at the end.
 */
export const RECOMMENDED: string[] = [
  // 1 · Essentieel: de klassiekers die in elke jeugdwerking thuishoren. Spelecht, breed inzetbaar,
  //     veel balcontacten, eenvoudig te organiseren.
  'rondo', // Rondo 4 tegen 1
  'game5', // Partijvorm 5 tegen 5 op grote doelen
  'duel', // 1 tegen 1 op kleine doeltjes
  'pass', // Passvierkant met doorbewegen
  'funino', // Funino: 3 tegen 3 op vier doeltjes
  'r52', // Rondo 5 tegen 2
  'fshot', // Aannemen en schieten vanaf de zestien
  'trans', // Omschakelen 4 tegen 4 op vier doeltjes
  'pten', // Tienpassenspel 5 tegen 5
  'dbox', // Dribbelvak met opdrachten
  'd2v1', // 2 tegen 1 naar doel
  'pos', // Positiespel 5 tegen 5 + 3
  'cmastery', // Balbeheersing: tikjes, zoolrol en V-beweging
  'prcp', // Tegendruk: 5 seconden om terug te winnen
  'pr1v1', // 1 tegen 1 verdedigen: aansluiten en afremmen
  'dgates', // Poortjesspel 1 tegen 1
  'psbuild', // Opbouwen tegen druk: 4 + K tegen 2
  'wprev', // Loopscholing en blessurepreventie
  'game', // Partijvorm 8 tegen 8 met zones
  'gkshot', // Schotstoppen vanuit de startpositie

  // 2 · Sterke basis: bewezen oefeningen die een kernthema goed uitdiepen, voor de meeste leeftijden.
  'pwall', // Kaatsen: één-twee-race naar het doeltje
  'ps43', // Positiespel 4 tegen 4 + 3 jokers
  'fcross', // Afwerken na voorzet
  'dfeint', // Schijnbewegingen: passeren en versnellen
  'omwinner', // Winnaar blijft: 2 tegen 2 met wisselende duo's
  'omwave2', // Omschakel-waves 2 tegen 2 op vier doeltjes
  'omwave2k', // Omschakel-waves 2 tegen 2 met kaatsers
  'rcircle', // Kringrondo 7 tegen 2
  'sgnum', // Nummerspel: 1 tegen 1 tot 3 tegen 3
  'pr2v2', // 2 tegen 2: druk en dekking
  'py', // Passvorm in Y met kaatsbal
  'fcounter', // 3 tegen 2 afwerken na omschakeling
  'sggates', // Poortjesspel 4 tegen 4
  'gkhand', // Vangen in W-vorm
  'psswitch', // Van kant wisselen: 4 tegen 4 + 2 op vier doeltjes
  'dturns', // Draaibewegingen aan de kegel
  'omrestart', // Doorlopend 4 tegen 4 op grote doelen
  'fin', // Afwerken na combinatie
  'rduo', // Rondo 4 tegen 2 in duo's
  'przone', // Partijvorm met pressingzone
  'pscan', // Aannemen met schouderblik
  'frebound', // Schieten en opvolgen
  'sgend', // Eindzonespel 4 tegen 4
  'r31', // Rondo 3 tegen 1
  'dline', // Dribbelvoetbal 3 tegen 3 over de lijn
  'obsplit', // Doeltrap: splitsen en uitspelen 2 + K tegen 1
  'fcutback', // Terugleggen vanaf de achterlijn
  'wchain', // Kettingtikkertje
  'cladder', // Loopladder: voetpatronen met kaatsbal
  'gs11', // Preventie-opwarming voor groeiende spelers
  'gk1v1', // 1 tegen 1: uitkomen en blokken
  'pdiamond', // Ruitpassen met derde man
  'om32', // Overtal heen, ondertal terug
  'dchase', // 1 tegen 1 met achtervolger
  'sgwing', // Partijvorm 4 tegen 4 + 2 flankjokers
  'prcurve', // Druk zetten in een boog: 1 tegen 2
  'r412', // Rondo 4 + 1 tegen 2 met middenspeler
  'psquad', // Kwadrantenspel: maximaal twee per vak
  'fcircuit', // Schietcarrousel rond de zestien
  'obgame', // Opbouwspel 6 + K tegen 6 op drie doeltjes
  'obfree', // Loskomen van de 3 en de 10: K + 2 tegen 2
  'obzones', // Positiespel in twee vakken: opbouw via de keeper
  'obwave', // K + 5 tegen K + 4: opbouwen in golven
  'wmatch', // Wedstrijdopwarming in vier delen
  'pthrough', // Steekpass in de loop
  'gklow', // Lage ballen opscheppen
  'dshield', // Bal afschermen 1 tegen 1

  // 3 · Waardevol en gerichter: goede oefeningen voor een specifiek thema, een leeftijd of een
  //     bepaald niveau.
  'press', // Druk zetten in blok 6 tegen 4
  'sgbuild', // Partijvorm 6 tegen 6 met opbouwzone
  'cagility', // Wendbaarheid: T-parcours
  'gsnordic', // Hamstrings en liezen: Nordic en Copenhagen in duo’s
  'kcircuit', // Krachtcircuit met eigen lichaamsgewicht
  'ksprint', // Maximale sprintsnelheid: vliegende sprints
  'rcolor', // Kleurenrondo 6 tegen 3
  'dback', // 1 tegen 1 met de rug naar doel
  'sgman', // Mandekking 4 tegen 4
  'prshift', // Verschuiven als blok: over de rivier
  'obsix', // Vrijlopen van de zes: opbouw 3 + K tegen 2
  'fplace', // Plaatsen in de hoeken
  'omduel', // Omschakelduel 1 tegen 1
  'pgates', // Passen door poortjes
  'dking', // Koning van het vak
  'gkangle', // Positie kiezen: de hoek verkleinen
  'sgblock', // Partijvorm 5 tegen 5: doorschuiven als blok
  'omcounter', // Balwinst op eigen helft en counteren: 6 tegen 6
  'wtennis', // Voetbaltennis
  'psflank', // Driehoek op de flank
  'prtrig', // Pressing op de trigger: terugspeelbal
  'crelay', // Hindernisestafette met bal
  'pline', // Passen in lijnen: pass en volg
  'gkdist', // Uitworp en uittrap naar doeltjes
  'obline', // Rustig uitspelen: 3 + K tegen 2 met terugtreklijn
  'sg2v2', // Intervalpartijtjes 2 tegen 2
  'krepeat', // Herhaalde sprints met afwerking
  'omback', // Na balverlies achter de bal: 5 tegen 5
  'fgame', // Schietspel 2 tegen 2 met kaatsers
  'rpress', // Rondo 4 tegen 2 met uitweg voor de verdedigers
  'ps3z', // Overspelen in drie vakken
  'obwall', // Verticale pass op de spits en de kaatsbal
  'sgavv', // Aanval tegen verdediging: 6 tegen 4 + K
  'cstar', // Sterloop met kleurkegels
  'gsland', // Afremmen en draaien met kniecontrole
  'gkdive', // Leren vallen: van knielend naar staand
  'prhunt', // Jagers en dribbelaars
  'rdeep', // Rondo 5 tegen 2 met diepe pass naar de spits
  'omrecover', // Terugsprinten achter de bal: 3 tegen 2 + 1
  'psshape', // Positiespel 6 tegen 4 met vaste posities
  'coord', // Coördinatieparcours met bal
  'wreact', // Reactiestart op signaal
  'gkback', // Terugspeelbal onder druk
  'obswitch', // Van kant wisselen via de keeper: 4 + K tegen 3

  // 4 · Aanvullend: specialistische of meer beperkte oefeningen, sterk als variatie of voor een
  //     specifiek aandachtspunt.
  'fvolley', // Volley en halve volley
  'r22', // Rondo 2 tegen 2 met vier kaatsers
  'omwaves', // Golfaanvallen 2 tegen 1
  'plong', // Lange pass: van kant wisselen
  'prunder', // Onderaantal verdedigen: 2 tegen 3
  'obdrive', // Indribbelen door de centrale verdediger
  'wjuggle', // Balgevoel: hoog houden
  'psline', // Spelen tussen de linies: middenzone
  'gkcross', // Hoge ballen: voorzetten klemmen
  'prbuild', // Druk zetten op de opbouw: 3 tegen 2 + K
  'whand', // Handbalvoetbal
  'ccircuit', // Coördinatiecircuit in vier posten
  'rtrans', // Omschakelrondo in twee vakken
  'omkeeper', // Snelle counter via de keeper
  'cbalance', // Evenwichtsduels in duo's
  'gscool', // Cooling-down: mobiliteit en romp voor groeiende spelers
  'fheader', // Koppen op doel
  'obdrop', // Uitzakkende zes: opbouwen met drie achteraan
  'oblong', // Lange bal op de spits en de tweede bal
  'wduel', // Wie is eerst aan de bal?
  'cjump', // Springen en landen over hordetjes
  'kplyo', // Explosiviteit: sprongen en bounds
  'omrondo', // Van rondo naar counter
  'gkrebound', // Dubbele redding: opstaan en opnieuw
  'obkeeper', // Kort of lang: de keeper beslist
  'psshadow', // Schaduwopbouw: patronen zonder tegenstander
  'ctwoball', // Dribbelen met een bal in de handen
  'prelay', // Passestafette
  'wshadow', // Schaduwlopen in duo's
  'cdrop', // Vallende bal: reageren voor de tweede stuit
  'wthrow', // Werpen en terugspelen in duo's
];

const RANK = new Map(RECOMMENDED.map((id, i) => [id, i]));

/** Position in the "Aanbevolen" order; exercises missing from RECOMMENDED sort at the end. */
export const recommendedRank = (id: string) => RANK.get(id) ?? RECOMMENDED.length;
