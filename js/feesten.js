// 🎉 Feesten: rond Sinterklaas, kerst, Pasen, ... verandert de app mee.
// Alle dieren krijgen een feestmuts, de spelletjes (niet je eigen) krijgen een feest-thema
// en Eva zegt iets over het feest. Op #feesten kies je welke feesten meedoen.
// Wordt na spelletjes.js geladen (gebruikt WERELDEN) en vóór app.js.

// Paaszondag (Gregoriaanse kalender, "anonieme" rekenmethode).
function paasdag(jaar) {
  const a = jaar % 19, b = Math.floor(jaar / 100), c = jaar % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const maand = Math.floor((h + l - 7 * m + 114) / 31), dag = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(jaar, maand - 1, dag);
}
const dagen = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const datum = (jaar, maand, dag) => new Date(jaar, maand - 1, dag);
// Joodse feesten volgen de Joodse kalender, dus hun datum schuift elk jaar.
// De browser kent die kalender (Intl, "hebrew"). We zoeken de dag in het gewone jaar j.
const JOODSE_KALENDER = (() => {
  try {
    const f = new Intl.DateTimeFormat("en-u-ca-hebrew", { day: "numeric", month: "long" });
    return f.resolvedOptions().calendar === "hebrew" ? f : null;
  } catch (e) { return null; }
})();
const joodseDagen = {};
// maanden: bv. ["Nisan"], of ["Adar", "Adar II"] (in een schrikkeljaar is Poerim in Adar II).
// vooraf: zoveel dagen ervoor begint het feest in de app al, duur: zoveel dagen duurt het.
function joods(maanden, dag, duur, vooraf = 0) {
  return (j) => {
    const k = `${maanden}|${dag}|${j}`;
    if (!(k in joodseDagen)) {
      joodseDagen[k] = null;
      for (let d = datum(j, 1, 1); JOODSE_KALENDER && d.getFullYear() === j; d = dagen(d, 1)) {
        const p = JOODSE_KALENDER.formatToParts(d);
        const m = p.find((x) => x.type === "month").value, n = Number(p.find((x) => x.type === "day").value);
        if (n === dag && maanden.includes(m)) { joodseDagen[k] = d; break; }
      }
    }
    const begin = joodseDagen[k];
    if (!begin) return null;
    const p = [dagen(begin, -vooraf), dagen(begin, duur - 1)];
    p.echt = [begin, p[1]]; // zonder de dagen ervoor: zo laten we de datum zien
    return p;
  };
}

