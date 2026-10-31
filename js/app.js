// ---------- hulpjes ----------
const scherm = document.getElementById("scherm");
const erik = document.getElementById("erik");
const RONDE = 5; // vragen per spelletje

const zegErik = (t) => { erik.textContent = t; };
const schud = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const woord = (x) => (typeof x === "string" ? x : x.w);
const vindCat = (nr) => CATEGORIEEN.find((c) => c.nr === Number(nr));
const el = (html) => { const d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstElementChild; };
const wacht = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- voorlezen ----------
let nlStem = null;
function kiesStem() {
  const stemmen = speechSynthesis.getVoices();
  const nl = stemmen.filter((v) => v.lang.replace("_", "-").toLowerCase().startsWith("nl"));
  nlStem =
    nl.find((v) => /nl-nl/i.test(v.lang.replace("_", "-")) && /google/i.test(v.name)) ||
    nl.find((v) => /nl-nl/i.test(v.lang.replace("_", "-"))) ||
    nl[0] || null;
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

// iPhone/iPad: een lage snelheid laat de stem de woorden aan elkaar plakken.
const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

// Knip een tekst in korte stukjes (zinnen en stukjes tussen komma's),
// zodat de stem na elk stukje echt even stopt.
function stukjes(tekst) {
  return (String(tekst).match(/[^.!?,:;]+[.!?,:;]*/g) || [])
    .map((t) => t.trim())
    .filter(Boolean);
}

let spreekBeurt = 0; // telt op bij elke nieuwe zeg(), zodat een oude zin stopt
function spreekStukje(t) {
  return new Promise((klaar) => {
    const u = new SpeechSynthesisUtterance(t);
    u.lang = nlStem ? nlStem.lang : "nl-NL";
    u.rate = isIOS ? 1 : 0.9;
    if (nlStem) u.voice = nlStem;
    let gedaan = false;
    const af = () => { if (!gedaan) { gedaan = true; klaar(); } };
    u.onend = af; u.onerror = af;
    // vangnet: sommige browsers vergeten onend
    setTimeout(af, 1500 + t.length * 150);
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
  zegErik("Hoi! Ik ben Erik Eekhoorn. Kies een categorie en we gaan oefenen!");
  const s = sterren();
  scherm.innerHTML = `
    <a class="grote-knop sorteer" href="#sorteer">🎮 Sorteerspel: welke categorie is het?</a>
    <ul class="grid"></ul>`;
  const lijst = scherm.querySelector(".grid");
  for (const c of CATEGORIEEN) {
    lijst.appendChild(el(`
      <li><a class="tegel" href="#cat/${c.nr}" style="background:${c.kleur}">
        <span class="figuur">${c.figuur}</span>
        <span class="nr">${c.nr}</span>
        <span class="naam">${c.naam}</span>
        <span class="sterren">${sterTekst(s[c.nr] || 0)}</span>
      </a></li>`));
  }
}

function categorie(cat) {
  zegErik(`Dit is ${cat.figuurNaam}. Wat wil je doen?`);
  const heeftGat = cat.woorden.some((x) => maakGat(cat, x));
  scherm.innerHTML = `
    <div class="kaart" style="border-color:${cat.kleur}">
      <div class="kop" style="background:${cat.kleur}">
        <span class="figuur groot">${cat.figuur}</span>
        <div><div class="nr">${cat.nr}</div><h2>${cat.naam}</h2></div>
      </div>
      <p class="regel">${cat.regel}</p>
      <div class="knoppen">
        <a class="grote-knop" href="#uitleg/${cat.nr}">🎬 Uitleg</a>
        ${heeftGat ? `<a class="grote-knop" href="#gaatjes/${cat.nr}">🧩 Gaatjes</a>` : ""}
        <a class="grote-knop" href="#dictee/${cat.nr}">🎧 Dictee</a>
      </div>
      <a class="terug" href="#">← Terug</a>
    </div>`;
}

async function uitleg(cat) {
  zegErik("Kijk en luister goed!");
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
      if (isGoed) { goed++; zegErik(schud(["Goed zo!", "Super!", "Top!", "Knap gedaan!"])[0]); zeg("Goed zo!"); }
      else { zegErik(uitlegFout); }
      i++;
      await wacht(isGoed ? 900 : 2200);
      if (location.hash === hier) volgende(); // niet doorgaan als het kind al weg is

    });
  };
  const einde = () => {
    const n = goed === RONDE ? 3 : goed >= 3 ? 2 : goed >= 1 ? 1 : 0;
    if (cat) geefSterren(cat.nr, n);
    if (n >= 2) feest();
    zegErik(n === 3 ? "Alles goed! Wat ben jij een spellingkampioen!" : n === 2 ? "Heel goed gedaan!" : "Goed geoefend! Nog een keer?");
    scherm.innerHTML = `
      <div class="kaart eind">
        <div class="groot-sterren">${sterTekst(n)}</div>
        <p>Je had er ${goed} van de ${RONDE} goed.</p>
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
    titel: "🧩 Gaatjes", cat, terug: `#cat/${cat.nr}`,
    maakVraag: (doos, antwoord) => {
      const x = lijst[Math.floor(Math.random() * lijst.length)];
      const g = maakGat(cat, x);
      zegErik("Welk stukje past in het gaatje?");
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
    titel: "🎧 Dictee", cat, terug: `#cat/${cat.nr}`,
    maakVraag: (doos, antwoord) => {
      const x = schud(cat.woorden)[0];
      const w = woord(x);
      zegErik("Luister goed en schrijf het woord op.");
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
      const cat = schud(CATEGORIEEN)[0];
      const x = schud(cat.woorden)[0];
      const keuzes = schud([cat, ...schud(CATEGORIEEN.filter((c) => c !== cat)).slice(0, 2)]);
      zegErik("Bij welke categorie hoort dit woord?");
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

// ---------- router ----------
function route() {
  if ("speechSynthesis" in window) { spreekBeurt++; speechSynthesis.cancel(); }
  const [naam, nr] = location.hash.slice(1).split("/");
  const cat = vindCat(nr);
  window.scrollTo(0, 0);
  if (naam === "sorteer") return sorteer();
  if (cat && naam === "cat") return categorie(cat);
  if (cat && naam === "uitleg") return uitleg(cat);
  if (cat && naam === "gaatjes") return gaatjes(cat);
  if (cat && naam === "dictee") return dictee(cat);
  thuis();
}
window.addEventListener("hashchange", route);
route();
