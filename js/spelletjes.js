// Kleine spelletjes per categorie. Gebruikt de hulpjes uit app.js
// (zeg, schud, woord, maakGat, foutWoord, gekleurd, speelRonde, ...).
// Dit bestand wordt vóór app.js geladen; de functies worden pas later aangeroepen.

const SPELLETJES = [
  { id: "ballonnen", emoji: "🎈", naam: "Ballonnen knallen", gat: true },
  { id: "eikels", emoji: "🌰", naam: "Eikels vangen", gat: true },
  { id: "kiezen", emoji: "⚖️", naam: "Welke is goed?", gat: true },
  { id: "gaatjes", emoji: "🧩", naam: "Gaatjes", gat: true },
  { id: "dictee", emoji: "🎧", naam: "Dictee" },
];

// Sleutel van een categorie voor links en sterren (id als die er is, anders het nummer).
const catSleutel = (cat) => cat.id || cat.nr;

// Hulpzinnetje bij dictee en "Welke is goed?": waar moet je aan denken?
const TIPS = {
  1: "Hak het woord in stukjes en schrijf wat je hoort.",
  "1s": "Daar mag geen u tussen!",
  2: "Denk aan ng, net als bij ding-dong!",
  3: "Denk aan de ch van lucht!",
  4: "Denk aan nk. Daar mag geen g tussen!",
  5: "Denk aan ee, oo of eu!",
  6: "Denk aan de i: aai, ooi of oei!",
  7: "Denk aan de u: eeuw of ieuw!",
  8: "Maak het woord langer. Hoor je d of t?",
  9: "Denk aan be, ge of ver vooraan!",
  10: "Lange klank of korte klank? Denk aan de klankgroep!",
  11: "Denk aan je, tje of pje aan het eind!",
  12: "Denk aan ig of lijk aan het eind!",
};
const tip = (cat) => TIPS[catSleutel(cat)] || cat.regel;
// Woorden die hetzelfde klinken (licht / ligt): een plaatje en een zinnetje
// laten zien welk woord we bedoelen. In het zinnetje staat … op de plek van het woord.
const BETEKENIS = {
  licht: { plaatje: "💡", zin: "Het licht is aan." },
  ligt: { plaatje: "🛏️", zin: "Hij ligt in bed." },
  legt: { plaatje: "🥚", zin: "De kip legt een ei." },
  zegt: { plaatje: "👋", zin: "Hij zegt hallo." },
  raad: { plaatje: "❓", zin: "Raad eens wat ik heb!" },
};
const betekenisHtml = (w) => {
  const b = BETEKENIS[w];
  if (!b) return "";
  const zin = b.zin.replace(new RegExp(w, "i"), "…");
  return `<div class="betekenis"><span>${b.plaatje}</span> ${zin}</div>`;
};
// Wat Eva zegt: het woord, en bij een klinkt-hetzelfde-woord ook het zinnetje.
const metZin = (w) => (BETEKENIS[w] ? `${w}. ${BETEKENIS[w].zin}` : w);
const tipHtml = (cat) => `<div class="tip-dictee">💡 ${tip(cat)}</div>`;

const BALLON_KLEUREN = ["#ef5350", "#42a5f5", "#66bb6a", "#ffa726", "#ab47bc", "#ec407a", "#26c6da"];