// Elk feest: wanneer, welke mutsen, welke versiering en twee feest-werelden voor de spelletjes.
// Joodse feesten (joods: true) hebben ook een Hebreeuwse naam (he) en een Hebreeuwse groet (chag),
// die Eva in het Hebreeuws zegt, ook als de app Nederlands praat.
// Op volgorde van het schooljaar.
const FEESTEN = [
  {
    id: "rosjhasjana", naam: "Rosj Hasjana", he: "ראש השנה", joods: true, emoji: "🍎",
    periode: joods(["Tishri"], 1, 2, 2),
    hoeden: ["appel"], versiering: ["🍎", "🍯", "📯", "🐝", "✨"],
    groet: "Het is Rosj Hasjana, het Joodse nieuwjaar! Eet jij ook appel met honing?", chag: "שנה טובה ומתוקה!",
    werelden: [
      { id: "f-honing", ding: "appels", emoji: "🍎", doel: "🍯", naam: "Appel in de honing", lucht: "#fff8e1", vloer: "#ffb300",
        zin: "Doop de goede appel in de honing!", hoera: ["Zoet!", "Sjana tova!", "Mmm, honing!"] },
      { id: "f-kaartje", ding: "kaartjes", emoji: "💌", doel: "📮", naam: "Nieuwjaarskaartjes", lucht: "#fce4ec", vloer: "#c62828",
        zin: "Post het goede nieuwjaarskaartje!", hoera: ["Verstuurd!", "Sjana tova!", "Hoera!"] },
    ],
  },
  {
    id: "soekot", naam: "Soekot", he: "סוכות", joods: true, emoji: "🛖",
    periode: joods(["Tishri"], 15, 9, 1),
    hoeden: ["bladerkroon"], versiering: ["🛖", "🌿", "🍋", "⭐", "🍇"],
    groet: "Het is Soekot! Zitten we lekker in de soeka?", chag: "חג סוכות שמח!",
    werelden: [
      { id: "f-soeka", ding: "versieringen", emoji: "⭐", doel: "🛖", naam: "Soeka versieren", lucht: "#f1f8e9", vloer: "#8d6e63",
        zin: "Hang de goede versiering in de soeka!", hoera: ["Wat mooi!", "Chag sameach!", "Hoera!"] },
      { id: "f-etrog", ding: "etrogs", emoji: "🍋", doel: "🧺", naam: "Etrog en loelav", lucht: "#fffde7", vloer: "#7cb342",
        zin: "Leg de goede etrog in het mandje!", hoera: ["Lekker ruiken!", "Chag sameach!", "Mooi zo!"] },
    ],
  },
  {
    id: "halloween", naam: "Halloween", emoji: "🎃",
    periode: (j) => [datum(j, 10, 24), datum(j, 10, 31)],
    hoeden: ["heksenhoed"], versiering: ["🎃", "👻", "🦇", "🍬", "🕸️"],
    groet: "Boe! Het is Halloween! Ben je bang?",
    werelden: [
      { id: "f-snoep", ding: "snoepjes", emoji: "🍬", doel: "🎃", naam: "Snoep ophalen", lucht: "#fff3e0", vloer: "#5d4037",
        zin: "Doe het goede snoepje in de pompoen!", hoera: ["Boe!", "Lekker eng!", "Hihihi!"] },
      { id: "f-spook", ding: "vleermuizen", emoji: "🦇", doel: "🏚️", naam: "Spookhuis", lucht: "#311b92", vloer: "#4a148c",
        zin: "Stuur de goede vleermuis naar het spookhuis!", hoera: ["Boe!", "Oehoe!", "Spannend!"] },
    ],
  },
  {
    id: "sinterklaas", naam: "Sinterklaas", emoji: "🎁",
    periode: (j) => [datum(j, 11, 10), datum(j, 12, 5)],
    hoeden: ["mijter", "pietmuts"], versiering: ["🎁", "🍬", "🐴", "🍪", "📜"],
    groet: "Sinterklaas is in het land! Zet jij je schoen?",
    werelden: [
      { id: "f-schoen", ding: "cadeautjes", emoji: "🎁", doel: "👞", naam: "Schoen zetten", lucht: "#ffebee", vloer: "#c62828",
        zin: "Stop het goede cadeautje in de schoen!", hoera: ["In de schoen!", "Dank je wel, Sinterklaas!", "Hoera!"] },
      { id: "f-pepernoot", ding: "pepernoten", emoji: "🍪", doel: "🐴", naam: "Paard voeren", lucht: "#fff8e1", vloer: "#8d6e63",
        zin: "Geef het paard van Sinterklaas de goede pepernoot!", hoera: ["Hihihi!", "Smakelijk!", "Hap!"] },
    ],
  },
  {
    id: "chanoeka", naam: "Chanoeka", he: "חנוכה", joods: true, emoji: "🕎",
    periode: joods(["Kislev"], 25, 8, 1),
    hoeden: ["chanoekamuts"], versiering: ["🕎", "🕯️", "✨", "🍩", "💙"],
    groet: "Het is Chanoeka! Steken we een kaarsje aan?", chag: "חג חנוכה שמח!",
    werelden: [
      { id: "f-kaars", ding: "kaarsjes", emoji: "🕯️", doel: "🕎", naam: "Kaarsjes aansteken", lucht: "#e3f2fd", vloer: "#1565c0",
        zin: "Zet het goede kaarsje in de chanoekia!", hoera: ["Licht!", "Wat mooi!", "Chag sameach!"] },
      { id: "f-donut", ding: "soefganiot", emoji: "🍩", doel: "🍽️", naam: "Soefganiot", lucht: "#fff8e1", vloer: "#90caf9",
        zin: "Leg de goede soefganija op het bord!", hoera: ["Mmm!", "Lekker!", "Smakelijk!"] },
    ],
  },
  {
    id: "kerst", naam: "Kerst", emoji: "🎄",
    periode: (j) => [datum(j, 12, 6), datum(j, 12, 30)],
    hoeden: ["kerstmuts"], versiering: ["🎄", "⭐", "❄️", "🔔", "🎁"],
    groet: "Het is bijna kerst! Zie je de sneeuw?",
    werelden: [
      { id: "f-kerstboom", ding: "cadeaus", emoji: "🎁", doel: "🎄", naam: "Onder de kerstboom", lucht: "#e8f5e9", vloer: "#2e7d32",
        zin: "Leg het goede cadeau onder de kerstboom!", hoera: ["Vrolijk kerstfeest!", "Mooi!", "Hoera!"] },
      { id: "f-sneeuw", ding: "sneeuwvlokken", emoji: "❄️", doel: "⛄", naam: "Sneeuwpop", lucht: "#e1f5fe", vloer: "#fff",
        zin: "Geef de sneeuwpop de goede sneeuwvlok!", hoera: ["Brrr, koud!", "Sneeuw!", "Hoera!"] },
    ],
  },
  {
    id: "nieuwjaar", naam: "Oud en nieuw", emoji: "🎆",
    periode: (j) => [datum(j, 12, 31), datum(j + 1, 1, 6)],
    hoeden: ["feestmuts"], versiering: ["🎆", "🎇", "🥂", "🍩", "✨"],
    groet: "Gelukkig nieuwjaar! Wat een mooi vuurwerk!",
    werelden: [
      { id: "f-vuurwerk", ding: "vuurpijlen", emoji: "🎇", doel: "🌙", naam: "Vuurwerk", lucht: "#1a237e", vloer: "#283593",
        zin: "Schiet de goede vuurpijl naar de maan!", hoera: ["Boem!", "Oooh, mooi!", "Knal!"] },
      { id: "f-oliebol", ding: "oliebollen", emoji: "🍩", doel: "🍽️", naam: "Oliebollen", lucht: "#fff8e1", vloer: "#bcaaa4",
        zin: "Leg de goede oliebol op het bord!", hoera: ["Mmm!", "Lekker!", "Smakelijk!"] },
    ],
  },
  {
    id: "toebisjvat", naam: "Toe Bisjvat", he: "ט״ו בשבט", joods: true, emoji: "🌳",
    periode: joods(["Shevat"], 15, 1, 3),
    hoeden: ["boompje"], versiering: ["🌳", "🌱", "🍇", "🌸", "🌰"],
    groet: "Het is Toe Bisjvat, het feest van de bomen! Plant jij een boompje?", chag: "ט״ו בשבט שמח!",
    werelden: [
      { id: "f-boom", ding: "boompjes", emoji: "🌱", doel: "🌳", naam: "Bomen planten", lucht: "#e8f5e9", vloer: "#8d6e63",
        zin: "Plant het goede boompje in het bos!", hoera: ["Groei maar!", "Wat groen!", "Hoera!"] },
      { id: "f-fruit", ding: "vruchten", emoji: "🍇", doel: "🧺", naam: "Vruchten plukken", lucht: "#f3e5f5", vloer: "#7cb342",
        zin: "Leg de goede vrucht in het mandje!", hoera: ["Lekker!", "Mmm!", "Smakelijk!"] },
    ],
  },
  {
    id: "valentijn", naam: "Valentijn", emoji: "💌",
    periode: (j) => [datum(j, 2, 10), datum(j, 2, 14)],
    hoeden: ["hartjes"], versiering: ["💌", "❤️", "🌹", "💕", "💝"],
    groet: "Het is Valentijn! Voor wie maak jij een kaartje?",
    werelden: [
      { id: "f-brief", ding: "briefjes", emoji: "💌", doel: "📮", naam: "Liefdesbriefjes", lucht: "#fce4ec", vloer: "#e91e63",
        zin: "Post het goede briefje!", hoera: ["Verstuurd!", "Lief!", "Hoera!"] },
      { id: "f-roos", ding: "rozen", emoji: "🌹", doel: "💐", naam: "Bloemen", lucht: "#fff0f5", vloer: "#a5d6a7",
        zin: "Zet de goede roos in de bos bloemen!", hoera: ["Wat mooi!", "Lief!", "Prachtig!"] },
    ],
  },
  {
    id: "carnaval", naam: "Carnaval", emoji: "🎭",
    periode: (j) => { const p = paasdag(j); return [dagen(p, -52), dagen(p, -47)]; },
    hoeden: ["narrenkap"], versiering: ["🎭", "🎉", "🎊", "🎺", "🤡"],
    groet: "Alaaf! Het is carnaval! Als wat ben jij verkleed?",
    werelden: [
      { id: "f-confetti", ding: "toeters", emoji: "🎺", doel: "🎭", naam: "Optocht", lucht: "#fff9c4", vloer: "#7b1fa2",
        zin: "Breng de goede toeter naar de optocht!", hoera: ["Alaaf!", "Toet toet!", "Feest!"] },
      { id: "f-ballon", ding: "ballonnen", emoji: "🎈", doel: "🎉", naam: "Feestballonnen", lucht: "#f3e5f5", vloer: "#43a047",
        zin: "Breng de goede ballon naar het feest!", hoera: ["Feest!", "Joepie!", "Alaaf!"] },
    ],
  },
  {
    id: "poerim", naam: "Poerim", he: "פורים", joods: true, emoji: "🎭",
    periode: joods(["Adar", "Adar II"], 14, 2, 6),
    hoeden: ["kroon", "narrenkap"], versiering: ["🎭", "👑", "🍪", "🎉", "🥁"],
    groet: "Het is Poerim! Als wat ben jij verkleed?", chag: "פורים שמח!",
    werelden: [
      { id: "f-masker", ding: "maskers", emoji: "🎭", doel: "👸", naam: "Verkleedfeest", lucht: "#f3e5f5", vloer: "#7b1fa2",
        zin: "Breng het goede masker naar koningin Esther!", hoera: ["Poerim sameach!", "Wat een feest!", "Joepie!"] },
      { id: "f-hamansoor", ding: "hamansoren", emoji: "🍪", doel: "🍽️", naam: "Hamansoren", lucht: "#fff8e1", vloer: "#ffb74d",
        zin: "Leg de goede hamansoor op het bord!", hoera: ["Mmm!", "Lekker!", "Smakelijk!"] },
    ],
  },
  {
    id: "pesach", naam: "Pesach", he: "פסח", joods: true, emoji: "🫓",
    periode: joods(["Nisan"], 15, 8, 3),
    hoeden: ["kikker"], versiering: ["🫓", "🍷", "🐸", "🌸", "🍽️"],
    groet: "Het is Pesach! Zoek jij de afikoman?", chag: "חג פסח שמח!",
    werelden: [
      { id: "f-kikker", ding: "kikkers", emoji: "🐸", doel: "🌊", naam: "Springende kikkers", lucht: "#e0f7fa", vloer: "#26a69a",
        zin: "Laat de goede kikker in het water springen!", hoera: ["Kwaak!", "Plons!", "Hoera!"] },
      { id: "f-matze", ding: "matzes", emoji: "🫓", doel: "🍽️", naam: "Sederavond", lucht: "#fff8e1", vloer: "#bcaaa4",
        zin: "Leg de goede matze op de sederschotel!", hoera: ["Chag sameach!", "Knapperig!", "Smakelijk!"] },
    ],
  },
  {
    id: "pasen", naam: "Pasen", emoji: "🐣",
    periode: (j) => { const p = paasdag(j); return [dagen(p, -7), dagen(p, 1)]; },
    hoeden: ["konijnenoren"], versiering: ["🐣", "🥚", "🐰", "🌷", "🧺"],
    groet: "Vrolijk Pasen! Zoek jij ook paaseieren?",
    werelden: [
      { id: "f-paasei", ding: "paaseieren", emoji: "🥚", doel: "🧺", naam: "Paaseieren zoeken", lucht: "#f1f8e9", vloer: "#aed581",
        zin: "Leg het goede paasei in het mandje!", hoera: ["Gevonden!", "In het mandje!", "Hoera!"] },
      { id: "f-paashaas", ding: "worteltjes", emoji: "🥕", doel: "🐰", naam: "Paashaas", lucht: "#fffde7", vloer: "#c5e1a5",
        zin: "Geef de paashaas het goede worteltje!", hoera: ["Knabbel!", "Lekker!", "Hap!"] },
    ],
  },
  {
    id: "koningsdag", naam: "Koningsdag", emoji: "👑",
    periode: (j) => [datum(j, 4, 21), datum(j, 4, 27)],
    hoeden: ["kroon"], versiering: ["👑", "🧡", "🎈", "🍰", "🎉"],
    groet: "Hoera, het is Koningsdag! Alles is oranje!",
    werelden: [
      { id: "f-kroon", ding: "kroontjes", emoji: "👑", doel: "🏰", naam: "Naar het paleis", lucht: "#fff3e0", vloer: "#ff9800",
        zin: "Breng het goede kroontje naar het paleis!", hoera: ["Lang leve de koning!", "Hoera!", "Oranje boven!"] },
      { id: "f-taart", ding: "tompoezen", emoji: "🍰", doel: "🍽️", naam: "Tompoezen", lucht: "#ffe0b2", vloer: "#fb8c00",
        zin: "Leg de goede tompoes op het bord!", hoera: ["Mmm!", "Smullen!", "Oranje boven!"] },
    ],
  },
  {
    id: "lagbaomer", naam: "Lag Baomer", he: "ל״ג בעומר", joods: true, emoji: "🔥",
    periode: joods(["Iyar"], 18, 1, 1),
    hoeden: ["feestmuts"], versiering: ["🔥", "🏹", "🌙", "🥔", "✨"],
    groet: "Het is Lag Baomer! Maken we een kampvuur?", chag: "ל״ג בעומר שמח!",
    werelden: [
      { id: "f-kampvuur", ding: "houtjes", emoji: "🪵", doel: "🔥", naam: "Kampvuur", lucht: "#1a237e", vloer: "#4e342e",
        zin: "Gooi het goede houtje op het kampvuur!", hoera: ["Warm!", "Knisper!", "Hoera!"] },
      { id: "f-pijl", ding: "pijlen", emoji: "🏹", doel: "🎯", naam: "Pijl en boog", lucht: "#e8f5e9", vloer: "#558b2f",
        zin: "Schiet de goede pijl in de roos!", hoera: ["Raak!", "In de roos!", "Goed gemikt!"] },
    ],
  },
  {
    id: "sjavoeot", naam: "Sjavoeot", he: "שבועות", joods: true, emoji: "🧀",
    periode: joods(["Sivan"], 6, 2, 3),
    hoeden: ["bloemenkrans"], versiering: ["🌸", "🧀", "🌾", "🍓", "🥛"],
    groet: "Het is Sjavoeot! Eet jij ook kaastaart?", chag: "חג שבועות שמח!",
    werelden: [
      { id: "f-kaas", ding: "stukjes kaas", emoji: "🧀", doel: "🍽️", naam: "Kaastaart", lucht: "#fffde7", vloer: "#fdd835",
        zin: "Leg het goede stukje kaas op het bord!", hoera: ["Mmm!", "Lekker!", "Chag sameach!"] },
      { id: "f-vrucht", ding: "aardbeien", emoji: "🍓", doel: "🧺", naam: "Eerste vruchten", lucht: "#fce4ec", vloer: "#8bc34a",
        zin: "Leg de goede aardbei in de mand!", hoera: ["Lekker!", "Wat rood!", "Hoera!"] },
    ],
  },
];
// De feest-werelden horen er ook bij (maar niet in de spelletjesmaker).
FEESTEN.forEach((f) => f.werelden.forEach((w) => { WERELDEN[w.id] = { ...w, feest: true }; }));

