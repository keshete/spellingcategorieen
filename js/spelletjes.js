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

// Hulpzinnetje bij elk spelletje: waar moet je aan denken?
const TIPS = {
  1: "Hak het woord in stukjes en schrijf wat je hoort.",
  "1s": "Daar mag geen u tussen!",
  2: "Denk aan ng, net als bij ding-dong!",
  3: "Denk aan de ch van lucht! Let op de uitzonderingen: hij ligt, hij legt, hij zegt.",
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
const tip = (cat) => TIPS[catSleutel(cat)] || cat.tip || cat.regel; // cat.tip: groep 5-8, zie categorieen-hoger.js
// Woorden die hetzelfde klinken (licht / ligt): een plaatje en een zinnetje
// laten zien welk woord we bedoelen. In het zinnetje staat … op de plek van het woord.
const BETEKENIS = {
  licht: { plaatje: "💡", zin: "Het licht is aan." },
  ligt: { plaatje: "🛌", zin: "Hij ligt in bed." },
  legt: { plaatje: "🐔🥚", zin: "De kip legt een ei." },
  zegt: { plaatje: "🧒💬👋", zin: "Hij zegt hallo." },
  raad: { plaatje: "🤔❓", zin: "Raad eens wat ik heb!" },
};
const betekenisHtml = (w) => {
  const b = BETEKENIS[w];
  if (!b) return "";
  // alleen een plaatje, het zinnetje zegt Eva (tik erop om het nog eens te horen)
  return `<button class="betekenis" onclick="zeg('${b.zin}')" aria-label="Plaatje, tik om het zinnetje te horen">${b.plaatje}</button>`;
};
// Wat Eva zegt: het woord, en bij een klinkt-hetzelfde-woord ook het zinnetje.
const metZin = (w) => (BETEKENIS[w] ? `${w}. ${BETEKENIS[w].zin}` : w);
// De tip zie je alleen bij (extra) makkelijk, anders wordt het te makkelijk.
const tipHtml = (cat) => (toonTip() ? `<div class="tip-dictee">💡 ${tip(cat)}</div>` : "");

const BALLON_KLEUREN = ["#ef5350", "#42a5f5", "#66bb6a", "#ffa726", "#ab47bc", "#ec407a", "#26c6da"];

// Eindscherm met sterren, en daarna kies je je beloning: eikels of een sticker.
function eindScherm({ cat, n, tekst, verdiend, opnieuw, terug }) {
  terug = terug || (cat ? `#cat/${catSleutel(cat)}` : "#");
  let nieuw = null;
  if (cat) {
    // gaat er een nieuwe categorie open? (alleen als de slotjes er zijn)
    const telOpen = typeof aantalOpen === "function" ? aantalOpen : () => 0;
    const openVoor = telOpen();
    geefSterren(catSleutel(cat), n);
    nieuw = telOpen() > openVoor ? CATEGORIEEN[telOpen() - 1] : null;
  }
  if (n >= 2) feest();
  zegEekhoorn(n === 3 ? "Wauw! Wat ben jij goed!" : n === 2 ? "Heel goed gedaan!" : "Goed geoefend!");
  if (nieuw) { zegEekhoorn(`Hoera! ${nieuw.naam} is nu open! 🔓`); zeg(`Hoera! ${nieuw.naam} is nu open!`); }
  scherm.innerHTML = `
    <div class="kaart eind" ${cat ? `style="border-color:${cat.kleur}"` : ""}>
      <div class="groot-sterren">${sterTekst(n)}</div>
      <p>${tekst}</p>
      ${nieuw ? `<a class="nieuw-open" href="#cat/${catSleutel(nieuw)}" style="background:${nieuw.kleur}">🔓 ${nieuw.figuur} ${nieuw.naam} is open!</a>` : ""}
      ${verdiend > 0 ? `
        <div class="beloning">
          <h3>🎁 Kies je beloning!</h3>
          <button class="beloning-knop" id="kies-eikels"><span>🌰 × ${verdiend}</span>Eikels voor de winkel</button>
          <button class="beloning-knop" id="kies-sticker"><span>🌟</span>Een sticker voor je stickerboek</button>
        </div>` : ""}
      <div class="knoppen">
        <button class="grote-knop" id="nog">🔁 Nog een keer</button>
        <a class="grote-knop" href="${terug}">Klaar</a>
      </div>
    </div>`;
  scherm.querySelector("#nog").onclick = opnieuw;
  if (verdiend > 0) {
    if (!nieuw) zeg("Kies je beloning!");
    scherm.querySelector("#kies-eikels").onclick = () => {
      scherm.querySelector(".beloning").innerHTML = `<h3>🌰 +${verdiend} eikels!</h3>`;
      spaarEikels(verdiend);
    };
    scherm.querySelector("#kies-sticker").onclick = () => {
      localStorage.setItem("stickerPlakken", nieuweSticker());
      geluid("feest");
      location.hash = "#stickers";
    };
  }
}

// Alle levens op: geen punten deze keer.
function levensOp({ cat, opnieuw, terug }) {
  geluid("fout");
  zegEekhoorn("Oei, je hartjes zijn op! Geen punten deze keer. Probeer het nog een keer!");
  zeg("Oei, je hartjes zijn op! Probeer het nog een keer!");
  scherm.innerHTML = `
    <div class="kaart eind" ${cat ? `style="border-color:${cat.kleur}"` : ""}>
      <div class="groot-sterren">💔</div>
      <p>Je hartjes zijn op. Deze keer geen punten.</p>
      <p class="regel">${cat ? tip(cat) : "Kijk goed en luister goed!"}</p>
      <div class="knoppen">
        <button class="grote-knop" id="nog">🔁 Nog een keer</button>
        <a class="grote-knop" href="${terug}">Terug</a>
      </div>
    </div>`;
  scherm.querySelector("#nog").onclick = opnieuw;
}

// ---------- 🎈 Ballonnen knallen ----------
// Ballonnen zweven omhoog. Tik alleen de ballonnen waarop het woord goed geschreven is.
function ballonnen(cat) {
  const hier = location.hash;
  const AANTAL = mijnNiveau().ballonnen;
  const lijst = woordenVoorNiveau(cat.woorden.filter((x) => foutWoord(cat, x, true)));
  let gemaakt = 0, weg = 0, geknald = 0, goedeBallonnen = 0, foutjes = 0;

  zegEekhoorn("Knal alleen de goed geschreven woorden!");
  zeg("Knal de ballonnen met een goed geschreven woord.");
  scherm.innerHTML = `
    <div class="kaart" style="border-color:${cat.kleur}">
      <div class="voortgang">🎈 Ballonnen knallen</div>
      <div class="levens-balk"><span class="levens">${hartjes(LEVENS)}</span><span class="pot" id="score">🌰 0</span></div>
      ${tipHtml(cat)}
      <div class="lucht" id="lucht"></div>
      <a class="terug" href="#cat/${catSleutel(cat)}">← Stoppen</a>
    </div>`;
  const lucht = scherm.querySelector("#lucht");
  const score = scherm.querySelector("#score");

  let over = false;
  const klaar = () => {
    if (over || location.hash !== hier) return;
    if (foutjes >= LEVENS) { over = true; lucht.querySelectorAll(".ballon-spel").forEach((b) => b.remove()); return setTimeout(() => levensOp({ cat, opnieuw: () => ballonnen(cat), terug: `#cat/${catSleutel(cat)}` }), 1200); }
    if (weg < AANTAL) return;
    over = true;
    const punten = Math.max(0, geknald - foutjes);
    const n = punten >= goedeBallonnen ? 3 : punten >= goedeBallonnen * 0.6 ? 2 : punten > 0 ? 1 : 0;
    eindScherm({ cat, n, tekst: `Je knalde ${geknald} goede ballonnen${foutjes ? ` en ${foutjes} foute` : ""}.`, verdiend: geknald, opnieuw: () => ballonnen(cat) });
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
    b.style.animationDuration = (7 + Math.random() * 2) * mijnNiveau().traag + "s";
    b.onclick = () => {
      if (b.classList.contains("knal")) return;
      if (isGoed) {
        geknald++;
        b.classList.add("knal");
        geluid("knal"); eikelVlieg();
        zegEekhoorn(schud(["Knal! Goed zo!", "Pang! Super!", "Ja! Goed geschreven!"])[0]);
        zeg(woord(x));
      } else {
        foutjes++;
        b.classList.add("knal", "mis");
        geluid("fout");
        zegEekhoorn(`Oeps! Zo schrijf je het: ${woord(x)}.`);
      }
      score.textContent = `🌰 ${geknald}`;
      const l = scherm.querySelector(".levens");
      l.textContent = hartjes(Math.max(0, LEVENS - foutjes));
      if (!isGoed) { l.classList.remove("au"); void l.offsetWidth; l.classList.add("au"); }
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
    if (gemaakt < AANTAL && !over) setTimeout(maakBallon, 1700 * mijnNiveau().traag);
  };
  setTimeout(maakBallon, 1200);
}

// ---------- 🌰 Eikels vangen ----------
// Eikels met stukjes vallen uit de boom. Vang de eikel die in het gaatje past, voordat hij op de grond valt.
function eikels(cat) {
  const lijst = woordenVoorNiveau(cat.woorden.filter((x) => maakGat(cat, x)));
  speelRonde({
    titel: "🌰 Eikels vangen", cat, terug: `#cat/${catSleutel(cat)}`,
    maakVraag: (doos, antwoord) => {
      const x = lijst[Math.floor(Math.random() * lijst.length)];
      const g = maakGat(cat, x);
      const opties = schud([g.deel, ...fouteKeuzes(g.fout).slice(0, 2)]);
      let klaar = false;
      zegEekhoorn("Help mij! Vang de eikel die in het gaatje past.");
      doos.innerHTML = `
        <button class="luister" title="Luister">🔊</button>
        ${tipHtml(cat)}
        ${betekenisHtml(woord(x))}
        <div class="woord-groot">${g.voor}<span class="gat">?</span>${g.na}</div>
        <div class="boom">
          ${opties.map((o, i) => `
            <button class="eikel" data-deel="${o}"
              style="left:${10 + i * (75 / opties.length) + Math.random() * 8}%;animation-duration:${(7 + Math.random() * 2.5) * mijnNiveau().traag}s;animation-delay:${0.8 + i * 0.4}s">
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
  const lijst = woordenVoorNiveau(cat.woorden.filter((x) => foutWoord(cat, x)));
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
        ${tipHtml(cat)}
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

// ---------- 🌰 eikels sparen en 🛒 het winkeltje ----------
// Met eikels koop je in de winkel een dier als jouw figuur, spulletjes erbij,
// of je mag een foto (bijvoorbeeld van je eigen kat) als figuur gebruiken.
// Alles blijft op dit apparaat (localStorage), de foto gaat nergens naartoe.
const WINKEL = [
  { id: "eekhoorn", soort: "dier", emoji: "🐿️", naam: "Eekhoorn", prijs: 0 },
  { id: "kat", soort: "dier", emoji: "🐱", naam: "Kat", prijs: 10 },
  { id: "hond", soort: "dier", emoji: "🐶", naam: "Hond", prijs: 10 },
  { id: "konijn", soort: "dier", emoji: "🐰", naam: "Konijn", prijs: 10 },
  { id: "vos", soort: "dier", emoji: "🦊", naam: "Vos", prijs: 15 },
  { id: "panda", soort: "dier", emoji: "🐼", naam: "Panda", prijs: 15 },
  { id: "olifant", soort: "dier", emoji: "🐘", naam: "Olifant", prijs: 20 },
  { id: "giraf", soort: "dier", emoji: "🦒", naam: "Giraf", prijs: 20 },
  { id: "leeuw", soort: "dier", emoji: "🦁", naam: "Leeuw", prijs: 20 },
  { id: "eenhoorn", soort: "dier", emoji: "🦄", naam: "Eenhoorn", prijs: 30 },
  { id: "draak", soort: "dier", emoji: "🐉", naam: "Draak", prijs: 40 },
  { id: "foto", soort: "foto", emoji: "📷", naam: "Mijn eigen foto", prijs: 25 },
  { id: "geen", soort: "spul", emoji: "✖️", naam: "Niks", prijs: 0 },
  { id: "strik", soort: "spul", emoji: "🎀", naam: "Strik", prijs: 5 },
  { id: "ballon", soort: "spul", emoji: "🎈", naam: "Ballon", prijs: 6 },
  { id: "pet", soort: "spul", emoji: "🧢", naam: "Pet", prijs: 8 },
  { id: "bril", soort: "spul", emoji: "🕶️", naam: "Zonnebril", prijs: 10 },
  { id: "hoed", soort: "spul", emoji: "🎩", naam: "Hoge hoed", prijs: 15 },
  { id: "kroon", soort: "spul", emoji: "👑", naam: "Kroon", prijs: 25 },
];
const aantalEikels = () => Number(localStorage.getItem("eikels") || 0);
const gekocht = () => JSON.parse(localStorage.getItem("gekocht") || '["eekhoorn","geen"]');
const mijnFiguur = () => ({ dier: "eekhoorn", spul: "geen", ...JSON.parse(localStorage.getItem("figuur") || "{}") });
const winkelItem = (id) => WINKEL.find((w) => w.id === id);

// Jouw figuur als HTML: een dier of je foto, met je spulletje erbij.
function figuurHtml(klasse = "") {
  const f = mijnFiguur();
  const foto = f.dier === "foto" && localStorage.getItem("figuurFoto");
  const spul = f.spul !== "geen" ? winkelItem(f.spul) : null;
  return `<span class="mijn-figuur ${klasse}">
    ${foto ? `<img src="${foto}" alt="Mijn figuur">` : `<span class="figuur-dier">${(winkelItem(f.dier) || WINKEL[0]).emoji}</span>`}
    ${spul ? `<span class="figuur-spul">${spul.emoji}</span>` : ""}</span>`;
}

// Teller rechtsboven, met jouw figuur ernaast.
// (pas na het laden, want el() staat in app.js)
let teller = null;
document.addEventListener("DOMContentLoaded", () => {
  const balk = el(`<div class="beloning-balk">
    <a class="figuur-knop" href="#prijzen" aria-label="Mijn figuur en de winkel"></a>
    <a class="stickerboek-knop" href="#stickers" aria-label="Mijn stickerboek">📒</a>
    <a class="eikel-teller" href="#prijzen" aria-label="Mijn eikels en de winkel">🌰 <b>0</b></a></div>`);
  document.querySelector("header").appendChild(balk);
  teller = balk.querySelector(".eikel-teller");
  toonEikels();
});
function toonEikels() {
  if (!teller) return;
  teller.querySelector("b").textContent = aantalEikels();
  const knop = document.querySelector(".figuur-knop");
  if (knop) knop.innerHTML = figuurHtml();
}

// Een eikeltje springt op als je iets goed hebt (in het potje van dit spel).
function eikelVlieg() {
  const vlieg = el(`<span class="eikel-vlieg">🌰</span>`);
  document.body.appendChild(vlieg);
  setTimeout(() => vlieg.remove(), 900);
  geluid("eikel");
  const m = document.querySelector(".mascot");
  m.classList.remove("spring"); void m.offsetWidth; m.classList.add("spring");
}
// Eikels echt sparen (aan het eind, als je eikels kiest als beloning).
function spaarEikels(n) {
  localStorage.setItem("eikels", aantalEikels() + n);
  geluid("eikel");
  toonEikels();
  if (teller) { teller.classList.remove("pop"); void teller.offsetWidth; teller.classList.add("pop"); }
  zegEekhoorn(`Nu heb je ${aantalEikels()} eikels! Kijk eens in de winkel. 🛒`);
}

// Foto kleiner maken (vierkant, 200 pixels), zodat hij in de browser past.
function maakFotoKlein(bestand) {
  return new Promise((klaar, mis) => {
    const img = new Image();
    img.onload = () => {
      const z = Math.min(img.width, img.height), M = 200;
      const c = document.createElement("canvas"); c.width = c.height = M;
      c.getContext("2d").drawImage(img, (img.width - z) / 2, (img.height - z) / 2, z, z, 0, 0, M, M);
      URL.revokeObjectURL(img.src);
      klaar(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = mis;
    img.src = URL.createObjectURL(bestand);
  });
}

// Het winkeltje (route #prijzen).
function prijzen() {
  const n = aantalEikels(), heb = gekocht(), f = mijnFiguur();
  const fotoGekocht = heb.includes("foto");
  zegEekhoorn(`Welkom in de winkel! Je hebt ${n} eikels. Wat wil je kopen?`);
  const vak = (w) => {
    const bezit = heb.includes(w.id);
    const aan = (w.soort === "spul" ? f.spul : f.dier) === w.id;
    return `<button class="winkel-vak ${bezit ? "bezit" : ""} ${aan ? "aan" : ""}" data-id="${w.id}">
      <span class="winkel-emoji">${w.emoji}</span>${w.naam}
      <span class="winkel-prijs">${aan ? "✅ Aan" : bezit ? "Kiezen" : `🌰 ${w.prijs}`}</span></button>`;
  };
  scherm.innerHTML = `
    <div class="kaart">
      <h2>🛒 Het eikel-winkeltje</h2>
      <div class="winkel-kop">
        <div class="groot-figuur">${figuurHtml("groot")}</div>
        <div class="groot-eikels">🌰 ${n}</div>
      </div>
      <p class="regel">Kies na een spelletje 🌰 eikels als beloning en koop hier leuke dingen!</p>
      <h3 class="spel-kop">🐾 Kies je dier</h3>
      <div class="winkel-rij">${WINKEL.filter((w) => w.soort === "dier").map(vak).join("")}</div>
      <h3 class="spel-kop">📷 Jouw eigen foto als figuur</h3>
      <p class="winkel-uitleg">Bijvoorbeeld een foto van je eigen kat! De foto blijft alleen op dit apparaat.</p>
      <div class="winkel-rij">${vak(winkelItem("foto"))}
        ${fotoGekocht ? `<label class="winkel-vak foto-kiezen"><span class="winkel-emoji">🖼️</span>Foto maken of kiezen
          <input type="file" accept="image/*" hidden></label>` : ""}</div>
      <h3 class="spel-kop">🎀 Spulletjes</h3>
      <div class="winkel-rij">${WINKEL.filter((w) => w.soort === "spul").map(vak).join("")}</div>
      <a class="grote-knop" href="#">Verder spelen</a>
    </div>`;
  scherm.querySelectorAll(".winkel-vak[data-id]").forEach((b) => (b.onclick = () => {
    const w = winkelItem(b.dataset.id);
    const fig = mijnFiguur();
    if (!gekocht().includes(w.id)) {
      if (aantalEikels() < w.prijs) {
        geluid("fout");
        zegEekhoorn(`Je hebt nog ${w.prijs - aantalEikels()} eikels nodig voor ${w.naam.toLowerCase()}. Speel nog een spelletje!`);
        return;
      }
      localStorage.setItem("eikels", aantalEikels() - w.prijs);
      localStorage.setItem("gekocht", JSON.stringify([...gekocht(), w.id]));
      feest();
      zeg(`Gekocht! ${w.naam}!`);
    } else geluid("eikel");
    if (w.soort === "spul") fig.spul = w.id;
    else if (w.soort === "dier") fig.dier = w.id;
    else if (localStorage.getItem("figuurFoto")) fig.dier = "foto";
    localStorage.setItem("figuur", JSON.stringify(fig));
    toonEikels();
    prijzen();
    if (w.soort === "foto" && !localStorage.getItem("figuurFoto"))
      zegEekhoorn("Tik op 'Foto maken of kiezen' en kies een foto!");
  }));
  const kies = scherm.querySelector('.foto-kiezen input');
  if (kies) kies.onchange = async () => {
    if (!kies.files[0]) return;
    try {
      localStorage.setItem("figuurFoto", await maakFotoKlein(kies.files[0]));
      localStorage.setItem("figuur", JSON.stringify({ ...mijnFiguur(), dier: "foto" }));
      feest(); toonEikels(); prijzen();
      zegEekhoorn("Wauw, wat een mooie foto! Dat ben jij nu!");
    } catch (e) {
      zegEekhoorn("Oei, die foto lukt niet. Probeer een andere!");
    }
  };
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
    <div class="spel-lijst">
      <a class="spel-tegel bordspel-tegel" href="#bordspel"><span>🎲</span>Eva's bordspel</a>
      ${KANT_EN_KLAAR.map((s) => tegel(s)).join("")}</div>
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
  const lijst = woordenVoorNiveau(cat.woorden.filter((x) => foutWoord(cat, x)));
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
        ${tipHtml(cat)}
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

// ---------- 📒 stickerboek ----------
const STICKERS = ("🦄 🐶 🐱 🐼 🦊 🐸 🐵 🦁 🐯 🐨 🐷 🐙 🦋 🐞 🐢 🐬 🦖 🐳 🦜 🦩 " +
  "🌈 ⭐ 🌻 🌸 🍓 🍉 🍦 🧁 🍭 🎈 🚗 🚂 ✈️ ⚽ 🏀 🎸 👑 💎 🎀 🌙").split(" ");
const geplakt = () => JSON.parse(localStorage.getItem("stickers") || "[]");
function nieuweSticker() {
  const heb = new Set(geplakt().map((s) => s.e));
  const nieuw = STICKERS.filter((e) => !heb.has(e));
  return schud(nieuw.length ? nieuw : STICKERS)[0];
}
function stickerboek() {
  const plakken = localStorage.getItem("stickerPlakken");
  zegEekhoorn(plakken
    ? "Je krijgt een sticker! Tik in je boek waar je hem wilt plakken."
    : geplakt().length ? `Je hebt al ${geplakt().length} stickers!` : "Je stickerboek is nog leeg. Kies een sticker na een spelletje!");
  if (plakken) zeg("Tik waar je je sticker wilt plakken!");
  scherm.innerHTML = `
    <div class="kaart">
      <h2>📒 Mijn stickerboek</h2>
      ${plakken ? `<div class="nieuwe-sticker">Jouw nieuwe sticker: <span>${plakken}</span></div>` : ""}
      <div class="boek ${plakken ? "plak-modus" : ""}">${geplakt().map((s) => `
        <span class="sticker" style="left:${s.x}%;top:${s.y}%;transform:translate(-50%,-50%) rotate(${s.r || 0}deg)">${s.e}</span>`).join("")}
      </div>
      <a class="grote-knop" href="#">Verder spelen</a>
    </div>`;
  if (!plakken) return;
  const boek = scherm.querySelector(".boek");
  boek.onclick = (e) => {
    const r = boek.getBoundingClientRect();
    const s = { e: plakken, x: Math.round(((e.clientX - r.left) / r.width) * 100), y: Math.round(((e.clientY - r.top) / r.height) * 100), r: Math.round(Math.random() * 30 - 15) };
    localStorage.setItem("stickers", JSON.stringify([...geplakt(), s]));
    localStorage.removeItem("stickerPlakken");
    geluid("knal"); feest();
    zegEekhoorn("Geplakt! Wat staat die mooi!");
    stickerboek();
    zegEekhoorn("Geplakt! Wat staat die mooi!");
  };
}

// ---------- 🎲 Eva's bordspel ----------
// Een bord met vakjes; Eva is de pion. Bij elke beurt is er een zinnetje met twee
// weggetjes (bv. ligt of licht). Kies het goede weggetje, gooi de dobbelsteen en loop vooruit.
// Vooral voor de lastige, speciale woorden.
const BORD_VRAGEN = [
  { cat: "3", zin: "Hij … in zijn bed.", plaatje: "🛌", goed: "ligt", fout: "licht", uitz: true },
  { cat: "3", zin: "Het … is aan.", plaatje: "💡", goed: "licht", fout: "ligt" },
  { cat: "3", zin: "De kip … een ei.", plaatje: "🐔🥚", goed: "legt", fout: "lecht", uitz: true },
  { cat: "3", zin: "Hij … hallo.", plaatje: "🧒💬👋", goed: "zegt", fout: "zecht", uitz: true },
  { cat: "3", zin: "Het is … buiten.", plaatje: "🌙⭐", goed: "nacht", fout: "nagt" },
  { cat: "1s", zin: "Ik drink een glas … .", plaatje: "🥛", goed: "melk", fout: "meluk" },
  { cat: "1s", zin: "We kijken een … .", plaatje: "🎬", goed: "film", fout: "filum" },
  { cat: "1s", zin: "Papa gaat naar zijn … .", plaatje: "👨‍💼💼", goed: "werk", fout: "weruk" },
  { cat: "1s", zin: "Er is een … in de lucht.", plaatje: "☁️", goed: "wolk", fout: "woluk" },
  { cat: "1s", zin: "Het is … in de zon.", plaatje: "☀️", goed: "warm", fout: "warum" },
  { cat: "1s", zin: "Ik heb … nodig!", plaatje: "🙋🆘", goed: "hulp", fout: "hulup" },
  { cat: "1s", zin: "De bel van de … luidt.", plaatje: "⛪🔔", goed: "kerk", fout: "keruk" },
  { cat: "8", zin: "De … blaft.", plaatje: "🐶💬", goed: "hond", fout: "hont" },
  { cat: "8", zin: "Ik slaap in mijn … .", plaatje: "🛏️", goed: "bed", fout: "bet" },
  { cat: "8", zin: "Het … rent in de wei.", plaatje: "🐴", goed: "paard", fout: "paart" },
  { cat: "8", zin: "… eens wat ik heb!", plaatje: "🤔❓", goed: "Raad", fout: "Raat" },
  { cat: "2", zin: "De … sist.", plaatje: "🐍", goed: "slang", fout: "slank" },
  { cat: "4", zin: "Ik zit op de … .", plaatje: "🧒🛋️", goed: "bank", fout: "bangk" },
];
const BORD = 20; // vakjes
// Alleen vragen van categorieën die al open zijn (als de slotjes er zijn).
function bordVragen() {
  return BORD_VRAGEN.filter((v) => {
    const c = CATEGORIEEN.find((c) => String(catSleutel(c)) === v.cat);
    if (!c) return true; // categorie (nog) niet apart, zoals speciaal hakwoord: gewoon meedoen
    return typeof isOpen !== "function" || isOpen(c);
  });
}
const DOBBEL = ["", "⚀", "⚁", "⚂"];

function bordspel() {
  const hier = location.hash;
  let plek = 0, levens = LEVENS, goed = 0, fout = 0, bezig = false;
  let stapel = schud(bordVragen());
  zegEekhoorn("Loop naar mijn boom! Kies steeds het goede weggetje.");
  zeg("Loop naar mijn boom!");
  scherm.innerHTML = `
    <div class="kaart bordkaart">
      <div class="voortgang">🎲 Eva's bordspel</div>
      <div class="levens-balk"><span class="levens">${hartjes(levens)}</span><span class="pot">🌰 0</span></div>
      <div class="bord"></div>
      <div id="beurt"></div>
      <a class="terug" href="#">← Stoppen</a>
    </div>`;
  const bord = scherm.querySelector(".bord");
  const tekenBord = () => {
    // slangetje: rij 1 links→rechts, rij 2 rechts→links, ...
    const vakjes = [];
    for (let i = 0; i < BORD; i++) {
      const rij = Math.floor(i / 5), kol = rij % 2 ? 4 - (i % 5) : i % 5;
      const soort = i === 0 ? "🏠" : i === BORD - 1 ? "🐿️🌳" : i % 4 === 3 ? "⭐" : "";
      vakjes.push(`<div class="vak ${i < plek ? "gelopen" : ""} ${soort === "⭐" ? "ster" : ""}" style="grid-row:${4 - rij};grid-column:${kol + 1}">
        <span class="vak-nr">${i === 0 ? "" : i}</span><span class="vak-teken">${soort}</span>
        ${i === plek ? figuurHtml("pion") : ""}</div>`);
    }
    bord.innerHTML = vakjes.join("");
  };
  const loop = async (stappen) => {
    for (let s = 0; s < stappen && plek < BORD - 1; s++) {
      plek++; tekenBord(); geluid("eikel"); await wacht(350);
    }
    if (plek < BORD - 1 && plek % 4 === 3) { // op een ster: nog een stapje extra
      zegEekhoorn("Een ster! Nog een stapje extra! ⭐"); await wacht(500); plek++; tekenBord(); geluid("goed"); await wacht(400);
    }
  };
  const beurt = () => {
    if (location.hash !== hier) return;
    if (plek >= BORD - 1) return klaar();
    if (!stapel.length) stapel = schud(bordVragen());
    const v = stapel.pop();
    const opties = schud([v.goed, v.fout]);
    const doos = scherm.querySelector("#beurt");
    doos.innerHTML = `
      <button class="betekenis" aria-label="Plaatje, tik om het zinnetje te horen">${v.plaatje}</button>
      <div class="weggetjes">${opties.map((o, i) => `
        <button class="weggetje ${i ? "rechts" : "links"}" data-o="${o}"><span class="bordje">${o}</span></button>`).join("")}</div>`;
    const hoor = v.zin.replace("…", v.goed);
    zeg(hoor);
    doos.querySelector(".betekenis").onclick = () => zeg(hoor);
    bezig = false;
    doos.querySelectorAll(".weggetje").forEach((b) => (b.onclick = async () => {
      if (bezig) return; bezig = true;
      doos.querySelectorAll(".weggetje").forEach((x) => (x.disabled = true));
      if (b.dataset.o === v.goed) {
        goed++; b.classList.add("goed"); geluid("goed"); eikelVlieg();
        scherm.querySelector(".pot").textContent = `🌰 ${goed}`;
        const worp = 1 + Math.floor(Math.random() * 3);
        zegEekhoorn(`${v.uitz ? "Goed! Dat is een uitzondering. " : "Goed zo! "}Je gooit ${worp}!`);
        doos.insertAdjacentHTML("beforeend", `<div class="dobbel">${DOBBEL[worp]}</div>`);
        await wacht(700);
        await loop(worp);
      } else {
        fout++; levens--; b.classList.add("fout"); geluid("fout");
        const l = scherm.querySelector(".levens");
        l.textContent = hartjes(levens); l.classList.remove("au"); void l.offsetWidth; l.classList.add("au");
        zegEekhoorn(`Oei, dat weggetje is dicht! 🚧 Het is: ${v.goed}.`);
        doos.querySelector(`[data-o="${v.goed}"]`).classList.add("goed");
        await wacht(2200);
        if (levens === 0) return location.hash === hier && levensOp({ cat: null, opnieuw: bordspel, terug: "#" });
      }
      await wacht(400);
      beurt();
    }));
  };
  const klaar = () => {
    zeg("Hoera! We zijn bij mijn boom!");
    const n = fout === 0 ? 3 : fout === 1 ? 2 : 1;
    eindScherm({ cat: null, n, tekst: `🌳 Eva is thuis! Je had ${goed} goed en ${fout} fout.`, verdiend: goed, opnieuw: bordspel, terug: "#" });
  };
  tekenBord();
  setTimeout(beurt, 1200);
}