// Eindscherm met sterren, voor spelletjes die niet uit losse vragen bestaan.
function toonEinde(cat, n, tekst, opnieuw) {
  // gaat er een nieuwe categorie open? (alleen als de slotjes er zijn)
  const telOpen = typeof aantalOpen === "function" ? aantalOpen : () => 0;
  const openVoor = telOpen();
  geefSterren(catSleutel(cat), n);
  const nieuw = telOpen() > openVoor ? CATEGORIEEN[telOpen() - 1] : null;
  if (n >= 2) feest();
  zegEekhoorn(n === 3 ? "Wauw! Wat ben jij goed!" : n === 2 ? "Heel goed gedaan!" : "Goed geoefend! Nog een keer?");
  if (nieuw) { zegEekhoorn(`Hoera! ${nieuw.naam} is nu open! 🔓`); zeg(`Hoera! ${nieuw.naam} is nu open!`); }
  scherm.innerHTML = `
    <div class="kaart eind" style="border-color:${cat.kleur}">
      <div class="groot-sterren">${sterTekst(n)}</div>
      <p>${tekst}</p>
      ${nieuw ? `<a class="nieuw-open" href="#cat/${catSleutel(nieuw)}" style="background:${nieuw.kleur}">🔓 ${nieuw.figuur} ${nieuw.naam} is open!</a>` : ""}
      <div class="knoppen">
        <button class="grote-knop" id="nog">🔁 Nog een keer</button>
        <a class="grote-knop" href="#cat/${catSleutel(cat)}">Klaar</a>
      </div>
    </div>`;
  scherm.querySelector("#nog").onclick = opnieuw;
}

// ---------- 🎈 Ballonnen knallen ----------
// Ballonnen zweven omhoog. Tik alleen de ballonnen waarop het woord goed geschreven is.
function ballonnen(cat) {
  const hier = location.hash;
  const AANTAL = 12;
  const lijst = cat.woorden.filter((x) => foutWoord(cat, x, true));
  let gemaakt = 0, weg = 0, geknald = 0, goedeBallonnen = 0, foutjes = 0;

  zegEekhoorn("Knal alleen de goed geschreven woorden!");
  zeg("Knal de ballonnen met een goed geschreven woord.");
  scherm.innerHTML = `
    <div class="kaart" style="border-color:${cat.kleur}">
      <div class="voortgang">🎈 Ballonnen knallen · <span id="score">⭐ 0</span></div>
      <div class="lucht" id="lucht"></div>
      <a class="terug" href="#cat/${catSleutel(cat)}">← Stoppen</a>
    </div>`;
  const lucht = scherm.querySelector("#lucht");
  const score = scherm.querySelector("#score");

  const klaar = () => {
    if (weg < AANTAL || location.hash !== hier) return;
    const punten = Math.max(0, geknald - foutjes);
    const n = punten >= goedeBallonnen ? 3 : punten >= goedeBallonnen * 0.6 ? 2 : punten > 0 ? 1 : 0;
    toonEinde(cat, n, `Je knalde ${geknald} goede ballonnen${foutjes ? ` en ${foutjes} foute` : ""}.`, () => ballonnen(cat));
  };

  const maakBallon = () => {
    if (location.hash !== hier) return;
    const x = schud(lijst)[0];
    // ongeveer de helft is goed; zorg dat er altijd een paar goede bij zitten
    const isGoed = gemaakt < 2 || Math.random() < 0.5;
    if (isGoed) goedeBallonnen++;
    const tekst = isGoed ? woord(x) : foutWoord(cat, x, true);
    const b = el(`<button class="ballon-spel"><span>${tekst}</span></button>`);
    b.style.left = 5 + Math.random() * 65 + "%";
    b.style.setProperty("--kleur", schud(BALLON_KLEUREN)[0]);
    b.style.animationDuration = 7 + Math.random() * 2 + "s";
    b.onclick = () => {
      if (b.classList.contains("knal")) return;
      if (isGoed) {
        geknald++;
        b.classList.add("knal");
        geluid("knal"); geefEikel();
        zegEekhoorn(schud(["Knal! Goed zo!", "Pang! Super!", "Ja! Goed geschreven!"])[0]);
        zeg(woord(x));
      } else {
        foutjes++;
        b.classList.add("knal", "mis");
        geluid("fout");
        zegEekhoorn(`Oeps! Zo schrijf je het: ${woord(x)}.`);
      }
      score.textContent = `⭐ ${Math.max(0, geknald - foutjes)}`;
      setTimeout(() => b.remove(), 400);
      weg++; klaar();
    };
    b.addEventListener("animationend", (e) => {
      if (e.animationName !== "stijg" || b.classList.contains("knal")) return;
      if (isGoed) zegEekhoorn(`Oei, ${woord(x)} vloog weg! Dat was een goede.`);
      b.remove(); weg++; klaar();
    });
    lucht.appendChild(b);
    gemaakt++;
    if (gemaakt < AANTAL) setTimeout(maakBallon, 1700);
  };
  setTimeout(maakBallon, 1200);
}