// Welke feesten doen mee? Standaard allemaal. "feestKeuze" = een feest dat je nu wilt (of leeg: de kalender).
const feestenUit = () => JSON.parse(localStorage.getItem("feestenUit") || "[]");
function feestBezig(f, nu = new Date()) {
  const vandaag = datum(nu.getFullYear(), nu.getMonth() + 1, nu.getDate());
  // ook het jaar ervoor, voor feesten die over nieuwjaar heen gaan
  return [nu.getFullYear() - 1, nu.getFullYear()].some((j) => {
    const p = f.periode(j);
    return p && vandaag >= p[0] && vandaag <= p[1];
  });
}
function actiefFeest() {
  const keuze = localStorage.getItem("feestKeuze");
  if (keuze === "geen") return null;
  if (keuze) return FEESTEN.find((f) => f.id === keuze) || null;
  const uit = feestenUit();
  const nu = FEESTEN.filter((f) => !uit.includes(f.id) && feestBezig(f));
  // Zijn er twee feesten tegelijk (Pesach en Pasen)? Dan gaat het Joodse feest voor.
  return nu.find((f) => f.joods) || nu[0] || null;
}

// De naam van een feest in de gekozen taal. Joodse feesten krijgen ook hun Hebreeuwse naam erbij.
function feestNaam(f) {
  if (TAAL === "he") return f.he || t(f.naam);
  return f.he ? `${t(f.naam)} <span class="feest-he" lang="he" dir="rtl">${f.he}</span>` : t(f.naam);
}
// Wat Eva zegt als het feest is. Bij een Joods feest staat de Hebreeuwse groet erbij.
function feestGroet(f) {
  if (!f.chag) return t(f.groet);
  // \u2068 en \u2069 houden de Hebreeuwse zin bij elkaar tussen de Nederlandse woorden (anders staat het ! verkeerd).
  return TAAL === "he" ? `${f.chag} ${t(f.groet)}` : `${t(f.groet)} \u2068${f.chag}\u2069`;
}
// Eva zegt de groet hardop: eerst in de taal van de app, dan de Hebreeuwse groet met een Hebreeuwse stem.
async function zegFeestGroet(f) {
  if (TAAL === "he" || !f.chag) return praat(feestGroet(f));
  await praat(t(f.groet));
  const beurt = spreekBeurt;
  await wacht(200);
  if (beurt === spreekBeurt) zeg(f.chag, "he-IL");
}
// Wanneer is het feest (nu of de volgende keer)? Bv. "2 – 9 april".
function feestDatum(f, nu = new Date()) {
  const vandaag = datum(nu.getFullYear(), nu.getMonth() + 1, nu.getDate());
  const p = [nu.getFullYear() - 1, nu.getFullYear(), nu.getFullYear() + 1].map((j) => f.periode(j)).find((x) => x && x[1] >= vandaag);
  if (!p) return "";
  const taal = { nl: "nl-NL", he: "he-IL", en: "en-GB" }[TAAL] || "nl-NL";
  const d = (x) => x.toLocaleDateString(taal, { day: "numeric", month: "long" });
  const [a, b] = p.echt || p;
  return a.getTime() === b.getTime() ? d(a) : `${d(a)} – ${d(b)}`;
}

