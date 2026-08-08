/**
 * De inhoud van de zes stukken, in beide talen. Puur data, zodat
 * serveronderdelen ermee kunnen werken; de simulaties zelf zitten in het
 * clientregister (`components/StukView.tsx`), waar ze op `id` staan.
 *
 * De `id` is de vaste sleutel — die verandert nooit. De slug verschilt per
 * taal, zodat de URL in beide talen leest als een woord en niet als een
 * vertaling die is blijven liggen.
 */

import { LOCALES, type Locale, type Text } from "./i18n";

export type StukTekst = {
  titel: string;
  /** Korte aanduiding boven de titel. */
  kicker: string;
  /** Herkomst: wie bedacht dit, en wanneer. */
  herkomst: string;
  /** Eén zin voor de kaart op de voorpagina. */
  samenvatting: string;
  /** De regel, in losse stappen. Dit is de hele opgave. */
  regel: string[];
  /** De tekst naast de simulatie. */
  alineas: string[];
  /** Concrete dingen om te proberen aan de knoppen. */
  probeer: { titel: string; tekst: string }[];
};

export type Stuk = {
  /** Vaste sleutel, ook gebruikt door het simulatieregister. */
  id: string;
  slug: Text;
  /** Verhouding breedte : hoogte van het canvas. */
  aspect: number;
  tekst: Record<Locale, StukTekst>;
};

