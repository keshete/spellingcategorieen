// ---------- hulpjes ----------
const scherm = document.getElementById("scherm");
const eekhoorn = document.getElementById("eekhoorn");
const RONDE = 5; // vragen per spelletje

const zegEekhoorn = (t) => { eekhoorn.textContent = t; };
const schud = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const woord = (x) => (typeof x === "string" ? x : x.w);
const vindCat = (id) => CATEGORIEEN.find((c) => c.id === id);
const el = (html) => { const d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstElementChild; };
const wacht = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- voorlezen ----------
let nlStem = null;
// Liefst een vrouwenstem (iPhone/iPad/Mac: Claire, Chrome: Google Nederlands, Windows: Colette/Fenna).
const VROUW = /claire|ellen|fenna|colette|google|lotte|laura|anna|femke|sara|vrouw|female/i;
const MAN = /xander|maarten|frank|ruben|arnaud|daan|male|man\b/i;
function kiesStem() {
  const stemmen = speechSynthesis.getVoices();
  const taal = (v) => v.lang.replace("_", "-").toLowerCase();
  const nl = stemmen.filter((v) => taal(v).startsWith("nl"));
  const nlNL = nl.filter((v) => taal(v) === "nl-nl");
  const vrouw = (v) => VROUW.test(v.name) && !/\bmale\b/i.test(v.name);
  nlStem =
    nlNL.find(vrouw) ||
    nlNL.find((v) => !MAN.test(v.name)) ||
    nl.find(vrouw) ||
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
if ("speechSynthesis" in window) { kiesStem(); speechSynthesis.onvoiceschanged = kiesStem; }

// Knip een tekst in korte stukjes (zinnen en stukjes tussen komma's),
// zodat de stem na elk stukje echt even stopt.
function stukjes(tekst) {
  return (String(tekst).match(/[^.!?,:;]+[.!?,:;]*/g) || [])
    .map((t) => t.trim())
    .filter(Boolean);
}

let spreekBeurt = 0; // telt op bij elke nieuwe zeg(), zodat een oude zin stopt
// Rustig praten; losse dicteewoorden nog iets langzamer, zodat je ze goed hoort.
function snelheid(t) {
  const losWoord = !/\s/.test(t.trim());
  return losWoord ? 0.6 : 0.8;
}

function spreekStukje(t) {
  return new Promise((klaar) => {
    const u = new SpeechSynthesisUtterance(t);
    u.lang = nlStem ? nlStem.lang : "nl-NL";
    u.rate = snelheid(t);
    if (nlStem) u.voice = nlStem;
    let gedaan = false;
    const af = () => { if (!gedaan) { gedaan = true; klaar(); } };
    u.onend = af; u.onerror = af;
    // vangnet: sommige browsers vergeten onend
    setTimeout(af, 2000 + t.length * 200);
    speechSynthesis.speak(u);
  });
}

async function zeg(tekst) {
  if (!("speechSynthesis" in window)) return wacht(600);
  if (!nlStem) kiesStem();
  const beurt = ++spreekBeurt;
  speechSynthesis.cancel();
  await wacht(80); // iOS: direct na cancel() spreken gaat soms mis
  for (const t of stukjes(tekst)) {
    if (beurt !== spreekBeurt) return;
    await spreekStukje(t);
    if (beurt !== spreekBeurt) return;
    await wacht(250);
  }
}

// ---------- sterren ----------
const sterren = () => JSON.parse(localStorage.getItem("sterren") || "{}");
function geefSterren(nr, aantal) {
  const s = sterren();
  s[nr] = Math.max(s[nr] || 0, aantal);
  localStorage.setItem("sterren", JSON.stringify(s));
}
const sterTekst = (n) => "★".repeat(n) + "☆".repeat(3 - n);

// ---------- slotjes ----------
// Eerst is alleen de eerste categorie open. Heb je bij een categorie
// 2 of meer sterren gehaald (gaatjes of dictee), dan gaat de volgende open.
const NODIG = 2;
const allesOpen = () => localStorage.getItem("allesOpen") === "ja";
function aantalOpen() {
  if (allesOpen()) return CATEGORIEEN.length;
  const s = sterren();
  let n = 1;
  while (n < CATEGORIEEN.length && (s[CATEGORIEEN[n - 1].id] || 0) >= NODIG) n++;
  return n;
}
const isOpen = (cat) => CATEGORIEEN.indexOf(cat) < aantalOpen();
const openCats = () => CATEGORIEEN.slice(0, aantalOpen());

// ---------- het lastige stukje ----------
function maakGat(cat, x) {
  const w = woord(x);
  if (typeof x === "object" && x.deel) {
    const i = w.indexOf(x.deel);
    return { voor: w.slice(0, i), deel: x.deel, na: w.slice(i + x.deel.length), fout: x.fout };
  }
  if (!cat.gat) return null;
  const m = w.match(cat.gat.re);
  if (!m) return null;
  return { voor: w.slice(0, m.index), deel: m[0], na: w.slice(m.index + m[0].length), fout: cat.gat.alts[m[0]] };
}
function gekleurd(cat, x) {
  const g = maakGat(cat, x);
  return g ? `${g.voor}<mark>${g.deel}</mark>${g.na}` : woord(x);
}

// ---------- feestje ----------
function feest() {
  for (let i = 0; i < 18; i++) {
    const s = el(`<span class="confetti">${schud(["⭐", "🎉", "✨", "🌟"])[0]}</span>`);
    s.style.left = Math.random() * 100 + "vw";
    s.style.animationDelay = Math.random() * 0.5 + "s";
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 2500);
  }
}

