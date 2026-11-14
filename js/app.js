// ---------- hulpjes ----------
const scherm = document.getElementById("scherm");
const eekhoorn = document.getElementById("eekhoorn");

const zegEekhoorn = (t) => { eekhoorn.textContent = t; };
const schud = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
// Voor het dictee: hoofdletters, spaties en de soort komma (' of ’) maken niet uit.
const netjes = (t) => t.trim().toLowerCase().replace(/[‘’`]/g, "'").replace(/\s+/g, " ");
const woord = (x) => (typeof x === "string" ? x : x.w);
const vindCat = (nr) => CATEGORIEEN.find((c) => c.nr === Number(nr));
const el = (html) => { const d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstElementChild; };
const wacht = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- voorlezen ----------
const VERSIE = 42; // staat op het stem-scherm, zodat je ziet of je de nieuwe app hebt
let nlStem = null;
// Liefst een vrouwenstem (iPhone/iPad/Mac: Claire, Chrome: Google Nederlands, Windows: Colette/Fenna).
const VROUW = /claire|ellen|fenna|colette|google|lotte|laura|anna|femke|sara|vrouw|female/i;
const MAN = /xander|maarten|frank|ruben|arnaud|daan|\bmale\b|\bman\b/i;
const taal = (v) => v.lang.replace("_", "-").toLowerCase();
const nlStemmen = () => speechSynthesis.getVoices().filter((v) => taal(v).startsWith("nl"));
const isVrouw = (v) => VROUW.test(v.name) && !/\bmale\b/i.test(v.name);
const isMan = (v) => MAN.test(v.name);
// Met een jongensstem heet de eekhoorn Erik, met een meisjesstem Eva.
const naam = () => (nlStem && isMan(nlStem) && !echteStemAan() ? "Erik" : "Eva");
function kiesStem() {
  const stemmen = speechSynthesis.getVoices();
  const nl = nlStemmen();
  const nlNL = nl.filter((v) => taal(v) === "nl-nl");
  const gekozen = localStorage.getItem("stem");
  nlStem =
    nl.find((v) => v.voiceURI === gekozen) ||
    nlNL.find(isVrouw) ||
    nlNL.find((v) => !isMan(v)) ||
    nl.find(isVrouw) ||
    nlNL[0] || nl[0] || null;
  if (stemmen.length && !nlStem) toonStemWaarschuwing();
}
function toonStemWaarschuwing() {
  if (document.getElementById("geen-stem")) return;
  const w = el(`<div id="geen-stem" class="waarschuwing">
    Dit apparaat heeft geen Nederlandse voorleesstem, dus het voorlezen klinkt niet goed.
    Op een iPad: Instellingen → Toegankelijkheid → Gesproken materiaal → Stemmen → Nederlands.
    Of gebruik Google Chrome.</div>`);
  document.body.prepend(w);
}
if ("speechSynthesis" in window) { kiesStem(); speechSynthesis.onvoiceschanged = () => { kiesStem(); if (!location.hash || location.hash === "#") route(); }; }

// Knip een tekst in korte stukjes (zinnen en stukjes tussen komma's),
// zodat de stem na elk stukje echt even stopt.
function stukjes(tekst) {
  return (String(tekst).match(/[^.!?,:;]+[.!?,:;]*/g) || [])
    .map((t) => t.trim())
    .filter(Boolean);
}

let spreekBeurt = 0; // telt op bij elke nieuwe zeg(), zodat een oude zin stopt
// Snelheid kies je met het schuifje op het stem-scherm: 0.5 (langzaam) tot 1.5 (supersnel),
// 1 (gewoon) in het midden. Losse dicteewoorden gaan altijd iets langzamer.
const tempo = () => {
  const v = parseFloat(localStorage.getItem("snelheid"));
  return v >= 0.5 && v <= 1.5 ? v : 1;
};
function snelheid(t) {
  const losWoord = !/\s/.test(t.trim());
  return losWoord ? tempo() * 0.9 : tempo();
}

let huidigeZin = null; // Safari: bewaar de zin, anders wordt hij soms opgeruimd en blijft het stil
function spreekStukje(t, metStem = true) {
  return new Promise((klaar) => {
    const u = new SpeechSynthesisUtterance(t);
    huidigeZin = u;
    u.lang = nlStem ? nlStem.lang : "nl-NL";
    u.rate = snelheid(t);
    u.pitch = 1; // gewone toonhoogte: hoger of lager klinkt raar en onduidelijk
    if (metStem && nlStem) u.voice = nlStem;
    let gedaan = false, begonnen = false;
    const af = () => { if (!gedaan) { gedaan = true; klaar(); } };
    u.onstart = () => { begonnen = true; };
    u.onend = af;
    u.onerror = (e) => {
      // Werkt de gekozen stem niet? Probeer het dan nog een keer met de gewone stem.
      if (!gedaan && metStem && !begonnen && !/interrupted|canceled/.test(e.error || "")) {
        gedaan = true; spreekStukje(t, false).then(klaar);
      } else af();
    };
    // vangnet: sommige browsers vergeten onend
    setTimeout(af, 2500 + t.length * 250);
    speechSynthesis.speak(u);
  });
}

// Volgorde: een echte stem van Wikimedia (losse woorden),
// en anders de computerstem van het apparaat.
async function zeg(tekst) {
  const beurt = ++spreekBeurt;
  stopGeluid();
  const tts = "speechSynthesis" in window;
  if (tts) {
    if (!nlStem) kiesStem();
    // iPhone/iPad: alleen als er al iets klinkt even stoppen en wachten. Anders meteen
    // praten, want na een tik moet de stem direct beginnen, anders blijft hij stil.
    if (speechSynthesis.speaking || speechSynthesis.pending) {
      speechSynthesis.cancel();
      await wacht(100);
    }
    if (speechSynthesis.paused) speechSynthesis.resume();
  }
  for (const t of stukjes(tekst)) {
    if (beurt !== spreekBeurt) return;
    let gedaan = false;
    if (echteStemAan() && !/\s/.test(t)) gedaan = await speelEchteStem(t);
    if (beurt !== spreekBeurt) return;
    if (!gedaan) {
      if (tts) await spreekStukje(t); else await wacht(600);
    }
    if (beurt !== spreekBeurt) return;
    await wacht(gedaan ? 400 : 250);
  }
}

// ---------- sterren ----------
const sterren = () => JSON.parse(localStorage.getItem("sterren") || "{}");
function geefSterren(nr, aantal) {
  const s = sterren();
  s[nr] = Math.max(s[nr] || 0, aantal);
  localStorage.setItem("sterren", JSON.stringify(s));
  bewaarSpelSterren(nr, location.hash.slice(1).split("/")[0], aantal); // voor de weg
}
const sterTekst = (n) => "★".repeat(n) + "☆".repeat(3 - n);

// ---------- slotjes en sleutels ----------
// Je leert de categorieën op volgorde, 1 tot en met 34. In het begin is alleen 1 open.
// Haal je bij de laatste open categorie 2 sterren of meer, dan krijg je een 🔑.
// Met die sleutel maak je zelf de volgende categorie open (scherm #open/nr).
const NODIG = 2;
const allesOpen = () => localStorage.getItem("allesOpen") === "ja";
// Hoeveel categorieën op een rij (vanaf 1) hebben al 2 sterren?
function opEenRij() {
  const s = sterren();
  let n = alGehad(); // wat je al op school had, telt als geleerd
  while (n < CATEGORIEEN.length && (s[CATEGORIEEN[n].nr] || 0) >= NODIG) n++;
  return n;
}
function aantalOpen() {
  if (allesOpen()) return CATEGORIEEN.length;
  let n = parseInt(localStorage.getItem("geopend"), 10);
  if (!(n >= 1)) { // eerste keer: wat je al had, blijft open
    n = Math.min(opEenRij() + 1, CATEGORIEEN.length);
    localStorage.setItem("geopend", n);
  }
  return Math.min(Math.max(n, alGehad() + 1), CATEGORIEEN.length);
}
const isOpen = (cat) => CATEGORIEEN.indexOf(cat) < aantalOpen();
const openCats = () => CATEGORIEEN.slice(0, aantalOpen());
// De categorie die je met je sleutel open mag maken (of null als je nog geen sleutel hebt).
function sleutelVoor() {
  const n = aantalOpen();
  return n < CATEGORIEEN.length && opEenRij() >= n ? CATEGORIEEN[n] : null;
}

// ---------- het lastige stukje ----------
function maakGat(cat, x) {
  const w = woord(x);
  if (typeof x === "object" && x.deel) {
    const i = w.indexOf(x.deel);
    return { voor: w.slice(0, i), deel: x.deel, na: w.slice(i + x.deel.length), fout: x.fout };
  }
  const gat = cat.gat || KLINKER_GAT; // geen eigen gat (zoals hakwoord): dan de klinker
  const m = w.match(gat.re);
  if (!m) return null;
  return { voor: w.slice(0, m.index), deel: m[0], na: w.slice(m.index + m[0].length), fout: gat.alts[m[0]] };
}
// Voor woorden zonder eigen lastig stukje: de klinkerklank, met een veelgemaakte fout.
const KLINKER_GAT = {
  re: /aa|ee|oo|uu|ie|oe|ui|eu|ou|ei|ij|[aeiou]/,
  alts: { a: ["aa"], aa: ["a"], e: ["ee"], ee: ["e"], o: ["oo"], oo: ["o"], u: ["uu"], uu: ["u"],
          i: ["ie"], ie: ["i"], oe: ["oo"], ui: ["ou"], eu: ["u"], ou: ["au"], ei: ["ij"], ij: ["ei"] },
};
// Een woord met een spelfout erin (voor de ballonnen).
// Met echtNee = true: geen "fout" woord dat eigenlijk een echt woord is (man, bank, ligt),
// voor spelletjes zonder voorlezen, zoals de ballonnen.
function foutWoord(cat, x, echtNee = false) {
  const g = maakGat(cat, x);
  if (!g) return null;
  const opties = g.fout.map((f) => g.voor + f + g.na).filter((f) => !echtNee || !ECHTE_WOORDEN.has(f));
  return opties.length ? schud(opties)[0] : null;
}
const ECHTE_WOORDEN = new Set(("vies peen rook man bot ram ban bank bang ton slank bier pier mier oer dor " +
  "ligt licht raat raad krap poten kiel vel per ping rink del deel kus kussen bed bet").split(" "));
function gekleurd(cat, x) {
  const g = maakGat(cat, x);
  return g ? `${g.voor}<mark>${g.deel}</mark>${g.na}` : woord(x);
}

// ---------- feestje ----------
function feest() {
  geluid("feest");
  for (let i = 0; i < 18; i++) {
    const f = actiefFeest();
    const s = el(`<span class="confetti">${schud(f ? [...f.versiering, "✨"] : ["⭐", "🎉", "✨", "🌟"])[0]}</span>`);
    s.style.left = Math.random() * 100 + "vw";
    s.style.animationDelay = Math.random() * 0.5 + "s";
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 2500);
  }
}

// ---------- schermen ----------
function thuis() {
  // De eerste keer kiest het kind eerst hoe oud het is, hoe moeilijk en wat het al heeft gehad.
  if (!heeftGekozen()) return kies();
  const f = actiefFeest();
  zegEekhoorn(`Hoi! Ik ben ${naam()} Eekhoorn. ${f ? f.groet + " " : ""}Tik op een categorie en kies een spelletje!`);
  const s = sterren();
  scherm.innerHTML = `
    ${niveauKnop()}
    <div class="thuis-spellen">
      <a class="thuis-knop" href="#doolhof" style="background:#f06292"><span>🧭</span>Doolhof</a>
      <a class="thuis-knop" href="#sorteer" style="background:#4fc3f7"><span>🎮</span>Sorteerspel</a>
      <a class="thuis-knop" href="#stickers" style="background:#9575cd"><span>📒</span>Stickerboek</a>
      <a class="thuis-knop" href="#prijzen" style="background:#a1887f"><span>🛒</span>Winkel</a>
      <a class="thuis-knop" href="#feesten" style="background:#ffb300"><span>${f ? f.emoji : "🎉"}</span>Feesten</a>
    </div>
    ${verderKnop(s)}
    <div class="groep-sprong">${GROEPEN.map((g) => {
      const cats = CATEGORIEEN.filter((c) => c.groep === g.nr);
      return `<button class="groep-knop" data-groep="${g.nr}">${g.naam}<small>${cats[0].nr} t/m ${cats[cats.length - 1].nr}</small></button>`;
    }).join("")}</div>
    <p class="thuis-uitleg">👇 Tik op een categorie. Je leert ze op volgorde: 2 sterren geeft een 🔑 voor de volgende.</p>
    <ul class="grid"></ul>
    <div class="ouder"></div>`;
  scherm.querySelectorAll(".groep-knop").forEach((b) => (b.onclick = () => {
    const kop = scherm.querySelector(`.groep-kop[data-groep="${b.dataset.groep}"]`);
    if (kop) kop.scrollIntoView({ behavior: "smooth", block: "start" });
    // Nog op slot? Dan zegt Eva hoe je zegt dat je ze al hebt gehad.
    const eerste = CATEGORIEEN.find((c) => c.groep === Number(b.dataset.groep));
    if (eerste && !isOpen(eerste)) {
      const t = "Heb je deze categorieën al gehad op school? Tik dan bovenaan op het vinkje ✅.";
      zegEekhoorn(t); zeg(t);
    }
  }));
  const lijst = scherm.querySelector(".grid");
  for (const c of CATEGORIEEN) {
    // Een kopje boven de eerste categorie van elke groep.
    const groep = GROEPEN.find((g) => g.nr === c.groep);
    if (groep && c === CATEGORIEEN.find((d) => d.groep === c.groep)) {
      lijst.appendChild(el(`<li class="groep-kop" data-groep="${groep.nr}">${groep.naam}</li>`));
    }
    lijst.appendChild(tegel(c, s));
  }
  ouderKnop(scherm.querySelector(".ouder"));
}

// Een tegel op het beginscherm: open, klaar voor je sleutel, of op slot.
function tegel(c, s) {
  if (isOpen(c)) return el(`
      <li><a class="tegel" href="#cat/${c.nr}" style="background:${c.kleur}">
        <span class="figuur">${c.figuur}</span>
        <span class="nr">${c.nr}</span>
        <span class="naam">${c.naam}</span>
        <span class="sterren">${sterTekst(s[c.nr] || 0)}</span>
      </a></li>`);
  if (sleutelVoor() === c) return el(`
      <li><a class="tegel sleutel-klaar" href="#open/${c.nr}" style="--kleur:${c.kleur}">
        <span class="figuur">🔑</span>
        <span class="nr">${c.nr}</span>
        <span class="naam">${c.naam}</span>
        <span class="sterren">Tik en maak open!</span>
      </a></li>`);
  const li = el(`
      <li><button class="tegel dicht" aria-label="${c.naam} (op slot)">
        <span class="figuur">🔒</span>
        <span class="nr">${c.nr}</span>
        <span class="naam">${c.naam}</span>
      </button></li>`);
  li.querySelector("button").onclick = () => {
    const i = CATEGORIEEN.indexOf(c), n = aantalOpen();
    const t = i === n
      ? `Haal 2 sterren bij ${CATEGORIEEN[n - 1].naam}. Dan krijg je de sleutel voor ${c.naam}!`
      : `${c.naam} zit nog op slot. Leer eerst ${CATEGORIEEN[n - 1].naam}! Heb je hem al gehad? Tik dan op ✅ bovenaan.`;
    zegEekhoorn(t); zeg(t);
  };
  return li;
}

// Voor de juf of een ouder: alles openzetten (met een sommetje, zodat kinderen
// het niet per ongeluk doen) of weer op volgorde zetten.
function ouderKnop(doos) {
  if (!doos) return;
  if (allesOpen()) {
    doos.innerHTML = `<button class="klein-knop">🔒 Weer op volgorde leren</button>`;
    doos.querySelector("button").onclick = () => { localStorage.removeItem("allesOpen"); thuis(); };
    return;
  }
  doos.innerHTML = `<button class="klein-knop">🔑 Voor juf of ouder</button>`;
  doos.querySelector("button").onclick = () => {
    const a = 6 + Math.floor(Math.random() * 4), b = 6 + Math.floor(Math.random() * 4);
    doos.innerHTML = `
      <form class="ouder-vraag">
        <label>Alles openzetten? Hoeveel is ${a} × ${b}?
          <input inputmode="numeric" autocomplete="off" size="4"></label>
        <button class="klein-knop">OK</button>
      </form>`;
    const veld = doos.querySelector("input");
    veld.focus();
    doos.querySelector("form").onsubmit = (e) => {
      e.preventDefault();
      if (Number(veld.value) === a * b) { localStorage.setItem("allesOpen", "ja"); thuis(); }
      else ouderKnop(doos);
    };
  };
}

// 🔑 Met je sleutel maak je de volgende categorie open.
function openMaken(cat) {
  if (sleutelVoor() !== cat) { location.hash = isOpen(cat) ? `#cat/${cat.nr}` : "#"; return; }
  const t = `Je hebt een sleutel! Tik op de sleutel en maak ${cat.naam} open.`;
  zegEekhoorn(t); zeg(t);
  scherm.innerHTML = `
    <div class="kaart open-kaart" style="border-color:${cat.kleur}">
      <h2>🔑 Je hebt een sleutel!</h2>
      <div class="slot-deur" style="background:${cat.kleur}">
        <span class="figuur reus">${cat.figuur}</span>
        <div class="nr">${cat.nr}</div><h2>${cat.naam}</h2>
        <span class="groot-slot">🔒</span>
      </div>
      <button class="sleutel-knop" aria-label="Maak open met de sleutel">🔑</button>
      <p class="thuis-uitleg">Tik op de sleutel!</p>
      <a class="terug" href="#">← Terug</a>
    </div>`;
  const knop = scherm.querySelector(".sleutel-knop");
  knop.onclick = async () => {
    knop.disabled = true;
    localStorage.setItem("geopend", CATEGORIEEN.indexOf(cat) + 1);
    knop.classList.add("draai");
    geluid("goed");
    await wacht(900);
    scherm.querySelector(".groot-slot").textContent = "🔓";
    scherm.querySelector(".slot-deur").classList.add("open");
    scherm.querySelector(".open-kaart > h2").textContent = "🔓 Open!";
    feest(); geluid("feest");
    const hoera = `Hoera! ${cat.naam} is open!`;
    zegEekhoorn(hoera + " 🔓"); zeg(hoera);
    scherm.querySelector(".thuis-uitleg").outerHTML =
      `<a class="verder-knop" href="#cat/${cat.nr}" style="background:${cat.kleur}"><span>▶️</span><span>Ga naar <b>${cat.nr} ${cat.naam}</b></span></a>`;
    knop.remove();
  };
}

// De volgende categorie om te leren: de eerste (in Staal-volgorde) die nog geen 3 sterren heeft.
// (Een open categorie die nog geen 2 sterren heeft; anders de laatste open.)
function volgendeTeLeren(s) {
  const open = openCats();
  return open.find((c) => (s[c.nr] || 0) < NODIG) || open[open.length - 1];
}
function verderKnop(s) {
  const k = sleutelVoor();
  if (k) return `<a class="verder-knop sleutel" href="#open/${k.nr}" style="background:${k.kleur}">
    <span>🔑</span><span>Je hebt een sleutel! Maak <b>${k.nr} ${k.naam}</b> open</span></a>`;
  const c = volgendeTeLeren(s);
  return `<a class="verder-knop" href="#cat/${c.nr}" style="background:${c.kleur}">
    <span>▶️</span><span>Verder leren: <b>${c.nr} ${c.naam}</b> ${c.figuur}</span></a>`;
}
// Knoppen onderaan een categorie: naar de vorige en de volgende, zo loop je alle 34 af.
function buurKnoppen(cat) {
  const i = CATEGORIEEN.indexOf(cat);
  const vorige = CATEGORIEEN[i - 1], volgende = CATEGORIEEN[i + 1];
  return `<div class="buren">
    ${vorige ? `<a class="buur" href="#cat/${vorige.nr}">⬅️ ${vorige.nr} ${vorige.naam}</a>` : "<span></span>"}
    ${!volgende ? `<span class="buur klaar">🏆 Dit is de laatste!</span>`
      : isOpen(volgende) ? `<a class="buur volgende" href="#cat/${volgende.nr}" style="background:${volgende.kleur}">${volgende.nr} ${volgende.naam} ➡️</a>`
      : sleutelVoor() === volgende ? `<a class="buur volgende" href="#open/${volgende.nr}" style="background:${volgende.kleur}">🔑 Maak ${volgende.nr} ${volgende.naam} open</a>`
      : `<span class="buur dicht">🔒 ${volgende.nr} ${volgende.naam}: haal eerst 2 sterren</span>`}
  </div>`;
}

function categorie(cat) {
  zegEekhoorn(cat.feest
    ? `Dit is ${cat.figuurNaam}. Het is ${cat.feest.naam}! Je oefent nu met ${cat.feest.naam}-woorden.`
    : `Dit is ${cat.figuurNaam}. Loop met mij over de weg naar de beker!`);
  scherm.innerHTML = `
    <div class="kaart" style="border-color:${cat.kleur}">
      <div class="kop" style="background:${cat.kleur}">
        <span class="figuur groot">${cat.figuur}</span>
        <div><div class="nr">${cat.nr}</div><h2>${cat.naam}</h2></div>
      </div>
      <p class="regel">${cat.regel}</p>
      ${cat.feest ? `<p class="feest-woorden">${cat.feest.emoji} ${cat.feest.naam}-woorden: ${cat.woorden.slice(0, 6).map(woord).join(", ")}</p>` : ""}
      ${tekenWeg(cat)}
      ${tekenMeerSpellen(cat)}
      ${buurKnoppen(cat)}
      <a class="terug" href="#">← Terug</a>
    </div>`;
}

async function uitleg(cat) {
  zegEekhoorn("Kijk en luister goed!");
  scherm.innerHTML = `
    <div class="kaart" style="border-color:${cat.kleur}">
      <div class="podium">
        <span class="figuur reus dans">${cat.figuur}</span>
        <p class="ballon" id="ballon"></p>
      </div>
      <ul class="voorbeelden" id="vb"></ul>
      <div class="knoppen">
        <button class="grote-knop" id="start">▶ Speel de uitleg</button>
        <a class="grote-knop" href="#cat/${cat.nr}">Klaar</a>
      </div>
    </div>`;
  const ballon = scherm.querySelector("#ballon");
  const vb = scherm.querySelector("#vb");
  ballon.textContent = cat.uitleg;
  const huidig = location.hash;
  scherm.querySelector("#start").onclick = async () => {
    bewaarSpelSterren(catSleutel(cat), "uitleg", 1);
    vb.innerHTML = "";
    ballon.textContent = cat.uitleg;
    await zeg(cat.uitleg);
    for (const x of cat.woorden.slice(0, 5)) {
      if (location.hash !== huidig) return;
      const li = el(`<li class="pop">${gekleurd(cat, x)}</li>`);
      vb.appendChild(li);
      await zeg(woord(x));
      await wacht(300);
    }
    if (location.hash === huidig) { ballon.textContent = cat.regel; await zeg(cat.regel); }
  };
}

// Een ronde vragen (hoeveel hangt af van de moeilijkheid). maakVraag(i) tekent een vraag en roept antwoord(goed) aan.
// Je hebt LEVENS hartjes. Fout = een hartje kwijt. Alle hartjes op = geen punten.
const LEVENS = 3;
const hartjes = (n) => "❤️".repeat(n) + "🤍".repeat(LEVENS - n);
function speelRonde({ titel, cat, maakVraag, terug }) {
  let i = 0, goed = 0, levens = LEVENS;
  const RONDE = mijnNiveau().vragen;
  const hier = location.hash;
  const opnieuw = () => speelRonde({ titel, cat, maakVraag, terug });
  const volgende = () => {
    if (i === RONDE) return einde();
    scherm.innerHTML = `
      <div class="kaart" ${cat ? `style="border-color:${cat.kleur}"` : ""}>
        <div class="voortgang">${titel} · vraag ${i + 1} van ${RONDE}</div>
        <div class="levens-balk"><span class="levens">${hartjes(levens)}</span><span class="pot">🌰 ${goed}</span></div>
        <div id="vraag"></div>
        <a class="terug" href="${terug}">← Stoppen</a>
      </div>`;
    maakVraag(scherm.querySelector("#vraag"), async (isGoed, uitlegFout) => {
      if (isGoed) {
        goed++; geluid("goed"); eikelVlieg();
        scherm.querySelector(".pot").textContent = `🌰 ${goed}`;
        zegEekhoorn(schud(["Goed zo!", "Super!", "Top!", "Knap gedaan!"])[0]); zeg("Goed zo!");
      } else {
        levens--; geluid("fout"); zegEekhoorn(uitlegFout);
        const l = scherm.querySelector(".levens");
        l.textContent = hartjes(levens); l.classList.add("au");
      }
      i++;
      await wacht(isGoed ? 900 : 2400);
      if (location.hash !== hier) return; // niet doorgaan als het kind al weg is
      if (levens === 0) return levensOp({ cat, opnieuw, terug });
      volgende();
    });
  };
  const einde = () => {
    const n = sterrenVoor(goed, RONDE);
    eindScherm({ cat, n, tekst: `Je had er ${goed} van de ${RONDE} goed.`, verdiend: goed, opnieuw, terug });
  };
  volgende();
}

function gaatjes(cat) {
  const lijst = woordenVoorNiveau(cat.woorden.filter((x) => maakGat(cat, x)));
  if (!lijst.length) return categorie(cat);
  speelRonde({
    titel: "🧩 Gaatjes", cat, terug: `#cat/${cat.nr}`,
    maakVraag: (doos, antwoord) => {
      const x = lijst[Math.floor(Math.random() * lijst.length)];
      const g = maakGat(cat, x);
      zegEekhoorn("Welk stukje past in het gaatje?");
      doos.innerHTML = `
        <button class="luister" title="Luister">🔊</button>
        ${tipHtml(cat)}
        ${betekenisHtml(woord(x))}
        <div class="woord-groot">${g.voor}<span class="gat">?</span>${g.na}</div>
        <div class="keuzes">${schud([g.deel, ...fouteKeuzes(g.fout)]).map((o) => `<button class="keuze">${o}</button>`).join("")}</div>`;
      doos.querySelector(".luister").onclick = () => zeg(metZin(woord(x)));
      zeg(metZin(woord(x)));
      doos.querySelectorAll(".keuze").forEach((k) => (k.onclick = () => {
        doos.querySelectorAll(".keuze").forEach((b) => (b.disabled = true));
        const isGoed = k.textContent === g.deel;
        k.classList.add(isGoed ? "goed" : "fout");
        doos.querySelector(".gat").textContent = g.deel;
        doos.querySelector(".gat").classList.add("ingevuld");
        antwoord(isGoed, `Bijna! Het is ${woord(x)}. ${cat.regel}`);
      }));
    },
  });
}

function dictee(cat) {
  const lijst = woordenVoorNiveau(cat.woorden);
  speelRonde({
    titel: "🎧 Dictee", cat, terug: `#cat/${cat.nr}`,
    maakVraag: (doos, antwoord) => {
      const x = schud(lijst)[0];
      const w = woord(x);
      // Makkelijk: je ziet hoeveel letters het woord heeft.
      const hulp = mijnNiveau().letterHulp ? `<div class="letterhulp" aria-label="${w.length} letters">${"_ ".repeat(w.length).trim()}</div>` : "";
      zegEekhoorn("Luister goed en schrijf het woord op.");
      doos.innerHTML = `
        <button class="luister groot" title="Luister nog een keer">🔊</button>
        ${hulp}
        ${betekenisHtml(w)}
        ${tipHtml(cat)}
        <form class="dictee">
          <input autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Schrijf het woord">
          <button class="grote-knop">Klaar ✔</button>
        </form>
        <div class="uitkomst"></div>`;
      const veld = doos.querySelector("input");
      // Zeg het woord twee keer, met een pauze ertussen, zodat je het goed hoort.
      const zegWoord = () => zeg(betekenis(w) ? metZin(w) : `${w}. ${w}.`);
      doos.querySelector(".luister").onclick = zegWoord;
      zegWoord(); veld.focus();
      doos.querySelector("form").onsubmit = (e) => {
        e.preventDefault();
        if (!veld.value.trim()) return;
        veld.disabled = true;
        const isGoed = netjes(veld.value) === netjes(w);
        veld.classList.add(isGoed ? "goed" : "fout");
        if (!isGoed) doos.querySelector(".uitkomst").innerHTML = `Het is: <b>${gekleurd(cat, x)}</b>`;
        antwoord(isGoed, `Kijk goed: ${w}. ${cat.regel}`);
      };
    },
  });
}

function sorteer() {
  speelRonde({
    titel: "🎮 Sorteerspel", cat: null, terug: "#",
    maakVraag: (doos, antwoord) => {
      const open = openCats();
      const cat = schud(open)[0];
      const x = schud(woordenVoorNiveau(cat.woorden))[0];
      const keuzes = schud([cat, ...schud(open.filter((c) => c !== cat)).slice(0, Math.min(sorteerKeuzes(), open.length) - 1)]);
      zegEekhoorn("Bij welke categorie hoort dit woord?");
      doos.innerHTML = `
        <button class="luister" title="Luister">🔊</button>
        <div class="woord-groot">${woord(x)}</div>
        <div class="keuzes cats">${keuzes.map((c) => `
          <button class="keuze cat" data-nr="${c.nr}" style="background:${c.kleur}">
            <span class="figuur">${c.figuur}</span>${c.nr} ${c.naam}</button>`).join("")}</div>`;
      doos.querySelector(".luister").onclick = () => zeg(woord(x));
      zeg(woord(x));
      doos.querySelectorAll(".keuze").forEach((k) => (k.onclick = () => {
        doos.querySelectorAll(".keuze").forEach((b) => (b.disabled = true));
        const isGoed = Number(k.dataset.nr) === cat.nr;
        k.classList.add(isGoed ? "goed" : "fout");
        doos.querySelector(`[data-nr="${cat.nr}"]`).classList.add("goed");
        doos.querySelector(".woord-groot").innerHTML = gekleurd(cat, x);
        antwoord(isGoed, `${woord(x)} is een ${cat.naam.toLowerCase()}. ${cat.regel}`);
      }));
    },
  });
}

// ---------- stem kiezen ----------
function stemScherm() {
  zegEekhoorn("Hoe wil je dat ik praat? Kies een stem en hoe snel ik praat.");
  if (!nlStem && "speechSynthesis" in window) kiesStem();
  const stemmen = "speechSynthesis" in window ? nlStemmen() : [];
  const heeftVrouw = stemmen.some(isVrouw);
  scherm.innerHTML = `
    <div class="kaart stemkaart">
      <h2>🔊 Hoe praat ${naam()}?</h2>
      <h3>Hoe snel?</h3>
      <div class="schuif">
        <input type="range" id="tempo" min="0.5" max="1.5" step="0.05" value="${tempo()}" aria-label="Hoe snel">
        <div class="schuif-labels"><span>🐌 Langzaam</span><span>🚶 Gewoon</span><span>🚀 Supersnel</span></div>
      </div>
      <h3>Welke stem?</h3>
      <div class="keuzes" id="stemmen">
        ${stemmen.map((v, i) => `<button class="grote-knop${!echteStemAan() && nlStem && v.voiceURI === nlStem.voiceURI ? " gekozen" : ""}" data-i="${i}">
          ${isVrouw(v) ? "👧 Meisje" : isMan(v) ? "👦 Jongen" : "🙂"}: ${v.name}</button>`).join("") || "<p>Geen Nederlandse stem gevonden.</p>"}
        <button class="grote-knop${echteStemAan() ? " gekozen" : ""}" id="echt">🧑 Echte mensen (steeds iemand anders)</button>
      </div>
      ${heeftVrouw ? "" : `<p class="tip">Er is nog geen meisjesstem op dit apparaat. Vraag een grote mens om te helpen:
        iPhone of iPad → Instellingen → Toegankelijkheid → Gesproken materiaal → Stemmen → Nederlands →
        tik op <b>Claire</b> om haar te downloaden. Kom daarna hier terug.</p>`}
      <p class="tip">Hoor je niks? Zet het geluid harder en zet de iPhone of iPad niet op stil
        (het knopje aan de zijkant).</p>
      <p class="tip">Klinkt een stem raar of krakerig? Op een iPhone of iPad kun je bij
        Instellingen → Toegankelijkheid → Gesproken materiaal → Stemmen → Nederlands
        de <b>verbeterde</b> versie van de stem downloaden. Die klinkt veel mooier.</p>
      <button class="grote-knop" id="probeer">▶️ Probeer</button>
      <p class="tip"><b>Echte mensen</b>: bij losse woorden hoor je een opname van een echt persoon, jongen of meisje,
        steeds iemand anders. Daarvoor is internet nodig.
        <small>Opnames: Lingua Libre en WikiWoordenboek via Wikimedia Commons (CC BY-SA).</small></p>
      <p class="versie">Versie ${VERSIE}</p>
    </div>`;
  const probeer = () => zeg(`Hoi! Ik ben ${naam()} Eekhoorn. Luister goed: kat, Stijn, hulp.`);
  const schuif = scherm.querySelector("#tempo");
  // Bij het loslaten van het schuifje: onthouden en even laten horen hoe snel het is.
  schuif.onchange = () => { localStorage.setItem("snelheid", schuif.value); probeer(); };
  scherm.querySelectorAll("#stemmen button").forEach((b) => (b.onclick = () => {
    // Een gekozen stem gebruiken we overal, ook bij losse woorden (dus geen echte mensen).
    localStorage.setItem("stem", stemmen[b.dataset.i].voiceURI); localStorage.setItem("echteStem", "uit");
    kiesStem(); stemScherm(); probeer();
  }));
  scherm.querySelector("#probeer").onclick = probeer;
  scherm.querySelector("#echt").onclick = () => {
    localStorage.setItem("echteStem", "aan"); stemScherm(); zeg("kat. vis. hulp.");
  };
}

// ---------- leeftijd en moeilijkheid ----------
function kies(naarGehad) {
  kiesScherm({ zegEekhoorn, zeg, naam, naarGehad, klaar: () => {
    if (location.hash === "" || location.hash === "#") thuis(); else location.hash = "#";
  } });
}

// ---------- router ----------
function route() {
  spreekBeurt++; stopGeluid();
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  const [naam, nr] = location.hash.slice(1).split("/");
  const gevonden = vindCat(nr);
  // op slot: terug naar het begin. Tijdens een feest: met feest-woorden (zie feesten.js).
  const cat = gevonden && isOpen(gevonden) ? feestCat(gevonden) : null;
  window.scrollTo(0, 0);
  if (naam === "open" && gevonden) return openMaken(gevonden);
  if (naam === "sorteer" && aantalOpen() >= 2) return sorteer();
  if (naam === "stem") return stemScherm();
  if (naam === "kies") return kies(nr === "gehad");
  if (cat && naam === "cat") return categorie(cat);
  if (cat && naam === "uitleg") return uitleg(cat);
  if (cat && naam === "gaatjes") return gaatjes(cat);
  if (cat && naam === "dictee") return dictee(cat);
  if (naam === "prijzen") return prijzen();
  if (naam === "bordspel" || naam === "doolhof") return doolhof(cat || null, feestDoolhof());
  if (naam === "feesten") return feestenScherm();
  if (naam === "stickers") return stickerboek();
  if (naam === "stickermaker") return stickermaker();
  if (cat && naam === "ballonnen") return ballonnen(cat, ...feestThema("ballonnen"));
  if (cat && naam === "eikels") return eikels(cat, ...feestThema("eikels"));
  if (cat && naam === "kiezen") return kiezen(cat);
  if (cat && naam === "wereld") return wereldSpel(cat, location.hash.split("/")[2]);
  if (cat && naam === "maak") return maakSpel(cat);
  thuis();
}
window.addEventListener("hashchange", route);
route();