export const STUKKEN: Stuk[] = [
  {
    id: "zwerm",
    slug: { nl: "zwerm", en: "flock" },
    aspect: 16 / 9,
    tekst: {
      nl: {
        titel: "Zwerm",
        kicker: "Beweging",
        herkomst: "Craig Reynolds, 1986",
        samenvatting:
          "Duizend vogels, drie regels, geen leider. De vorm van de zwerm staat nergens opgeschreven.",
        regel: [
          "Kijk naar de buren binnen je zichtstraal.",
          "Stuur weg van wie te dichtbij komt.",
          "Vlieg dezelfde kant op als de rest.",
          "Blijf in de buurt van het midden van je buren.",
        ],
        alineas: [
          "Een spreeuwenwolk boven een rietveld draait, splitst en sluit zich weer, en het is bijna niet te geloven dat niemand dat aanstuurt. Craig Reynolds liet in 1986 zien dat er ook niemand voor nodig is. Zijn boids — een verbastering van *bird-oids* — kennen alleen hun directe buren en volgen drie regels: niet botsen, dezelfde richting kiezen, bij elkaar blijven.",
          "Meer is het niet. Er is geen leider, geen route, geen model van de zwerm als geheel. Elke vogel beslist puur lokaal, op basis van de handvol buren die zij toevallig ziet. De wolk die daaruit ontstaat is nergens beschreven — hij is er gewoon, zodra genoeg vogels tegelijk hetzelfde doen.",
          "Wat de simulatie zichtbaar maakt, is hoe smal het bereik is waarin het mooi wordt. Draai de cohesie op en de zwerm klontert tot een trillende bal. Draai de scheiding op en hij spat uit elkaar tot los grind. Ertussen ligt een strook waarin de zwerm vloeibaar wordt: rekbaar, samenhangend, telkens anders. Dat gebied is niet ingebouwd, het is een gevolg.",
          "De aardigheid van boids is dat ze de verleiding weerstaan om het antwoord in te bouwen. Wie een zwerm wil tekenen, kan een wolk animeren. Reynolds animeerde de vogels en liet de wolk aan de wiskunde over.",
        ],
        probeer: [
          {
            titel: "Zet cohesie op nul",
            tekst:
              "De zwerm valt niet uiteen in willekeur maar in stromen: uitlijning alleen is al genoeg voor gezamenlijke richting.",
          },
          {
            titel: "Zichtstraal omlaag naar 20",
            tekst:
              "Bij een kleine straal blijven het losse groepjes. De wolk als geheel bestaat pas als de buurkringen elkaar overlappen.",
          },
          {
            titel: "Sleep over het beeld",
            tekst:
              "De zwerm wijkt uiteen en sluit zich achter de aanwijzer weer — precies zoals bij een valk. Ook dat gedrag staat nergens.",
          },
        ],
      },
      en: {
        titel: "Flock",
        kicker: "Motion",
        herkomst: "Craig Reynolds, 1986",
        samenvatting:
          "A thousand birds, three rules, no leader. The shape of the flock is written down nowhere.",
        regel: [
          "Look at the neighbours within your field of view.",
          "Steer away from anyone who comes too close.",
          "Fly in the same direction as the rest.",
          "Stay near the centre of your neighbours.",
        ],
        alineas: [
          "A cloud of starlings over a reed bed turns, splits and closes again, and it is nearly impossible to believe that nobody is steering it. In 1986 Craig Reynolds showed that nobody needs to. His boids — a mangling of *bird-oids* — know only their immediate neighbours and follow three rules: do not collide, pick the same heading, stay together.",
          "That is all of it. There is no leader, no route, no model of the flock as a whole. Every bird decides purely locally, from the handful of neighbours it happens to see. The cloud that results is described nowhere — it is simply there, as soon as enough birds do the same thing at the same time.",
          "What the simulation makes visible is how narrow the band is in which it turns beautiful. Turn cohesion up and the flock clots into a trembling ball. Turn separation up and it scatters into loose gravel. Between the two lies a strip where the flock becomes fluid: elastic, coherent, different every time. That region is not built in. It is a consequence.",
          "The elegance of boids is that they resist the temptation to build in the answer. Anyone who wants to draw a flock could animate a cloud. Reynolds animated the birds and left the cloud to the arithmetic.",
        ],
        probeer: [
          {
            titel: "Set cohesion to zero",
            tekst:
              "The flock does not dissolve into randomness but into currents: alignment alone is enough for a shared direction.",
          },
          {
            titel: "Drop the field of view to 20",
            tekst:
              "With a small radius you get scattered clusters. The cloud as a whole exists only once the neighbourhoods overlap.",
          },
          {
            titel: "Drag across the canvas",
            tekst:
              "The flock parts and closes again behind the pointer — exactly as it does for a falcon. That behaviour is written down nowhere either.",
          },
        ],
      },
    },
  },
  {
    id: "patroon",
    slug: { nl: "patroon", en: "pattern" },
    aspect: 16 / 10,
    tekst: {
      nl: {
        titel: "Patroon",
        kicker: "Chemie",
        herkomst: "Alan Turing, 1952 · Gray en Scott, 1984",
        samenvatting:
          "Twee stoffen die elkaar opeten en wegdrijven. Uit een egale vloeistof komen vlekken, strepen en kronkels.",
        regel: [
          "Stof A wordt aangevuld, stof B wordt afgevoerd.",
          "Waar B is, eet B stof A op en maakt daarbij meer B.",
          "Beide stoffen verspreiden zich, B trager dan A.",
        ],
        alineas: [
          "In 1952 publiceerde Alan Turing *The chemical basis of morphogenesis*, een van de weinige artikelen waarin een wiskundige uitlegt hoe een luipaard aan zijn vlekken komt. Zijn stelling: je hebt geen bouwtekening nodig. Twee stoffen die op elkaar reageren en verschillend snel door weefsel trekken, produceren vanzelf een patroon — mits de remmer sneller reist dan de aanjager.",
          "Dat is contra-intuïtief. Diffusie is juist het proces dat verschillen gladstrijkt: een druppel inkt in water verdwijnt, hij verschijnt niet. Turing liet zien dat diffusie in combinatie met de juiste reactie het omgekeerde doet, en dat een volmaakt egale vloeistof daardoor instabiel kan zijn. Elke minieme oneffenheid groeit uit tot structuur.",
          "Hierboven draait de variant van Gray en Scott, met twee draaiknoppen: hoeveel A erbij komt en hoeveel B verdwijnt. Twee getallen, en daarmee ligt de hele wereld vast. Een klein stukje van dat vlak geeft stippen, een stukje ernaast strepen, en op de grens tussen twee gebieden krijg je patronen die nooit tot rust komen: kronkels die blijven splitsen en oplossen.",
          "Turing schreef het artikel twee jaar voor zijn dood. Dat biologen zijn patronen daadwerkelijk in vissenhuid en vachten zouden terugvinden, heeft hij niet meegemaakt.",
        ],
        probeer: [
          {
            titel: "Mitose",
            tekst:
              "Blobs die groeien tot ze te groot worden en dan splitsen. Het lijkt op celdeling, maar er zit geen cel in — alleen twee getallen.",
          },
          {
            titel: "Schuif de afvoer k met 0,001 op",
            tekst:
              "Bij sommige waarden verandert er nauwelijks iets; op andere plekken kantelt het beeld van stippen naar strepen. Het vlak zit vol randen.",
          },
          {
            titel: "Teken met de muis",
            tekst:
              "Je voegt stof B toe. Wat er groeit hangt niet af van je streek maar van de instelling: het systeem trekt zich weinig aan van je bedoeling.",
          },
        ],
      },
      en: {
        titel: "Pattern",
        kicker: "Chemistry",
        herkomst: "Alan Turing, 1952 · Gray and Scott, 1984",
        samenvatting:
          "Two substances that consume one another and drift apart. Out of an even liquid come spots, stripes and worms.",
        regel: [
          "Substance A is replenished, substance B is drained away.",
          "Where B is present, B eats A and makes more B in the process.",
          "Both substances diffuse, B more slowly than A.",
        ],
        alineas: [
          "In 1952 Alan Turing published *The chemical basis of morphogenesis*, one of the few papers in which a mathematician explains how a leopard comes by its spots. His claim: you need no blueprint. Two substances that react with one another and travel through tissue at different speeds will produce a pattern by themselves — provided the inhibitor travels faster than the activator.",
          "This is counter-intuitive. Diffusion is precisely the process that smooths differences away: a drop of ink in water disappears, it does not appear. Turing showed that diffusion, combined with the right reaction, does the opposite, and that a perfectly even liquid can therefore be unstable. Any minute irregularity grows into structure.",
          "What runs above is the Gray-Scott variant, with two dials: how much A is added and how much B is removed. Two numbers, and with them the entire world is fixed. One small region of that plane gives spots, the region beside it gives stripes, and on the border between two regions you get patterns that never settle: worms that keep splitting and dissolving.",
          "Turing wrote the paper two years before his death. He did not live to see biologists find his patterns in fish skin and animal coats.",
        ],
        probeer: [
          {
            titel: "Mitosis",
            tekst:
              "Blobs that grow until they are too large and then divide. It looks like cell division, but there is no cell in it — only two numbers.",
          },
          {
            titel: "Nudge the kill rate k by 0.001",
            tekst:
              "At some values almost nothing changes; elsewhere the image tips from spots to stripes. The plane is full of edges.",
          },
          {
            titel: "Draw with the mouse",
            tekst:
              "You are adding substance B. What grows depends not on your stroke but on the settings: the system cares very little about your intent.",
          },
        ],
      },
    },
  },
  {
    id: "regel",
    slug: { nl: "regel", en: "rule" },
    aspect: 3 / 2,
    tekst: {
      nl: {
        titel: "Regel",
        kicker: "Rekenen",
        herkomst: "Stephen Wolfram, 1983",
        samenvatting:
          "Een rij cellen, acht mogelijke buurstanden, één byte aan regels. Genoeg voor iets wat niet van willekeur te onderscheiden is.",
        regel: [
          "Elke cel kijkt naar zichzelf en haar linker- en rechterbuur.",
          "Die drie cellen geven acht mogelijke combinaties.",
          "Voor elke combinatie ligt vast of de cel aan of uit gaat.",
          "Die acht antwoorden vormen samen één getal: de regel.",
        ],
        alineas: [
          "Dit is zo ongeveer het eenvoudigste rekenapparaat dat je kunt bedenken. Een rij hokjes, elk aan of uit. Elke stap kijkt elk hokje naar zichzelf en zijn twee buren, zoekt die stand op in een tabel van acht regels, en neemt de uitkomst over. De tabel is acht bits groot, dus er bestaan precies 256 verschillende automaten. Ze zijn allemaal onderzocht.",
          "De meeste zijn saai. Ze sterven uit, ze vullen het scherm, of ze maken keurige driehoeken die zich eindeloos herhalen. Maar regel 30 begint met één zwarte cel en produceert daarna een beeld dat aan de linkerkant regelmatig blijft en aan de rechterkant chaotisch wordt — zo chaotisch dat de middelste kolom decennialang als toevalsgenerator is gebruikt, onder meer in Mathematica.",
          "Regel 110 doet iets vreemders. Tussen de strepen door schuiven kleine stabiele structuurtjes die elkaar inhalen, botsen en veranderen. In 2004 bewees Matthew Cook dat je met die botsingen kunt rekenen: regel 110 is universeel, net zo krachtig als welke computer dan ook. Eén rij hokjes, acht regels, en er past een volledige programmeertaal in.",
          "Dat is het ongemakkelijke aan deze bladzijde. Bij de zwerm en het patroon kun je nog uitleggen waaróm het eruitziet zoals het eruitziet. Hier is de kortste beschrijving van wat regel 30 doet: regel 30 uitvoeren. Er is geen formule die vooruitloopt op de uitkomst.",
        ],
        probeer: [
          {
            titel: "Regel 30",
            tekst:
              "Begint met één cel. Links ontstaat regelmaat, rechts niet. Dezelfde regel, hetzelfde begin — en toch twee werelden in één beeld.",
          },
          {
            titel: "Regel 110",
            tekst:
              "Zoek de schuine strepen die door het achtergrondpatroon lopen. Waar twee elkaar kruisen, wordt gerekend.",
          },
          {
            titel: "Regel 90",
            tekst:
              "De driehoek van Sierpiński, uit een rij hokjes. Dezelfde figuur als bij de L-systemen, langs een heel andere weg.",
          },
        ],
      },
      en: {
        titel: "Rule",
        kicker: "Computation",
        herkomst: "Stephen Wolfram, 1983",
        samenvatting:
          "A row of cells, eight possible neighbourhoods, one byte of rules. Enough for something indistinguishable from randomness.",
        regel: [
          "Every cell looks at itself and its left and right neighbour.",
          "Those three cells give eight possible combinations.",
          "For each combination it is fixed whether the cell turns on or off.",
          "Those eight answers together form a single number: the rule.",
        ],
        alineas: [
          "This is about the simplest computing device you could devise. A row of boxes, each on or off. At every step each box looks at itself and its two neighbours, finds that configuration in a table of eight lines, and adopts the result. The table is eight bits wide, so there are exactly 256 different automata. All of them have been examined.",
          "Most are dull. They die out, they fill the screen, or they make tidy triangles that repeat forever. But rule 30 starts from a single black cell and then produces an image that stays regular on the left and turns chaotic on the right — so chaotic that its centre column served for decades as a random number generator, in Mathematica among others.",
          "Rule 110 does something stranger. Between the stripes, small stable structures glide along, overtaking one another, colliding, changing. In 2004 Matthew Cook proved that you can compute with those collisions: rule 110 is universal, as powerful as any computer whatsoever. One row of boxes, eight lines of rules, and a complete programming language fits inside.",
          "That is the uncomfortable thing about this page. For the flock and the pattern you can still explain *why* it looks the way it looks. Here, the shortest description of what rule 30 does is: run rule 30. There is no formula that gets ahead of the outcome.",
        ],
        probeer: [
          {
            titel: "Rule 30",
            tekst:
              "Starts from one cell. Regularity forms on the left, none on the right. Same rule, same beginning — and yet two worlds in one image.",
          },
          {
            titel: "Rule 110",
            tekst:
              "Look for the diagonal stripes running through the background texture. Where two of them cross, computation happens.",
          },
          {
            titel: "Rule 90",
            tekst:
              "The Sierpiński triangle, out of a row of boxes. The same figure as in the L-systems, by an entirely different route.",
          },
        ],
      },
    },
  },
  {
    id: "stroming",
    slug: { nl: "stroming", en: "flow" },
    aspect: 3 / 2,
    tekst: {
      nl: {
        titel: "Stroming",
        kicker: "Tekening",
        herkomst: "Perlin, 1983 · gemeengoed in generatieve kunst",
        samenvatting:
          "Duizenden deeltjes volgen een onzichtbaar veld van hoeken. Niemand bepaalt de compositie.",
        regel: [
          "Over het vlak ligt een veld: elk punt heeft een hoek.",
          "Elk deeltje kijkt welke hoek hier geldt.",
          "Het zet een stap die kant op en tekent het spoor.",
          "Meer niet — herhaal een paar miljoen keer.",
        ],
        alineas: [
          "Een stromingsveld is de goedkoopste manier om een tekening te maken die eruitziet alsof iemand hem gemaakt heeft. Onder het beeld ligt een veld van hoeken, meestal afgeleid uit ruis: een functie die voor elk punt in het vlak een waarde teruggeeft die dicht bij die van de buurpunten ligt, maar niet voorspelbaar is. Ken Perlin bedacht die functie in 1983 voor de wolken en het marmer van *Tron*, en kreeg er later een Oscar voor.",
          "De deeltjes zijn dom. Ze weten niet waar ze vandaan komen, niet waar de andere deeltjes zijn, en al helemaal niet hoe de tekening ervoor staat. Ze lezen de hoek onder zich, zetten een stap, en laten een streepje achter. Dat de sporen samen bundels vormen — met wervels, kruisingen en gebieden waar niets gebeurt — komt niet doordat iemand die heeft ingetekend. Het komt doordat naburige deeltjes een bijna gelijke hoek lezen en dus een tijdlang naast elkaar blijven lopen.",
          "Dit is het stuk waar het minst valt uit te leggen en het meest valt te kijken. De aardigheid zit in de schaal van het veld: bij een grove schaal draaien duizenden deeltjes met dezelfde beweging mee en krijg je een enkel groot gebaar; bij een fijne schaal loopt iedereen langs elkaar heen en blijft er vilt over. Ertussen ligt het gebied waarin de tekening structuur heeft zonder herhaling.",
          "Elke tekening hier is eenmalig. Het toevalszaad bepaalt het veld, het veld bepaalt de rest; met dezelfde instellingen en een ander zaad krijg je een compositie die je nooit meer terugvindt. De knop *Bewaar PNG* legt vast wat er op dat moment staat.",
        ],
        probeer: [
          {
            titel: "Schaal op 0,0008",
            tekst:
              "Één groot gebaar over het hele vlak. Alle deeltjes lezen bijna dezelfde hoek en bewegen als een enkele stroom.",
          },
          {
            titel: "Levensduur kort, penseel dik",
            tekst:
              "Korte, dikke halen in plaats van lange lijnen. Hetzelfde veld, een heel ander handschrift.",
          },
          {
            titel: "Verloop in de tijd omhoog",
            tekst:
              "Nu draait het veld zelf ook. De tekening wordt een opname van een stroom die verandert terwijl hij getekend wordt.",
          },
        ],
      },
      en: {
        titel: "Flow",
        kicker: "Drawing",
        herkomst: "Perlin, 1983 · common property in generative art",
        samenvatting:
          "Thousands of particles follow an invisible field of angles. Nobody decides the composition.",
        regel: [
          "A field lies over the plane: every point has an angle.",
          "Each particle reads the angle that applies here.",
          "It takes a step that way and draws the trace.",
          "Nothing more — repeat a few million times.",
        ],
        alineas: [
          "A flow field is the cheapest way to make a drawing that looks as though somebody made it. Underneath the image lies a field of angles, usually derived from noise: a function that returns, for every point in the plane, a value close to those of its neighbours but not predictable. Ken Perlin devised that function in 1983 for the clouds and marble of *Tron*, and later received an Academy Award for it.",
          "The particles are stupid. They do not know where they came from, where the other particles are, or anything at all about how the drawing is coming along. They read the angle beneath them, take a step, and leave a short stroke behind. That the traces form bundles together — with eddies, crossings and regions where nothing happens — is not because somebody drew them in. It is because neighbouring particles read almost the same angle and therefore travel side by side for a while.",
          "This is the piece with the least to explain and the most to look at. The interest is in the scale of the field: at a coarse scale thousands of particles turn with the same motion and you get one large gesture; at a fine scale everyone walks past everyone else and what remains is felt. In between lies the region where the drawing has structure without repetition.",
          "Every drawing here happens once. The random seed determines the field, the field determines the rest; with the same settings and a different seed you get a composition you will never find again. The *Save PNG* button fixes whatever is on screen at that moment.",
        ],
        probeer: [
          {
            titel: "Scale at 0.0008",
            tekst:
              "One large gesture across the whole plane. Every particle reads almost the same angle and they move as a single current.",
          },
          {
            titel: "Short lifespan, thick brush",
            tekst:
              "Short, heavy strokes instead of long lines. The same field, an entirely different hand.",
          },
          {
            titel: "Turn up drift over time",
            tekst:
              "Now the field itself rotates too. The drawing becomes a recording of a current that changes while it is being drawn.",
          },
        ],
      },
    },
  },
  {
    id: "groei",
    slug: { nl: "groei", en: "growth" },
    aspect: 4 / 3,
    tekst: {
      nl: {
        titel: "Groei",
        kicker: "Taal",
        herkomst: "Aristid Lindenmayer, 1968",
        samenvatting:
          "Vervang elk teken door een langere reeks, en lees het resultaat als een plant.",
        regel: [
          "Begin met een korte tekenreeks: het axioma.",
          "Vervang elk teken tegelijk volgens een vaste tabel.",
          "Herhaal dat een paar keer.",
          "Lees de uitkomst als instructies: vooruit, links, rechts, tak.",
        ],
        alineas: [
          "Aristid Lindenmayer was bioloog, geen informaticus. Hij bestudeerde draadalgen en zocht een notatie voor hoe zo'n draad zich vertakt. Wat hij in 1968 opschreef was een grammatica: een handjevol vervangingsregels die je op zichzelf blijft toepassen. Elk teken wordt in één klap vervangen — alle cellen delen tegelijk, precies zoals in weefsel.",
          "Het aardige zit in de omvang. De varen hierboven staat volledig vast in twee regels: X wordt `F+[[X]-X]-F[-FX]+X` en F wordt `FF`. Zes generaties later is dat een reeks van tienduizenden tekens, en getekend is het een blad met blaadjes met blaadjes. De beschrijving is korter dan de tekening met ruime marge, en dat is precies wat een zaadje ook doet.",
          "Vertakking is de hele truc, en die zit in de haakjes. Een `[` onthoudt waar de schildpad staat en welke kant zij op kijkt; een `]` zet haar daar terug. Zonder haakjes krijg je krommen — de sneeuwvlok, de drakenkromme — met haakjes krijg je planten. Dat is het verschil tussen een lijn en een organisme, uitgedrukt in twee leestekens.",
          "Zet de willekeur op nul en hetzelfde systeem geeft altijd exact dezelfde plant. Dat is het onbevredigende aan een wiskundige varen, en de reden dat de knop ernaast staat: een beetje ruis op elke hoek, en er komen twee varens uit die duidelijk familie zijn en toch niet hetzelfde.",
        ],
        probeer: [
          {
            titel: "Draaihoek langzaam verdraaien",
            tekst:
              "Dezelfde regels, alleen een andere hoek: van rechtopstaand naar hangend naar iets wat op zeewier lijkt.",
          },
          {
            titel: "Willekeur op ± 8°",
            tekst:
              "De regelmaat verdwijnt en de plant wordt aannemelijk. Precisie was blijkbaar het probleem.",
          },
          {
            titel: "Drakenkromme, twaalf generaties",
            tekst:
              "Twee regels van drie tekens. De kromme raakt zichzelf nergens, hoe vaak je ook doorgaat.",
          },
        ],
      },
      en: {
        titel: "Growth",
        kicker: "Language",
        herkomst: "Aristid Lindenmayer, 1968",
        samenvatting:
          "Replace every character with a longer string, and read the result as a plant.",
        regel: [
          "Start with a short string: the axiom.",
          "Replace every character at once according to a fixed table.",
          "Repeat that a few times.",
          "Read the result as instructions: forward, left, right, branch.",
        ],
        alineas: [
          "Aristid Lindenmayer was a biologist, not a computer scientist. He studied filamentous algae and was looking for a notation for the way such a filament branches. What he wrote down in 1968 was a grammar: a handful of replacement rules that you keep applying to their own output. Every character is replaced in a single sweep — all cells divide at the same time, exactly as they do in tissue.",
          "The pleasure is in the sizes involved. The fern above is fully specified by two rules: X becomes `F+[[X]-X]-F[-FX]+X` and F becomes `FF`. Six generations later that is a string of tens of thousands of characters, and drawn out it is a frond with fronds with fronds. The description is shorter than the drawing by a wide margin, which is precisely what a seed manages too.",
          "Branching is the whole trick, and it lives in the brackets. A `[` remembers where the turtle stands and which way it faces; a `]` puts it back there. Without brackets you get curves — the snowflake, the dragon curve — with brackets you get plants. That is the difference between a line and an organism, expressed in two punctuation marks.",
          "Set the jitter to zero and the same system yields exactly the same plant every time. That is the unsatisfying thing about a mathematical fern, and the reason the dial sits beside it: a little noise on every turn, and out come two ferns that are plainly related and still not the same.",
        ],
        probeer: [
          {
            titel: "Turn the angle slowly",
            tekst:
              "The same rules, only a different angle: from upright to drooping to something resembling seaweed.",
          },
          {
            titel: "Jitter at ± 8°",
            tekst:
              "The regularity disappears and the plant becomes plausible. Precision, apparently, was the problem.",
          },
          {
            titel: "Dragon curve, twelve generations",
            tekst:
              "Two rules of three characters. The curve never touches itself, however far you take it.",
          },
        ],
      },
    },
  },
  {
    id: "zandhoop",
    slug: { nl: "zandhoop", en: "sandpile" },
    aspect: 1,
    tekst: {
      nl: {
        titel: "Zandhoop",
        kicker: "Instorting",
        herkomst: "Bak, Tang en Wiesenfeld, 1987",
        samenvatting:
          "Korrel voor korrel, en af en toe stort het in. De hoop houdt zichzelf precies op de rand.",
        regel: [
          "Op elk vakje ligt een stapeltje korrels.",
          "Liggen er vier of meer, dan stort het vakje in.",
          "Bij instorting gaat er één korrel naar elk van de vier buren.",
          "Buren kunnen daardoor zelf instorten. Herhaal tot alles stil is.",
        ],
        alineas: [
          "Per Bak wilde weten waarom natuurverschijnselen zo vaak dezelfde statistiek volgen: veel kleine gebeurtenissen, af en toe een grote, en geen typische maat ertussen. Aardbevingen, bosbranden, uitstervingsgolven. Zijn antwoord uit 1987 heet zelfgeorganiseerde kritikaliteit, en het model erbij is een zandhoop.",
          "Laat korrels op één punt vallen. In het begin gebeurt er niets bijzonders. Zodra de hoop een zekere steilte bereikt, veroorzaakt de volgende korrel een lawine — meestal een van drie vakjes, soms een die over het hele veld loopt. Er is geen instelling die dat regelt. De hoop stelt zichzelf in op de toestand waarin lawines van alle formaten voorkomen, en blijft daar hangen.",
          "Dat 'abels' in de naam is een wiskundige belofte: het maakt niet uit in welke volgorde je de instortingen afhandelt. Begin linksboven of rechtsonder, handel ze om en om af — de eindstand is identiek. Dat is opmerkelijk, want de weg ernaartoe verschilt volledig.",
          "Wat er bij één bron ontstaat is bovendien geen hoop maar een figuur: een vierkant met driehoeken erin, zelfgelijkvormig, tot op vandaag niet volledig verklaard. Er bestaat een bewijs dat het patroon naar een vaste limietvorm toe groeit, maar de driehoekjes zelf ontsnappen nog altijd aan een gesloten beschrijving. Het is een fractaal die niemand heeft ontworpen en die uit vier woorden regelgeving volgt.",
        ],
        probeer: [
          {
            titel: "Laat lang doorlopen",
            tekst:
              "Het patroon groeit zelfgelijkvormig: elke verdubbeling van het aantal korrels geeft dezelfde figuur, groter.",
          },
          {
            titel: "Zet de bron op regen",
            tekst:
              "Geen figuur maar ruis — en toch precies dezelfde lawinestatistiek. Dit is de kritieke toestand waar Bak het over had.",
          },
          {
            titel: "Klik ergens in het patroon",
            tekst:
              "Een schep zand op de verkeerde plek. Kijk hoe ver de lawine loopt voordat alles weer stil ligt.",
          },
        ],
      },
      en: {
        titel: "Sandpile",
        kicker: "Collapse",
        herkomst: "Bak, Tang and Wiesenfeld, 1987",
        samenvatting:
          "Grain by grain, and every so often it collapses. The pile holds itself exactly at the edge.",
        regel: [
          "Every square holds a small stack of grains.",
          "If it holds four or more, the square topples.",
          "On toppling, one grain goes to each of the four neighbours.",
          "Neighbours may topple in turn. Repeat until everything is still.",
        ],
        alineas: [
          "Per Bak wanted to know why natural phenomena so often follow the same statistics: many small events, occasionally a large one, and no typical size in between. Earthquakes, forest fires, extinction waves. His answer, from 1987, is called self-organised criticality, and the model that came with it is a sandpile.",
          "Drop grains on a single point. At first nothing remarkable happens. Once the pile reaches a certain steepness, the next grain triggers an avalanche — usually one of three squares, sometimes one that runs across the entire field. There is no setting that governs this. The pile tunes itself to the state in which avalanches of every size occur, and stays there.",
          "The word 'abelian' in the name is a mathematical promise: it does not matter in what order you resolve the topplings. Start top left or bottom right, alternate between them — the final state is identical. That is remarkable, because the route there differs completely.",
          "What forms from a single source is moreover not a pile but a figure: a square with triangles inside it, self-similar, and to this day not fully explained. There is a proof that the pattern converges on a fixed limiting shape, but the little triangles themselves still escape any closed description. It is a fractal nobody designed, following from four sentences of legislation.",
        ],
        probeer: [
          {
            titel: "Let it run for a long time",
            tekst:
              "The pattern grows self-similarly: every doubling of the number of grains gives the same figure, larger.",
          },
          {
            titel: "Set the source to rain",
            tekst:
              "No figure, just noise — and yet exactly the same avalanche statistics. This is the critical state Bak was talking about.",
          },
          {
            titel: "Click somewhere inside the pattern",
            tekst:
              "A shovelful of sand in the wrong place. Watch how far the avalanche runs before everything settles again.",
          },
        ],
      },
    },
  },
];

const BY_ID: Record<string, Stuk> = Object.fromEntries(
  STUKKEN.map((s) => [s.id, s]),
);

/** Slug → stuk, per taal. Vooraf opgebouwd; het zijn er maar twaalf. */
const BY_SLUG: Record<Locale, Record<string, Stuk>> = Object.fromEntries(
  LOCALES.map((locale) => [
    locale,
    Object.fromEntries(STUKKEN.map((s) => [s.slug[locale], s])),
  ]),
) as Record<Locale, Record<string, Stuk>>;

export function getStukById(id: string): Stuk | undefined {
  return BY_ID[id];
}

export function getStukBySlug(locale: Locale, slug: string): Stuk | undefined {
  return BY_SLUG[locale][slug];
}

export function buren(id: string): { vorige: Stuk; volgende: Stuk } | null {
  const index = STUKKEN.findIndex((s) => s.id === id);
  if (index === -1) return null;
  return {
    vorige: STUKKEN[(index - 1 + STUKKEN.length) % STUKKEN.length],
    volgende: STUKKEN[(index + 1) % STUKKEN.length],
  };
}