// ---------- 🌰 Eikels vangen ----------
// Eikels met stukjes vallen uit de boom. Vang de eikel die in het gaatje past, voordat hij op de grond valt.
function eikels(cat) {
  const lijst = schud(cat.woorden.filter((x) => maakGat(cat, x)));
  speelRonde({
    titel: "🌰 Eikels vangen", cat, terug: `#cat/${catSleutel(cat)}`,
    maakVraag: (doos, antwoord) => {
      const x = lijst[Math.floor(Math.random() * lijst.length)];
      const g = maakGat(cat, x);
      const opties = schud([g.deel, ...g.fout.slice(0, 2)]);
      let klaar = false;
      zegEekhoorn("Help mij! Vang de eikel die in het gaatje past.");
      doos.innerHTML = `
        <button class="luister" title="Luister">🔊</button>
        ${betekenisHtml(woord(x))}
        <div class="woord-groot">${g.voor}<span class="gat">?</span>${g.na}</div>
        <div class="boom">
          ${opties.map((o, i) => `
            <button class="eikel" data-deel="${o}"
              style="left:${10 + i * (75 / opties.length) + Math.random() * 8}%;animation-duration:${7 + Math.random() * 2.5}s;animation-delay:${0.8 + i * 0.4}s">
              <span class="eikel-plaatje">🌰</span><span class="eikel-tekst">${o}</span></button>`).join("")}
          <div class="grond">🐿️</div>
        </div>`;
      doos.querySelector(".luister").onclick = () => zeg(metZin(woord(x)));
      zeg(metZin(woord(x)));
      const vul = () => { const gat = doos.querySelector(".gat"); gat.textContent = g.deel; gat.classList.add("ingevuld"); };
      const stop = () => { klaar = true; doos.querySelectorAll(".eikel").forEach((e) => e.classList.add("stil")); };
      doos.querySelectorAll(".eikel").forEach((e) => {
        e.onclick = () => {
          if (klaar) return;
          stop();
          const isGoed = e.dataset.deel === g.deel;
          e.classList.add(isGoed ? "gevangen" : "mis");
          vul();
          antwoord(isGoed, `Bijna! Het is ${woord(x)}. ${cat.regel}`);
        };
        e.addEventListener("animationend", (ev) => {
          if (ev.animationName !== "val-eikel" || klaar || e.dataset.deel !== g.deel) return;
          stop(); vul();
          antwoord(false, `Te laat! Het is ${woord(x)}. Probeer de volgende sneller te vangen!`);
        });
      });
    },
  });
}

