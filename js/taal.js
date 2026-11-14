// ---------- taal van de app ----------
// De app kan Nederlands, Hebreeuws (van rechts naar links) en Engels praten.
// De spellingwoorden zelf blijven altijd Nederlands: je leert Nederlandse spelling.
// Alle vertalingen staan in vertalingen.js. De sleutel is de Nederlandse zin zelf,
// met {naam} op de plek van iets dat verandert. Staat een zin er niet in, dan blijft hij Nederlands.

const TALEN = [
  { code: "nl", naam: "Nederlands", vlag: "🇳🇱", stem: "nl-NL" },
  { code: "he", naam: "עברית", vlag: "🇮🇱", stem: "he-IL", rtl: true },
  { code: "en", naam: "English", vlag: "🇬🇧", stem: "en-GB" },
];
const TAAL = (() => {
  let c = null;
  try { c = localStorage.getItem("taal"); } catch (e) { /* niks */ }
  return TALEN.some((x) => x.code === c) ? c : "nl";
})();
const taalInfo = () => TALEN.find((x) => x.code === TAAL);
document.documentElement.lang = TAAL;
document.documentElement.dir = taalInfo().rtl ? "rtl" : "ltr";

// De volle naam van de eekhoorn in de gekozen taal (Eva of Erik, zie naam() in app.js).
const EEKHOORN = {
  nl: { Eva: "Eva Eekhoorn", Erik: "Erik Eekhoorn" },
  he: { Eva: "אווה הסנאית", Erik: "אריק הסנאי" },
  en: { Eva: "Eva Squirrel", Erik: "Erik Squirrel" },
};
const KORTE_NAAM = { he: { Eva: "אווה", Erik: "אריק" } };

// t("Hoi {naam}!", { naam: "Libby" }) geeft de zin in de gekozen taal.
// {eekhoorn} (volle naam) en {naam} (Eva of Erik) mag je altijd gebruiken.
function t(nl, vars = {}) {
  const lijst = TAAL === "nl" ? null : VERTALINGEN[TAAL];
  let zin = (lijst && lijst[nl]) || nl;
  const kort = typeof naam === "function" ? naam() : "Eva";
  const alles = { naam: (KORTE_NAAM[TAAL] || {})[kort] || kort, eekhoorn: EEKHOORN[TAAL][kort], ...vars };
  return zin.replace(/\{(\w+)\}/g, (m, k) => (k in alles ? alles[k] : m));
}

// Uitleg, regel, tip en figuurnaam van elke categorie in de gekozen taal.
// De Nederlandse regel bewaren we in regelNl: die leer je zo op school.
// De naam van de categorie (Hakwoord, Zingwoord, ...) blijft Nederlands, zoals in Staal.
function vertaalCategorieen() {
  for (const c of CATEGORIEEN) c.regelNl = c.regel;
  if (TAAL === "nl") return;
  const lijst = CAT_VERTALINGEN[TAAL] || {};
  for (const c of CATEGORIEEN) {
    const v = lijst[c.id || c.nr];
    if (v) Object.assign(c, v);
  }
}
vertaalCategorieen();

// Het taal-scherm (route #taal).
function taalScherm() {
  zegEekhoorn("Kies een taal · בחירת שפה · Choose a language");
  scherm.innerHTML = `
    <div class="kaart taalkaart">
      <h2>🌐 ${t("Welke taal?")}</h2>
      <div class="taal-keuzes">${TALEN.map((x) => `
        <button class="grote-knop taal-knop${x.code === TAAL ? " gekozen" : ""}" data-taal="${x.code}" lang="${x.code}" dir="${x.rtl ? "rtl" : "ltr"}">
          <span class="vlag">${x.vlag}</span>${x.naam}</button>`).join("")}</div>
      <p class="tip">${t("De woorden die je oefent blijven Nederlands. Uitleg, knoppen en wat {naam} zegt, komen in jouw taal.")}</p>
      <a class="terug" href="#">${t("← Terug")}</a>
    </div>`;
  scherm.querySelectorAll(".taal-knop").forEach((b) => (b.onclick = () => {
    try { localStorage.setItem("taal", b.dataset.taal); } catch (e) { /* niks */ }
    location.hash = "#";
    location.reload();
  }));
}

// De teksten in de kop (die staan in index.html) in de gekozen taal.
document.querySelectorAll("header [aria-label]").forEach((a) => a.setAttribute("aria-label", t(a.getAttribute("aria-label"))));