// Een spelletje van Eva in feest-kleren: de wereld wordt een feest-wereld.
function metFeest(spel, i) {
  const f = actiefFeest();
  if (!f || !spel || String(spel.id).startsWith("m-")) return spel;
  const W = f.werelden[i % f.werelden.length];
  return { ...spel, wereld: W.id, naam: W.naam };
}
// Ballonnen, eikels en het doolhof met een feest-thema: [thema, titel] of [].
const hoofdletter = (s) => s.charAt(0).toUpperCase() + s.slice(1);
function feestThema(spel) {
  const f = actiefFeest();
  if (!f) return [];
  const W = WERELDEN[f.werelden[spel === "eikels" ? 1 : 0].id];
  const doe = { ballonnen: "knallen", eikels: "vangen" }[spel];
  return [W, `${W.emoji} ${hoofdletter(W.ding)} ${doe}`];
}
function feestDoolhof() {
  const f = actiefFeest();
  return f ? { naam: t("{feest}-doolhof", { feest: TAAL === "he" && f.he ? f.he : t(f.naam) }), wereld: f.werelden[0].id } : undefined;
}

// Feestmutsen en een slinger: via een class op <body>, de rest doet de CSS.
function toonFeest() {
  const f = actiefFeest();
  document.body.classList.forEach((c) => c.startsWith("feest-") && document.body.classList.remove(c));
  document.body.style.removeProperty("--hoed");
  document.body.style.removeProperty("--hoed2");
  const oud = document.querySelector(".slinger");
  if (oud) oud.remove();
  if (!f) return;
  document.body.classList.add("feest-aan", `feest-${f.id}`);
  const [h1, h2 = h1] = f.hoeden;
  // volledige adressen, anders zoekt de CSS de plaatjes in de map css/
  const hoed = (h) => `url("${new URL(`img/feest/${h}.svg`, location.href).href}")`;
  document.body.style.setProperty("--hoed", hoed(h1));
  document.body.style.setProperty("--hoed2", hoed(h2));
  const slinger = el(`<a class="slinger" href="#feesten" aria-label="${t("Feesten kiezen")}">${Array.from({ length: 14 }, (_, i) => f.versiering[i % f.versiering.length]).join(" ")}</a>`);
  document.body.prepend(slinger);
}
document.addEventListener("DOMContentLoaded", toonFeest);
window.addEventListener("hashchange", toonFeest); // ook als je een ander feest kiest of de dag verandert