// ---------- ⚖️ Welke is goed? ----------
// Eva zegt een woord. Er staan twee woorden: één goed, één met een fout (krab of krap?).
// Bij sommige categorieën komen ook uitzonderingen langs (hij ligt, niet hij licht).
const UITZONDERINGEN = {
  3: [
    { w: "ligt", fout: "licht" },
    { w: "legt", fout: "lecht" },
    { w: "zegt", fout: "zecht" },
  ],
};
function kiezen(cat) {
  const lijst = cat.woorden.filter((x) => foutWoord(cat, x));
  const uitz = UITZONDERINGEN[catSleutel(cat)] || [];
  speelRonde({
    titel: "⚖️ Welke is goed?", cat, terug: `#cat/${catSleutel(cat)}`,
    maakVraag: (doos, antwoord) => {
      // ongeveer 1 op de 3 vragen een uitzondering, als die er zijn
      const u = uitz.length && Math.random() < 0.35 ? schud(uitz)[0] : null;
      const x = u ? null : schud(lijst)[0];
      const goedW = u ? u.w : woord(x);
      const foutW = u ? u.fout : foutWoord(cat, x);
      const hoor = metZin(goedW);
      zegEekhoorn("Luister goed. Welk woord is goed geschreven?");
      doos.innerHTML = `
        <button class="luister groot" title="Luister nog een keer">🔊</button>
        ${betekenisHtml(goedW)}
        <div class="twee-keuzes">${schud([goedW, foutW]).map((o) => `
          <button class="woordkaart">${o}</button>`).join("")}</div>
        <div class="uitkomst"></div>`;
      doos.querySelector(".luister").onclick = () => zeg(hoor);
      zeg(hoor);
      doos.querySelectorAll(".woordkaart").forEach((k) => (k.onclick = () => {
        doos.querySelectorAll(".woordkaart").forEach((b) => (b.disabled = true));
        const isGoed = k.textContent.trim() === goedW;
        k.classList.add(isGoed ? "goed" : "fout");
        [...doos.querySelectorAll(".woordkaart")].find((b) => b.textContent.trim() === goedW).classList.add("goed");
        const uitkomst = doos.querySelector(".uitkomst");
        if (u) uitkomst.innerHTML = `<span class="uitzondering">⚠️ Uitzondering!</span> ${u.w} schrijf je met een g.`;
        else uitkomst.innerHTML = `${gekleurd(cat, x)}`;
        antwoord(isGoed, u
          ? `Dit is een uitzondering! ${u.w} schrijf je met een g.`
          : `Kijk goed: ${goedW}. ${tip(cat)}`);
      }));
    },
  });
}

// ---------- 🔊 geluidjes (gemaakt met de browser, geen bestanden) ----------
let geluidCtx = null;
function toon(freq, start, duur, type = "sine", volume = 0.15) {
  const t0 = geluidCtx.currentTime + start;
  const o = geluidCtx.createOscillator(), g = geluidCtx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(volume, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + duur);
  o.connect(g).connect(geluidCtx.destination);
  o.start(t0); o.stop(t0 + duur);
}
function geluid(soort) {
  try {
    geluidCtx = geluidCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (geluidCtx.state === "suspended") geluidCtx.resume();
    if (soort === "goed") { toon(660, 0, .12); toon(880, .1, .2); }
    if (soort === "fout") { toon(220, 0, .18, "triangle"); toon(175, .15, .25, "triangle"); }
    if (soort === "knal") { toon(900, 0, .06, "square", .08); toon(300, .03, .1, "square", .06); }
    if (soort === "eikel") toon(1200, 0, .1, "sine", .1);
    if (soort === "feest") [523, 659, 784, 1047].forEach((f, i) => toon(f, i * .12, .3));
  } catch (e) { /* geen geluid, geen probleem */ }
}

// ---------- 🌰 eikels sparen en 🎁 prijzen voor Eva ----------
const PRIJZEN = [
  { eikels: 10, emoji: "🎀", naam: "een strik" },
  { eikels: 25, emoji: "🧢", naam: "een pet" },
  { eikels: 50, emoji: "🕶️", naam: "een zonnebril" },
  { eikels: 80, emoji: "🎩", naam: "een hoge hoed" },
  { eikels: 120, emoji: "🦸", naam: "een superheldencape" },
  { eikels: 170, emoji: "👑", naam: "een kroon" },
  { eikels: 250, emoji: "🚀", naam: "een raket" },
];
const aantalEikels = () => Number(localStorage.getItem("eikels") || 0);
const gewonnenPrijzen = () => PRIJZEN.filter((p) => aantalEikels() >= p.eikels);

