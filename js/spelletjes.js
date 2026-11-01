// Kleine spelletjes per categorie. Gebruikt de hulpjes uit app.js
// (zeg, schud, woord, maakGat, foutWoord, gekleurd, speelRonde, ...).
// Dit bestand wordt vóór app.js geladen; de functies worden pas later aangeroepen.

const SPELLETJES = [
  { id: "ballonnen", emoji: "🎈", naam: "Ballonnen knallen", gat: true },
  { id: "eikels", emoji: "🌰", naam: "Eikels vangen", gat: true },
  { id: "bouwen", emoji: "🧱", naam: "Woord bouwen" },
  { id: "gaatjes", emoji: "🧩", naam: "Gaatjes", gat: true },
  { id: "dictee", emoji: "🎧", naam: "Dictee" },
];

// Sleutel van een categorie voor links en sterren (id als die er is, anders het nummer).
const sleutel = (cat) => cat.id || cat.nr;

// Hulpzinnetje bij dictee en woord bouwen: waar moet je aan denken?
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
const tip = (cat) => TIPS[sleutel(cat)] || cat.regel;
const tipHtml = (cat) => `<div class="tip-dictee">💡 ${tip(cat)}</div>`;

const BALLON_KLEUREN = ["#ef5350", "#42a5f5", "#66bb6a", "#ffa726", "#ab47bc", "#ec407a", "#26c6da"];

// Eindscherm met sterren, voor spelletjes die niet uit losse vragen bestaan.
function toonEinde(cat, n, tekst, opnieuw) {
  // gaat er een nieuwe categorie open? (alleen als de slotjes er zijn)
  const telOpen = typeof aantalOpen === "function" ? aantalOpen : () => 0;
  const openVoor = telOpen();
  geefSterren(sleutel(cat), n);
  const nieuw = telOpen() > openVoor ? CATEGORIEEN[telOpen() - 1] : null;
  if (n >= 2) feest();
  zegEekhoorn(n === 3 ? "Wauw! Wat ben jij goed!" : n === 2 ? "Heel goed gedaan!" : "Goed geoefend! Nog een keer?");
  if (nieuw) { zegEekhoorn(`Hoera! ${nieuw.naam} is nu open! 🔓`); zeg(`Hoera! ${nieuw.naam} is nu open!`); }
  scherm.innerHTML = `
    <div class="kaart eind" style="border-color:${cat.kleur}">
      <div class="groot-sterren">${sterTekst(n)}</div>
      <p>${tekst}</p>
      ${nieuw ? `<a class="nieuw-open" href="#cat/${sleutel(nieuw)}" style="background:${nieuw.kleur}">🔓 ${nieuw.figuur} ${nieuw.naam} is open!</a>` : ""}
      <div class="knoppen">
        <button class="grote-knop" id="nog">🔁 Nog een keer</button>
        <a class="grote-knop" href="#cat/${sleutel(cat)}">Klaar</a>
      </div>
    </div>`;
  scherm.querySelector("#nog").onclick = opnieuw;
}