// ---------- schermen ----------
function thuis() {
  zegEekhoorn("Hoi! Ik ben Eva Eekhoorn. Kies een categorie en we gaan oefenen!");
  const s = sterren();
  const n = aantalOpen();
  const sorteerOpen = n >= 2;
  scherm.innerHTML = `
    ${sorteerOpen
      ? `<a class="grote-knop sorteer" href="#sorteer">🎮 Sorteerspel: welke categorie is het?</a>`
      : `<button class="grote-knop sorteer dicht" id="sorteer-dicht">🔒 Sorteerspel</button>`}
    <ul class="grid"></ul>
    <div class="ouder"></div>`;
  if (!sorteerOpen) scherm.querySelector("#sorteer-dicht").onclick = () =>
    zegEekhoorn(`Het sorteerspel gaat open als je ${CATEGORIEEN[1].naam} ook hebt.`);
  const lijst = scherm.querySelector(".grid");
  CATEGORIEEN.forEach((c, i) => {
    if (i < n) {
      lijst.appendChild(el(`
        <li><a class="tegel" href="#cat/${c.id}" style="background:${c.kleur}">
          <span class="figuur">${c.figuur}</span>
          <span class="nr">${c.nr}</span>
          <span class="naam">${c.naam}</span>
          <span class="sterren">${sterTekst(s[c.id] || 0)}</span>
        </a></li>`));
    } else {
      const li = el(`
        <li><button class="tegel dicht" aria-label="${c.naam} (op slot)">
          <span class="slot">🔒</span>
          <span class="nr">${c.nr}</span>
          <span class="naam">${c.naam}</span>
        </button></li>`);
      li.querySelector("button").onclick = () => {
        const vorige = CATEGORIEEN[i - 1];
        zegEekhoorn(i === n
          ? `Deze gaat open als je bij ${vorige.naam} 2 sterren haalt. Jij kunt het!`
          : `Deze zit nog op slot. Eerst ${CATEGORIEEN[n - 1].naam}!`);
      };
      lijst.appendChild(li);
    }
  });
  ouderKnop(scherm.querySelector(".ouder"));
}