// Teller rechtsboven en Eva's nieuwste prijs naast haar.
// (pas na het laden, want el() staat in app.js)
let teller = null;
document.addEventListener("DOMContentLoaded", () => {
  teller = el(`<a class="eikel-teller" href="#prijzen" aria-label="Mijn eikels en prijzen">🌰 <b>0</b></a>`);
  document.querySelector("header").appendChild(teller);
  toonEikels();
});
function toonEikels() {
  if (!teller) return;
  teller.querySelector("b").textContent = aantalEikels();
  const mascotte = document.querySelector(".mascot");
  const laatste = gewonnenPrijzen().pop();
  let p = mascotte.querySelector(".prijs");
  if (laatste && !p) { p = el(`<span class="prijs"></span>`); mascotte.appendChild(p); }
  if (p) p.textContent = laatste ? laatste.emoji : "";
}

function geefEikel(n = 1) {
  const voor = gewonnenPrijzen().length;
  localStorage.setItem("eikels", aantalEikels() + n);
  // een eikeltje vliegt naar de teller
  const vlieg = el(`<span class="eikel-vlieg">🌰</span>`);
  document.body.appendChild(vlieg);
  setTimeout(() => vlieg.remove(), 900);
  geluid("eikel");
  const m = document.querySelector(".mascot");
  m.classList.remove("spring"); void m.offsetWidth; m.classList.add("spring");
  setTimeout(() => {
    toonEikels();
    if (teller) { teller.classList.remove("pop"); void teller.offsetWidth; teller.classList.add("pop"); }
    const nieuw = gewonnenPrijzen()[voor];
    if (nieuw) {
      feest();
      zegEekhoorn(`Hoera! Ik krijg ${nieuw.naam} ${nieuw.emoji}! Dank je wel!`);
      zeg(`Hoera! Ik krijg ${nieuw.naam}!`);
    }
  }, 700);
}

function prijzen() {
  const n = aantalEikels();
  const volgende = PRIJZEN.find((p) => n < p.eikels);
  zegEekhoorn(volgende
    ? `Je hebt ${n} eikels. Nog ${volgende.eikels - n} voor ${volgende.naam}!`
    : `Wauw, ${n} eikels! Je hebt alle prijzen!`);
  scherm.innerHTML = `
    <div class="kaart">
      <h2>🎁 Prijzenkast van Eva</h2>
      <p class="regel">Elk goed antwoord geeft een eikel 🌰. Spaar ze voor prijzen!</p>
      <div class="groot-eikels">🌰 ${n}</div>
      <div class="prijzenkast">${PRIJZEN.map((p) => `
        <div class="prijsvak ${n >= p.eikels ? "" : "dicht"}">
          <span>${n >= p.eikels ? p.emoji : "❔"}</span>
          ${n >= p.eikels ? p.naam : `🌰 ${p.eikels}`}
        </div>`).join("")}</div>
      <a class="grote-knop" href="#">Verder spelen</a>
    </div>`;
}

// ---------- 🗺️ de weg door een categorie ----------
// Per spelletje bewaren we de beste sterren: { "3": { gaatjes: 2, ... } }
const spelSterren = () => JSON.parse(localStorage.getItem("spelSterren") || "{}");
function bewaarSpelSterren(sleutelCat, spel, n) {
  const s = spelSterren();
  s[sleutelCat] = s[sleutelCat] || {};
  s[sleutelCat][spel] = Math.max(s[sleutelCat][spel] || 0, n);
  localStorage.setItem("spelSterren", JSON.stringify(s));
}

