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
// Chanoeka (eerste en laatste dag), want die datum schuift elk jaar.
const CHANOEKA = { 2025: [12, 15, 12, 22], 2026: [12, 5, 12, 12], 2027: [12, 25, 1, 1], 2028: [12, 13, 12, 20],
  2029: [12, 2, 12, 9], 2030: [12, 21, 12, 28], 2031: [12, 10, 12, 17], 2032: [11, 28, 12, 5] };

// Elk feest: wanneer, welke mutsen, welke versiering en twee feest-werelden voor de spelletjes.
const FEESTEN = [
  {
    id: "sinterklaas", naam: "Sinterklaas", emoji: "🎁", wanneer: "half november tot 5 december",
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
    id: "chanoeka", naam: "Chanoeka", emoji: "🕎", wanneer: "8 dagen in december",
    periode: (j) => { const c = CHANOEKA[j]; return c ? [datum(j, c[0], c[1]), datum(c[2] < c[0] ? j + 1 : j, c[2], c[3])] : null; },
    hoeden: ["chanoekamuts"], versiering: ["🕎", "🕯️", "✨", "🍩", "💙"],
    groet: "Chag sameach! Het is Chanoeka. Steken we een kaarsje aan?",
    werelden: [
      { id: "f-kaars", ding: "kaarsjes", emoji: "🕯️", doel: "🕎", naam: "Kaarsjes aansteken", lucht: "#e3f2fd", vloer: "#1565c0",
        zin: "Zet het goede kaarsje in de chanoekia!", hoera: ["Licht!", "Wat mooi!", "Chag sameach!"] },
      { id: "f-donut", ding: "soefganiot", emoji: "🍩", doel: "🍽️", naam: "Soefganiot", lucht: "#fff8e1", vloer: "#90caf9",
        zin: "Leg de goede soefganija op het bord!", hoera: ["Mmm!", "Lekker!", "Smakelijk!"] },
    ],
  },
  {
    id: "kerst", naam: "Kerst", emoji: "🎄", wanneer: "december, na Sinterklaas",
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
    id: "nieuwjaar", naam: "Oud en nieuw", emoji: "🎆", wanneer: "31 december tot 6 januari",
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
    id: "valentijn", naam: "Valentijn", emoji: "💌", wanneer: "10 tot 14 februari",
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
    id: "carnaval", naam: "Carnaval", emoji: "🎭", wanneer: "in februari of maart",
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
    id: "pasen", naam: "Pasen", emoji: "🐣", wanneer: "de week voor Pasen",
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
    id: "koningsdag", naam: "Koningsdag", emoji: "👑", wanneer: "de week voor 27 april",
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
    id: "halloween", naam: "Halloween", emoji: "🎃", wanneer: "de week voor 31 oktober",
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
  return FEESTEN.find((f) => !uit.includes(f.id) && feestBezig(f)) || null;
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
  return f ? { naam: `${f.naam}-doolhof`, wereld: f.werelden[0].id } : undefined;
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
  const slinger = el(`<a class="slinger" href="#feesten" aria-label="Feesten kiezen">${Array.from({ length: 14 }, (_, i) => f.versiering[i % f.versiering.length]).join(" ")}</a>`);
  document.body.prepend(slinger);
}
document.addEventListener("DOMContentLoaded", toonFeest);
window.addEventListener("hashchange", toonFeest); // ook als je een ander feest kiest of de dag verandert

// Het feesten-scherm: welke feesten doen mee?
function feestenScherm() {
  const uit = feestenUit(), keuze = localStorage.getItem("feestKeuze") || "", nu = actiefFeest();
  zegEekhoorn(nu ? `${nu.groet} Kies hier welke feesten meedoen.` : "Kies welke feesten meedoen! Dan verandert de app als het feest is.");
  zeg(nu ? nu.groet : "Kies welke feesten meedoen!");
  scherm.innerHTML = `
    <div class="kaart">
      <h2>🎉 Feesten</h2>
      <p class="regel">Als het feest is, krijgen alle dieren een feestmuts en worden de spelletjes feest-spelletjes. Jij kiest welke feesten meedoen.</p>
      <div class="feest-lijst">${FEESTEN.map((f) => {
        const mee = !uit.includes(f.id);
        return `<button class="feest-vak ${mee ? "mee" : "niet"} ${nu === f ? "nu" : ""}" data-id="${f.id}">
          <span class="feest-emoji">${f.emoji}<img class="feest-hoed" src="img/feest/${f.hoeden[0]}.svg" alt=""></span>
          <b>${f.naam}</b><small>${f.wanneer}</small>
          <span class="feest-mee">${mee ? "✅ Doe ik mee" : "❌ Doe ik niet mee"}</span>
          ${nu === f ? `<span class="feest-nu">🎉 Nu!</span>` : ""}</button>`;
      }).join("")}</div>
      <h3 class="spel-kop">👀 Wil je nu al een feest?</h3>
      <p class="winkel-uitleg">Kies een feest om nu te vieren, of laat de kalender kiezen.</p>
      <div class="kies-rij feest-nu-rij">
        <button class="kies-knop ${keuze === "" ? "gekozen" : ""}" data-k=""><span>📅</span>Kalender</button>
        ${FEESTEN.map((f) => `<button class="kies-knop ${keuze === f.id ? "gekozen" : ""}" data-k="${f.id}"><span>${f.emoji}</span>${f.naam}</button>`).join("")}
        <button class="kies-knop ${keuze === "geen" ? "gekozen" : ""}" data-k="geen"><span>🚫</span>Geen feest</button>
      </div>
      <a class="grote-knop" href="#">Verder spelen</a>
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

// ---------- 🎁 feest-woorden ----------
// Tijdens een feest oefen je in elke categorie met woorden die bij het feest horen,
// met een plaatje en een zinnetje dat Eva zegt. [woord, plaatje, zinnetje, (gaatje)]
// Elk woord moet bij de regel van de categorie passen (zie gat in categorieen.js).
const FEEST_WOORDEN = {
  sinterklaas: {
    1: [["zak", "🎒", "De zak van Sinterklaas zit vol."], ["dak", "🏠", "Het paard loopt over het dak."],
        ["staf", "🦯", "Sinterklaas heeft een gouden staf."], ["boot", "⛵", "Sinterklaas komt met de boot."],
        ["schoen", "👞", "Ik zet mijn schoen bij de kachel."], ["muts", "🧢", "Piet heeft een muts met een veer."],
        ["snoep", "🍬", "Er zit snoep in mijn schoen."], ["rijm", "📜", "Bij elk pakje hoort een rijm."]],
    2: [["zing", "🎶", "Zing mee met het Sinterklaasliedje!"], ["lang", "🧔", "De baard van Sinterklaas is lang."],
        ["ring", "💍", "Sinterklaas heeft een gouden ring."], ["ding", "🎁", "Wat een mooi ding in mijn schoen!"]],
    3: [["nacht", "🌙", "Sinterklaas komt in de nacht."], ["gedicht", "📜", "Bij een cadeau hoort een gedicht."],
        ["wacht", "⏳", "Ik wacht op Sinterklaas."], ["zacht", "🤫", "Piet loopt heel zacht over het dak."],
        ["acht", "8️⃣", "Om acht uur gaan we naar bed."]],
    4: [["dank", "🙏", "Dank je wel, Sinterklaas!"], ["geschenk", "🎁", "Wat een mooi geschenk!"],
        ["drinkt", "🐴💧", "Het paard drinkt water."], ["denk", "🤔", "Denk je dat Sinterklaas vannacht komt?"]],
    5: [["deur", "🚪", "Er wordt op de deur geklopt!"], ["hoor", "👂", "Hoor, wie klopt daar, kinderen?"],
        ["kleur", "🖍️", "Ik kleur een tekening voor Sinterklaas."], ["schoorsteen", "🏠", "Piet klimt door de schoorsteen."],
        ["veel", "🍬", "Ik krijg veel pepernoten!"], ["geur", "👃", "Wat een lekkere geur van speculaas."],
        ["voor", "🎁", "Dit pakje is voor jou!"]],
    6: [["mooi", "🎁", "Wat een mooi cadeau!"], ["zwaai", "👋", "Zwaai naar de boot van Sinterklaas!"],
        ["gooi", "🍪", "Piet gooit pepernoten!"], ["draai", "💃", "Piet maakt een draai op het plein."]],
    7: [["nieuw", "🆕", "Sinterklaas heeft een nieuwe mantel."], ["sneeuw", "❄️", "Er ligt sneeuw op het dak."],
        ["eeuw", "👴", "Sinterklaas is wel een eeuw oud!"], ["schreeuw", "📣", "Alle kinderen schreeuwen hoera!"]],
    8: [["paard", "🐴", "Het paard van Sinterklaas loopt over het dak."], ["baard", "🧔", "Sinterklaas heeft een lange witte baard."],
        ["goud", "🪙", "Chocolademunten van goud!"], ["hand", "✋", "Geef Sinterklaas maar een hand."],
        ["rood", "🔴", "De mantel van Sinterklaas is rood."], ["lied", "🎶", "We zingen een lied voor Sinterklaas."],
        ["kind", "🧒", "Elk kind krijgt een cadeautje."]],
    9: [["verrassing", "🎁", "Wat een verrassing!"], ["gedicht", "📜", "Lees het gedicht maar voor."],
        ["verlanglijst", "📝", "Ik schrijf een verlanglijst voor Sinterklaas."], ["bezoek", "🚪", "Sinterklaas komt op bezoek!"],
        ["gezellig", "🥰", "Pakjesavond is gezellig."], ["gebak", "🍪", "Speculaas is lekker gebak."]],
    10: [["pepernoten", "🍪", "Piet strooit pepernoten.", { deel: "o", fout: ["oo"] }],
         ["letter", "🍫", "Ik krijg een chocoladeletter.", { deel: "tt", fout: ["t"] }],
         ["daken", "🏠", "Piet klimt over de daken.", { deel: "a", fout: ["aa"] }],
         ["slapen", "😴", "Ga maar slapen, Sinterklaas komt vannacht.", { deel: "a", fout: ["aa"] }]],
    11: [["pakje", "🎁", "Ik krijg een pakje!"], ["cadeautje", "🎁", "Een cadeautje van Sinterklaas."],
         ["schoentje", "👞", "Zet je schoentje maar klaar."], ["liedje", "🎶", "Zing een liedje bij de schoorsteen."],
         ["zakje", "🍬", "Een zakje met snoep."]],
    12: [["gezellig", "🥰", "Wat is pakjesavond gezellig!"], ["vrolijk", "😄", "Wat een vrolijk feest!"],
         ["heerlijk", "🍫", "Chocolade is heerlijk!"], ["prachtig", "✨", "Wat een prachtig paard!"]],
    14: [["'s nachts", "🌙", "Sinterklaas komt 's nachts."], ["'s avonds", "🎁", "Pakjesavond is 's avonds."]],
    16: [["foto's", "📸", "We maken foto's met Sinterklaas."], ["opa's", "👴", "Opa's en oma's vieren ook mee."], ["oma's", "👵", "De oma's bakken speculaas."]],
    17: [["traditie", "🎁", "Sinterklaas is een oude traditie."]],
    19: [["fantastisch", "🤩", "Pakjesavond is fantastisch!"]],
    21: [["chocola", "🍫", "Een letter van chocola."], ["chocolademelk", "☕", "Warme chocolademelk bij de intocht."]],
    24: [["cadeau", "🎁", "Een cadeau van Sinterklaas!"]],
    27: [["lolly", "🍭", "Een lolly in mijn schoen!"]],
  },
  kerst: {
    1: [["boom", "🎄", "We zetten een grote boom in de kamer."], ["ster", "⭐", "Er staat een ster in de top."],
        ["kaars", "🕯️", "De kaars brandt."], ["slee", "🛷", "De kerstman rijdt in een slee."],
        ["bal", "🔴", "Een rode bal in de boom."], ["piek", "🎄", "De piek staat bovenop de boom."]],
    2: [["slinger", "🎊", "Een slinger aan de muur."], ["zing", "🎶", "We zingen kerstliedjes."], ["lang", "🌙", "De nacht is lang."]],
    3: [["nacht", "🌙", "Stille nacht, heilige nacht."], ["licht", "💡", "Lichtjes in de kerstboom."], ["kerstnacht", "⭐", "Het sneeuwt in de kerstnacht."]],
    4: [["drink", "☕", "Ik drink warme chocolademelk."], ["dank", "🙏", "Dank je wel voor het cadeau!"]],
    5: [["deur", "🚪", "Er hangt een krans op de deur."], ["kleur", "🎨", "Rood en groen zijn kerstkleuren."], ["veel", "🎁", "Veel cadeaus onder de boom."]],
    6: [["mooi", "🎄", "Wat een mooie boom!"]],
    7: [["sneeuw", "❄️", "Kijk, het sneeuwt!"], ["sneeuwpop", "⛄", "We maken een sneeuwpop."], ["nieuw", "🎆", "Bijna een nieuw jaar!"]],
    8: [["hert", "🦌", "Het hert trekt de slee."], ["goud", "⭐", "Een ster van goud."], ["rood", "🔴", "De neus van het rendier is rood."], ["brood", "🍞", "We eten kerstbrood."]],
    9: [["versiering", "🎄", "De boom heeft mooie versiering."], ["gezellig", "🥰", "Kerst is gezellig."],
        ["geschenk", "🎁", "Een geschenk onder de boom."], ["bezoek", "👵", "Opa en oma komen op bezoek."]],
    10: [["ballen", "🔴", "Ballen in de kerstboom.", { deel: "ll", fout: ["l"] }],
         ["sterren", "⭐", "Sterren aan de hemel.", { deel: "rr", fout: ["r"] }],
         ["bomen", "🎄", "Overal staan kerstbomen.", { deel: "o", fout: ["oo"] }]],
    11: [["lampje", "💡", "Een lampje in de boom."], ["kaarsje", "🕯️", "Steek een kaarsje aan."],
         ["boompje", "🎄", "Een klein kerstboompje."], ["belletje", "🔔", "Ting ting, een belletje!"]],
    12: [["gezellig", "🥰", "Wat is kerst gezellig!"], ["heerlijk", "🍗", "Het kerstdiner is heerlijk."], ["vrolijk", "🎄", "Vrolijk kerstfeest!"]],
    14: [["'s winters", "❄️", "'s Winters is het koud."], ["'s nachts", "⭐", "'s Nachts schijnen de sterren."]],
    21: [["chocolademelk", "☕", "Warme chocolademelk bij de boom."]],
    24: [["cadeau", "🎁", "Een cadeau onder de kerstboom."]],
  },
};

// Plaatje en zinnetje van een feest-woord (alleen als dat feest nu bezig is).
function feestZin(w) {
  const f = actiefFeest();
  const lijsten = f && FEEST_WOORDEN[f.id];
  if (!lijsten) return null;
  for (const lijst of Object.values(lijsten)) {
    const r = lijst.find((x) => x[0] === w);
    if (r) return { plaatje: r[1], zin: r[2] };
  }
  return null;
}
// Een categorie met feest-woorden (als er een feest is en er woorden voor zijn).
function feestCat(cat) {
  const f = actiefFeest();
  const lijst = cat && f && FEEST_WOORDEN[f.id] && FEEST_WOORDEN[f.id][String(catSleutel(cat))];
  if (!lijst) return cat;
  const woorden = lijst.map(([w, , , g]) => (g ? { w, ...g } : w)).filter((x) => maakGat(cat, x));
  if (!woorden.length) return cat;
  // te weinig feest-woorden? Vul aan met gewone woorden van de categorie.
  const extra = woorden.length < 5 ? schud(cat.woorden).slice(0, 5 - woorden.length) : [];
  return { ...cat, woorden: [...woorden, ...extra], feest: f };
}
