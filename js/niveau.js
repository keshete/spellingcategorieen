// Leeftijd/groep en moeilijkheid die het kind zelf kiest (scherm #kies).
// Bewaard in localStorage: "groep" (4 t/m 8) en "niveau" (extraMakkelijk, makkelijk, moeilijk, extraMoeilijk).
//
// Groep: categorieën van eerdere groepen zijn al geleerd, dus die horen meteen bij
// "open". Categorieën van een hogere groep mag je ook doen (vooruit werken).
// Een categorie zonder groep-veld hoort bij groep 4.
//
// Moeilijkheid (4 niveaus). De 💡 tip zie je alleen bij de twee makkelijke.
//   extra makkelijk: kortste woorden, 2 keuzes, 4 vragen, letterhulp in het dictee,
//                    6 trage ballonnen
//   makkelijk:       alle woorden, 3 keuzes, 5 vragen, 10 ballonnen
//   moeilijk:        alle woorden, 3 keuzes (sorteerspel 4), 6 vragen, 12 ballonnen, geen tip
//   extra moeilijk:  langste woorden, 4 keuzes in het sorteerspel, 8 vragen,
//                    16 snelle ballonnen, geen tip

const LEEFTIJDEN = [
  { groep: 4, jaar: "7 of 8 jaar" },
  { groep: 5, jaar: "8 of 9 jaar" },
  { groep: 6, jaar: "9 of 10 jaar" },
  { groep: 7, jaar: "10 of 11 jaar" },
  { groep: 8, jaar: "11 of 12 jaar" },
];

const NIVEAUS = {
  extraMakkelijk: { naam: "Extra makkelijk", icoon: "🐣", uitleg: "Korte woorden, 2 keuzes en een tip.",
    woorden: "kort", vragen: 4, keuzes: 2, letterHulp: true, tip: true, ballonnen: 6, traag: 1.5 },
  makkelijk: { naam: "Makkelijk", icoon: "🌱", uitleg: "Alle woorden en een tip.",
    woorden: "alle", vragen: 5, keuzes: 3, letterHulp: false, tip: true, ballonnen: 10, traag: 1.2 },
  moeilijk: { naam: "Moeilijk", icoon: "🔥", uitleg: "Geen tip en meer vragen.",
    woorden: "alle", vragen: 6, keuzes: 3, sorteerKeuzes: 4, letterHulp: false, tip: false, ballonnen: 12, traag: 1 },
  extraMoeilijk: { naam: "Extra moeilijk", icoon: "🌋", uitleg: "Lange woorden, geen tip en veel vragen.",
    woorden: "lang", vragen: 8, keuzes: 4, letterHulp: false, tip: false, ballonnen: 16, traag: 0.75 },
};
// Oude keuzes van eerdere versies.
const OUDE_NIVEAUS = { gemiddeld: "makkelijk" };

const heeftGekozen = () => !!localStorage.getItem("groep") && !!localStorage.getItem("niveau");
function mijnGroep() {
  const g = Number(localStorage.getItem("groep"));
  return g >= 4 && g <= 8 ? g : 4;
}
function mijnNiveauNaam() {
  const n = localStorage.getItem("niveau");
  return NIVEAUS[n] ? n : OUDE_NIVEAUS[n] || "makkelijk";
}
const mijnNiveau = () => NIVEAUS[mijnNiveauNaam()];
const catGroep = (cat) => cat.groep || 4;
// Hoort deze categorie bij jouw groep of een groep daarvoor?
const binnenMijnGroep = (cat) => catGroep(cat) <= mijnGroep();
// Voor slotjes: hoeveel categorieën (vooraan in de lijst) zijn al geleerd in eerdere groepen?
const alGeleerd = (lijst) => lijst.filter((c) => catGroep(c) < mijnGroep()).length;

// Welke woorden passen bij de moeilijkheid? Kort = makkelijk, lang = moeilijk.
// Er blijven altijd minstens 4 woorden over (of alle, als het er minder zijn).
function woordenVoorNiveau(lijst) {
  const n = mijnNiveau().woorden;
  if (n === "alle" || lijst.length <= 4) return lijst;
  const len = (x) => (typeof x === "string" ? x : x.w).length;
  const gesorteerd = [...lijst].sort((a, b) => len(a) - len(b));
  const aantal = Math.max(4, Math.ceil(lijst.length * 0.6));
  return n === "kort" ? gesorteerd.slice(0, aantal) : gesorteerd.slice(-aantal);
}