const WEG_X = [18, 50, 82, 50]; // links, midden, rechts, midden, ... zo slingert de weg
function tekenWeg(cat) {
  const heeftGat = cat.woorden.some((x) => maakGat(cat, x));
  const mijn = spelSterren()[catSleutel(cat)] || {};
  const stappen = [
    { id: "uitleg", emoji: "🎬", naam: "Uitleg", klaar: !!mijn.uitleg },
    ...["gaatjes", "ballonnen", "eikels", "kiezen", "dictee"]
      .map((id) => SPELLETJES.find((g) => g.id === id))
      .filter((g) => heeftGat || !g.gat)
      .map((g) => ({ ...g, sterren: mijn[g.id] || 0, klaar: (mijn[g.id] || 0) > 0 })),
  ];
  const beker = stappen.every((s) => s.klaar);
  const hier = stappen.findIndex((s) => !s.klaar);
  const alle = [...stappen, { id: "beker", emoji: beker ? "🏆" : "🏁", naam: beker ? "Beker!" : "Finish" }];
  const H = 120; // hoogte per stap
  const punten = alle.map((_, i) => [WEG_X[i % WEG_X.length], i * H + H / 2]);
  const hoogte = alle.length * H;
  return `
    <div class="weg" style="height:${hoogte}px">
      <svg class="weg-lijn" viewBox="0 0 100 ${hoogte}" preserveAspectRatio="none">
        <polyline points="${punten.map(([x, y]) => `${x},${y}`).join(" ")}" />
      </svg>
      ${alle.map((s, i) => {
        const [x, y] = punten[i];
        const isBeker = s.id === "beker";
        const tag = isBeker ? "div" : "a";
        return `
        <${tag} class="steen ${s.klaar ? "klaar" : ""} ${i === hier ? "hier" : ""} ${isBeker && beker ? "gewonnen" : ""}"
          ${isBeker ? "" : `href="#${s.id}/${catSleutel(cat)}"`}
          style="left:${x}%;top:${y}px;${s.klaar || (isBeker && beker) ? `background:${cat.kleur}` : ""}">
          <span class="steen-emoji">${s.emoji}</span>
          <span class="steen-naam">${s.naam}</span>
          ${s.sterren !== undefined ? `<span class="steen-sterren">${sterTekst(s.sterren)}</span>` : ""}
          ${i === hier ? `<span class="eva-hier">🐿️</span>` : ""}
        </${tag}>`;
      }).join("")}
    </div>`;
}

// ---------- 🏀 werelden: kies de goede bal en scoor! ----------
// Eén spel-motor met verschillende "werelden". Eva zegt een woord; op de ballen
// (of vissen, raketten, ...) staan stukjes of woorden. Tik de goede en hij vliegt naar het doel.
const WERELDEN = {
  basketbal: { emoji: "🏀", doel: "🗑️", naam: "Basketbal", lucht: "#ffe0b2", vloer: "#bf8040",
    zin: "Gooi de goede bal in de basket!", hoera: ["Score!", "Swish! Raak!", "Twee punten!"] },
  voetbal: { emoji: "⚽", doel: "🥅", naam: "Voetbal", lucht: "#b3e5fc", vloer: "#66bb6a",
    zin: "Schiet de goede bal in het doel!", hoera: ["Goal!", "Doelpunt!", "Wat een schot!"] },
  ruimte: { emoji: "🚀", doel: "🌙", naam: "Ruimte", lucht: "#283593", vloer: "#1a237e",
    zin: "Stuur de goede raket naar de maan!", hoera: ["Geland!", "Raketje op de maan!", "Woesj!"] },
  pinguin: { emoji: "🐟", doel: "🐧", naam: "Pinguïn", lucht: "#e1f5fe", vloer: "#b3e5fc",
    zin: "Geef de pinguïn de goede vis!", hoera: ["Smakelijk!", "Mmm, lekker!", "Hap!"] },
  konijn: { emoji: "🥕", doel: "🐰", naam: "Konijn", lucht: "#f1f8e9", vloer: "#aed581",
    zin: "Geef het konijn de goede wortel!", hoera: ["Knabbel knabbel!", "Lekker!", "Hap!"] },
  piraat: { emoji: "💣", doel: "🏴‍☠️", naam: "Piraten", lucht: "#80deea", vloer: "#0277bd",
    zin: "Schiet de goede kogel naar het piratenschip!", hoera: ["Boem! Raak!", "Ahoi!", "Raak!"] },
};
// Spelletjes die er al zijn (bedacht door Eva). Eigen spelletjes komen erbij.
const KANT_EN_KLAAR = [
  { id: "k-basket", naam: "Basketbal", wereld: "basketbal", op: "stukje", aantal: 2 },
  { id: "k-voetbal", naam: "Voetbal", wereld: "voetbal", op: "woord", aantal: 2 },
  { id: "k-ruimte", naam: "Naar de maan", wereld: "ruimte", op: "stukje", aantal: 3 },
  { id: "k-pinguin", naam: "Pinguïn voeren", wereld: "pinguin", op: "woord", aantal: 3 },
];
const mijnSpellen = () => JSON.parse(localStorage.getItem("mijnSpellen") || "[]");
const alleWereldSpellen = () => [...KANT_EN_KLAAR, ...mijnSpellen()];