// ---------- 🎈 Ballonnen knallen ----------
// Ballonnen zweven omhoog. Tik alleen de ballonnen waarop het woord goed geschreven is.
function ballonnen(cat) {
  const hier = location.hash;
  const AANTAL = 12;
  const lijst = cat.woorden.filter((x) => foutWoord(cat, x));
  let gemaakt = 0, weg = 0, geknald = 0, goedeBallonnen = 0, foutjes = 0;

  zegEekhoorn("Knal alleen de goed geschreven woorden!");
  zeg("Knal de ballonnen met een goed geschreven woord.");
  scherm.innerHTML = `
    <div class="kaart" style="border-color:${cat.kleur}">
      <div class="voortgang">🎈 Ballonnen knallen · <span id="score">⭐ 0</span></div>
      <div class="lucht" id="lucht"></div>
      <a class="terug" href="#cat/${sleutel(cat)}">← Stoppen</a>
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
    const tekst = isGoed ? woord(x) : foutWoord(cat, x);
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
    titel: "🌰 Eikels vangen", cat, terug: `#cat/${sleutel(cat)}`,
    maakVraag: (doos, antwoord) => {
      const x = lijst[Math.floor(Math.random() * lijst.length)];
      const g = maakGat(cat, x);
      const opties = schud([g.deel, ...g.fout.slice(0, 2)]);
      let klaar = false;
      zegEekhoorn("Help mij! Vang de eikel die in het gaatje past.");
      doos.innerHTML = `
        <button class="luister" title="Luister">🔊</button>
        <div class="woord-groot">${g.voor}<span class="gat">?</span>${g.na}</div>
        <div class="boom">
          ${opties.map((o, i) => `
            <button class="eikel" data-deel="${o}"
              style="left:${10 + i * (75 / opties.length) + Math.random() * 8}%;animation-duration:${7 + Math.random() * 2.5}s;animation-delay:${0.8 + i * 0.4}s">
              <span class="eikel-plaatje">🌰</span><span class="eikel-tekst">${o}</span></button>`).join("")}
          <div class="grond">🐿️</div>
        </div>`;
      doos.querySelector(".luister").onclick = () => zeg(woord(x));
      zeg(woord(x));
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

// ---------- 🧱 Woord bouwen ----------
// Eva zegt een woord. Bouw het met blokjes; het lastige stukje is één blokje.
function bouwen(cat) {
  speelRonde({
    titel: "🧱 Woord bouwen", cat, terug: `#cat/${sleutel(cat)}`,
    maakVraag: (doos, antwoord) => {
      const x = schud(cat.woorden)[0];
      const w = woord(x);
      const g = maakGat(cat, x);
      const delen = g ? [...g.voor, g.deel, ...g.na] : [...w];
      const extra = [];
      if (g && g.fout.length) extra.push(schud(g.fout)[0]);
      extra.push(schud([..."abdeklmnoprstv"].filter((l) => !w.includes(l)))[0]);
      const blokjes = schud([...delen, ...extra]);
      zegEekhoorn("Luister goed en bouw het woord met de blokjes.");
      doos.innerHTML = `
        <button class="luister groot" title="Luister nog een keer">🔊</button>
        ${tipHtml(cat)}
        <div class="bouwplaats">${delen.map(() => `<button class="vakje"></button>`).join("")}</div>
        <div class="blokjes">${blokjes.map((b, i) => `<button class="blokje" data-i="${i}">${b}</button>`).join("")}</div>
        <div class="uitkomst"></div>`;
      doos.querySelector(".luister").onclick = () => zeg(w);
      zeg(w);
      const vakjes = [...doos.querySelectorAll(".vakje")];
      let klaar = false;
      const controleer = () => {
        if (vakjes.some((v) => !v.dataset.i)) return;
        klaar = true;
        const gebouwd = vakjes.map((v) => v.textContent).join("");
        const isGoed = gebouwd === w;
        vakjes.forEach((v) => v.classList.add(isGoed ? "goed" : "fout"));
        if (!isGoed) doos.querySelector(".uitkomst").innerHTML = `Het is: <b>${gekleurd(cat, x)}</b>`;
        else feest();
        antwoord(isGoed, `Kijk goed: ${w}. ${cat.regel}`);
      };
      doos.querySelectorAll(".blokje").forEach((b) => (b.onclick = () => {
        if (klaar) return;
        const leeg = vakjes.find((v) => !v.dataset.i);
        if (!leeg) return;
        leeg.textContent = b.textContent;
        leeg.dataset.i = b.dataset.i;
        leeg.classList.add("pop");
        b.classList.add("weg");
        controleer();
      }));
      // tik op een vakje om het blokje terug te leggen
      vakjes.forEach((v) => (v.onclick = () => {
        if (klaar || !v.dataset.i) return;
        doos.querySelector(`.blokje[data-i="${v.dataset.i}"]`).classList.remove("weg");
        v.textContent = ""; delete v.dataset.i; v.classList.remove("pop");
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
  const mijn = spelSterren()[sleutel(cat)] || {};
  const stappen = [
    { id: "uitleg", emoji: "🎬", naam: "Uitleg", klaar: !!mijn.uitleg },
    ...["gaatjes", "ballonnen", "eikels", "bouwen", "dictee"]
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
          ${isBeker ? "" : `href="#${s.id}/${sleutel(cat)}"`}
          style="left:${x}%;top:${y}px;${s.klaar || (isBeker && beker) ? `background:${cat.kleur}` : ""}">
          <span class="steen-emoji">${s.emoji}</span>
          <span class="steen-naam">${s.naam}</span>
          ${s.sterren !== undefined ? `<span class="steen-sterren">${sterTekst(s.sterren)}</span>` : ""}
          ${i === hier ? `<span class="eva-hier">🐿️</span>` : ""}
        </${tag}>`;
      }).join("")}
    </div>`;
}