// Laat je de 💡 tip zien? Alleen bij extra makkelijk en makkelijk.
const toonTip = () => mijnNiveau().tip;
// Keuzes in het sorteerspel.
const sorteerKeuzes = () => mijnNiveau().sorteerKeuzes || mijnNiveau().keuzes;

// Hoeveel foute keuzes naast de goede (gaatjes): extra makkelijk 1, anders allemaal.
const fouteKeuzes = (fout) => (mijnNiveau().keuzes <= 2 ? fout.slice(0, 1) : fout);

// Sterren bij het eind: alles goed = 3, 60% of meer = 2, minstens 1 goed = 1.
function sterrenVoor(goed, totaal) {
  if (goed === totaal) return 3;
  if (goed >= Math.ceil(totaal * 0.6)) return 2;
  return goed >= 1 ? 1 : 0;
}

// Het kleine knopje op het beginscherm, bijvoorbeeld "Groep 4 · 🌱 Makkelijk".
function niveauKnop() {
  const n = mijnNiveau();
  return `<a class="niveau-knop" href="#kies" aria-label="Leeftijd en moeilijkheid veranderen">
    🎒 Groep ${mijnGroep()} · ${n.icoon} ${n.naam} <span class="pen">✏️</span></a>`;
}

// Het keuzescherm: eerst hoe oud je bent, dan hoe moeilijk.
function kiesScherm({ zegEekhoorn, zeg, naam, klaar }) {
  const scherm = document.getElementById("scherm");
  let groep = heeftGekozen() ? mijnGroep() : null;
  let niveau = heeftGekozen() ? mijnNiveauNaam() : null;
  const vraag1 = "Hoe oud ben jij?";
  const vraag2 = "Hoe moeilijk wil je het?";
  zegEekhoorn(`${vraag1} Dan weet ik welke categorieën bij jou passen.`);
  zeg(`Hoi! Ik ben ${naam()} Eekhoorn. ${vraag1}`);
  const teken = () => {
    scherm.innerHTML = `
      <div class="kaart kieskaart">
        <h2>🎂 ${vraag1}</h2>
        <div class="keuzes leeftijden">
          ${LEEFTIJDEN.map((l) => `<button class="grote-knop${l.groep === groep ? " gekozen" : ""}" data-groep="${l.groep}">
            ${l.jaar}<small>groep ${l.groep}</small></button>`).join("")}
        </div>
        <h2>💪 ${vraag2}</h2>
        <div class="keuzes niveaus">
          ${Object.entries(NIVEAUS).map(([k, n]) => `<button class="grote-knop${k === niveau ? " gekozen" : ""}" data-niveau="${k}">
            <span class="icoon">${n.icoon}</span>${n.naam}<small>${n.uitleg}</small></button>`).join("")}
        </div>
        <button class="grote-knop start" id="klaar" ${groep && niveau ? "" : "disabled"}>Klaar, we gaan! ▶</button>
        <p class="tip">Je kunt dit later altijd weer veranderen met het knopje 🎒 bovenaan.</p>
      </div>`;
    scherm.querySelectorAll("[data-groep]").forEach((b) => (b.onclick = () => {
      groep = Number(b.dataset.groep);
      teken();
      if (!niveau) { zegEekhoorn(vraag2); zeg(`Groep ${groep}, leuk! ${vraag2}`); }
      else zeg(`Groep ${groep}.`);
    }));
    scherm.querySelectorAll("[data-niveau]").forEach((b) => (b.onclick = () => {
      niveau = b.dataset.niveau;
      teken();
      const n = NIVEAUS[niveau];
      zegEekhoorn(groep ? `${n.naam}! Tik op Klaar.` : `${n.naam}! Hoe oud ben jij?`);
      zeg(`${n.naam}. ${n.uitleg}`);
    }));
    scherm.querySelector("#klaar").onclick = () => {
      if (!groep || !niveau) return;
      localStorage.setItem("groep", groep);
      localStorage.setItem("niveau", niveau);
      klaar();
    };
  };
  teken();
}