// Knoppen onder de weg: meer spelletjes, eigen spelletjes en "maak je eigen spel".
function tekenMeerSpellen(cat) {
  const k = catSleutel(cat);
  const tegel = (s, eigen) => `
    <a class="spel-tegel ${eigen ? "eigen" : ""}" href="#wereld/${k}/${s.id}">
      <span>${WERELDEN[s.wereld].emoji}</span>${s.naam}</a>`;
  return `
    <h3 class="spel-kop">🎮 Nog meer spelletjes</h3>
    <div class="spel-lijst">${KANT_EN_KLAAR.map((s) => tegel(s)).join("")}</div>
    <h3 class="spel-kop">⭐ Mijn eigen spelletjes</h3>
    <div class="spel-lijst">
      ${mijnSpellen().map((s) => tegel(s, true)).join("")}
      <a class="spel-tegel maak" href="#maak/${k}"><span>🛠️</span>Maak je eigen spel!</a>
    </div>`;
}

function wereldSpel(cat, spelId) {
  const spel = alleWereldSpellen().find((s) => s.id === spelId);
  if (!spel) return categorie(cat);
  const W = WERELDEN[spel.wereld];
  const lijst = cat.woorden.filter((x) => foutWoord(cat, x));
  speelRonde({
    titel: `${W.emoji} ${spel.naam}`, cat, terug: `#cat/${catSleutel(cat)}`,
    maakVraag: (doos, antwoord) => {
      const x = schud(lijst)[0];
      const w = woord(x), g = maakGat(cat, x);
      const fouten = schud([...new Set(g.fout)]).slice(0, spel.aantal - 1);
      const goed = spel.op === "woord" ? w : g.deel;
      const opties = schud([goed, ...fouten.map((f) => (spel.op === "woord" ? g.voor + f + g.na : f))]);
      zegEekhoorn(W.zin);
      doos.innerHTML = `
        <button class="luister" title="Luister">🔊</button>
        ${betekenisHtml(w)}
        ${spel.op === "stukje" ? `<div class="woord-groot">${g.voor}<span class="gat">?</span>${g.na}</div>` : ""}
        <div class="veld" style="--lucht:${W.lucht};--vloer:${W.vloer}">
          <div class="doel">${W.doel}</div>
          <div class="ballen">${opties.map((o) => `
            <button class="bal ${spel.op}" data-o="${o}">
              <span class="bal-emoji">${W.emoji}</span><span class="bal-tekst">${o}</span></button>`).join("")}
          </div>
        </div>`;
      doos.querySelector(".luister").onclick = () => zeg(metZin(w));
      zeg(metZin(w));
      const doel = doos.querySelector(".doel");
      doos.querySelectorAll(".bal").forEach((b) => (b.onclick = () => {
        doos.querySelectorAll(".bal").forEach((x) => (x.disabled = true));
        const isGoed = b.dataset.o === goed;
        const gat = doos.querySelector(".gat");
        if (gat) { gat.textContent = g.deel; gat.classList.add("ingevuld"); }
        if (isGoed) {
          // de bal vliegt naar het doel
          const a = b.getBoundingClientRect(), d = doel.getBoundingClientRect();
          b.style.transform = `translate(${d.left + d.width / 2 - (a.left + a.width / 2)}px, ${d.top + d.height / 2 - (a.top + a.height / 2)}px) scale(.6) rotate(360deg)`;
          b.classList.add("vlieg");
          setTimeout(() => { doel.classList.add("raak"); zegEekhoorn(schud(W.hoera)[0]); }, 550);
        } else {
          b.classList.add("mis");
        }
        antwoord(isGoed, `Bijna! Het is ${w}. ${tip(cat)}`);
      }));
    },
  });
}

