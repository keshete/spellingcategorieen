// Staal-categorieën van groep 5 tot en met 8 (nummers en namen volgens Staal).
// Ze komen achter de categorieën van groep 4, in de volgorde van de nummers.
// Uitleg, woorden en figuren zijn eigen werk. Zie INHOUD.md.
//
// groep: in welke groep je de categorie leert (7 = groep 7 en 8).
// gat: zie categorieen.js. Een woord kan ook een object zijn: { w, deel, fout }.
CATEGORIEEN.push(
  // ---------- groep 5 ----------
  {
    nr: 13, groep: 5, naam: "Kilowoord", kleur: "#26a69a", figuur: "🥝", figuurNaam: "Kiwi Kilo",
    regel: "Ik hoor /ie/ aan het eind van een klankgroep, maar ik schrijf i.",
    tip: "Denk aan één i aan het eind van het stukje: ki-lo!",
    uitleg: "Ik ben Kiwi Kilo! Hak het woord in stukjes: ki-lo. Je hoort ie, maar aan het eind van een stukje schrijf je maar één i.",
    woorden: ["kilo", "kiwi", "piraat", "piloot", "liter", "radio", "lila"],
    gat: { re: /i(?!e)/, alts: { i: ["ie", "ii"] } },
  },
  {
    nr: 14, groep: 5, naam: "Komma-s-woord", kleur: "#5c6bc0", figuur: "🌙", figuurNaam: "Maan Komma",
    regel: "Eerst de komma, dan de s.",
    tip: "Eerst de komma, dan de s!",
    uitleg: "Ik ben Maan Komma. Ik schijn 's nachts! Bij 's morgens, 's middags en 's avonds zet je eerst een komma bovenaan, en dan de s.",
    woorden: ["'s morgens", "'s middags", "'s avonds", "'s nachts", "'s winters", "'s zomers"],
    gat: { re: /^'s/, alts: { "'s": ["s", "s'"] } },
  },
  {
    nr: 15, groep: 5, naam: "Centwoord", kleur: "#c0a020", figuur: "🪙", figuurNaam: "Muntje Cent",
    regel: "Ik hoor /s/, maar ik schrijf c.",
    tip: "Hoor je s? Denk aan de c van cent!",
    uitleg: "Rinkel rinkel, ik ben Muntje Cent! Je hoort een s, maar je schrijft een c. Net als in cent.",
    woorden: ["cent", "circus", "citroen", "cijfer", "centrum", "cel", "centimeter"],
    gat: { re: /^c/, alts: { c: ["s", "k"] } },
  },
  {
    nr: 16, groep: 5, naam: "Komma-s-meervoud", kleur: "#ef6c00", figuur: "🍕", figuurNaam: "Pizza Punt",
    regel: "Meer dan één? Eindigt het woord op een lange klank a, o, u of i? Dan schrijf je komma-s. Niet bij ee.",
    tip: "Lange klank aan het eind? Komma-s!",
    uitleg: "Ik ben Pizza Punt. Eén pizza, twee pizza's! Eindigt het woord op een lange klank? Dan zet je een komma voor de s. Anders ga je pizzas lezen, en dat klinkt raar.",
    woorden: ["pizza's", "opa's", "oma's", "auto's", "foto's", "menu's", "kano's", "baby's"],
    gat: { re: /'s$/, alts: { "'s": ["s", "ss"] } },
  },
  {
    nr: 17, groep: 5, naam: "Politiewoord", kleur: "#1e88e5", figuur: "🚓", figuurNaam: "Agent Tie",
    regel: "Ik hoor /tsie/, maar ik schrijf tie.",
    tip: "Denk aan tie, net als politie!",
    uitleg: "Tuu-taa, hier is Agent Tie! Je hoort tsie, maar je schrijft tie. Net als in politie.",
    woorden: ["politie", "vakantie", "informatie", "portie", "operatie", "reactie", "traditie"],
    gat: { re: /tie$/, alts: { tie: ["tsie", "sie"] } },
  },
  {
    nr: 18, groep: 5, naam: "Colawoord", kleur: "#8d6e63", figuur: "🥤", figuurNaam: "Beker Cola",
    regel: "Ik hoor /k/, maar ik schrijf c.",
    tip: "Hoor je k? Denk aan de c van cola!",
    uitleg: "Bubbels! Ik ben Beker Cola. Je hoort een k, maar je schrijft een c. Net als in cola.",
    woorden: ["cola", "camping", "computer", "clown", "cactus", "cacao", "crimineel"],
    gat: { re: /^c/, alts: { c: ["k", "q"] } },
  },
  {
    nr: 19, groep: 5, naam: "Tropisch-woord", kleur: "#43a047", figuur: "🌴", figuurNaam: "Palm Tropisch",
    regel: "Ik hoor /ies/ aan het eind, maar ik schrijf isch.",
    tip: "Hoor je ies aan het eind? Schrijf isch!",
    uitleg: "Het is warm hier, ik ben Palm Tropisch! Hoor je ies aan het eind? Dan schrijf je isch. Net als in tropisch.",
    woorden: ["tropisch", "logisch", "fantastisch", "elektrisch", "praktisch", "komisch"],
    gat: { re: /isch$/, alts: { isch: ["ies", "is"] } },
  },

  // ---------- groep 6 ----------
  {
    nr: 20, groep: 6, naam: "Taxiwoord", kleur: "#f9a825", figuur: "🚕", figuurNaam: "Taxi Toet",
    regel: "Ik hoor /ks/, maar ik schrijf x.",
    tip: "Hoor je ks? Schrijf een x!",
    uitleg: "Toet toet, ik ben Taxi Toet! Je hoort ks, maar je schrijft één letter: de x.",
    woorden: ["taxi", "extra", "examen", "mixer", "saxofoon", "explosie", "relax"],
    gat: { re: /x/, alts: { x: ["ks", "kz"] } },
  },
  {
    nr: 21, groep: 6, naam: "Chefwoord", kleur: "#6d4c41", figuur: "🧑‍🍳", figuurNaam: "Chef Pannetje",
    regel: "Ik hoor /sj/, maar ik schrijf ch.",
    tip: "Hoor je sj? Denk aan de ch van chef!",
    uitleg: "Ik ben Chef Pannetje en ik kook lekker! Je hoort sj, maar je schrijft ch. Net als in chef.",
    woorden: ["chef", "chocola", "chips", "machine", "douche", "brochure"],
    gat: { re: /ch/, alts: { ch: ["sj", "sch"] } },
  },
  {
    nr: 22, groep: 6, naam: "Theewoord", kleur: "#7cb342", figuur: "🫖", figuurNaam: "Pot Thee",
    regel: "Ik hoor /t/, maar ik schrijf th.",
    tip: "Hoor je t? Denk aan de th van thee!",
    uitleg: "Zin in een kopje? Ik ben Pot Thee. Je hoort een t, maar je schrijft th. Net als in thee.",
    woorden: ["thee", "thuis", "theater", "thema", "thermometer", "apotheek"],
    gat: { re: /th/, alts: { th: ["t", "tt"] } },
  },
  {
    nr: 23, groep: 6, naam: "Caféwoord", kleur: "#a1887f", figuur: "☕", figuurNaam: "Kopje Café",
    regel: "Ik hoor /ee/ aan het eind, maar ik schrijf é, met een streepje erop.",
    tip: "Een streepje op de e: é!",
    uitleg: "Ik ben Kopje Café. Hoor je ee aan het eind? Dan schrijf je één e met een streepje erop: é. Net als in café.",
    woorden: ["café", "logé", "coupé", "paté", "rosé", "comité"],
    gat: { re: /é/, alts: { "é": ["ee", "e"] } },
  },
  {
    nr: 24, groep: 6, naam: "Cadeauwoord", kleur: "#d81b60", figuur: "🎁", figuurNaam: "Doos Cadeau",
    regel: "Ik hoor /oo/, maar ik schrijf eau.",
    tip: "Hoor je oo? Denk aan eau van cadeau!",
    uitleg: "Een verrassing! Ik ben Doos Cadeau. Je hoort oo, maar je schrijft drie letters: eau. Net als in cadeau.",
    woorden: ["cadeau", "bureau", "niveau", "plateau", "tableau"],
    gat: { re: /eau/, alts: { eau: ["oo", "o"] } },
  },
  {
    nr: 25, groep: 6, naam: "Routewoord", kleur: "#00897b", figuur: "🗺️", figuurNaam: "Kaart Route",
    regel: "Ik hoor /oe/, maar ik schrijf ou.",
    tip: "Hoor je oe? Denk aan de ou van route!",
    uitleg: "Ik ben Kaart Route en ik wijs de weg! Je hoort oe, maar je schrijft ou. Net als in route.",
    woorden: ["route", "douche", "journaal", "souvenir", "routine", "toupet"],
    gat: { re: /ou/, alts: { ou: ["oe", "o"] } },
  },
  {
    nr: 26, groep: 6, naam: "Garagewoord", kleur: "#546e7a", figuur: "🔧", figuurNaam: "Sleutel Garage",
    regel: "Ik hoor /zj/, maar ik schrijf g.",
    tip: "Hoor je zj? Schrijf een g!",
    uitleg: "Ik ben Sleutel Garage en ik maak auto's! Je hoort zj, maar je schrijft een g. Net als aan het eind van garage.",
    woorden: ["garage", "bagage", "horloge", "etage", "massage", "college"],
    gat: { re: /g(?=e$)/, alts: { g: ["zj", "sj"] } },
  },
  {
    nr: 27, groep: 6, naam: "Lollywoord", kleur: "#ec407a", figuur: "🍭", figuurNaam: "Lolly Snoep",
    regel: "Ik hoor /ie/, maar ik schrijf y.",
    tip: "Hoor je ie aan het eind? Denk aan de y van lolly!",
    uitleg: "Mmm, ik ben Lolly Snoep! Je hoort ie aan het eind, maar je schrijft een y. Net als in lolly.",
    woorden: ["lolly", "baby", "hobby", "pony", "hockey", "party", "rugby"],
    gat: { re: /y$/, alts: { y: ["ie", "i"] } },
  },
  {
    nr: 28, groep: 6, naam: "Tremawoord", kleur: "#e53935", figuur: "🐞", figuurNaam: "Lieveheersbeestje Puntje",
    regel: "Twee klinkers naast elkaar, maar je hoort ze los? Dan zet je twee puntjes op de tweede klinker.",
    tip: "Hoor je de klinkers los? Twee puntjes erop!",
    uitleg: "Ik heb puntjes, net als een trema! Bij ruïne hoor je ru en ine los. Zonder puntjes lees je ruine, met ui. Daarom zet je twee puntjes op de i.",
    woorden: ["ruïne", "reünie", "naïef", "poëzie", "egoïst", "beïnvloeden"],
    gat: { re: /[ëïü]/, alts: { "ë": ["e", "é"], "ï": ["i", "í"], "ü": ["u", "ú"] } },
  },

  // ---------- groep 7 en 8 ----------
  {
    nr: 29, groep: 7, naam: "Militairwoord", kleur: "#558b2f", figuur: "🎖️", figuurNaam: "Medaille Air",
    regel: "Ik hoor /èr/ aan het eind, maar ik schrijf air.",
    tip: "Hoor je èr aan het eind? Schrijf air!",
    uitleg: "Ik ben Medaille Air. Hoor je èr aan het eind? Dan schrijf je air. Net als in militair en populair.",
    woorden: ["militair", "populair", "elementair", "solitair", "documentaire", "affaire"],
    gat: { re: /air/, alts: { air: ["er", "eer"] } },
  },
  {
    nr: 30, groep: 7, naam: "Koppelteken", kleur: "#3949ab", figuur: "🔗", figuurNaam: "Schakel Streepje",
    regel: "Botsen twee klinkers als je twee woorden aan elkaar plakt? Zet er een streepje tussen.",
    tip: "Botsen de klinkers? Zet er een streepje tussen!",
    uitleg: "Ik ben Schakel Streepje en ik houd woorden bij elkaar. Zee plus egel: dan botsen e en e. Daarom zet je er een streepje tussen: zee-egel.",
    woorden: ["zee-egel", "auto-ongeluk", "foto-album", "radio-uitzending", "zee-eend", "tv-gids"],
    gat: { re: /-./, alts: {
      "-e": ["e", "ë"], "-o": ["o", "ö"], "-a": ["a", "ä"], "-u": ["u", "ü"], "-g": ["g", "gg"] } },
  },
  {
    nr: 31, groep: 7, naam: "Trottoirwoord", kleur: "#78909c", figuur: "🛴", figuurNaam: "Step Trottoir",
    regel: "Ik hoor /waar/, maar ik schrijf oir.",
    tip: "Hoor je waar? Schrijf oir!",
    uitleg: "Zoef, ik ben Step Trottoir en ik rijd op de stoep! Je hoort waar, maar je schrijft oir. Net als in trottoir.",
    woorden: ["trottoir", "repertoire", "boudoir", "abattoir", "memoires", "peignoir"],
    gat: { re: /oir/, alts: { oir: ["waar", "oar"] } },
  },
  {
    nr: 32, groep: 7, naam: "Tussen-e", kleur: "#fbc02d", figuur: "🌻", figuurNaam: "Zonnebloem Zon",
    regel: "Tussen twee woorden hoor je een /u/? Vaak schrijf je dan alleen een e, zonder n. Zoals bij zon: zonnebloem.",
    tip: "Denk aan de e in het midden, zonder n!",
    uitleg: "Ik ben Zonnebloem Zon. Zon plus bloem wordt zonnebloem. Je hoort een u in het midden, en je schrijft een e. Geen n erbij!",
    woorden: [
      { w: "zonnebloem", deel: "nne", fout: ["n", "nnen"] },
      { w: "zonnebril", deel: "nne", fout: ["n", "nnen"] },
      { w: "zonneschijn", deel: "nne", fout: ["n", "nnen"] },
      { w: "verrekijker", deel: "erre", fout: ["er", "erren"] },
      { w: "eindeloos", deel: "de", fout: ["d", "den"] },
      { w: "machteloos", deel: "te", fout: ["t", "ten"] },
    ],
  },
  {
    nr: 33, groep: 7, naam: "Trema-meervoud", kleur: "#ab47bc", figuur: "🧚", figuurNaam: "Fee Ideeën",
    regel: "Eindigt het woord op ee of ie met de klemtoon? Het meervoud krijgt ën, met twee puntjes.",
    tip: "Ee of ie aan het eind? Meervoud met ën!",
    uitleg: "Ik ben Fee Ideeën! Eén fee, twee feeën. Het woord eindigt op ee, dus het meervoud krijgt ën met twee puntjes. Zo zie je dat het een nieuw stukje is.",
    woorden: ["ideeën", "zeeën", "feeën", "knieën", "fantasieën", "melodieën"],
    gat: { re: /ën$/, alts: { "ën": ["en", "ëen"] } },
  },
  {
    nr: 34, groep: 7, naam: "Latijns voorvoegsel", kleur: "#6d6875", figuur: "🏛️", figuurNaam: "Zuil Latijn",
    regel: "Ab, ad, ob en sub staan vooraan. Je hoort soms een p of t, maar je schrijft b of d.",
    tip: "Denk aan ab, ad, ob of sub vooraan!",
    uitleg: "Ik ben Zuil Latijn, heel oud! Ab, ad, ob en sub komen uit het Latijn. Je hoort soms ap of at, maar je schrijft ab of ad. Oefen ze goed!",
    woorden: ["absoluut", "abnormaal", "advocaat", "advies", "object", "observeren", "subtiel"],
    gat: { re: /^(ab|ad|ob|sub)/, alts: { ab: ["ap"], ad: ["at"], ob: ["op"], sub: ["sup"] } },
  },
);

// Wie geen groep heeft, hoort bij groep 4.
for (const c of CATEGORIEEN) {
  c.groep = c.groep || 4;
  c.id = c.id || String(c.nr); // unieke sleutel voor links en sterren (speciaal hakwoord: "1s")
}
const GROEPEN = [
  { nr: 4, naam: "Groep 4" },
  { nr: 5, naam: "Groep 5" },
  { nr: 6, naam: "Groep 6" },
  { nr: 7, naam: "Groep 7 en 8" },
];