// Voor de juf of een ouder: alles openzetten (met een sommetje, zodat kinderen
// het niet per ongeluk doen) of weer op volgorde zetten.
function ouderKnop(doos) {
  if (allesOpen()) {
    doos.innerHTML = `<button class="klein-knop">🔒 Weer op volgorde openen</button>`;
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

function categorie(cat) {
  zegEekhoorn(`Dit is ${cat.figuurNaam}. Wat wil je doen?`);
  const heeftGat = cat.woorden.some((x) => maakGat(cat, x));
  scherm.innerHTML = `
    <div class="kaart" style="border-color:${cat.kleur}">
      <div class="kop" style="background:${cat.kleur}">
        <span class="figuur groot">${cat.figuur}</span>
        <div><div class="nr">${cat.nr}</div><h2>${cat.naam}</h2></div>
      </div>
      <p class="regel">${cat.regel}</p>
      <div class="knoppen">
        <a class="grote-knop" href="#uitleg/${cat.id}">🎬 Uitleg</a>
        ${heeftGat ? `<a class="grote-knop" href="#gaatjes/${cat.id}">🧩 Gaatjes</a>` : ""}
        <a class="grote-knop" href="#dictee/${cat.id}">🎧 Dictee</a>
      </div>
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
        <a class="grote-knop" href="#cat/${cat.id}">Klaar</a>
      </div>
    </div>`;
  const ballon = scherm.querySelector("#ballon");
  const vb = scherm.querySelector("#vb");
  ballon.textContent = cat.uitleg;
  const huidig = location.hash;
  scherm.querySelector("#start").onclick = async () => {
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

// Een ronde van RONDE vragen. maakVraag(i) tekent een vraag en roept antwoord(goed) aan.
function speelRonde({ titel, cat, maakVraag, terug }) {
  let i = 0, goed = 0;
  const hier = location.hash;
  const volgende = () => {
    if (i === RONDE) return einde();
    scherm.innerHTML = `
      <div class="kaart" ${cat ? `style="border-color:${cat.kleur}"` : ""}>
        <div class="voortgang">${titel} · vraag ${i + 1} van ${RONDE} · ${"⭐".repeat(goed)}</div>
        <div id="vraag"></div>
        <a class="terug" href="${terug}">← Stoppen</a>
      </div>`;
    maakVraag(scherm.querySelector("#vraag"), async (isGoed, uitlegFout) => {
      if (isGoed) { goed++; zegEekhoorn(schud(["Goed zo!", "Super!", "Top!", "Knap gedaan!"])[0]); zeg("Goed zo!"); }
      else { zegEekhoorn(uitlegFout); }
      i++;
      await wacht(isGoed ? 900 : 2200);
      if (location.hash === hier) volgende(); // niet doorgaan als het kind al weg is

    });
  };
  const einde = () => {
    const n = goed === RONDE ? 3 : goed >= 3 ? 2 : goed >= 1 ? 1 : 0;
    const openVoor = aantalOpen();
    if (cat) geefSterren(cat.id, n);
    const nieuw = aantalOpen() > openVoor ? CATEGORIEEN[aantalOpen() - 1] : null;
    if (n >= 2) feest();
    zegEekhoorn(n === 3 ? "Alles goed! Wat ben jij een spellingkampioen!" : n === 2 ? "Heel goed gedaan!" : "Goed geoefend! Nog een keer?");
    if (nieuw) { zegEekhoorn(`Hoera! ${nieuw.naam} is nu open! 🔓`); zeg(`Hoera! ${nieuw.naam} is nu open!`); }
    scherm.innerHTML = `
      <div class="kaart eind">
        <div class="groot-sterren">${sterTekst(n)}</div>
        <p>Je had er ${goed} van de ${RONDE} goed.</p>
        ${nieuw ? `<a class="nieuw-open" href="#cat/${nieuw.id}" style="background:${nieuw.kleur}">🔓 ${nieuw.figuur} ${nieuw.naam} is open!</a>` : ""}
        <div class="knoppen">
          <button class="grote-knop" id="nog">🔁 Nog een keer</button>
          <a class="grote-knop" href="${terug}">Klaar</a>
        </div>
      </div>`;
    scherm.querySelector("#nog").onclick = () => speelRonde({ titel, cat, maakVraag, terug });
  };
  volgende();
}

function gaatjes(cat) {
  const lijst = schud(cat.woorden.filter((x) => maakGat(cat, x)));
  if (!lijst.length) return categorie(cat);
  speelRonde({
    titel: "🧩 Gaatjes", cat, terug: `#cat/${cat.id}`,
    maakVraag: (doos, antwoord) => {
      const x = lijst[Math.floor(Math.random() * lijst.length)];
      const g = maakGat(cat, x);
      zegEekhoorn("Welk stukje past in het gaatje?");
      doos.innerHTML = `
        <button class="luister" title="Luister">🔊</button>
        <div class="woord-groot">${g.voor}<span class="gat">?</span>${g.na}</div>
        <div class="keuzes">${schud([g.deel, ...g.fout]).map((o) => `<button class="keuze">${o}</button>`).join("")}</div>`;
      doos.querySelector(".luister").onclick = () => zeg(woord(x));
      zeg(woord(x));
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
  speelRonde({
    titel: "🎧 Dictee", cat, terug: `#cat/${cat.id}`,
    maakVraag: (doos, antwoord) => {
      const x = schud(cat.woorden)[0];
      const w = woord(x);
      zegEekhoorn("Luister goed en schrijf het woord op.");
      doos.innerHTML = `
        <button class="luister groot" title="Luister nog een keer">🔊</button>
        <form class="dictee">
          <input autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Schrijf het woord">
          <button class="grote-knop">Klaar ✔</button>
        </form>
        <div class="uitkomst"></div>`;
      const veld = doos.querySelector("input");
      doos.querySelector(".luister").onclick = () => zeg(w);
      zeg(w); veld.focus();
      doos.querySelector("form").onsubmit = (e) => {
        e.preventDefault();
        if (!veld.value.trim()) return;
        veld.disabled = true;
        const isGoed = veld.value.trim().toLowerCase() === w;
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
      const x = schud(cat.woorden)[0];
      const keuzes = schud([cat, ...schud(open.filter((c) => c !== cat)).slice(0, 2)]);
      zegEekhoorn("Bij welke categorie hoort dit woord?");
      doos.innerHTML = `
        <button class="luister" title="Luister">🔊</button>
        <div class="woord-groot">${woord(x)}</div>
        <div class="keuzes cats">${keuzes.map((c) => `
          <button class="keuze cat" data-nr="${c.id}" style="background:${c.kleur}">
            <span class="figuur">${c.figuur}</span>${c.nr} ${c.naam}</button>`).join("")}</div>`;
      doos.querySelector(".luister").onclick = () => zeg(woord(x));
      zeg(woord(x));
      doos.querySelectorAll(".keuze").forEach((k) => (k.onclick = () => {
        doos.querySelectorAll(".keuze").forEach((b) => (b.disabled = true));
        const isGoed = k.dataset.nr === cat.id;
        k.classList.add(isGoed ? "goed" : "fout");
        doos.querySelector(`[data-nr="${cat.id}"]`).classList.add("goed");
        doos.querySelector(".woord-groot").innerHTML = gekleurd(cat, x);
        antwoord(isGoed, `${woord(x)} is een ${cat.naam.toLowerCase()}. ${cat.regel}`);
      }));
    },
  });
}

// ---------- router ----------
function route() {
  if ("speechSynthesis" in window) { spreekBeurt++; speechSynthesis.cancel(); }
  const [naam, id] = location.hash.slice(1).split("/");
  const gevonden = vindCat(id);
  const cat = gevonden && isOpen(gevonden) ? gevonden : null; // op slot: terug naar het begin
  window.scrollTo(0, 0);
  if (naam === "sorteer" && aantalOpen() >= 2) return sorteer();
  if (cat && naam === "cat") return categorie(cat);
  if (cat && naam === "uitleg") return uitleg(cat);
  if (cat && naam === "gaatjes") return gaatjes(cat);
  if (cat && naam === "dictee") return dictee(cat);
  thuis();
}
window.addEventListener("hashchange", route);
route();