// ---------- 🛠️ maak je eigen spel ----------
function maakSpel(cat) {
  const k = catSleutel(cat);
  const keuze = { wereld: "basketbal", op: "stukje", aantal: 2 };
  zegEekhoorn("Jij bent de baas! Kies een wereld en maak je eigen spel.");
  scherm.innerHTML = `
    <div class="kaart maker">
      <h2>🛠️ Maak je eigen spel</h2>
      <h3>1. Kies een wereld</h3>
      <div class="kies-rij" data-veld="wereld">${Object.entries(WERELDEN).map(([id, W]) => `
        <button class="kies-knop" data-w="${id}"><span>${W.emoji}${W.doel}</span>${W.naam}</button>`).join("")}</div>
      <h3>2. Wat staat er op de ${"ballen"}?</h3>
      <div class="kies-rij" data-veld="op">
        <button class="kies-knop" data-w="stukje"><span>b · p</span>Een stukje</button>
        <button class="kies-knop" data-w="woord"><span>krab · krap</span>Een heel woord</button>
      </div>
      <h3>3. Hoeveel om uit te kiezen?</h3>
      <div class="kies-rij" data-veld="aantal">
        <button class="kies-knop" data-w="2"><span>⚪⚪</span>2</button>
        <button class="kies-knop" data-w="3"><span>⚪⚪⚪</span>3</button>
      </div>
      <h3>4. Hoe heet jouw spel?</h3>
      <input class="spel-naam" maxlength="24" placeholder="Mijn basketbalspel" autocomplete="off">
      <div class="knoppen">
        <button class="grote-knop" id="bewaar">✅ Klaar, spelen!</button>
        <a class="grote-knop grijs" href="#cat/${k}">Terug</a>
      </div>
    </div>`;
  const naamVeld = scherm.querySelector(".spel-naam");
  const toon = () => {
    scherm.querySelectorAll(".kies-rij").forEach((rij) => rij.querySelectorAll(".kies-knop").forEach((b) =>
      b.classList.toggle("gekozen", String(keuze[rij.dataset.veld]) === b.dataset.w)));
    naamVeld.placeholder = `Mijn ${WERELDEN[keuze.wereld].naam.toLowerCase()}spel`;
  };
  scherm.querySelectorAll(".kies-rij").forEach((rij) => rij.querySelectorAll(".kies-knop").forEach((b) => (b.onclick = () => {
    const v = rij.dataset.veld;
    keuze[v] = v === "aantal" ? Number(b.dataset.w) : b.dataset.w;
    geluid("eikel"); toon();
  })));
  toon();
  scherm.querySelector("#bewaar").onclick = () => {
    const spel = { id: "m-" + Date.now(), naam: naamVeld.value.trim() || naamVeld.placeholder, ...keuze };
    localStorage.setItem("mijnSpellen", JSON.stringify([...mijnSpellen(), spel]));
    feest();
    location.hash = `#wereld/${k}/${spel.id}`;
  };
}