// Het feesten-scherm: welke feesten doen mee?
function feestenScherm() {
  const uit = feestenUit(), keuze = localStorage.getItem("feestKeuze") || "", nu = actiefFeest();
  zegEekhoorn(nu ? `${feestGroet(nu)} ${t("Kies hier welke feesten meedoen.")}` : t("Kies welke feesten meedoen! Dan verandert de app als het feest is."));
  if (nu) zegFeestGroet(nu); else praat(t("Kies welke feesten meedoen!"));
  scherm.innerHTML = `
    <div class="kaart">
      <h2>🎉 ${t("Feesten")}</h2>
      <p class="regel">${t("Als het feest is, krijgen alle dieren een feestmuts en worden de spelletjes feest-spelletjes. Jij kiest welke feesten meedoen.")}</p>
      <div class="feest-lijst">${FEESTEN.map((f) => {
        const mee = !uit.includes(f.id);
        return `<button class="feest-vak ${mee ? "mee" : "niet"} ${nu === f ? "nu" : ""}" data-id="${f.id}">
          <span class="feest-emoji">${f.emoji}<img class="feest-hoed" src="img/feest/${f.hoeden[0]}.svg" alt=""></span>
          <b>${feestNaam(f)}</b><small>${feestDatum(f)}</small>
          <span class="feest-mee">${mee ? "✅ " + t("Doe ik mee") : "❌ " + t("Doe ik niet mee")}</span>
          ${nu === f ? `<span class="feest-nu">🎉 ${t("Nu!")}</span>` : ""}</button>`;
      }).join("")}</div>
      <h3 class="spel-kop">👀 ${t("Wil je nu al een feest?")}</h3>
      <p class="winkel-uitleg">${t("Kies een feest om nu te vieren, of laat de kalender kiezen.")}</p>
      <div class="kies-rij feest-nu-rij">
        <button class="kies-knop ${keuze === "" ? "gekozen" : ""}" data-k=""><span>📅</span>${t("Kalender")}</button>
        ${FEESTEN.map((f) => `<button class="kies-knop ${keuze === f.id ? "gekozen" : ""}" data-k="${f.id}"><span>${f.emoji}</span>${TAAL === "he" && f.he ? f.he : t(f.naam)}</button>`).join("")}
        <button class="kies-knop ${keuze === "geen" ? "gekozen" : ""}" data-k="geen"><span>🚫</span>${t("Geen feest")}</button>
      </div>
      <a class="grote-knop" href="#">${t("Verder spelen")}</a>
    </div>`;
  scherm.querySelectorAll(".feest-vak").forEach((b) => (b.onclick = () => {
    const id = b.dataset.id, lijst = feestenUit();
    localStorage.setItem("feestenUit", JSON.stringify(lijst.includes(id) ? lijst.filter((x) => x !== id) : [...lijst, id]));
    geluid("eikel"); toonFeest(); feestenScherm();
  }));
  scherm.querySelectorAll(".feest-nu-rij .kies-knop").forEach((b) => (b.onclick = () => {
    if (b.dataset.k) localStorage.setItem("feestKeuze", b.dataset.k); else localStorage.removeItem("feestKeuze");
    toonFeest();
    if (actiefFeest()) feest(); else geluid("eikel");
    feestenScherm();
  }));
}
