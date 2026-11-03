// Staal-categorieën voor groep 4 (nummers, namen en regels volgens Staal).
// Woorden en figuren zijn eigen werk. Zie INHOUD.md.
//
// gat: welk stukje van het woord het "lastige stukje" is (voor het gaatjesspel
// en om in de uitleg te kleuren), met foute keuzes per stukje.
// Een woord kan ook een object zijn: { w: "bomen", deel: "o", fout: ["oo"] }.
const CATEGORIEEN = [
  {
    nr: 1, naam: "Hakwoord", kleur: "#ff8a65", figuur: "🐦", figuurNaam: "Specht Hakkie",
    regel: "Ik schrijf het woord zoals ik het hoor.",
    uitleg: "Ik ben Specht Hakkie. Ik hak een woord in stukjes: k, a, t. Wat je hoort, schrijf je op!",
    woorden: ["kat", "vis", "pen", "rok", "maan", "boot", "soep", "tuin", "kip", "raam",
              "bus", "zon", "mes", "pop", "buik"],
  },
  {
    id: "1s", nr: 1, naam: "Speciaal hakwoord", kleur: "#f4511e", figuur: "🛑", figuurNaam: "Specht Stop",
    regel: "Daar mag geen u tussen.",
    uitleg: "Ik ben Specht Stop, met mijn stopbord! Bij melk hoor je soms mel-uk. Maar daar mag geen u tussen. Je schrijft gewoon melk.",
    woorden: ["melk", "werk", "hulp", "arm", "film", "kerk", "wolk", "warm", "hals", "golf"],
    gat: { re: /[lr][kpmsf]$/, alts: {
      lk: ["luk", "lek"], rk: ["ruk", "rek"], lp: ["lup", "lep"], rm: ["rum", "rem"],
      lm: ["lum", "lem"], ls: ["lus", "les"], lf: ["luf", "lef"] } },
  },
  {
    nr: 2, naam: "Zingwoord", kleur: "#ffb74d", figuur: "🔔", figuurNaam: "Bel Ding-Dong",
    regel: "Net als bij ding-dong.",
    uitleg: "Ding-dong! Hoor je ng aan het eind? Dan schrijf je ng, net als bij ding-dong.",
    woorden: ["ring", "bang", "tong", "slang", "jong", "kring"],
    gat: { re: /ng/, alts: { ng: ["nk", "n"] } },
  },
  {
    nr: 3, naam: "Luchtwoord", kleur: "#4fc3f7", figuur: "🎈", figuurNaam: "Ballon Lucht",
    regel: "Korte klank + cht, met de ch van lucht. Behalve: hij ligt, hij legt, hij zegt.",
    uitleg: "Ik zweef in de lucht! Na een korte klank schrijf je cht, met de ch van lucht. Alleen hij ligt, hij legt en hij zegt doen het anders.",
    woorden: ["lucht", "nacht", "licht", "recht", "zacht", "bocht", "kracht"],
    gat: { re: /cht/, alts: { cht: ["gt", "ch"] } },
  },
  {
    nr: 4, naam: "Plankwoord", kleur: "#81c784", figuur: "🦫", figuurNaam: "Bever Plank",
    regel: "Daar mag geen g tussen.",
    uitleg: "Ik sjouw een plank! Je hoort soms een g, maar die schrijf je niet. Plank: n, k. Geen g ertussen!",
    woorden: ["plank", "bank", "drink", "pink", "stank", "denk"],
    gat: { re: /nk/, alts: { nk: ["ngk", "ng"] } },
  },
  {
    nr: 5, naam: "Eer-oor-eur-woord", kleur: "#ba68c8", figuur: "🐻", figuurNaam: "Beer Oor",
    regel: "Ik schrijf ee, oo, eu.",
    uitleg: "Ik ben een beer met grote oren. Voor een r of een l schrijf je ee, oo of eu, ook al klinkt het een beetje anders.",
    woorden: ["beer", "peer", "meer", "oor", "door", "deur", "geur", "kleur", "veel", "deel", "keel"],
    gat: { re: /ee|oo|eu/, alts: { ee: ["e", "ie"], oo: ["o", "oe"], eu: ["u", "ui"] } },
  },
  {
    nr: 6, naam: "Aai-ooi-oei-woord", kleur: "#f06292", figuur: "🐄", figuurNaam: "Koe Zwaai",
    regel: "Ik hoor de /j/, maar ik schrijf de i.",
    uitleg: "Hoi, ik ben een koei! Je hoort een j, maar je schrijft een i: aai, ooi, oei.",
    woorden: ["kraai", "haai", "mooi", "kooi", "hooi", "koei", "groei", "bloei"],
    gat: { re: /aai|ooi|oei/, alts: { aai: ["aaj", "ai"], ooi: ["ooj", "oi"], oei: ["oej", "oi"] } },
  },
  {
    nr: 7, naam: "Eeuw-ieuw-woord", kleur: "#4db6ac", figuur: "🦁", figuurNaam: "Leeuw Sneeuw",
    regel: "Ik denk aan de u.",
    uitleg: "Brrr, een leeuw in de sneeuw! Denk aan de u: eeuw en ieuw.",
    woorden: ["leeuw", "meeuw", "sneeuw", "eeuw", "nieuw", "kieuw"],
    gat: { re: /eeuw|ieuw/, alts: { eeuw: ["eew", "eeu"], ieuw: ["iew", "ieu"] } },
  },
  {
    nr: 8, naam: "Langermaakwoord", kleur: "#9575cd", figuur: "🦒", figuurNaam: "Giraf Lang",
    regel: "Ik hoor een /t/ aan het eind, dus langer maken. Dan hoor ik of ik d of t moet schrijven.",
    uitleg: "Ik heb een lange nek! Hoor je een t aan het eind? Maak het woord langer: hond, honden. Nu hoor je een d!",
    woorden: ["hond", "bed", "hoed", "paard", "raad", "kat", "wit", "voet", "web", "krab", "rib"],
    gat: { re: /[dtb]$/, alts: { d: ["t"], t: ["d"], b: ["p"] } },
  },
  {
    nr: 9, naam: "Voorvoegsel", kleur: "#aed581", figuur: "🚂", figuurNaam: "Trein Voorop",
    regel: "Ik hoor de /u/, maar ik schrijf de e.",
    uitleg: "Tuut tuut, ik rijd voorop! Be, ge en ver staan vooraan. Je hoort een u, maar je schrijft een e.",
    woorden: ["begin", "bezoek", "gebak", "gezin", "verhaal", "verdriet"],
    gat: { re: /^(be|ge|ver)/, alts: { be: ["bu", "bi"], ge: ["gu", "gi"], ver: ["vur", "vr"] } },
  },
  {
    nr: 10, naam: "Klankgroepenwoord", kleur: "#ffd54f", figuur: "🐛", figuurNaam: "Rups Klank",
    regel: "Klankgroep en laatste klank zoeken. Lange klank: stukje weg. Korte klank: dubbel. Tweetekenklank of medeklinker: schrijf wat je hoort.",
    uitleg: "Ik ben een rups met stukjes. Kijk naar de klankgroep. Is de klank lang? Haal een stukje weg: bo-men. Is hij kort? Schrijf de letter dubbel: bak-ker.",
    woorden: [
      { w: "bomen", deel: "o", fout: ["oo"] }, { w: "ramen", deel: "a", fout: ["aa"] },
      { w: "bakker", deel: "kk", fout: ["k"] }, { w: "potten", deel: "tt", fout: ["t"] },
      { w: "kussen", deel: "ss", fout: ["s"] }, "huizen", "tuinen", "kerken",
    ],
  },
  {
    nr: 11, naam: "Verkleinwoord", kleur: "#7986cb", figuur: "🐭", figuurNaam: "Muis Mini",
    regel: "Grondwoord + je, tje of pje. Ik hoor de /u/, maar ik schrijf de e.",
    uitleg: "Ik ben maar klein! Maak een woord klein met je, tje of pje. Je hoort een u, maar je schrijft een e.",
    woorden: ["huisje", "boompje", "stoeltje", "kippetje"],
    gat: { re: /(etje|tje|pje|je)$/, alts: { je: ["ju", "tje"], tje: ["tju", "je"], pje: ["pju", "je"], etje: ["utje", "tje"] } },
  },
  {
    nr: 12, naam: "Achtervoegsel", kleur: "#e57373", figuur: "🦊", figuurNaam: "Vos Staart",
    regel: "Ik hoor /ug/, maar ik schrijf ig. Ik hoor /luk/, maar ik schrijf lijk.",
    uitleg: "Kijk naar mijn staart, die zit achteraan! Hoor je ug aan het eind? Schrijf ig. Hoor je luk? Schrijf lijk.",
    woorden: ["zonnig", "handig", "lastig", "vrolijk", "eerlijk", "moeilijk"],
    gat: { re: /(lijk|ig)$/, alts: { ig: ["ug", "ich"], lijk: ["luk", "lek"] } },
  },
];
